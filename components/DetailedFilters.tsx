import styles from '../styles/DetailedFilters.module.css';

// const DISCOUNT_OPTIONS = [
//   { label: '30% 이상', value: 30 },
//   { label: '50% 이상', value: 50 },
//   { label: '70% 이상', value: 70 },
// ];

// const PRICE_OPTIONS = [
//   { label: '3만원 이하', value: 30000 },
//   { label: '5만원 이하', value: 50000 },
//   { label: '10만원 이하', value: 100000 },
// ];

interface DetailedFiltersProps {
  selectedDiscount: number;
  onDiscountChange: (discount: number) => void;
  selectedPrice: number;
  onPriceChange: (price: number) => void;
}

/**
 * 상세 필터 컴포넌트 (TypeScript 버전)
 */
export default function DetailedFilters(_props: DetailedFiltersProps) {
  return (
    <div className={styles.container}>
      {/* 할인율 필터 그룹 - 주석처리됨 */}
      {/* <div className={styles.group}>
                <span className={styles.label}>할인율</span>
                <div className={styles.options}>
                    <button
                        className={`${styles.chip} ${selectedDiscount === 0 ? styles.active : ''}`}
                        onClick={() => onDiscountChange(0)}
                    >
                        전체
                    </button>
                    {DISCOUNT_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            className={`${styles.chip} ${selectedDiscount === option.value ? styles.active : ''}`}
                            onClick={() => onDiscountChange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div> */}

      {/* 가격대 필터 그룹 - 주석처리됨 */}
      {/* <div className={styles.group}>
                <span className={styles.label}>가격대</span>
                <div className={styles.options}>
                    <button
                        className={`${styles.chip} ${selectedPrice === Infinity ? styles.active : ''}`}
                        onClick={() => onPriceChange(Infinity)}
                    >
                        전체
                    </button>
                    {PRICE_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            className={`${styles.chip} ${selectedPrice === option.value ? styles.active : ''}`}
                            onClick={() => onPriceChange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div> */}
    </div>
  );
}
