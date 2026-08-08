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

/**
 * FALLBACK_IMAGE - 상품 이미지 URL이 없거나 깨졌을 때 카드에 대신 표시할 이미지
 *
 * 이전 값(placeholder-product.svg)은 구 디자인 시스템에서 남은 청보라 그라데이션 +
 * 영문 "No Image" 텍스트라, 현재의 모노크롬 웜그레이 팔레트와 충돌했습니다.
 * ARCA 팔레트(#F1F1EE 배경 / #DCDCD6 실루엣)에 맞춘 옷걸이 일러스트로 교체해
 * 이미지가 깨진 카드도 그리드 안에서 튀지 않고 자연스럽게 섞이도록 했습니다.
 */
const FALLBACK_IMAGE = '/placeholder-product.jpg';

export const CATEGORY_GROUPS: Record<Category, string[]> = {
  TOP: ['TOP', 'SHIRT', 'T_SHIRT', 'KNIT', 'SWEATSHIRT', 'DRESS', 'BLOUSE'],
  BOTTOM: ['BOTTOM', 'PANTS', 'JEANS', 'SHORTS', 'SKIRT'],
  OUTER: ['OUTER', 'JACKET', 'COAT', 'PADDING'],
  SHOES: ['SHOES'],
  ETC: ['ETC', 'ACCESSORIES', 'BAG', 'UNCATEGORIZED', 'UNKNOWN'],
};

const CATEGORY_CODES = Object.keys(CATEGORY_GROUPS) as Category[];

/**
 * GENDER_ALIASES - 백엔드/외부 데이터의 다양한 성별 표기를 프론트 표준 코드로 변환하는 맵
 *
 * 왜 필요한가요?
 * 실제 백엔드(Heroku)는 성별을 'MEN'/'WOMEN'으로 내려주는데,
 * 프론트의 Gender 타입은 'MAN'/'WOMAN'/'UNISEX'입니다.
 * 이 매핑이 없으면 모든 상품이 기본값 'UNISEX(공용)'로 잘못 표시되고,
 * 성별 필터도 아무 상품과 매칭되지 않습니다. (실제로 발생했던 버그)
 */
const GENDER_ALIASES: Record<string, Gender> = {
  MAN: 'MAN',
  MEN: 'MAN',       // 백엔드 실제 값
  MALE: 'MAN',
  M: 'MAN',
  WOMAN: 'WOMAN',
  WOMEN: 'WOMAN',   // 백엔드 실제 값
  FEMALE: 'WOMAN',
  W: 'WOMAN',
  F: 'WOMAN',
  UNISEX: 'UNISEX',
  COMMON: 'UNISEX',
  ALL: 'UNISEX',
};

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
  // 'women ' → 'WOMEN' 처럼 공백 제거·대문자화 후 별칭 맵에서 표준 코드를 찾습니다.
  const normalized = normalizeCode(value).replace(/_/g, '');
  // 별칭 맵에 없는 값(빈 문자열, 알 수 없는 코드)은 안전하게 'UNISEX'로 처리합니다.
  return GENDER_ALIASES[normalized] ?? 'UNISEX';
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
