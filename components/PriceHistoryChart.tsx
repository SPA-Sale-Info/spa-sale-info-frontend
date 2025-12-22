/**
 * PriceHistoryChart.tsx - 가격 변동 히스토리 차트 컴포넌트 (TypeScript 버전)
 */

import { useMemo } from 'react';
import styles from '../styles/PriceHistoryChart.module.css';

// props 타입: 원가/할인가/할인율
interface PriceHistoryChartProps {
  originalPrice: number;
  salePrice: number;
  discountRate?: number;
}

/**
 * 숫자를 한국 원화 형식으로 포맷
 */
// 가격 표시용 포맷 함수
function formatPrice(price: number | null | undefined): string {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return '가격 정보 없음';
  }

  return `${price.toLocaleString('ko-KR')}원`;
}

function PriceHistoryChart({ originalPrice, salePrice }: PriceHistoryChartProps) {
  /**
   * 그래프 데이터 계산
   */
  const chartData = useMemo(() => {
    // 숫자가 아니면 0으로 보정해 계산 오류를 방지
    const safeOriginalPrice = typeof originalPrice === 'number' && !Number.isNaN(originalPrice)
      ? originalPrice
      : 0;
    const safeSalePrice = typeof salePrice === 'number' && !Number.isNaN(salePrice)
      ? salePrice
      : 0;
    // 할인 금액과 퍼센트 계산
    const discount = Math.max(safeOriginalPrice - safeSalePrice, 0);
    const discountPercent = safeOriginalPrice > 0 ? Math.round((discount / safeOriginalPrice) * 100) : 0;
    const salePricePercent = 100 - discountPercent;

    return {
      originalPrice: safeOriginalPrice,
      salePrice: safeSalePrice,
      discount,
      discountPercent,
      salePricePercent,
    };
  }, [originalPrice, salePrice]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>💰 가격 분석</h3>
        <p className={styles.subtitle}>
          원가 대비 <strong>{chartData.discountPercent}%</strong> 할인된 가격입니다
        </p>
      </div>

      {/* 가격 비교 차트 */}
      <div className={styles.chartWrapper}>
        <div className={styles.chart}>
          {/* 원가 바 */}
          <div className={styles.barContainer}>
            <div className={styles.barLabel}>
              <span className={styles.labelText}>원가</span>
              <span className={styles.labelPrice}>{formatPrice(originalPrice)}</span>
            </div>
            <div className={styles.barWrapper}>
              <div className={`${styles.bar} ${styles.barOriginal}`} style={{ width: '100%' }}>
                <span className={styles.barPercentage}>100%</span>
              </div>
            </div>
          </div>

          {/* 할인가 바 */}
          <div className={styles.barContainer}>
            <div className={styles.barLabel}>
              <span className={styles.labelText}>할인가</span>
              <span className={`${styles.labelPrice} ${styles.salePriceText}`}>{formatPrice(salePrice)}</span>
            </div>
            <div className={styles.barWrapper}>
              <div
                className={`${styles.bar} ${styles.barSale}`}
                style={{ width: `${chartData.salePricePercent}%` }}
              >
                <span className={styles.barPercentage}>{chartData.salePricePercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 할인 정보 카드 */}
        <div className={styles.discountInfo}>
          <div className={styles.discountIcon}>🎉</div>
          <div className={styles.discountText}>
            <div className={styles.discountAmount}>{formatPrice(chartData.discount)} 절약</div>
            <div className={styles.discountLabel}>원가 대비 할인 금액</div>
          </div>
        </div>
      </div>

      {/* 가격 정보 상세 */}
      <div className={styles.priceDetails}>
        <div className={styles.detailItem}>
          <div className={styles.detailIcon}>🏷️</div>
          <div className={styles.detailContent}>
            <div className={styles.detailLabel}>원가</div>
            <div className={styles.detailValue}>{formatPrice(originalPrice)}</div>
          </div>
        </div>

        <div className={styles.detailDivider}>→</div>

        <div className={styles.detailItem}>
          <div className={styles.detailIcon}>💎</div>
          <div className={styles.detailContent}>
            <div className={styles.detailLabel}>할인가</div>
            <div className={`${styles.detailValue} ${styles.saleValue}`}>{formatPrice(salePrice)}</div>
          </div>
        </div>

        <div className={styles.detailDivider}>→</div>

        <div className={styles.detailItem}>
          <div className={styles.detailIcon}>📊</div>
          <div className={styles.detailContent}>
            <div className={styles.detailLabel}>할인율</div>
            <div className={`${styles.detailValue} ${styles.discountValue}`}>{chartData.discountPercent}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceHistoryChart;
