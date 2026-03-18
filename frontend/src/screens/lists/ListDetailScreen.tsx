/**
 * Pantalla de detalle de lista de la compra — conectada al API real.
 *
 * Muestra los productos de una lista con opción de:
 * - Marcar/desmarcar ítems (con actualización optimista)
 * - Eliminar ítems (con confirmación)
 * - Buscar y añadir productos mediante autocompletado con debounce
 */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ListRenderItem,
} from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, textStyles, borderRadius } from "@/theme";
import type { ListsStackParamList } from "@/navigation/types";
import type { Product, ShoppingListItem } from "@/types/domain";
import { listService } from "@/api/listService";
import { productService } from "@/api/productService";
import { useListStore } from "@/store/listStore";
import { SkeletonBox } from "@/components/ui/SkeletonBox";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<ListsStackParamList, "ListDetail">;

// ─── Item row (extracted outside component for performance) ───────────────────

interface ItemRowProps {
  item: ShoppingListItem;
  onToggle: (item: ShoppingListItem) => void;
  onDelete: (item: ShoppingListItem) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, onToggle, onDelete }) => {
  // Backend enriched GET returns product_name; POST returns product as integer FK.
  // Support both shapes.
  const productName =
    item.product_name ??
    (typeof item.product === "object" && item.product !== null
      ? (item.product as { name?: string }).name
      : undefined) ??
    "Producto";
  const productUnit =
    typeof item.product === "object" && item.product !== null
      ? (item.product as { unit?: string }).unit
      : undefined;
  // Backend uses is_checked (snake_case); domain type alias is isChecked.
  const isChecked = item.isChecked ?? item.is_checked ?? false;

  const handleLongPress = useCallback(() => {
    Alert.alert(
      "¿Eliminar producto?",
      `¿Eliminar "${productName}" de la lista?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete(item),
        },
      ],
    );
  }, [item, onDelete, productName]);

  return (
    <TouchableOpacity
      testID={`item-row-${item.id}`}
      style={styles.itemRow}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        testID={`checkbox-item-${item.id}`}
        onPress={() => onToggle(item)}
        style={styles.checkbox}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
        accessibilityLabel={`Marcar ${productName}`}
      >
        <Ionicons
          name={isChecked ? "checkbox" : "square-outline"}
          size={22}
          color={isChecked ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <Text
          style={[styles.itemName, isChecked && styles.itemNameChecked]}
          numberOfLines={1}
        >
          {productName}
        </Text>
        <Text style={styles.itemMeta}>
          {item.quantity > 1 ? `×${item.quantity}` : (productUnit ?? "")}
          {item.note ? ` · ${item.note}` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// renderItem extracted outside component
function makeRenderItem(
  onToggle: (item: ShoppingListItem) => void,
  onDelete: (item: ShoppingListItem) => void,
): ListRenderItem<ShoppingListItem> {
  function renderItemRow({ item }: { item: ShoppingListItem }) {
    return <ItemRow item={item} onToggle={onToggle} onDelete={onDelete} />;
  }
  return renderItemRow;
}

// ─── Autocomplete result row ───────────────────────────────────────────────────

interface AutocompleteRowProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const AutocompleteRow: React.FC<AutocompleteRowProps> = ({ product, onSelect }) => (
  <TouchableOpacity
    testID={`autocomplete-item-${product.id}`}
    style={styles.autocompleteRow}
    onPress={() => onSelect(product)}
    activeOpacity={0.7}
  >
    <View style={styles.autocompleteContent}>
      <Text style={styles.autocompleteName} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.autocompleteCategory} numberOfLines={1}>
        {product.category} · {product.unit}
        {product.brand ? ` · ${product.brand}` : ""}
      </Text>
    </View>
    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
  </TouchableOpacity>
);

// ─── ListDetailScreen ─────────────────────────────────────────────────────────

export const ListDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { listId, listName } = route.params;
  const { activeList, setActiveList, updateListItem } = useListStore();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Set screen title ─────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const items = activeList?.items ?? [];
    navigation.setOptions({
      title: listName,
      headerRight: () => (
        <Text style={styles.headerBadge}>
          {items.length} {items.length === 1 ? "producto" : "productos"}
        </Text>
      ),
    });
  }, [navigation, listName, activeList?.items]);

  // ─── Fetch list on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await listService.getList(listId);
        setActiveList(list);
      } catch {
        Alert.alert("Error", "No se pudo cargar la lista.");
      } finally {
        setIsLoading(false);
      }
    };
    void load();

    return () => {
      // Clear debounce timer on unmount
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [listId, setActiveList]);

  // ─── Autocomplete search with debounce ────────────────────────────────────
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await productService.autocomplete(text.trim());
        setSuggestions(results.slice(0, 5));
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  // ─── Add product to list ──────────────────────────────────────────────────
  const handleSelectProduct = useCallback(
    async (product: Product) => {
      setSearchQuery("");
      setSuggestions([]);
      try {
        const newItem = await listService.addItem(listId, {
          product: product.id,
          quantity: 1,
        });
        // Enrich the response with product metadata the POST endpoint doesn't return
        const enrichedItem: ShoppingListItem = {
          ...newItem,
          product_name: product.name,
          category_name: typeof product.category === "string" ? product.category : undefined,
          isChecked: newItem.is_checked ?? false,
        };
        // Update activeList in store
        const currentList = useListStore.getState().activeList;
        if (currentList) {
          setActiveList({
            ...currentList,
            items: [...(currentList.items ?? []), enrichedItem],
          });
        }
      } catch {
        Alert.alert("Error", "No se pudo añadir el producto.");
      }
    },
    [listId, setActiveList],
  );

  // ─── Toggle item checked (optimistic update) ──────────────────────────────
  const handleToggleItem = useCallback(
    async (item: ShoppingListItem) => {
      // Resolve current checked state from either field name
      const currentChecked = item.isChecked ?? item.is_checked ?? false;
      // Optimistic update
      const updatedItem: ShoppingListItem = {
        ...item,
        isChecked: !currentChecked,
        is_checked: !currentChecked,
      };
      updateListItem(listId, updatedItem);

      try {
        const serverItem = await listService.updateItem(listId, item.id, {
          is_checked: !currentChecked,
        });
        // Merge: keep enriched fields (product_name, etc.) from the local item;
        // take is_checked and quantity from the server response.
        updateListItem(listId, {
          ...item,
          ...serverItem,
          product_name: item.product_name ?? serverItem.product_name,
          category_name: item.category_name ?? serverItem.category_name,
          isChecked: serverItem.is_checked ?? !currentChecked,
          is_checked: serverItem.is_checked ?? !currentChecked,
        });
      } catch {
        // Rollback optimistic update
        updateListItem(listId, item);
        Alert.alert("Error", "No se pudo actualizar el producto.");
      }
    },
    [listId, updateListItem],
  );

  // ─── Delete item ──────────────────────────────────────────────────────────
  const handleDeleteItem = useCallback(
    async (item: ShoppingListItem) => {
      try {
        await listService.deleteItem(listId, item.id);
        const currentList = useListStore.getState().activeList;
        if (currentList) {
          setActiveList({
            ...currentList,
            items: currentList.items.filter((i) => i.id !== item.id),
          });
        }
      } catch {
        Alert.alert("Error", "No se pudo eliminar el producto.");
      }
    },
    [listId, setActiveList],
  );

  const renderItem = makeRenderItem(handleToggleItem, handleDeleteItem);
  const items = activeList?.items ?? [];

  // ─── Loading skeleton ─────────────────────────────────────────────────────
  const skeletonItems = isLoading ? (
    <View style={styles.skeletonContainer}>
      <SkeletonBox testID="skeleton-item-0" width="100%" height={48} borderRadius={8} style={styles.skeletonRow} />
      <SkeletonBox testID="skeleton-item-1" width="100%" height={48} borderRadius={8} style={styles.skeletonRow} />
      <SkeletonBox testID="skeleton-item-2" width="100%" height={48} borderRadius={8} style={styles.skeletonRow} />
      <SkeletonBox testID="skeleton-item-3" width="100%" height={48} borderRadius={8} style={styles.skeletonRow} />
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      {/* Items section */}
      {isLoading ? (
        skeletonItems
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            items.length === 0
              ? styles.emptyContentContainer
              : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Añade productos con el buscador de abajo
              </Text>
            </View>
          }
        />
      )}

      {/* Search / Add products section */}
      <View style={styles.searchSection}>
        {/* Autocomplete results overlay */}
        {(suggestions.length > 0 || isSearching) && (
          <View style={styles.autocompleteContainer}>
            {isSearching ? (
              <View style={styles.autocompleteSkeletons}>
                <SkeletonBox testID="skeleton-autocomplete-0" width="100%" height={32} borderRadius={4} style={styles.autocompleteSkeletonRow} />
                <SkeletonBox testID="skeleton-autocomplete-1" width="100%" height={32} borderRadius={4} style={styles.autocompleteSkeletonRow} />
                <SkeletonBox testID="skeleton-autocomplete-2" width="100%" height={32} borderRadius={4} style={styles.autocompleteSkeletonRow} />
              </View>
            ) : (
              <FlatList
                data={suggestions}
                keyExtractor={(p) => p.id}
                renderItem={({ item: product }) => (
                  <AutocompleteRow product={product} onSelect={handleSelectProduct} />
                )}
                scrollEnabled={suggestions.length > 3}
                style={styles.autocompleteList}
              />
            )}
          </View>
        )}

        {/* Search input */}
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            testID="autocomplete-search-input"
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Añade productos a tu lista…"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel="Buscar productos para añadir"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSuggestions([]);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
            >
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  skeletonRow: {
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 120, // space for search section
  },
  emptyContentContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  headerBadge: {
    ...textStyles.bodySmall,
    color: colors.textMuted,
    marginRight: spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
    minHeight: 48,
  },
  checkbox: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  itemName: {
    ...textStyles.bodyMedium,
    color: colors.text,
  },
  itemNameChecked: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  itemMeta: {
    ...textStyles.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  searchSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 48,
    gap: spacing.xs,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    color: colors.text,
    paddingVertical: 0,
    height: "100%",
  },
  autocompleteContainer: {
    position: "absolute",
    bottom: 72, // above search bar
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 220,
    overflow: "hidden",
    zIndex: 10,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  autocompleteList: {
    maxHeight: 220,
  },
  autocompleteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  autocompleteContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  autocompleteName: {
    ...textStyles.bodyMedium,
    color: colors.text,
  },
  autocompleteCategory: {
    ...textStyles.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  autocompleteSkeletons: {
    padding: spacing.md,
  },
  autocompleteSkeletonRow: {
    marginBottom: spacing.xs,
  },
});
