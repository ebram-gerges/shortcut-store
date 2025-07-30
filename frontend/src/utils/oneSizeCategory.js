// Helper to check if a category or subcategory is a one-size category
export function isOneSizeCategory(category, subcategory) {
  const targets = [category?.name, category?.slug, subcategory?.name, subcategory?.slug]
    .filter(Boolean)
    .map(s => s.toLowerCase());
  return targets.some(s =>
    s.includes('sweatpant') ||
    s.includes('suit') ||
    s.includes('basic top')
  );
} 