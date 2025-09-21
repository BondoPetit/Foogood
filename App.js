/**
 * FooGood App - Food Expiry Tracker
 * Main application entry point with clean architecture
 */
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Context
import { AppProvider } from './src/context/AppContext';

// Screens
import { PantryScreen } from './src/screens/PantryScreen';
import { ExpiringSoonScreen } from './src/screens/ExpiringSoonScreen';
import { RecipesScreen } from './src/screens/RecipesScreen';
import { ShoppingListScreen } from './src/screens/ShoppingListScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';

// Components
import { TabIcon } from './src/components/UI';

// Theme
import { COLORS } from './src/utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * Pantry stack navigator for category management
 */
function PantryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PantryMain" component={PantryScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
    </Stack.Navigator>
  );
}

/**
 * Main navigation component
 */
function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon route={route} focused={focused} />
        ),
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar.background,
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: COLORS.tabBar.active,
        tabBarInactiveTintColor: COLORS.tabBar.inactive,
      })}
    >
      <Tab.Screen 
        name="Pantry" 
        component={PantryStack}
        options={{ title: 'Pantry' }}
      />
      <Tab.Screen 
        name="ExpiringSoon" 
        component={ExpiringSoonScreen}
        options={{ title: 'Udløber snart' }}
      />
      <Tab.Screen 
        name="Recipes" 
        component={RecipesScreen}
        options={{ title: 'Opskrifter' }}
      />
      <Tab.Screen 
        name="ShoppingList" 
        component={ShoppingListScreen}
        options={{ title: 'Indkøbsliste' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Indstillinger' }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root application component
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}