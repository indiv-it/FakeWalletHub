import * as SQLite from 'expo-sqlite';

/**
 * @file database.ts
 * @description Local SQLite database management for the FakeWalletHub application.
 * Handles transactions, notes, custom categories, and savings goals using expo-sqlite.
 */

// --- Types ---
export interface TransactionData {
    id?: number;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    listType: string;
    date: string;
    created_at: string;
}

export interface NoteData {
    id?: number;
    title: string;
    content?: string;
    color: string;
    date: string;
    created_at: string;
}

export interface CustomCategory {
    id: string;
    custom_name: string;
    icon?: string | null;
}

export interface CategoryGoal {
    id: string;
    goal_enabled: boolean;
    goal_amount: number;
}

// --- Database state ---
let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

// Constants for list types
export const LIST_TYPE_CASH = 'cash';
export const LIST_TYPE_BANK = 'bank';

/**
 * Legacy listType mapping for backward compatibility with older data versions.
 */
const LEGACY_LISTTYPE_MAP: Record<string, string> = {
    'เงินสด': LIST_TYPE_CASH,
    'เงินในบัญชี': LIST_TYPE_BANK,
    'Cash': LIST_TYPE_CASH,
    'In Bank': LIST_TYPE_BANK,
    '现金': LIST_TYPE_CASH,
    '银行账户': LIST_TYPE_BANK,
    '現金': LIST_TYPE_CASH,
    '銀行口座': LIST_TYPE_BANK,
};

/**
 * Legacy category mapping for backward compatibility.
 */
const LEGACY_CATEGORY_MAP: Record<string, string> = {
    'เงินจำเป็น': 'essentials',
    'เงินตามใจ': 'wants',
    'เงินลงทุน': 'investment',
    'เงินออม': 'savings',
    'Essentials': 'essentials',
    'Wants': 'wants',
    'Investment': 'investment',
    'Savings': 'savings',
    '必需品': 'essentials',
    '个人消费': 'wants',
    '投资': 'investment',
    '储蓄': 'savings',
    '個人消費': 'wants',
    '貯蓄': 'savings',
};

/**
 * Initializes and returns the database connection.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    try {
        if (!db) {
            db = await SQLite.openDatabaseAsync('FWH_Data.db');
        }
        return db;
    } catch (error) {
        console.error('Failed to open database:', error);
        throw error;
    }
}

/**
 * Initializes the database schema and performs necessary migrations.
 * Uses a singleton promise to prevent concurrent initialization.
 */
export async function initDatabase(): Promise<void> {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            const database = await getDatabase();

            // Enable WAL mode for better performance
            await database.execAsync(`PRAGMA journal_mode = WAL;`);

            // Create tables if they don't exist
            await database.execAsync(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    amount REAL NOT NULL,
                    type TEXT NOT NULL,
                    category TEXT NOT NULL,
                    listType TEXT NOT NULL,
                    date TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT,
                    color TEXT NOT NULL,
                    date TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS custom_categories (
                    id TEXT PRIMARY KEY,
                    custom_name TEXT NOT NULL,
                    icon TEXT
                );
                CREATE TABLE IF NOT EXISTS category_goals (
                    id TEXT PRIMARY KEY,
                    goal_enabled INTEGER NOT NULL DEFAULT 0,
                    goal_amount REAL NOT NULL DEFAULT 0
                );
            `);

            // Run migrations
            await migrateTransactionData(database);
            await migrateCategoryIcons(database);

            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
            initPromise = null; // Reset promise to allow retry
            throw error;
        }
    })();

    return initPromise;
}

/**
 * Migrates legacy string values in the database to standardized keys.
 */
async function migrateTransactionData(database: SQLite.SQLiteDatabase): Promise<void> {
    try {
        for (const [oldName, newKey] of Object.entries(LEGACY_LISTTYPE_MAP)) {
            await database.runAsync(
                `UPDATE transactions SET listType = ? WHERE listType = ?`,
                [newKey, oldName]
            );
        }
        for (const [oldName, newId] of Object.entries(LEGACY_CATEGORY_MAP)) {
            await database.runAsync(
                `UPDATE transactions SET category = ? WHERE category = ?`,
                [newId, oldName]
            );
        }
    } catch (error) {
        console.warn('Migration warning (non-critical):', error);
    }
}

/**
 * Ensures the custom_categories table has the required columns.
 */
async function migrateCategoryIcons(database: SQLite.SQLiteDatabase): Promise<void> {
    try {
        const tableInfo = await database.getAllAsync<{ name: string }>(
            `PRAGMA table_info(custom_categories)`
        );
        const hasIcon = tableInfo.some(col => col.name === 'icon');
        if (!hasIcon) {
            await database.execAsync(`ALTER TABLE custom_categories ADD COLUMN icon TEXT`);
            console.log('Successfully added icon column to custom_categories');
        }
    } catch (error) {
        console.warn('Category icon migration warning:', error);
    }
}

// ==========================================
//              TRANSACTIONS
// ==========================================

/**
 * Inserts a new transaction into the database.
 */
export async function insertTransaction(data: Partial<TransactionData>): Promise<number> {
    try {
        await initDatabase();
        const database = await getDatabase();
        const transactionData = {
            title: data.title || 'Untitled',
            amount: data.amount || 0,
            type: data.type || 'expense',
            category: (data.category !== undefined && data.category !== null) ? data.category : 'essentials',
            listType: (data.listType !== undefined && data.listType !== null) ? data.listType : LIST_TYPE_CASH,
            date: data.date || new Date().toISOString().split('T')[0],
            created_at: data.created_at || new Date().toISOString(),
        };

        const result = await database.runAsync(
            `INSERT INTO transactions (title, amount, type, category, listType, date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                transactionData.title,
                transactionData.amount,
                transactionData.type,
                transactionData.category,
                transactionData.listType,
                transactionData.date,
                transactionData.created_at,
            ]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error('insertTransaction error:', error);
        throw error;
    }
}

