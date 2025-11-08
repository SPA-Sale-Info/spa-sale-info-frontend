/**
 * GenderFilter.js - 성별 필터 컴포넌트
 *
 * 남성, 여성, 공용 라벨을 빠르게 전환
 */

import styles from '../styles/GenderFilter.module.css'

// 사용자가 누를 수 있는 성별 옵션 목록입니다.
const GENDERS = [
  { code: 'all', name: '전체', emoji: '🌈' },
  { code: 'women', name: '여성', emoji: '👗' },
  { code: 'men', name: '남성', emoji: '👔' },
]

function GenderFilter({ selectedGender, onGenderChange }) {
  // 버튼을 누르면 상위(Home)에서 어떤 성별을 보고 싶은지 기억합니다.
  const handleGenderClick = (genderCode) => {
    onGenderChange(genderCode)
  }

  return (
    <div className={styles.container} role="radiogroup" aria-label="성별 필터">
      {GENDERS.map((gender) => {
        const isSelected = selectedGender === gender.code
        const buttonClassName = `${styles.button} ${isSelected ? styles.selected : ''}`

        // 반복문으로 버튼 네 개를 만들고 현재 선택 여부를 표시합니다.
        return (
          <button
            key={gender.code}
            className={buttonClassName}
            onClick={() => handleGenderClick(gender.code)}
            aria-pressed={isSelected}
            aria-label={`${gender.name} 상품만 보기`}
            type="button"
          >
            <span className={styles.emoji} aria-hidden="true">
              {gender.emoji}
            </span>
            <span>{gender.name}</span>
          </button>
        )
      })}
    </div>
  )
}

export default GenderFilter
