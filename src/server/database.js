import * as SQLite from 'expo-sqlite';

let db = null;
let initPromise = null;

// ----- Connect database ------
export async function getDatabase() {
    if (!db) {
        db = await SQLite.openDatabaseAsync('mybank.db');
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
                    custom_name TEXT NOT NULL
                );
            `);
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
            initPromise = null; // Allow retry if it fails
            throw error;
        }
    })();

    return initPromise;
}

// ------ Insert Data ------
export async function insertTransaction(data) {
    await initDatabase();
    const database = await getDatabase();

    // Setting Default Data
    const transactionData = {
        title: data.title || 'ไม่ระบุชื่อ',
        amount: data.amount || 0,
        type: data.type || 'expense',
        category: data.category || 'ไม่ระบุหมวดหมู่',
        listType: data.listType || 'ไม่ระบุประเภทเงิน',
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
        title: data.title || 'ไม่ระบุชื่อ',
        amount: data.amount || 0,
        type: data.type || 'expense',
        category: data.category || 'ไม่ระบุหมวดหมู่',
        listType: data.listType || 'ไม่ระบุประเภทเงิน',
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
            data.title || 'ไม่มีหัวข้อ',
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
            data.title || 'ไม่มีหัวข้อ',
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

export async function updateCustomCategory(id, oldName, newName) {
    const database = await getDatabase();
    await database.runAsync(
        `INSERT OR REPLACE INTO custom_categories (id, custom_name) VALUES (?, ?)`,
        [id, newName]
    );

    // Update existing transactions to reflect the new category name
    if (oldName && newName && oldName !== newName) {
        await database.runAsync(
            `UPDATE transactions SET category = ? WHERE category = ?`,
            [newName, oldName]
        );
    }
}

