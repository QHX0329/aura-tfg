/**
 * Pantalla de listas de la compra.
 *
 * Muestra todas las listas del usuario con opción de crear nuevas.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, textStyles } from "@/theme";
import type { ListsStackParamList } from "@/navigation/types";

type ListsScreenNavigationProp = NativeStackNavigationProp<
  ListsStackParamList,
  "Lists"
>;

export const ListsScreen: React.FC = () => {
  const navigation = useNavigation<ListsScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Listas</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.emptyState}>
        <Ionicons
          name="list-outline"
          size={64}
          color={colors.textMuted}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>Sin listas todavía</Text>
        <Text style={styles.emptySubtitle}>
          Crea tu primera lista de la compra{"\n"}y empieza a ahorrar
        </Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Crear lista</Text>
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...textStyles.heading2,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    minHeight: 44,
    justifyContent: "center",
  },
  addButtonText: {
    ...textStyles.buttonSmall,
    color: colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxxl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.heading3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  createButtonText: {
    ...textStyles.button,
    color: colors.white,
  },
});
