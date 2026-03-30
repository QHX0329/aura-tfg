/**
 * Hook reutilizable para resolver nombres de producto a partir de IDs.
 *
 * Extrae la lógica duplicada que existía en DashboardPage, PricesPage,
 * PromotionsPage y ProductsUploadPage.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { apiClient } from '../api/client';
import {
  collectUnresolvedEntityIds,
  type EntityLike,
} from '../utils/entityResolver';

interface ProductLookup {
  id: number;
  name: string;
}

/**
 * Dado un array de entidades (que pueden contener product IDs),
 * resuelve los nombres haciendo fetch al backend solo de los que faltan.
 */
export function useResolveProductNames(entities: EntityLike[]) {
  const [namesById, setNamesById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const prevIdsRef = useRef<string>('');

  const resolve = useCallback(async (items: EntityLike[]) => {
    const unresolvedIds = collectUnresolvedEntityIds(items, namesById);
    if (unresolvedIds.length === 0) return;

    // Evitar re-fetch si los IDs no cambiaron
    const key = unresolvedIds.sort().join(',');
    if (key === prevIdsRef.current) return;
    prevIdsRef.current = key;

    setLoading(true);
    try {
      const results = await Promise.allSettled(
        unresolvedIds.map((id) =>
          apiClient.get<ProductLookup>(`/products/${id}/`).then((r) => r.data),
        ),
      );

      const newNames: Record<string, string> = {};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.name) {
          newNames[unresolvedIds[index]] = result.value.name;
        }
      });

      if (Object.keys(newNames).length > 0) {
        setNamesById((prev) => ({ ...prev, ...newNames }));
      }
    } finally {
      setLoading(false);
    }
  }, [namesById]);

  useEffect(() => {
    if (entities.length > 0) {
      void resolve(entities);
    }
  }, [entities, resolve]);

  return { productNamesById: namesById, resolving: loading };
}
