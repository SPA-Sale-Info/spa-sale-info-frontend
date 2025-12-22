/**
 * useFavorites.ts
 *
 * 찜/북마크 기능을 위한 커스텀 훅 (TypeScript 버전)
 * LocalStorage를 활용하여 사용자가 좋아하는 상품을 저장하고 관리합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';

// LocalStorage 키 상수 정의
const FAVORITES_STORAGE_KEY = 'mat_project_favorites';

// 찜 목록에 저장되는 간소화된 상품 정보
interface FavoriteItem {
  id: number;
  name: string;
  brand: string;
  brandCode?: string;
  brandName?: string;
  price: number;
  salePrice: number;
  originalPrice?: number;
  discountRate?: number;
  imageUrl: string;
  productUrl?: string;
  gender?: string;
  mainCategory?: string;
  category?: string;
  vibeTags?: string[];
  addedAt: string;
}

// 훅의 반환 타입
interface UseFavoritesReturn {
  favorites: FavoriteItem[];
  toggleFavorite: (product: Product | FavoriteItem) => void;
  isFavorite: (productId: number) => boolean;
  getFavoriteCount: () => number;
  checkPriceDrops: () => { hasDrop: boolean; product?: FavoriteItem; message?: string };
  isInitialized: boolean;
}

/**
 * useFavorites - 찜 기능 관리 커스텀 훅
 */
export default function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * LocalStorage에서 찜 목록을 불러오는 함수
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      setFavorites([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  /**
   * LocalStorage에 찜 목록을 저장하는 함수
   */
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites, isInitialized]);

  /**
   * toggleFavorite - 찜 추가/제거 토글 함수
   */
  const toggleFavorite = useCallback(
    (product: Product | FavoriteItem) => {
      if (!product || !product.id) {
        return;
      }

      const alreadyExists = favorites.some((fav) => fav.id === product.id);

      if (alreadyExists) {
        setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== product.id));
      } else {
        const favoriteItem: FavoriteItem = {
          id: product.id,
          name: product.name,
          brand: product.brand,
          brandCode: 'brandCode' in product ? product.brandCode : product.brand,
          brandName: 'brandName' in product ? product.brandName : product.brand,
          price: 'price' in product ? product.price : product.salePrice,
          salePrice: product.salePrice,
          originalPrice: product.originalPrice,
          discountRate: product.discountRate,
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          gender: product.gender,
          mainCategory: 'mainCategory' in product ? product.mainCategory : product.category,
          vibeTags: 'vibeTags' in product ? product.vibeTags : [],
          addedAt: new Date().toISOString(),
        };

        setFavorites((prevFavorites) => {
          if (prevFavorites.some((fav) => fav.id === product.id)) {
            return prevFavorites;
          }
          return [...prevFavorites, favoriteItem];
        });
      }
    },
    [favorites]
  );

  /**
   * isFavorite - 특정 상품이 찜되어 있는지 확인
   */
  const isFavorite = useCallback(
    (productId: number): boolean => {
      return favorites.some((fav) => fav.id === productId);
    },
    [favorites]
  );

  /**
   * getFavoriteCount - 찜한 상품 개수 반환
   */
  const getFavoriteCount = useCallback((): number => {
    return favorites.length;
  }, [favorites]);

  /**
   * checkPriceDrops - 가격 인하 알림 체크 함수 (시뮬레이션)
   */
  const checkPriceDrops = useCallback(() => {
    if (favorites.length > 0 && Math.random() > 0.9) {
      const randomProduct = favorites[Math.floor(Math.random() * favorites.length)];
      return {
        hasDrop: true,
        product: randomProduct,
        message: `${randomProduct.brand} ${randomProduct.name} 상품 가격이 인하되었습니다!`,
      };
    }
    return { hasDrop: false };
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
    checkPriceDrops,
    isInitialized,
  };
}
