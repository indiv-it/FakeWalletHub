import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    initDatabase,
    getAllTransactions,
    insertTransaction,
    updateTransaction,
    deleteTransaction,
    TransactionData,
} from '../server/database';

// --- Types ---
interface TransactionContextValue {
    transactions: TransactionData[];
    isLoading: boolean;
    loadTransactions: () => Promise<void>;
    addTransaction: (data: Partial<TransactionData>) => Promise<void>;
    editTransaction: (id: number, data: Partial<TransactionData>) => Promise<void>;
    removeTransaction: (id: number) => Promise<void>;
}

// ------ Create Context ------
const TransactionContext = createContext<TransactionContextValue | undefined>(undefined);

// ------ Custom Hook ------
export const useTransaction = (): TransactionContextValue => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransaction must be used within a TransactionProvider');
    }
    return context;
};

// ------ Provider Component ------
export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ------ Load Data from DB ------
    const loadTransactions = useCallback(async () => {
        try {
            await initDatabase();
            const rows = await getAllTransactions();
            setTransactions(rows);
        } catch (error) {
            console.error('Error loading transactions:', error);
            setTransactions([]);
        }
    }, []);

    const runWithLoading = useCallback(async (action: () => Promise<void>) => {
        setIsLoading(true);
        try {
            await action();
        } finally {
            setIsLoading(false);
        }
    }, []);

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
    }, [loadTransactions]);

    // ------ Add Data ------
    const addTransaction = useCallback(async (data: Partial<TransactionData>) => {
        await runWithLoading(async () => {
            try {
                await insertTransaction(data);
                await loadTransactions();
            } catch (error) {
                console.error('Error adding transaction:', error);
                throw error;
            }
        });
    }, [loadTransactions, runWithLoading]);

    // ------ Edit Data ------
    const editTransaction = useCallback(async (id: number, data: Partial<TransactionData>) => {
        await runWithLoading(async () => {
            try {
                await updateTransaction(id, data);
                await loadTransactions();
            } catch (error) {
                console.error('Error editing transaction:', error);
                throw error;
            }
        });
    }, [loadTransactions, runWithLoading]);

    // ------ Delete Data ------
    const removeTransaction = useCallback(async (id: number) => {
        await runWithLoading(async () => {
            try {
                await deleteTransaction(id);
                await loadTransactions();
            } catch (error) {
                console.error('Error removing transaction:', error);
            }
        });
    }, [loadTransactions, runWithLoading]);

    const value: TransactionContextValue = {
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
