/**
 * FavoriteButton.tsx
 *
 * 찜하기 버튼 컴포넌트 (TypeScript 버전)
 * 사용자 클릭으로 찜 상태를 토글합니다.
 *
 * TypeScript 문법 포인트:
 * - type 별칭으로 제한된 문자열 값만 허용합니다.
 * - interface로 props 구조를 정의합니다.
 */

import React from 'react';
import styles from '../styles/FavoriteButton.module.css';
import type { Product } from '../types';

// 버튼 크기 타입 (허용되는 값만 지정)
type ButtonSize = 'small' | 'medium' | 'large';

// 컴포넌트가 받는 props 타입
interface FavoriteButtonProps {
  product: Product;
  isFavorite: boolean;
  onToggle: (product: Product) => void;
  size?: ButtonSize;
}

function FavoriteButton({ product, isFavorite, onToggle, size = 'medium' }: FavoriteButtonProps) {
  /**
   * 클릭 이벤트 핸들러
   */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 카드 전체 클릭 이벤트와 충돌하지 않도록 버블링을 막습니다.
    e.preventDefault();
    e.stopPropagation();
    onToggle(product);
  };

  return (
    <button
      className={`${styles.favoriteButton} ${styles[size]} ${
        isFavorite ? styles.active : ''
      }`}
      onClick={handleClick}
      aria-label={isFavorite ? '찜 취소' : '찜하기'}
      title={isFavorite ? '찜 취소' : '찜하기'}
    >
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
  );
}

export default FavoriteButton;
