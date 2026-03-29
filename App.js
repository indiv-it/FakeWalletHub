import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

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
import Warn from './src/screens/Warn';
import { PopupProvider } from './src/context/PopupContext';

const Stack = createNativeStackNavigator();

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
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Home"
                  screenOptions={{
                    headerShown: false,
                    animation: "none",
                  }}
                >
                  <Stack.Screen name="Home" component={Home} />
                  <Stack.Screen name="Record" component={Record} />
                  <Stack.Screen name="Notebook" component={Notebook} />
                  <Stack.Screen name="AddList" component={AddList} />
                  <Stack.Screen name="Warn" component={Warn} />
                </Stack.Navigator>
              </NavigationContainer>
            </NoteProvider>
          </TransactionProvider>
            </ThemeProvider>
          </CategoryProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </PopupProvider>
  );
}