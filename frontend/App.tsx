/**
 * Entry point de la aplicación BargAIn.
 *
 * Configura el NavigationContainer y renderiza el RootNavigator.
 * Llama a authStore.hydrate() en el montaje para restaurar la sesión
 * desde SecureStore antes de renderizar la navegación (evita el auth flicker).
 */

import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from '@expo-google-fonts/source-sans-3';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';

import { RootNavigator } from '@/navigation';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    SourceSans3_400Regular,
    SourceSans3_500Medium,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  /** Indica si la sesión ha sido restaurada desde SecureStore */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useAuthStore.getState().hydrate().finally(() => setHydrated(true));
  }, []);

  if (!fontsLoaded || !hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
