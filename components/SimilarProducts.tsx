/**
 * components/SimilarProducts.tsx - 상품 상세 아래의 비슷한 상품
 *
 * 백엔드는 두 가지 방식으로 답합니다(응답의 strategy).
 * - IMAGE:    상품 이미지의 유사도로 찾은 결과 → 제목 "비슷한 상품"
 * - METADATA: 이미지 검색을 쓸 수 없을 때 같은 카테고리의 세일 상품으로 대체 → 제목 "같은 카테고리의 세일 상품"
 *
 * 대체 결과를 "비슷한 상품"이라고 부르면 사실과 다르므로 제목을 구분합니다. 유사도 점수는 보여주지 않습니다.
 * 결과가 없거나 호출이 실패하면(이 기능이 없는 서버 포함) 섹션 전체를 그리지 않습니다.
 */

import { useEffect, useState } from 'react';
import styles from '../styles/SimilarProducts.module.css';
import ProductCard from './ProductCard';
import type { NormalizedProduct, Product } from '../types';
import { normalizeProduct } from '../utils/productNormalization';
import { getSimilarProducts } from '../utils/userApi';

interface SimilarProductsProps {
  productId: string;
  isFavorite: (productId: string | number) => boolean;
  onFavoriteToggle: (product: Product) => void;
}

interface SimilarState {
  title: string;
  products: NormalizedProduct[];
}

export default function SimilarProducts({ productId, isFavorite, onFavoriteToggle }: SimilarProductsProps) {
  const [state, setState] = useState<SimilarState | null>(null);

  useEffect(() => {
    // 다른 상품으로 이동하면 이전 결과를 지우고, 늦게 도착한 이전 응답은 버립니다.
    let cancelled = false;
    setState(null);
    getSimilarProducts(productId)
      .then((result) => {
        if (cancelled) {
          return;
        }
        const products = result.items
          .map((item) => normalizeProduct(item.product))
          .filter((product) => product.id && product.id !== productId);
        setState({
          title: result.strategy === 'IMAGE' ? '비슷한 상품' : '같은 카테고리의 세일 상품',
          products,
        });
      })
      .catch(() => {
        // 부가 정보이므로 실패는 조용히 생략합니다.
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!state || state.products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label={state.title}>
      <h2 className={styles.title}>{state.title}</h2>
      <div className={styles.grid}>
        {state.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            brand={product.brand}
            name={product.name}
            salePrice={product.salePrice}
            originalPrice={product.originalPrice}
            discountRate={product.discountRate}
            imageUrl={product.imageUrl}
            isFavorite={isFavorite(product.id)}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    </section>
  );
}
