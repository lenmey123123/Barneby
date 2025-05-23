// BarnebyAppNeu/App.tsx
import 'react-native-get-random-values';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import { GameProvider } from './contexts/GameContext';
import './i18n';

export default function App() {
  return (
    <GameProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </GameProvider>
  );
}