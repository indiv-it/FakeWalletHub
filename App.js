import 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// theme provider
import { ThemeProvider } from './src/context/ThemeContext';
import { TransactionProvider } from './src/context/TransactionContext';
import { NoteProvider } from './src/context/NoteContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { CategoryProvider } from './src/context/CategoryContext';

// screens
import Home from './src/screens/Home';
import Record from './src/screens/Record';
import Notebook from './src/screens/Notebook';
import AddList from './src/screens/AddList';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { PopupProvider } from './src/context/PopupContext';

// Loading overlay
import LoadingOverlay from './src/components/LoadingOverlay';

// Stack navigator
const Stack = createNativeStackNavigator();

// App navigator
function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null); // Initial route

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboarding();
  }, []);

  // Check onboarding status
  const checkOnboarding = async () => {
    try {
      // const hasCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');
      setInitialRoute(hasCompleted === 'true' ? 'Home' : 'Onboarding');
    } catch (e) {
      console.log('Error checking onboarding:', e);
      setInitialRoute('Onboarding');
    }
  };

  if (!initialRoute) return <LoadingOverlay />; // Loading

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Record" component={Record} />
        <Stack.Screen name="Notebook" component={Notebook} />
        <Stack.Screen name="AddList" component={AddList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PopupProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <CategoryProvider>
            <ThemeProvider>
              <TransactionProvider>
                <NoteProvider>
                  <StatusBar style="light" />
                  <AppNavigator />
                </NoteProvider>
              </TransactionProvider>
            </ThemeProvider>
          </CategoryProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </PopupProvider>
  );
}