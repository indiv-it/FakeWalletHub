import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS } from '../style/Theme';

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use the theme
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
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

        // Save theme preference
        try {
            AsyncStorage.setItem('themeMode', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.log('Error saving theme preference:', error);
        }
    };

    // Theme object
    const theme = {
        colors: isDarkMode ? DARK_COLORS : LIGHT_COLORS,
        isDarkMode,
        toggleTheme,
        setIsDarkMode,
    };

    // Provide the theme to the app
    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};
