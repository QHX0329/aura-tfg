/**
 * Pantalla principal (Home / Dashboard).
 *
 * Muestra un resumen del estado del usuario:
 * listas activas, ahorro acumulado, tiendas cercanas.
 */

import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography } from "@/theme";

export const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛒 Listas activas</Text>
          <Text style={styles.cardValue}>0</Text>
          <Text style={styles.cardSubtitle}>Crea tu primera lista</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Ahorro estimado</Text>
          <Text style={styles.cardValue}>0,00 €</Text>
          <Text style={styles.cardSubtitle}>
            Optimiza tu compra para ahorrar
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Tiendas cercanas</Text>
          <Text style={styles.cardValue}>—</Text>
          <Text style={styles.cardSubtitle}>
            Activa la ubicación para ver tiendas
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  logoImage: {
    width: 300,
    height: 120,
  },
  subtitle: {
    ...typography.styles.bodySmall,
    color: colors.light.textSecondary,
    marginTop: -spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: spacing.xl,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
  },
  cardTitle: {
    ...typography.styles.label,
    color: colors.light.textSecondary,
    marginBottom: spacing.sm,
  },
  cardValue: {
    ...typography.styles.h2,
    color: colors.light.text,
  },
  cardSubtitle: {
    ...typography.styles.bodySmall,
    color: colors.light.textTertiary,
    marginTop: spacing.xs,
  },
});
