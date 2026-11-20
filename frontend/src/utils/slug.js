
export const toProductSlug = (product) => {
  // Use DB slug if available (preferred)
  if (product?.slug) return product.slug;

  // Fallback: generate from name (for products without slug yet)
  const name = product?.name || 'product';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};