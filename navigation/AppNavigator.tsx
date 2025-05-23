// BarnebyAppNeu/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SetupScreen from '../screens/SetupScreen';
import RoleRevealScreen from '../screens/RoleRevealScreen';
import GameScreen from '../screens/GameScreen';
import ResolutionScreen from '../screens/ResolutionScreen';
import RulesScreen from '../screens/RulesScreen';

export type RootStackParamList = {
  Setup: undefined;
  RoleReveal: undefined;
  Game: undefined;
  Resolution: undefined;
  Rules: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Setup"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="RoleReveal" component={RoleRevealScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Resolution" component={ResolutionScreen} />
        <Stack.Screen name="Rules" component={RulesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;