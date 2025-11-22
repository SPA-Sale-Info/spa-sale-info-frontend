
import { useEffect, useState } from 'react'
import styles from '../styles/NotificationToast.module.css'

/**
 * 알림 토스트 컴포넌트
 * 
 * @param {string} message - 표시할 메시지
 * @param {boolean} isVisible - 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * 
 * @description
 * 화면 하단에 잠시 나타났다가 사라지는 알림 메시지입니다.
 * 애니메이션을 위해 shouldRender 상태를 별도로 관리하여,
 * 사라지는 애니메이션이 끝난 후에 컴포넌트가 언마운트되도록 처리했습니다.
 */
export default function NotificationToast({ message, isVisible, onClose }) {
    // shouldRender: 컴포넌트가 DOM에 존재해야 하는지 여부 (애니메이션 중에도 true여야 함)
    const [shouldRender, setShouldRender] = useState(false)

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true)
            // 4초 후에 자동으로 닫히도록 타이머 설정
            const timer = setTimeout(() => {
                onClose()
            }, 4000)
            return () => clearTimeout(timer)
        } else {
            // 사라지는 애니메이션(0.3초)이 끝난 후에 DOM에서 제거
            const timer = setTimeout(() => {
                setShouldRender(false)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose])

    if (!shouldRender) return null

    return (
        <div className={`${styles.toast} ${isVisible ? styles.visible : ''} `}>
            <div className={styles.icon}>🔔</div>
            <div className={styles.content}>
                {message}
            </div>
            <button className={styles.close} onClick={onClose}>×</button>
        </div>
    )
}
