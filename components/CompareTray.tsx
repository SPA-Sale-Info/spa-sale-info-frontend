/**
 * CompareTray.tsx - 상품 비교 트레이 & 비교 표 모달
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 1) 비교함에 담긴 상품이 있으면 화면 하단에 고정 트레이(bar)를 보여줍니다.
 *    - 담긴 상품 썸네일 + 개별 제거(✕)
 *    - "전체 비교" 버튼 → 비교 표 모달 열기
 *    - "비우기" 버튼
 * 2) "전체 비교"를 누르면 상품들을 항목별로 나란히 비교하는 표를 모달로 띄웁니다.
 *    - 브랜드 / 할인가 / 원가 / 할인율 / 성별 / 사이즈 / 색상 / 재고 / 외부링크
 *
 * 여러 브랜드 세일을 "비교"하는 서비스의 핵심 가치를 직접 보여주는 기능입니다.
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import styles from '../styles/CompareTray.module.css';
import { BRAND_METADATA } from '../types';
import type { Brand, Gender, NormalizedProduct } from '../types';

interface CompareTrayProps {
  items: NormalizedProduct[];                       // 비교함 상품들
  onRemove: (productId: string) => void;            // 개별 제거
  onClear: () => void;                              // 전체 비우기
}

// 가격 포맷 유틸 ("12,900원")
function formatPrice(price: number | null | undefined): string {
  if (typeof price !== 'number' || Number.isNaN(price)) return '-';
  return `${price.toLocaleString('ko-KR')}원`;
}

const GENDER_LABEL: Record<Gender, string> = { MAN: '남성', WOMAN: '여성', UNISEX: '공용' };

function brandLabel(brand: Brand): string {
  return BRAND_METADATA[brand]?.name || brand;
}

export default function CompareTray({ items, onRemove, onClear }: CompareTrayProps) {
  // 비교 표 모달 열림 여부
  const [isOpen, setIsOpen] = useState(false);

  // 담긴 게 없으면 트레이 자체를 렌더하지 않습니다.
  if (items.length === 0) {
    return null;
  }

  /**
   * 비교 표의 "행(항목)" 정의
   * 각 행은 라벨과 "상품 → 셀 내용" 변환 함수로 구성합니다.
   * 이렇게 데이터 기반으로 표를 만들면 항목 추가/삭제가 쉽습니다.
   */
  const rows: { label: string; render: (p: NormalizedProduct) => React.ReactNode }[] = [
    { label: '브랜드', render: (p) => brandLabel(p.brand) },
    { label: '할인가', render: (p) => <strong>{formatPrice(p.salePrice)}</strong> },
    { label: '원가', render: (p) => (p.originalPrice ? <s>{formatPrice(p.originalPrice)}</s> : '-') },
    { label: '할인율', render: (p) => (p.discountRate > 0 ? `${p.discountRate}%` : '-') },
    { label: '성별', render: (p) => GENDER_LABEL[p.gender] },
    { label: '사이즈', render: (p) => (p.sizes.length > 0 ? p.sizes.join(', ') : '-') },
    { label: '색상', render: (p) => (p.colors.length > 0 ? p.colors.join(', ') : '-') },
    {
      label: '재고',
      render: (p) => (p.inStock === false ? '품절' : p.inStock === true ? '재고 있음' : '-'),
    },
  ];

  return (
    <>
      {/* 하단 고정 트레이 */}
      <div className={styles.tray} role="region" aria-label="상품 비교함">
        <div className={styles.trayInner}>
          {/* 담긴 상품 썸네일 목록 */}
          <div className={styles.thumbs}>
            {items.map((item) => (
              <div key={item.id} className={styles.thumb}>
                <Image src={item.imageUrl} alt={item.name} width={44} height={56} className={styles.thumbImg} />
                <button
                  type="button"
                  className={styles.thumbRemove}
                  onClick={() => onRemove(item.id)}
                  aria-label={`${item.name} 비교함에서 제거`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* 액션 버튼들 */}
          <div className={styles.trayActions}>
            <span className={styles.trayCount}>{items.length}개 담김</span>
            <button type="button" className={styles.clearBtn} onClick={onClear}>
              비우기
            </button>
            <button
              type="button"
              className={styles.compareBtn}
              onClick={() => setIsOpen(true)}
              // 2개 미만이면 비교 의미가 약하지만, 1개도 볼 수 있게 허용합니다.
            >
              전체 비교 →
            </button>
          </div>
        </div>
      </div>

      {/* 비교 표 모달 */}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)} role="presentation">
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="상품 비교 표"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>상품 비교</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsOpen(false)}
                aria-label="비교 표 닫기"
              >
                ✕
              </button>
            </div>

            {/* 표: 가로 스크롤 허용(상품이 많아도 안전) */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.rowHeader} scope="col">항목</th>
                    {items.map((item) => (
                      <th key={item.id} scope="col" className={styles.productHead}>
                        <Link href={`/product/${item.id}`} className={styles.productHeadLink}>
                          <Image src={item.imageUrl} alt={item.name} width={80} height={100} className={styles.headImg} />
                          <span className={styles.headName}>{item.name}</span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className={styles.rowHeader}>{row.label}</th>
                      {items.map((item) => (
                        <td key={item.id} className={styles.cell}>{row.render(item)}</td>
                      ))}
                    </tr>
                  ))}
                  {/* 마지막 행: 외부 사이트 구매 링크 */}
                  <tr>
                    <th scope="row" className={styles.rowHeader}>구매</th>
                    {items.map((item) => (
                      <td key={item.id} className={styles.cell}>
                        {item.productUrl && item.productUrl !== '#' ? (
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className={styles.buyLink}
                          >
                            {brandLabel(item.brand)}에서 보기 →
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
