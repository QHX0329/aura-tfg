import type { Product } from "@/types/domain";

export interface EntityReference {
  id: string | number;
  name?: string | null;
}

export type EntityLike = EntityReference | string | number | null | undefined;

interface ResolveEntityNameOptions {
  entity: EntityLike;
  byId?: Record<string, string>;
  fallback: string;
  preferredName?: string | null;
}

const normalizeName = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const getEntityId = (entity: EntityLike): string => {
  if (entity === null || entity === undefined) {
    return "";
  }

  if (typeof entity === "object" && "id" in entity) {
    return String(entity.id);
  }

  return String(entity);
};

export const getEmbeddedEntityName = (entity: EntityLike): string | undefined => {
  if (typeof entity !== "object" || entity === null) {
    return undefined;
  }

  return normalizeName(entity.name);
};

export const resolveEntityName = ({
  entity,
  byId,
  fallback,
  preferredName,
}: ResolveEntityNameOptions): string => {
  const preferred = normalizeName(preferredName);
  if (preferred) {
    return preferred;
  }

  const embedded = getEmbeddedEntityName(entity);
  if (embedded) {
    return embedded;
  }

  const entityId = getEntityId(entity);
  if (entityId && byId?.[entityId]) {
    return byId[entityId];
  }

  return fallback;
};

export const resolveProductNameFromEntity = (
  product: number | string | Product | null | undefined,
  productName?: string | null,
): string => {
  return resolveEntityName({
    entity: product as EntityLike,
    preferredName: productName,
    fallback: "Producto sin nombre",
  });
};
