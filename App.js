import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// theme provider
import { ThemeProvider } from './src/context/ThemeContext';

// screens
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Home from './src/screens/Home';
import Record from './src/screens/Record';
import Profile from './src/screens/Profile';
import AddList from './src/screens/AddList';
import Warn from './src/screens/Warn';
import EditProfile from './src/screens/Manu Profile/EditProfile';
import UpgradeAccount from './src/screens/Manu Profile/UpgradeAccount';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              animation: "none",
            }}
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Record" component={Record} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="AddList" component={AddList} />
            <Stack.Screen name="Warn" component={Warn} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="UpgradeAccount" component={UpgradeAccount} />
          </Stack.Navigator>
        </NavigationContainer>
      </>
    </ThemeProvider>
  );
}