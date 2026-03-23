import * as SQLite from 'expo-sqlite';

let db = null;

// Open database (async API for expo-sqlite v15+)
export async function getDatabase() {
    if (!db) {
        db = await SQLite.openDatabaseAsync('mybank.db');
    }
    return db;
}

// Initialize database - create tables if not exist
export async function initDatabase() {
    const database = await getDatabase();
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
    `);
    console.log('Database initialized');
}

// Insert a new transaction
export async function insertTransaction(data) {
    const database = await getDatabase();
    
    // Set default values for optional fields
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

// Get all transactions (sorted by date desc, then id desc)
export async function getAllTransactions() {
    const database = await getDatabase();
    const rows = await database.getAllAsync(
        `SELECT * FROM transactions ORDER BY date DESC, id DESC`
    );
    return rows;
}

// Update a transaction by id
export async function updateTransaction(id, data) {
    const database = await getDatabase();
    
    // Set default values for optional fields
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

// Delete a transaction by id
export async function deleteTransaction(id) {
    const database = await getDatabase();
    await database.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
}
