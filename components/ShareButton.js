import { useState } from 'react'
import styles from '../styles/ShareButton.module.css'

/**
 * 공유하기 버튼 컴포넌트
 * 
 * @param {string} title - 공유할 제목
 * @param {string} text - 공유할 텍스트
 * @param {string} url - 공유할 URL (기본값: 현재 페이지 URL)
 * 
 * @description
 * Web Share API를 지원하는 브라우저(모바일 등)에서는 네이티브 공유 시트를 띄우고,
 * 지원하지 않는 데스크탑 브라우저에서는 클립보드에 URL을 복사합니다.
 */
export default function ShareButton({ title, text, url }) {
    const [showTooltip, setShowTooltip] = useState(false)

    const handleShare = async () => {
        const shareData = {
            title: title || document.title,
            text: text || '이 상품 어때요?',
            url: url || window.location.href,
        }

        // Web Share API 지원 여부 확인
        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (err) {
                console.log('공유 취소됨', err)
            }
        } else {
            // Fallback: Web Share API 미지원 시 클립보드 복사
            try {
                await navigator.clipboard.writeText(shareData.url)
                setShowTooltip(true)
                setTimeout(() => setShowTooltip(false), 2000)
            } catch (err) {
                console.error('클립보드 복사 실패', err)
            }
        }
    }

    return (
        <div className={styles.container}>
            <button
                onClick={handleShare}
                className={styles.button}
                aria-label="공유하기"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
            </button>

            {showTooltip && (
                <div className={styles.tooltip}>
                    링크가 복사되었습니다!
                </div>
            )}
        </div>
    )
}
