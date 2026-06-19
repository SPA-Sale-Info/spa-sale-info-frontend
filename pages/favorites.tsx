/**
 * favorites.tsx - 찜한 상품 목록 페이지 (TypeScript 버전)
 *
 * 로컬 저장된 찜 목록을 보여주고, 전체 삭제 기능을 제공합니다.
 * TypeScript 문법 포인트:
 * - useState<boolean>으로 상태 타입을 명시할 수 있습니다.
 */

import { useState } from 'react';
import Link from 'next/link';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import useFavorites from '../hooks/useFavorites';
import styles from '../styles/Favorites.module.css';

export default function Favorites() {
  // 커스텀 훅에서 찜 데이터와 함수들을 가져옵니다.
  const { favorites, toggleFavorite, isFavorite, getFavoriteCount } = useFavorites();
  // "전체 삭제 확인" UI를 보여줄지 여부
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 페이지 타이틀은 찜 개수에 따라 동적으로 표시
  const pageTitle = `찜한 상품 (${getFavoriteCount()}개) | 맛 프로젝트`;

  // 전체 삭제 버튼 클릭 시 동작
  const handleClearAll = () => {
    if (showClearConfirm) {
      // clearFavorites 함수가 useFavorites 훅에 없으므로 모든 항목을 개별적으로 제거
      favorites.forEach((product) => toggleFavorite(product));
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
    }
  };

  // 삭제 취소 버튼
  const handleCancelClear = () => {
    setShowClearConfirm(false);
  };

  return (
    <>
      <SEO
        title={pageTitle}
        description="찜한 상품을 모아보고 저렴한 가격에 구매하세요."
        canonical="https://mion-spa-info.vercel.app/favorites"
      />

      <div className={styles.container}>
        {/* 헤더 영역 */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.backLink}>
              ← 홈으로
            </Link>

            <h1 className={styles.title}>
              <span className={styles.heartIcon}>♥</span>
              찜한 상품
            </h1>

            {favorites.length > 0 && (
              <div className={styles.headerActions}>
                {showClearConfirm ? (
                  <div className={styles.confirmActions}>
                    <button
                      onClick={handleClearAll}
                      className={`${styles.actionButton} ${styles.confirmButton}`}
                    >
                      전체 삭제 확인
                    </button>
                    <button
                      onClick={handleCancelClear}
                      className={`${styles.actionButton} ${styles.cancelButton}`}
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button onClick={handleClearAll} className={`${styles.actionButton} ${styles.clearButton}`}>
                    전체 삭제
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className={styles.main}>
          {favorites.length === 0 ? (
            /* 찜 목록이 비어있을 때 */
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>♡</div>
              <h2 className={styles.emptyTitle}>아직 찜한 상품이 없어요</h2>
              <p className={styles.emptyDescription}>마음에 드는 상품을 찜하고 나중에 다시 확인해보세요.</p>
              <Link href="/" className={styles.emptyButton}>
                상품 둘러보기
              </Link>
            </div>
          ) : (
            /* 찜 목록이 있을 때 */
            <>
              <div className={styles.summary}>
                <p className={styles.summaryText}>
                  총 <strong>{getFavoriteCount()}개</strong>의 상품을 찜하셨습니다.
                </p>
              </div>

              <div className={styles.grid}>
                {favorites.map((product) => (
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
                    onFavoriteToggle={toggleFavorite}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        {/* 푸터 */}
        <footer className={styles.footer}>
          <p className={styles.footerText}>
            찜한 상품은 브라우저에 저장되며, 브라우저 데이터를 삭제하면 함께 삭제됩니다.
          </p>
        </footer>
      </div>
    </>
  );
}
