/**
 * Pantalla del mapa de tiendas.
 *
 * Placeholder que mostrará el mapa con tiendas cercanas
 * usando React Native Maps + Google Maps API.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, textStyles } from "@/theme";

export const MapScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Ionicons
          name="map-outline"
          size={64}
          color={colors.textMuted}
          style={styles.placeholderIcon}
        />
        <Text style={styles.placeholderTitle}>Mapa de tiendas</Text>
        <Text style={styles.placeholderSubtitle}>
          Aquí se mostrarán los supermercados{"\n"}y comercios cercanos a tu
          ubicación
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...textStyles.heading2,
    color: colors.text,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surfaceVariant,
    margin: spacing.xl,
    borderRadius: 16,
  },
  placeholderIcon: {
    marginBottom: spacing.lg,
  },
  placeholderTitle: {
    ...textStyles.heading3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  placeholderSubtitle: {
    ...textStyles.body,
    color: colors.textMuted,
    textAlign: "center",
  },
});
