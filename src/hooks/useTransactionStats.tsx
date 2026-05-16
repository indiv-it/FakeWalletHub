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
        const categoryStats: Record<string, CategoryStat> = {};
        CATEGORY_IDS.forEach(catId => {
            categoryStats[catId] = { income: 0, expense: 0 };
        });

        let totalIncome = 0;
        let totalExpense = 0;
        let bankIncome = 0;
        let bankExpense = 0;
        let cashIncome = 0;
        let cashExpense = 0;

        for (const t of txList) {
            const isBankOrCash =
                t.listType === LIST_TYPE_CASH || t.listType === LIST_TYPE_BANK;
            const isIncome = t.type === 'income';
            const amount = t.amount;

            if (CATEGORY_IDS.includes(t.category)) {
                if (isIncome) categoryStats[t.category].income += amount;
                else categoryStats[t.category].expense += amount;
            }

            if (!isBankOrCash) continue;

            if (isIncome) {
                totalIncome += amount;
                if (t.listType === LIST_TYPE_BANK) bankIncome += amount;
                else cashIncome += amount;
            } else {
                totalExpense += amount;
                if (t.listType === LIST_TYPE_BANK) bankExpense += amount;
                else cashExpense += amount;
            }
        }

        const sumMoney = totalIncome - totalExpense;

        const totalVolume = totalIncome + totalExpense;
        const incomePercent = totalVolume > 0 ? (totalIncome / totalVolume) * 100 : 0;
        const expensePercent = totalVolume > 0 ? (totalExpense / totalVolume) * 100 : 0;

        // Category share of current balance (income - expense) vs sum of all category balances
        const categoryBalances = CATEGORY_IDS.map(
            catId => categoryStats[catId].income - categoryStats[catId].expense
        );
        const totalCategoryBalance = categoryBalances.reduce((sum, b) => sum + b, 0);

        const categoryPercent: Record<string, number> = {};
        CATEGORY_IDS.forEach((catId, index) => {
            categoryPercent[catId] =
                totalCategoryBalance !== 0
                    ? (categoryBalances[index] / totalCategoryBalance) * 100
                    : 0;
        });

        // Share of global income/expense (not in-category income vs expense split)
        const categoryStatsPercent: Record<string, CategoryStatPercent> = {};
        for (const catId of CATEGORY_IDS) {
            const stat = categoryStats[catId];
            categoryStatsPercent[catId] = {
                incomePercent: totalIncome > 0 ? (stat.income / totalIncome) * 100 : 0,
                expensePercent: totalExpense > 0 ? (stat.expense / totalExpense) * 100 : 0,
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
