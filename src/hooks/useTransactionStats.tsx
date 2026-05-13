import { useMemo } from 'react';
import { LIST_TYPE_CASH, LIST_TYPE_BANK, TransactionData } from '../server/database';
import { useTransaction } from '../context/TransactionContext';
import { useCategory } from '../context/CategoryContext';
import { useTheme } from '../context/ThemeContext';

// --- Types ---
interface CategoryStat {
    income: number;
    expense: number;
}

interface CategoryStatPercent {
    incomePercent: number;
    expensePercent: number;
}

interface ChartDataItem {
    label: string;
    value: number;
    color: string;
}

interface ChartDataPercentItem {
    label: string;
    value: number;
    percent: number;
}

export interface TransactionStats {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    balance: number;
    bank: number;
    cash: number;
    categoryStats: Record<string, CategoryStat>;
    incomePercent: number;
    expensePercent: number;
    expenseByCategory: ChartDataItem[];
    expenseByCategoryPercent: ChartDataPercentItem[];
    categoryStatsPercent: Record<string, CategoryStatPercent>;
    categoryPercent: Record<string, number>;
}

/**
 * Custom hook to calculate financial statistics from transactions.
 * Provides all-time and monthly statistics including totals, category breakdowns, and percentages.
 */
export const useTransactionStats = (): {
    allTimeStats: TransactionStats;
    monthlyStats: TransactionStats;
} => {
    const { transactions } = useTransaction();
    const { CATEGORY_IDS, getCategoryDisplayName } = useCategory();
    const { colors } = useTheme();

    const calculateData = (txList: TransactionData[]): TransactionStats => {
        // Only include transactions with a valid list type
        const validTx = txList.filter(
            t => t.listType === LIST_TYPE_CASH || t.listType === LIST_TYPE_BANK
        );

        const totalIncome = validTx
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = validTx
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const bankIncome = validTx
            .filter(t => t.type === 'income' && t.listType === LIST_TYPE_BANK)
            .reduce((sum, t) => sum + t.amount, 0);
        const bankExpense = validTx
            .filter(t => t.type === 'expense' && t.listType === LIST_TYPE_BANK)
            .reduce((sum, t) => sum + t.amount, 0);

        const cashIncome = validTx
            .filter(t => t.type === 'income' && t.listType === LIST_TYPE_CASH)
            .reduce((sum, t) => sum + t.amount, 0);
        const cashExpense = validTx
            .filter(t => t.type === 'expense' && t.listType === LIST_TYPE_CASH)
            .reduce((sum, t) => sum + t.amount, 0);

        // Breakdown by category
        const categoryStats: Record<string, CategoryStat> = {};
        CATEGORY_IDS.forEach(catId => {
            const catTx = txList.filter(t => t.category === catId);
            categoryStats[catId] = {
                income: catTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                expense: catTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
            };
        });

        const sumMoney = totalIncome - totalExpense;

        // Global percentages
        const totalVolume = totalIncome + totalExpense;
        const incomePercent = totalVolume > 0 ? (totalIncome / totalVolume) * 100 : 0;
        const expensePercent = totalVolume > 0 ? (totalExpense / totalVolume) * 100 : 0;

        // Category percentages
        const categoryPercent: Record<string, number> = {};
        const totalCategoryIncome = Object.values(categoryStats).reduce((sum, cat) => sum + cat.income, 0);
        const totalCategoryExpense = Object.values(categoryStats).reduce((sum, cat) => sum + cat.expense, 0);
        const totalCatVolume = totalCategoryIncome + totalCategoryExpense;

        for (const [cat, stat] of Object.entries(categoryStats)) {
            const totalInCat = stat.income + stat.expense;
            categoryPercent[cat] = totalCatVolume > 0 ? (totalInCat / totalCatVolume) * 100 : 0;
        }

        const categoryStatsPercent: Record<string, CategoryStatPercent> = {};
        for (const [cat, stat] of Object.entries(categoryStats)) {
            const total = stat.income + stat.expense;
            categoryStatsPercent[cat] = {
                incomePercent: total > 0 ? (stat.income / total) * 100 : 0,
                expensePercent: total > 0 ? (stat.expense / total) * 100 : 0,
            };
        }

        const colorsList = colors.chartColors;
        const expenseByCategory: ChartDataItem[] = CATEGORY_IDS.map((catId, index) => ({
            label: getCategoryDisplayName(catId),
            value: categoryStats[catId]?.expense || 0,
            color: colorsList[index % colorsList.length],
        })).filter(item => item.value > 0);

        const expenseByCategoryPercent: ChartDataPercentItem[] = expenseByCategory.map(item => ({
            label: item.label,
            value: item.value,
            percent: totalExpense > 0 ? (item.value / totalExpense) * 100 : 0,
        }));

        const categoryTotal = Object.values(categoryStats).reduce(
            (acc, stat) => acc + (stat.income - stat.expense), 0
        );
        const netProfit = sumMoney - categoryTotal;

        return {
            totalIncome, totalExpense, netProfit,
            balance: sumMoney,
            bank: bankIncome - bankExpense,
            cash: cashIncome - cashExpense,
            categoryStats,
            incomePercent, expensePercent,
            expenseByCategory, expenseByCategoryPercent,
            categoryStatsPercent, categoryPercent,
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
            monthlyStats: calculateData(monthlyTx),
        };
    }, [transactions, CATEGORY_IDS, getCategoryDisplayName]);
};
