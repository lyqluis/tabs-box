export const sortCollections = (collections: Collection[]): Collection[] => {
  const pinnedCollections = collections
    .filter((c) => c.pinned)
    .sort((a, b) => b.updated - a.updated)
  const restCollections = collections
    .filter((c) => !c.pinned)
    .sort((a, b) => b.updated - a.updated)
  return [...pinnedCollections, ...restCollections]
}
