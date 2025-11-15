/**
 * favorites.js - 찜한 상품 목록 페이지
 *
 * 사용자가 찜한 상품들을 모아서 보여주는 페이지입니다.
 *
 * 주요 기능:
 * - LocalStorage에 저장된 찜 목록 표시
 * - 찜 목록이 비어있을 때 안내 메시지
 * - 찜 해제 기능
 * - 메인 페이지로 돌아가기
 */

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import ProductCard from '../components/ProductCard'
import useFavorites from '../hooks/useFavorites'
import styles from '../styles/Favorites.module.css'

export default function Favorites() {
  const { favorites, toggleFavorite, isFavorite, getFavoriteCount, clearFavorites } = useFavorites()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  /**
   * 페이지 제목 설정
   * 찜한 상품 개수를 제목에 포함
   */
  const pageTitle = `찜한 상품 (${getFavoriteCount()}개) | 맛 프로젝트`

  /**
   * 전체 삭제 확인 핸들러
   */
  const handleClearAll = () => {
    if (showClearConfirm) {
      clearFavorites()
      setShowClearConfirm(false)
    } else {
      setShowClearConfirm(true)
    }
  }

  /**
   * 전체 삭제 취소
   */
  const handleCancelClear = () => {
    setShowClearConfirm(false)
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="찜한 상품을 모아보고 저렴한 가격에 구매하세요."
        />
      </Head>

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
                  <button
                    onClick={handleClearAll}
                    className={`${styles.actionButton} ${styles.clearButton}`}
                  >
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
              <p className={styles.emptyDescription}>
                마음에 드는 상품을 찜하고 나중에 다시 확인해보세요.
              </p>
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
                    {...product}
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
  )
}
