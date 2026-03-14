/**
 * Pantalla de detalle de lista de la compra.
 *
 * Muestra los productos de una lista con sus precios.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, textStyles } from "@/theme";
import type { ListsStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ListsStackParamList, "ListDetail">;

export const ListDetailScreen: React.FC<Props> = ({ route }) => {
  const { listName } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{listName}</Text>
        <Text style={styles.subtitle}>0 productos</Text>
      </View>

      <View style={styles.emptyState}>
        <Ionicons
          name="cart-outline"
          size={64}
          color={colors.textMuted}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>Lista vacía</Text>
        <Text style={styles.emptySubtitle}>
          Añade productos para empezar a comparar precios
        </Text>
      </View>
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    ...textStyles.heading2,
    color: colors.text,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
  },
});
