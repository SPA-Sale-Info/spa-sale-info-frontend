import styles from '../styles/DetailedFilters.module.css'

const DISCOUNT_OPTIONS = [
    { label: '30% 이상', value: 30 },
    { label: '50% 이상', value: 50 },
    { label: '70% 이상', value: 70 },
]

const PRICE_OPTIONS = [
    { label: '3만원 이하', value: 30000 },
    { label: '5만원 이하', value: 50000 },
    { label: '10만원 이하', value: 100000 },
]

/**
 * 상세 필터 컴포넌트
 * 
 * @param {number} selectedDiscount - 선택된 최소 할인율 (0이면 전체)
 * @param {function} onDiscountChange - 할인율 변경 핸들러
 * @param {number} selectedPrice - 선택된 최대 가격 (Infinity면 전체)
 * @param {function} onPriceChange - 가격 변경 핸들러
 * 
 * @description
 * 사용자가 할인율과 가격대를 선택할 수 있는 UI를 제공합니다.
 * 칩(Chip) 형태의 버튼을 사용하여 직관적인 선택이 가능하도록 디자인했습니다.
 */
export default function DetailedFilters({
    selectedDiscount,
    onDiscountChange,
    selectedPrice,
    onPriceChange
}) {
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
    )
}
