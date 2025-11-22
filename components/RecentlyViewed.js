import Link from 'next/link'
import Image from 'next/image'
import styles from '../styles/RecentlyViewed.module.css'

/**
 * 최근 본 상품 목록 컴포넌트
 *
 * @param {Object[]} products - 최근 본 상품 객체 배열
 * @returns {JSX.Element | null} 상품이 없으면 null, 있으면 가로 스크롤 리스트 반환
 *
 * @description
 * 사용자가 이전에 조회했던 상품들을 가로 스크롤 가능한 카드 형태로 보여줍니다.
 * 모바일에서는 터치 스크롤이 가능하며, 데스크탑에서는 스크롤바가 숨겨진 채로 동작합니다.
 */
export default function RecentlyViewed({ products }) {
    // 상품이 없으면 섹션 자체를 렌더링하지 않습니다.
    if (!products || products.length === 0) return null

    return (
        <section className={styles.container}>
            <h3 className={styles.title}>최근 본 상품</h3>
            <div className={styles.scrollArea}>
                {/* 가로 스크롤 컨테이너 */}
                <div className={styles.list}>
                    {products.map((product) => (
                        <Link
                            href={`/product/${product.id}`}
                            key={product.id}
                            className={styles.card}
                        >
                            <div className={styles.imageWrapper}>
                                {/* Next.js Image 컴포넌트로 최적화된 이미지 로딩 */}
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className={styles.image}
                                    sizes="120px"
                                />
                                {/* 할인율이 있을 때만 뱃지 표시 */}
                                {product.discountRate > 0 && (
                                    <span className={styles.discountBadge}>
                                        {product.discountRate}%
                                    </span>
                                )}
                            </div>
                            <div className={styles.info}>
                                <div className={styles.brand}>{product.brand}</div>
                                <div className={styles.name}>{product.name}</div>
                                <div className={styles.price}>
                                    {product.salePrice.toLocaleString()}원
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
