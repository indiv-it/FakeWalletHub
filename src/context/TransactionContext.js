import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Import database functions
import {
    initDatabase,
    getAllTransactions,
    insertTransaction,
    updateTransaction,
    deleteTransaction,
} from '../server/database';

// ------ Create Context ------
const TransactionContext = createContext();

// ------ Custom Hook ------
export const useTransaction = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransaction must be used within a TransactionProvider');
    }
    return context;
};

// ------ Provider Component ------
export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ------ Load Data on Mount ------
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

    // ------ Load Data from DB ------
    const loadTransactions = useCallback(async () => {
        try {
            const rows = await getAllTransactions();
            setTransactions(rows);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }, []);

    // ------ Add Data ------
    const addTransaction = useCallback(async (data) => {
        try {
            await insertTransaction(data);
            await loadTransactions();
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    }, [loadTransactions]);

    // ------ Edit Data ------
    const editTransaction = useCallback(async (id, data) => {
        try {
            await updateTransaction(id, data);
            await loadTransactions();
        } catch (error) {
            console.error('Error editing transaction:', error);
            throw error;
        }
    }, [loadTransactions]);

    // ------ Delete Data ------
    const removeTransaction = useCallback(async (id) => {
        try {
            await deleteTransaction(id);
            await loadTransactions();
        } catch (error) {
            console.error('Error removing transaction:', error);
        }
    }, [loadTransactions]);

    // ------ Context Value ------
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
