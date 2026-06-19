/**
 * hooks/useCompare.ts - 상품 비교 기능 커스텀 훅 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 사용자가 여러 브랜드의 상품을 "비교함"에 담아 한 화면에서 나란히 비교하도록 합니다.
 * (여러 SPA 브랜드 세일을 모아 비교하는 서비스의 핵심 가치를 직접 구현하는 기능)
 *
 * - 최대 MAX_COMPARE개(4개)까지 담을 수 있습니다(표가 너무 넓어지는 것 방지).
 * - 선택 목록은 localStorage에 저장되어 새로고침/탭 닫기 후에도 유지됩니다.
 * - 다른 탭에서 변경되면 storage 이벤트로 동기화됩니다.
 *
 * useFavorites와 동일한 패턴(초기 로드 → 저장 → 토글)을 따릅니다.
 */

import { useState, useEffect, useCallback } from 'react';

import type { ApiProduct, NormalizedProduct, Product } from '../types';
import { normalizeProduct } from '../utils/productNormalization';

// localStorage 키 (다른 데이터와 충돌 방지를 위한 접두사)
const COMPARE_STORAGE_KEY = 'mat_project_compare';

// 비교함 최대 수용 개수 (UI 가독성을 위해 4개로 제한)
export const MAX_COMPARE = 4;

interface UseCompareReturn {
  compareItems: NormalizedProduct[];          // 비교함에 담긴 상품들
  toggleCompare: (product: Product) => void;   // 담기/빼기 토글
  removeCompare: (productId: string | number) => void; // 특정 상품 제거
  clearCompare: () => void;                     // 전체 비우기
  isComparing: (productId: string | number) => boolean; // 담겨 있는지 확인
  isFull: boolean;                              // 4개가 다 찼는지
  count: number;                                // 현재 담긴 개수
  isInitialized: boolean;                       // localStorage 로드 완료 여부
}

export default function useCompare(): UseCompareReturn {
  const [compareItems, setCompareItems] = useState<NormalizedProduct[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 로드: 마운트 시 localStorage에서 비교 목록을 읽어옵니다.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // 저장된 값을 다시 정규화하고, 최대 개수로 잘라 안전하게 복원합니다.
          const normalized = parsed
            .filter((item) => Boolean(item && typeof item === 'object' && item.id != null))
            .map((item) => normalizeProduct(item as ApiProduct))
            .slice(0, MAX_COMPARE);
          setCompareItems(normalized);
        }
      }
    } catch {
      setCompareItems([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 저장: 비교 목록이 바뀔 때마다 localStorage에 반영합니다(초기화 후에만).
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareItems));
    } catch {
      // 용량 초과 등은 무시
    }
  }, [compareItems, isInitialized]);

  // 다른 탭과 동기화: storage 이벤트가 발생하면 목록을 다시 읽습니다.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== COMPARE_STORAGE_KEY) return;
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : [];
        if (Array.isArray(parsed)) {
          setCompareItems(parsed.map((item) => normalizeProduct(item as ApiProduct)).slice(0, MAX_COMPARE));
        }
      } catch {
        /* noop */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleCompare = useCallback((product: Product) => {
    if (!product || product.id == null) return;
    const productId = String(product.id);

    setCompareItems((prev) => {
      const exists = prev.some((item) => item.id === productId);
      if (exists) {
        // 이미 담겨 있으면 제거
        return prev.filter((item) => item.id !== productId);
      }
      // 4개가 다 찼으면 더 담지 않습니다(호출부에서 안내 토스트 등을 띄울 수 있음).
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, normalizeProduct(product as ApiProduct)];
    });
  }, []);

  const removeCompare = useCallback((productId: string | number) => {
    const id = String(productId);
    setCompareItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const isComparing = useCallback(
    (productId: string | number) => {
      const id = String(productId);
      return compareItems.some((item) => item.id === id);
    },
    [compareItems],
  );

  return {
    compareItems,
    toggleCompare,
    removeCompare,
    clearCompare,
    isComparing,
    isFull: compareItems.length >= MAX_COMPARE,
    count: compareItems.length,
    isInitialized,
  };
}
