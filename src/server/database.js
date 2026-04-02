import * as SQLite from 'expo-sqlite';

let db = null;
let initPromise = null;

// listType constants — stored in database
export const LIST_TYPE_CASH = 'cash';
export const LIST_TYPE_BANK = 'bank';

// Legacy listType Thai name → constant key mapping
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

// Legacy category Thai name → ID mapping
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

// ----- Connect database ------
export async function getDatabase() {
    if (!db) {
        db = await SQLite.openDatabaseAsync('FWH_Data.db');
    }
    return db;
}

// ------ Create a database table ------
export async function initDatabase() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            const database = await getDatabase();
            await database.execAsync(`
                PRAGMA journal_mode = WAL;
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
            
            // Run migration for legacy data
            await migrateTransactionData(database);
            await migrateCategoryIcons(database);
            
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
            initPromise = null; // Allow retry if it fails
            throw error;
        }
    })();

    return initPromise;
}

// ------ Migrate legacy Thai names to constant keys ------
async function migrateTransactionData(database) {
    try {
        // Migrate listType: Thai names → constant keys
        for (const [oldName, newKey] of Object.entries(LEGACY_LISTTYPE_MAP)) {
            await database.runAsync(
                `UPDATE transactions SET listType = ? WHERE listType = ?`,
                [newKey, oldName]
            );
        }

        // Migrate category: Thai/translated names → constant IDs
        for (const [oldName, newId] of Object.entries(LEGACY_CATEGORY_MAP)) {
            await database.runAsync(
                `UPDATE transactions SET category = ? WHERE category = ?`,
                [newId, oldName]
            );
        }
    } catch (error) {
        console.log('Migration warning (non-critical):', error);
    }
}

// ------ Migrate category icons (add column if missing) ------
async function migrateCategoryIcons(database) {
    try {
        // Check if icon column exists in custom_categories
        const tableInfo = await database.getAllAsync(`PRAGMA table_info(custom_categories)`);
        const hasIcon = tableInfo.some(col => col.name === 'icon');
        
        if (!hasIcon) {
            await database.execAsync(`ALTER TABLE custom_categories ADD COLUMN icon TEXT`);
            console.log('Added icon column to custom_categories');
        }
    } catch (error) {
        console.log('Category icon migration warning:', error);
    }
}

// ------ Insert Data ------
export async function insertTransaction(data) {
    await initDatabase();
    const database = await getDatabase();

    // Setting Default Data
    const transactionData = {
        title: data.title || 'Untitled',
        amount: data.amount || 0,
        type: data.type || 'expense',
        category: data.category || 'essentials',
        listType: data.listType || LIST_TYPE_CASH,
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
}

// ------ Retrieve information ------
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

// ------ Update Data ------
export async function updateTransaction(id, data) {
    await initDatabase();
    const database = await getDatabase();

    // Setting Default Data
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
}

// ------ Delete Data ------
export async function deleteTransaction(id) {
    await initDatabase();
    const database = await getDatabase();
    await database.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
}

// ==========================================
//                 NOTES
// ==========================================

// ------ Insert Note ------
export async function insertNote(data) {
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
}

// ------ Retrieve Notes ------
export async function getAllNotes() {
    await initDatabase();
    const database = await getDatabase();
    const rows = await database.getAllAsync(
        `SELECT * FROM notes ORDER BY date DESC, id DESC`
    );
    return rows;
}

// ------ Update Note ------
export async function updateNote(id, data) {
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
}

// ------ Delete Note ------
export async function deleteNote(id) {
    await initDatabase();
    const database = await getDatabase();
    await database.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
}


// ==========================================
//             CUSTOM CATEGORIES
// ==========================================

export async function getAllCustomCategories() {
    const database = await getDatabase();
    const rows = await database.getAllAsync(`SELECT * FROM custom_categories`);
    return rows;
}

export async function updateCustomCategory(id, customName, icon) {
    const database = await getDatabase();
    
    // Check if category exists first to preserve custom name or icon if one is omitted
    const existing = await database.getFirstAsync(`SELECT * FROM custom_categories WHERE id = ?`, [id]);
    
    const finalName = customName !== undefined ? customName : (existing ? existing.custom_name : '');
    const finalIcon = icon !== undefined ? icon : (existing ? existing.icon : null);

    await database.runAsync(
        `INSERT OR REPLACE INTO custom_categories (id, custom_name, icon) VALUES (?, ?, ?)`,
        [id, finalName, finalIcon]
    );
}
