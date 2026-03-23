import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    initDatabase,
    getAllTransactions,
    insertTransaction,
    updateTransaction,
    deleteTransaction,
} from '../server/database';

// Create context
const TransactionContext = createContext();

// Custom hook
export const useTransaction = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransaction must be used within a TransactionProvider');
    }
    return context;
};

// Provider
export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize database and load transactions
    useEffect(() => {
        (async () => {
            try {
                await initDatabase();
                await loadTransactions();
            } catch (error) {
                console.error('Error initializing database:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // Load all transactions from DB
    const loadTransactions = useCallback(async () => {
        try {
            const rows = await getAllTransactions();
            setTransactions(rows);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }, []);

    // Add a new transaction
    const addTransaction = useCallback(async (data) => {
        try {
            await insertTransaction(data);
            await loadTransactions();
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    }, [loadTransactions]);

    // Edit an existing transaction
    const editTransaction = useCallback(async (id, data) => {
        try {
            await updateTransaction(id, data);
            await loadTransactions();
        } catch (error) {
            console.error('Error editing transaction:', error);
            throw error;
        }
    }, [loadTransactions]);

    // Remove a transaction
    const removeTransaction = useCallback(async (id) => {
        try {
            await deleteTransaction(id);
            await loadTransactions();
        } catch (error) {
            console.error('Error removing transaction:', error);
        }
    }, [loadTransactions]);

    const value = {
        transactions,
        isLoading,
        loadTransactions,
        addTransaction,
        editTransaction,
        removeTransaction,
    };

    return (
        <TransactionContext.Provider value={value}>
            {children}
        </TransactionContext.Provider>
    );
};
