import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/RecentlyViewed.module.css';

// 최근 본 상품 카드에서 필요한 데이터 구조
interface RecentlyViewedProduct {
  id: string;
  name: string;
  brand: string;
  salePrice: number;
  imageUrl: string;
  discountRate?: number;
}

// 컴포넌트에 전달되는 props 타입
interface RecentlyViewedProps {
  products: RecentlyViewedProduct[];
}

/**
 * 최근 본 상품 목록 컴포넌트 (TypeScript 버전)
 */
export default function RecentlyViewed({ products }: RecentlyViewedProps) {
  if (!products || products.length === 0) return null;

  // 가격 표시는 숫자 유효성을 검사한 뒤 출력
  const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== 'number' || Number.isNaN(price)) {
      return '가격 정보 없음';
    }
    return `${price.toLocaleString('ko-KR')}원`;
  };

  return (
    <section className={styles.container}>
      <h3 className={styles.title}>최근 본 상품</h3>
      <div className={styles.scrollArea}>
        <div className={styles.list}>
          {products.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className={styles.image}
                  sizes="120px"
                />
                {product.discountRate && product.discountRate > 0 && (
                  <span className={styles.discountBadge}>{product.discountRate}%</span>
                )}
              </div>
              <div className={styles.info}>
                <div className={styles.brand}>{product.brand}</div>
                <div className={styles.name}>{product.name}</div>
                <div className={styles.price}>{formatPrice(product.salePrice)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
