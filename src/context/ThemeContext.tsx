import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from '../style/Theme';

// --- Types ---
interface ThemeContextValue {
    colors: ThemeColors;
    isDarkMode: boolean;
    toggleTheme: () => void;
    setIsDarkMode: (value: boolean) => void;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Custom hook to use the theme
export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Theme provider component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Load theme preference from storage on app start
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Load theme preference from storage
    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('themeMode');
            if (savedTheme) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (error) {
            console.log('Error loading theme preference:', error);
        }
    };

    // Toggle between dark and light mode
    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        try {
            AsyncStorage.setItem('themeMode', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.log('Error saving theme preference:', error);
        }
    };

    const theme: ThemeContextValue = {
        colors: isDarkMode ? DARK_COLORS : LIGHT_COLORS,
        isDarkMode,
        toggleTheme,
        setIsDarkMode,
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};
