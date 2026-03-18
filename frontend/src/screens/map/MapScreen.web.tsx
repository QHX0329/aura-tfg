import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, textStyles } from '@/theme';

/**
 * Variante web de la pantalla de mapa.
 *
 * Evita cargar `react-native-maps` en web, ya que es un paquete nativo
 * que no es compatible con la plataforma web en esta configuracion actual.
 */
export const MapScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mapa no disponible en web</Text>
        <Text style={styles.subtitle}>
          Esta vista esta disponible en Android/iOS. En web se mostrara en una
          fase posterior con una implementacion especifica.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...textStyles.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 380,
  },
});
