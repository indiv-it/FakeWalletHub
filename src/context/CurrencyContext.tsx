import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Types ---
export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
    locale: string;
}

interface CurrencyContextValue {
    currentCurrency: string;
    changeCurrency: (currencyCode: string) => void;
    formatMoney: (amount: number) => string;
    currencyInfo: CurrencyInfo;
    currencies: typeof CURRENCIES;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
    thb: { code: 'thb', symbol: '฿', name: 'THB', locale: 'th-TH' },
    usd: { code: 'usd', symbol: '$', name: 'USD', locale: 'en-US' },
    cny: { code: 'cny', symbol: '¥', name: 'CNY', locale: 'zh-CN' },
    jpy: { code: 'jpy', symbol: '¥', name: 'JPY', locale: 'ja-JP' },
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const useCurrency = (): CurrencyContextValue => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentCurrency, setCurrentCurrency] = useState('thb');

    useEffect(() => {
        loadCurrencyPreference();
    }, []);

    const loadCurrencyPreference = async () => {
        try {
            const savedCurrency = await AsyncStorage.getItem('appCurrency');
            if (savedCurrency && CURRENCIES[savedCurrency]) {
                setCurrentCurrency(savedCurrency);
            }
        } catch (error) {
            console.log('Error loading currency preference:', error);
        }
    };

    const changeCurrency = (currencyCode: string) => {
        if (CURRENCIES[currencyCode]) {
            setCurrentCurrency(currencyCode);
            try {
                AsyncStorage.setItem('appCurrency', currencyCode);
            } catch (error) {
                console.log('Error saving currency preference:', error);
            }
        }
    };

    const formatMoney = (amount: number): string => {
        const c = CURRENCIES[currentCurrency] || CURRENCIES['thb'];
        return `${c.symbol} ${Number(amount).toLocaleString(c.locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const value: CurrencyContextValue = {
        currentCurrency,
        changeCurrency,
        formatMoney,
        currencyInfo: CURRENCIES[currentCurrency],
        currencies: CURRENCIES,
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};
