import * as SQLite from 'expo-sqlite';

/**
 * @file database.js
 * @description Local SQLite database management for the FakeWalletHub application.
 * Handles transactions, notes, and custom categories using expo-sqlite.
 */

let db = null;
let initPromise = null;

// Constants for list types
export const LIST_TYPE_CASH = 'cash';
export const LIST_TYPE_BANK = 'bank';

/** 
 * Legacy listType mapping for backward compatibility with older data versions.
 */
const LEGACY_LISTTYPE_MAP = {
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
const LEGACY_CATEGORY_MAP = {
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
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export async function getDatabase() {
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
 * @returns {Promise<void>}
 */
export async function initDatabase() {
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
 * @param {SQLite.SQLiteDatabase} database 
 */
async function migrateTransactionData(database) {
    try {
        // Migrate listTypes
        for (const [oldName, newKey] of Object.entries(LEGACY_LISTTYPE_MAP)) {
            await database.runAsync(
                `UPDATE transactions SET listType = ? WHERE listType = ?`,
                [newKey, oldName]
            );
        }

        // Migrate categories
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
 * @param {SQLite.SQLiteDatabase} database 
 */
async function migrateCategoryIcons(database) {
    try {
        const tableInfo = await database.getAllAsync(`PRAGMA table_info(custom_categories)`);
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
 * @param {Object} data - Transaction data
 * @returns {Promise<number>} Last inserted row ID
 */
export async function insertTransaction(data) {
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
 * @returns {Promise<Array>} Array of transaction objects
 */
export async function getAllTransactions() {
    try {
        await initDatabase();
        const database = await getDatabase();
        const rows = await database.getAllAsync(
            `SELECT * FROM transactions ORDER BY date DESC, id DESC`
        );
        return rows || [];
    } catch (err) {
        console.error("getAllTransactions error:", err);
        return [];
    }
}

/**
 * Updates an existing transaction.
 * @param {number} id - Transaction ID
 * @param {Object} data - Updated data
 */
export async function updateTransaction(id, data) {
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
 * @param {number} id 
 */
export async function deleteTransaction(id) {
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
 * @param {Object} data - Note data
 * @returns {Promise<number>} Last inserted row ID
 */
export async function insertNote(data) {
    try {
        await initDatabase();
        const database = await getDatabase();

        const result = await database.runAsync(
            `INSERT INTO notes (title, content, color, date, created_at)
            VALUES (?, ?, ?, ?, ?)`,
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
 * @returns {Promise<Array>} Array of note objects
 */
export async function getAllNotes() {
    try {
        await initDatabase();
        const database = await getDatabase();
        const rows = await database.getAllAsync(
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
 * @param {number} id 
 * @param {Object} data 
 */
export async function updateNote(id, data) {
    try {
        await initDatabase();
        const database = await getDatabase();

        await database.runAsync(
            `UPDATE notes SET title = ?, content = ?, color = ?, date = ?
            WHERE id = ?`,
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
 * @param {number} id 
 */
export async function deleteNote(id) {
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
 * @returns {Promise<Array>}
 */
export async function getAllCustomCategories() {
    try {
        const database = await getDatabase();
        const rows = await database.getAllAsync(`SELECT * FROM custom_categories`);
        return rows || [];
    } catch (error) {
        console.error('getAllCustomCategories error:', error);
        return [];
    }
}

/**
 * Updates or inserts a custom category.
 * @param {string} id 
 * @param {string} customName 
 * @param {string} icon 
 */
export async function updateCustomCategory(id, customName, icon) {
    try {
        const database = await getDatabase();
        
        // Fetch existing to handle optional parameters
        const existing = await database.getFirstAsync(`SELECT * FROM custom_categories WHERE id = ?`, [id]);
        
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
