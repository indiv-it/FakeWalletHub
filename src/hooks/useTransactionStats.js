import { useMemo } from 'react';
import { LIST_TYPE_CASH, LIST_TYPE_BANK } from '../server/database';
import { useTransaction } from '../context/TransactionContext';
import { useCategory } from '../context/CategoryContext';
import { useTheme } from '../context/ThemeContext';

/**
 * Custom hook to calculate financial statistics from transactions.
 * Provides all-time and monthly statistics including totals, category breakdowns, and percentages.
 * 
 * @returns {Object} { allTimeStats, monthlyStats }
 */
export const useTransactionStats = () => {
    const { transactions } = useTransaction();
    const { CATEGORY_IDS, getCategoryDisplayName } = useCategory();
    const { colors } = useTheme();

    /**
     * Internal function to calculate data for a specific transaction list.
     * 
     * @param {Array} txList - Array of transaction objects
     * @returns {Object} Processed statistics
     */
    const calculateData = (txList) => {
        // Filter for valid list types (Cash or Bank)
        const validTx = txList.filter(
            t => t.listType === LIST_TYPE_CASH || t.listType === LIST_TYPE_BANK
        );

        // Calculate Totals
        const totalIncome = validTx
            .filter(t => t.type === 'income')
            .reduce((s, t) => s + t.amount, 0);

        const totalExpense = validTx
            .filter(t => t.type === 'expense')
            .reduce((s, t) => s + t.amount, 0);

        // Bank vs Cash Breakdown
        const bankIncome = validTx
            .filter(t => t.type === 'income' && t.listType === LIST_TYPE_BANK)
            .reduce((s, t) => s + t.amount, 0);

        const bankExpense = validTx
            .filter(t => t.type === 'expense' && t.listType === LIST_TYPE_BANK)
            .reduce((s, t) => s + t.amount, 0);

        const cashIncome = validTx
            .filter(t => t.type === 'income' && t.listType === LIST_TYPE_CASH)
            .reduce((s, t) => s + t.amount, 0);

        const cashExpense = validTx
            .filter(t => t.type === 'expense' && t.listType === LIST_TYPE_CASH)
            .reduce((s, t) => s + t.amount, 0);

        // Category Statistics
        const categoryStats = {};
        CATEGORY_IDS.forEach(catId => {
            const catTx = txList.filter(t => t.category === catId);
            categoryStats[catId] = {
                income: catTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
                expense: catTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
            };
        });

        const totalCategoryIncome = Object.values(categoryStats).reduce((s, c) => s + c.income, 0);
        const totalCategoryExpense = Object.values(categoryStats).reduce((s, c) => s + c.expense, 0);

        const sumMoney = totalIncome - totalExpense;
        
        // Percentages for Income vs Expense
        const totalVolume = totalIncome + totalExpense;
        const incomePercent = totalVolume > 0 ? (totalIncome / totalVolume) * 100 : 0;
        const expensePercent = totalVolume > 0 ? (totalExpense / totalVolume) * 100 : 0;

        // Overall Category Percentages
        const categoryPercent = {};
        const totalCatVolume = totalCategoryIncome + totalCategoryExpense;
        for (const [cat, stat] of Object.entries(categoryStats)) {
            const totalInCat = stat.income + stat.expense;
            categoryPercent[cat] = totalCatVolume > 0 ? (totalInCat / totalCatVolume) * 100 : 0;
        }

        // Internal Income/Expense Percentages per Category
        const categoryStatsPercent = {};
        for (const [cat, stat] of Object.entries(categoryStats)) {
            const total = stat.income + stat.expense;
            categoryStatsPercent[cat] = {
                incomePercent: total > 0 ? (stat.income / total) * 100 : 0,
                expensePercent: total > 0 ? (stat.expense / total) * 100 : 0
            };
        }

        // Chart Data format for Gifted Charts
        const colorsList = colors.chartColors;
        const expenseByCategory = CATEGORY_IDS.map((catId, index) => ({
            label: getCategoryDisplayName(catId),
            value: categoryStats[catId]?.expense || 0,
            color: colorsList[index % colorsList.length]
        })).filter(item => item.value > 0);

        const expenseByCategoryPercent = expenseByCategory.map(item => ({
            label: item.label,
            value: item.value,
            percent: totalExpense > 0 ? (item.value / totalExpense) * 100 : 0
        }));

        return {
            totalIncome,
            totalExpense,
            netProfit: sumMoney,
            balance: sumMoney,
            bank: bankIncome - bankExpense,
            cash: cashIncome - cashExpense,
            categoryStats,
            incomePercent,
            expensePercent,
            expenseByCategory,
            expenseByCategoryPercent,
            categoryStatsPercent,
            categoryPercent,
        };
    };

    return useMemo(() => {
        const now = new Date();
        const monthlyTx = transactions.filter(tx => {
            const [y, m] = tx.date.split('-').map(Number);
            return y === now.getFullYear() && m === now.getMonth() + 1;
        });

        return {
            allTimeStats: calculateData(transactions),
            monthlyStats: calculateData(monthlyTx)
        };
    }, [transactions, CATEGORY_IDS, getCategoryDisplayName]);
};
