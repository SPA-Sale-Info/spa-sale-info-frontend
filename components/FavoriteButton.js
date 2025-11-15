/**
 * FavoriteButton.js
 *
 * 찜하기 버튼 컴포넌트
 * ProductCard에 표시되어 사용자가 상품을 찜할 수 있도록 합니다.
 *
 * Props:
 * - product: 찜할 상품 객체
 * - isFavorite: 현재 찜 상태 (boolean)
 * - onToggle: 찜 토글 함수
 * - size: 버튼 크기 ('small' | 'medium' | 'large')
 */

import React from 'react'
import styles from '../styles/FavoriteButton.module.css'

function FavoriteButton({ product, isFavorite, onToggle, size = 'medium' }) {
  /**
   * 클릭 이벤트 핸들러
   * 이벤트 버블링을 막아 ProductCard의 클릭 이벤트와 충돌 방지
   */
  const handleClick = (e) => {
    // 이벤트 버블링 중지 (부모 요소의 클릭 이벤트 실행 방지)
    e.preventDefault()
    e.stopPropagation()

    // 찜 토글 함수 호출
    onToggle(product)
  }

  return (
    <button
      className={`${styles.favoriteButton} ${styles[size]} ${
        isFavorite ? styles.active : ''
      }`}
      onClick={handleClick}
      aria-label={isFavorite ? '찜 취소' : '찜하기'}
      title={isFavorite ? '찜 취소' : '찜하기'}
    >
      {/* 하트 아이콘 SVG */}
      <svg
        className={styles.heartIcon}
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  )
}

export default FavoriteButton