/**
 * Retrieves all transactions ordered by date descending.
 */
export async function getAllTransactions(): Promise<TransactionData[]> {
    try {
        await initDatabase();
        const database = await getDatabase();
        const rows = await database.getAllAsync<TransactionData>(
            `SELECT * FROM transactions ORDER BY date DESC, id DESC`
        );
        return rows || [];
    } catch (err) {
        console.error('getAllTransactions error:', err);
        return [];
    }
}

/**
 * Updates an existing transaction.
 */
export async function updateTransaction(id: number, data: Partial<TransactionData>): Promise<void> {
    try {
        await initDatabase();
        const database = await getDatabase();

        const transactionData = {
            title: data.title || 'Untitled',
            amount: data.amount || 0,
            type: data.type || 'expense',
            category: data.category || 'essentials',
            listType: data.listType || LIST_TYPE_CASH,
            date: data.date || new Date().toISOString().split('T')[0],
            created_at: data.created_at || new Date().toISOString(),
        };

        await database.runAsync(
            `UPDATE transactions SET title = ?, amount = ?, type = ?, category = ?, listType = ?, date = ?, created_at = ?
            WHERE id = ?`,
            [
                transactionData.title,
                transactionData.amount,
                transactionData.type,
                transactionData.category,
                transactionData.listType,
                transactionData.date,
                transactionData.created_at,
                id,
            ]
        );
    } catch (error) {
        console.error('updateTransaction error:', error);
        throw error;
    }
}

/**
 * Deletes a transaction by ID.
 */
export async function deleteTransaction(id: number): Promise<void> {
    try {
        await initDatabase();
        const database = await getDatabase();
        await database.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
    } catch (error) {
        console.error('deleteTransaction error:', error);
        throw error;
    }
}

// ==========================================
//                 NOTES
// ==========================================

/**
 * Inserts a new note.
 */
