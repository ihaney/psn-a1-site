/**
 * URL helper utilities for creating SEO-friendly URLs
 */

/**
 * Converts a string to a URL-friendly slug
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

/**
 * Creates a supplier URL with slug and ID
 * @param supplierTitle The supplier's title
 * @param supplierId The supplier's unique ID
 * @returns A pretty URL for the supplier page
 */
export function createSupplierUrl(supplierTitle: string, supplierId: string): string {
  const slug = slugify(supplierTitle);
  return `/supplier/${slug}/${supplierId}`;
}

/**
 * Extracts supplier ID from URL parameters
 * @param params URL parameters object
 * @returns The supplier ID or null if not found
 */
export function getSupplierIdFromParams(params: { slug?: string; supplierId?: string }): string | null {
  return params.supplierId || null;
}