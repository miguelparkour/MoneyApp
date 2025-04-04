import React from 'react';
import { Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    FuturaBold: require('../assets/fonts/FuturaBold.otf'), // si tu fuente es .otf
  });

  if (!fontsLoaded) return null; // o puedes mostrar un loader

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <HomeScreen />
    </View>
  );
}