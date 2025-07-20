import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ImpactDashboardScreen from '../screens/ImpactDashboardScreen';
import OpportunityDetailScreen from '../screens/OpportunityDetailScreen';

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();

const AuthStackScreen = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const MainTabScreen = () => (
  <MainTab.Navigator>
    <MainTab.Screen name="Home" component={HomeScreen} />
    <MainTab.Screen name="Profile" component={ProfileScreen} />
    <MainTab.Screen name="Dashboard" component={ImpactDashboardScreen} />
  </MainTab.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <AuthStackScreen />
    </NavigationContainer>
  );
};

export default AppNavigator; 