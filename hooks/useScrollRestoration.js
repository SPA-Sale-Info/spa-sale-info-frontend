import { useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * 스크롤 위치 복원 훅
 * 
 * @description
 * Next.js의 페이지 이동 시 스크롤 위치가 유지되지 않는 문제를 해결합니다.
 * 브라우저의 기본 뒤로가기 동작을 보완하여, 목록 -> 상세 -> 목록으로 돌아왔을 때
 * 사용자가 보던 위치를 정확히 복원해 줍니다.
 */
export default function useScrollRestoration() {
    const router = useRouter()

    useEffect(() => {
        // 스크롤 위치 저장 함수
        // 현재 페이지를 떠나기 직전(routeChangeStart)에 호출됩니다.
        const saveScrollPos = (url) => {
            const scrollPos = { x: window.scrollX, y: window.scrollY }
            // 세션 스토리지(sessionStorage)를 사용하여 탭이 닫히면 데이터도 사라지게 합니다.
            sessionStorage.setItem(`scrollPos:${router.asPath}`, JSON.stringify(scrollPos))
        }

        // 스크롤 위치 복원 함수
        // 페이지 이동이 완료된 후(routeChangeComplete)에 호출됩니다.
        const restoreScrollPos = (url) => {
            const scrollPos = sessionStorage.getItem(`scrollPos:${url}`)
            if (scrollPos) {
                try {
                    const { x, y } = JSON.parse(scrollPos)
                    // 약간의 지연(setTimeout)을 주는 이유:
                    // 페이지 콘텐츠가 렌더링되고 높이가 확보될 때까지 기다리기 위함입니다.
                    // 0.1초(100ms)는 사용자가 깜빡임을 거의 느끼지 못하는 짧은 시간입니다.
                    setTimeout(() => {
                        window.scrollTo(x, y)
                    }, 100)
                } catch (e) {
                    console.error('스크롤 복원 실패:', e)
                }
            }
        }

        // Next.js 라우터 이벤트 리스너 등록
        router.events.on('routeChangeStart', saveScrollPos)
        router.events.on('routeChangeComplete', restoreScrollPos)

        // 컴포넌트 언마운트 시 리스너 제거 (메모리 누수 방지)
        return () => {
            router.events.off('routeChangeStart', saveScrollPos)
            router.events.off('routeChangeComplete', restoreScrollPos)
        }
    }, [router])
}
