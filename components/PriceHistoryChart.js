/**
 * PriceHistoryChart.js
 *
 * 가격 변동 히스토리를 시각적으로 보여주는 차트 컴포넌트
 * 원가에서 현재가까지의 할인 폭을 그래프로 표현합니다.
 *
 * Props:
 * - originalPrice: 원가
 * - salePrice: 할인가
 * - discountRate: 할인율
 */

import { useMemo } from 'react'
import styles from '../styles/PriceHistoryChart.module.css'

/**
 * 숫자를 한국 원화 형식으로 포맷
 */
function formatPrice(price) {
  return `${price.toLocaleString('ko-KR')}원`
}

function PriceHistoryChart({ originalPrice, salePrice, discountRate }) {
  /**
   * 그래프 데이터 계산
   * - 할인폭을 퍼센티지로 계산
   * - 애니메이션을 위한 값들 생성
   */
  const chartData = useMemo(() => {
    const discount = originalPrice - salePrice
    const discountPercent = Math.round((discount / originalPrice) * 100)
    const salePricePercent = 100 - discountPercent

    return {
      originalPrice,
      salePrice,
      discount,
      discountPercent,
      salePricePercent,
    }
  }, [originalPrice, salePrice])

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
              <div
                className={`${styles.bar} ${styles.barOriginal}`}
                style={{ width: '100%' }}
              >
                <span className={styles.barPercentage}>100%</span>
              </div>
            </div>
          </div>

          {/* 할인가 바 */}
          <div className={styles.barContainer}>
            <div className={styles.barLabel}>
              <span className={styles.labelText}>할인가</span>
              <span className={`${styles.labelPrice} ${styles.salePriceText}`}>
                {formatPrice(salePrice)}
              </span>
            </div>
            <div className={styles.barWrapper}>
              <div
                className={`${styles.bar} ${styles.barSale}`}
                style={{ width: `${chartData.salePricePercent}%` }}
              >
                <span className={styles.barPercentage}>
                  {chartData.salePricePercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 할인 정보 카드 */}
        <div className={styles.discountInfo}>
          <div className={styles.discountIcon}>🎉</div>
          <div className={styles.discountText}>
            <div className={styles.discountAmount}>
              {formatPrice(chartData.discount)} 절약
            </div>
            <div className={styles.discountLabel}>
              원가 대비 할인 금액
            </div>
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
            <div className={`${styles.detailValue} ${styles.saleValue}`}>
              {formatPrice(salePrice)}
            </div>
          </div>
        </div>

        <div className={styles.detailDivider}>→</div>

        <div className={styles.detailItem}>
          <div className={styles.detailIcon}>📊</div>
          <div className={styles.detailContent}>
            <div className={styles.detailLabel}>할인율</div>
            <div className={`${styles.detailValue} ${styles.discountValue}`}>
              {chartData.discountPercent}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceHistoryChart
