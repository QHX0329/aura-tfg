export interface EntityReference {
  id: string | number;
  name?: string | null;
}

export type EntityLike = EntityReference | string | number | null | undefined;

interface NamedCatalogItem {
  id: string | number;
  name: string;
}

interface ResolveEntityNameOptions {
  entity: EntityLike;
  byId?: Record<string, string>;
  catalog?: NamedCatalogItem[];
  fallback: string;
}

const toNonEmptyName = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const getEntityId = (entity: EntityLike): string => {
  if (entity === null || entity === undefined) {
    return '';
  }

  if (typeof entity === 'object' && 'id' in entity) {
    return String(entity.id);
  }

  return String(entity);
};

export const hasEmbeddedEntityName = (entity: EntityLike): entity is EntityReference & { name: string } => {
  if (typeof entity !== 'object' || entity === null) {
    return false;
  }

  const resolvedName = toNonEmptyName(entity.name);
  return resolvedName !== undefined;
};

export const collectUnresolvedEntityIds = (
  entities: EntityLike[],
  byId: Record<string, string> = {},
): string[] => {
  return Array.from(
    new Set(
      entities
        .filter((entity) => !hasEmbeddedEntityName(entity))
        .map((entity) => getEntityId(entity))
        .filter((id) => id.length > 0 && !byId[id]),
    ),
  );
};

export const resolveEntityName = ({
  entity,
  byId,
  catalog,
  fallback,
}: ResolveEntityNameOptions): string => {
  if (hasEmbeddedEntityName(entity)) {
    return entity.name;
  }

  const entityId = getEntityId(entity);
  if (!entityId) {
    return fallback;
  }

  if (byId && byId[entityId]) {
    return byId[entityId];
  }

  if (catalog) {
    const item = catalog.find((candidate) => String(candidate.id) === entityId);
    if (item) {
      return item.name;
    }
  }

  return fallback;
};