export async function insertNote(data: Partial<NoteData>): Promise<number> {
    try {
        await initDatabase();
        const database = await getDatabase();
        const result = await database.runAsync(
            `INSERT INTO notes (title, content, color, date, created_at) VALUES (?, ?, ?, ?, ?)`,
            [
                data.title || 'Untitled',
                data.content || '',
                data.color || '#FBBF24',
                data.date || new Date().toISOString().split('T')[0],
                data.created_at || new Date().toISOString(),
            ]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error('insertNote error:', error);
        throw error;
    }
}

/**
 * Retrieves all notes from the database.
 */
export async function getAllNotes(): Promise<NoteData[]> {
    try {
        await initDatabase();
        const database = await getDatabase();
        const rows = await database.getAllAsync<NoteData>(
            `SELECT * FROM notes ORDER BY date DESC, id DESC`
        );
        return rows || [];
    } catch (error) {
        console.error('getAllNotes error:', error);
        return [];
    }
}

/**
 * Updates a note by ID.
 */
export async function updateNote(id: number, data: Partial<NoteData>): Promise<void> {
    try {
        await initDatabase();
        const database = await getDatabase();
        await database.runAsync(
            `UPDATE notes SET title = ?, content = ?, color = ?, date = ? WHERE id = ?`,
            [
                data.title || 'Untitled',
                data.content || '',
                data.color || '#FBBF24',
                data.date || new Date().toISOString().split('T')[0],
                id,
            ]
        );
    } catch (error) {
        console.error('updateNote error:', error);
        throw error;
    }
}

/**
 * Deletes a note by ID.
 */
export async function deleteNote(id: number): Promise<void> {
    try {
        await initDatabase();
        const database = await getDatabase();
        await database.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
    } catch (error) {
        console.error('deleteNote error:', error);
        throw error;
    }
}

// ==========================================
//             CUSTOM CATEGORIES
// ==========================================

/**
 * Retrieves all custom categories.
 */
export async function getAllCustomCategories(): Promise<CustomCategory[]> {
    try {
        const database = await getDatabase();
        const rows = await database.getAllAsync<CustomCategory>(`SELECT * FROM custom_categories`);
        return rows || [];
    } catch (error) {
        console.error('getAllCustomCategories error:', error);
        return [];
    }
}

/**
 * Updates or inserts a custom category.
 */
export async function updateCustomCategory(
    id: string,
    customName?: string,
    icon?: string | null
): Promise<void> {
    try {
        const database = await getDatabase();
        const existing = await database.getFirstAsync<CustomCategory>(
            `SELECT * FROM custom_categories WHERE id = ?`,
            [id]
        );

        const finalName = customName !== undefined ? customName : (existing ? existing.custom_name : '');
        const finalIcon = icon !== undefined ? icon : (existing ? existing.icon : null);

        await database.runAsync(
            `INSERT OR REPLACE INTO custom_categories (id, custom_name, icon) VALUES (?, ?, ?)`,
            [id, finalName, finalIcon]
        );
    } catch (error) {
        console.error('updateCustomCategory error:', error);
        throw error;
    }
}

// ==========================================
//             CATEGORY GOALS
// ==========================================

/**
 * Retrieves all category goals.
 */
export async function getAllCategoryGoals(): Promise<CategoryGoal[]> {
    try {
        await initDatabase();
        const database = await getDatabase();
        const rows = await database.getAllAsync<{ id: string; goal_enabled: number; goal_amount: number }>(
            `SELECT * FROM category_goals`
        );
        return (rows || []).map(r => ({
            id: r.id,
            goal_enabled: r.goal_enabled === 1,
            goal_amount: r.goal_amount,
        }));
    } catch (error) {
        console.error('getAllCategoryGoals error:', error);
        return [];
    }
}

/**
 * Retrieves a single category goal by ID.
 */
export async function getCategoryGoalById(id: string): Promise<CategoryGoal | null> {
    try {
        await initDatabase();
        const database = await getDatabase();
        const row = await database.getFirstAsync<{ id: string; goal_enabled: number; goal_amount: number }>(
            `SELECT * FROM category_goals WHERE id = ?`,
            [id]
        );
        if (!row) return null;
        return {
            id: row.id,
            goal_enabled: row.goal_enabled === 1,
            goal_amount: row.goal_amount,
        };
    } catch (error) {
        console.error('getCategoryGoalById error:', error);
        return null;
    }
}

/**
 * Upserts (insert or update) a category goal.
 */
export async function upsertCategoryGoal(
    id: string,
    enabled: boolean,
    amount: number
): Promise<void> {
    try {
        await initDatabase();
        const database = await getDatabase();
        await database.runAsync(
            `INSERT OR REPLACE INTO category_goals (id, goal_enabled, goal_amount) VALUES (?, ?, ?)`,
            [id, enabled ? 1 : 0, amount]
        );
    } catch (error) {
        console.error('upsertCategoryGoal error:', error);
        throw error;
    }
}
