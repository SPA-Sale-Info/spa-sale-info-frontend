import {
  BRAND_METADATA,
  isBrand,
} from '../types';
import type {
  ApiProduct,
  Brand,
  Category,
  Gender,
  NormalizedProduct,
} from '../types';

const FALLBACK_IMAGE = '/placeholder-product.svg';

export const CATEGORY_GROUPS: Record<Category, string[]> = {
  TOP: ['TOP', 'SHIRT', 'T_SHIRT', 'KNIT', 'SWEATSHIRT', 'DRESS', 'BLOUSE'],
  BOTTOM: ['BOTTOM', 'PANTS', 'JEANS', 'SHORTS', 'SKIRT'],
  OUTER: ['OUTER', 'JACKET', 'COAT', 'PADDING'],
  SHOES: ['SHOES'],
  ETC: ['ETC', 'ACCESSORIES', 'BAG', 'UNCATEGORIZED', 'UNKNOWN'],
};

const CATEGORY_CODES = Object.keys(CATEGORY_GROUPS) as Category[];
const GENDER_CODES: readonly Gender[] = ['MAN', 'WOMAN', 'UNISEX'];

const BRAND_ALIASES: Record<string, Brand> = {
  'H&M': 'HM',
  HNM: 'HM',
  'CHARLES & KEITH': 'CHARLESKEITH',
  'CHARLES_&_KEITH': 'CHARLESKEITH',
  'CHARLES&KEITH': 'CHARLESKEITH',
  CHARLES_AND_KEITH: 'CHARLESKEITH',
  CHARLESKEITH: 'CHARLESKEITH',
  'MASSIMO DUTTI': 'MASSIMODUTTI',
  MASSIMO_DUTTI: 'MASSIMODUTTI',
  MUSINSA_STANDARD: 'MUSINSASTANDARD',
  'MUSINSA STANDARD': 'MUSINSASTANDARD',
};

const normalizeCode = (value: unknown): string => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim().toUpperCase().replace(/[\s-]+/g, '_');
};

export const coerceNumber = (value: unknown): number => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[,\s원%]/g, ''));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

export const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const resolveImageUrl = (rawUrl: unknown): string => {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return FALLBACK_IMAGE;
  }

  const trimmed = rawUrl.trim();

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }

  return FALLBACK_IMAGE;
};

export const normalizeBrand = (product: ApiProduct): Brand => {
  const rawBrand = product.brandType ?? product.brand ?? product.brandName;
  const normalized = normalizeCode(rawBrand).replace(/_/g, '');
  const alias = BRAND_ALIASES[normalizeCode(rawBrand)] ?? BRAND_ALIASES[normalized];

  if (alias) {
    return alias;
  }

  return isBrand(normalized) ? normalized : 'UNKNOWN';
};

export const normalizeGender = (value: unknown): Gender => {
  const normalized = normalizeCode(value).replace(/_/g, '');
  return (GENDER_CODES as readonly string[]).includes(normalized)
    ? normalized as Gender
    : 'UNISEX';
};

export const normalizeCategory = (product: ApiProduct): {
  category: Category;
  subCategory?: string;
} => {
  const rawMainCategory = normalizeCode(product.mainCategory);
  const rawSubCategory = normalizeCode(product.category ?? product.subCategory);
  const categoryKey = rawMainCategory || rawSubCategory || 'UNCATEGORIZED';

  if ((CATEGORY_CODES as readonly string[]).includes(categoryKey)) {
    return {
      category: categoryKey as Category,
      subCategory: rawSubCategory || undefined,
    };
  }

  const match = Object.entries(CATEGORY_GROUPS).find(([, items]) => items.includes(categoryKey));

  return {
    category: match ? match[0] as Category : 'ETC',
    subCategory: rawSubCategory || categoryKey,
  };
};

export const normalizeProduct = (product: ApiProduct = {}): NormalizedProduct => {
  const brand = normalizeBrand(product);
  const { category, subCategory } = normalizeCategory(product);
  const originalPrice = coerceNumber(product.originalPrice);
  const salePriceSource = product.currentPrice !== undefined ? product.currentPrice : product.salePrice;
  const salePrice = coerceNumber(salePriceSource);
  const rawDiscountRate = coerceNumber(product.discountRate);
  const discountRate = rawDiscountRate > 0
    ? rawDiscountRate
    : (originalPrice
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0);
  const rawImageUrls = normalizeStringArray(product.imageUrls);
  const imageUrls = rawImageUrls.map(resolveImageUrl).filter(Boolean);
  const imageUrl = imageUrls[0] || resolveImageUrl(product.imageUrl);
  const rawId = product.id ?? product.productCode ?? `${brand}-${product.name ?? 'unknown'}`;
  const id = String(rawId);
  const tags = normalizeStringArray(product.tags);
  const explicitVibeTags = normalizeStringArray(product.vibeTags);
  const vibeTags = explicitVibeTags.length > 0 ? explicitVibeTags : tags;
  const colors = normalizeStringArray(product.colors);
  const sizes = normalizeStringArray(product.sizes);

  return {
    id,
    brand,
    brandCode: brand,
    brandName: product.brandName || BRAND_METADATA[brand].name,
    productCode: String(product.productCode ?? id),
    name: product.name || '이름 미정',
    description: product.description || undefined,
    gender: normalizeGender(product.gender),
    category,
    mainCategory: category,
    categoryGroup: category,
    subCategory,
    originalPrice,
    salePrice,
    price: salePrice,
    currentPrice: salePrice,
    discountRate,
    onSale: discountRate > 0,
    imageUrl,
    imageUrls: imageUrls.length > 0 ? imageUrls : [imageUrl],
    productUrl: product.productUrl || '#',
    colors,
    sizes,
    inStock: typeof product.inStock === 'boolean' ? product.inStock : undefined,
    material: product.material || undefined,
    tags,
    vibeTags,
    vibe: vibeTags[0] ?? null,
    saleStartDate: product.saleStartDate || undefined,
    saleEndDate: product.saleEndDate || undefined,
    viewCount: coerceNumber(product.viewCount),
    likeCount: coerceNumber(product.likeCount),
    createdAt: product.createdAt || undefined,
    updatedAt: product.updatedAt || undefined,
  };
};

export const normalizeProducts = (products: ApiProduct[] = []): NormalizedProduct[] => {
  return products.map((product) => normalizeProduct(product));
};
