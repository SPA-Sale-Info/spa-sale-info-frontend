/**
 * ShareButton.tsx - 공유하기 버튼 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 상품 페이지에서 링크를 공유할 수 있는 버튼을 렌더링합니다.
 * 클릭 시 두 가지 방식 중 하나로 공유합니다:
 *   1. Web Share API 지원 시 (모바일 등): 네이티브 공유 시트 열기
 *      → 카카오톡, 문자, 메모 등 설치된 앱으로 직접 공유할 수 있습니다.
 *   2. Web Share API 미지원 시 (일부 데스크톱): 클립보드에 URL 복사
 *      → 복사 완료 시 "링크가 복사되었습니다!" 툴팁이 2초간 표시됩니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * Web Share API란?
 * ═══════════════════════════════════════════════════════════════
 * 브라우저가 제공하는 표준 공유 기능입니다.
 * navigator.share({ title, text, url })로 호출하면
 * 기기의 기본 공유 시트(iOS, Android의 공유 메뉴 등)가 열립니다.
 * → 사용자가 원하는 앱으로 내용을 공유할 수 있습니다.
 * 지원 여부는 navigator.share가 존재하는지로 확인합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * Clipboard API란?
 * ═══════════════════════════════════════════════════════════════
 * 브라우저가 제공하는 클립보드 접근 API입니다.
 * navigator.clipboard.writeText(text)로 텍스트를 클립보드에 복사합니다.
 * → HTTPS 환경이나 사용자 허가가 있어야 동작합니다.
 * Java 비유: java.awt.Toolkit.getDefaultToolkit().getSystemClipboard()와 유사합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - interface props: 모든 필드가 optional (?:)
 * - async/await: 비동기 함수 — Promise를 동기식처럼 작성합니다.
 * - await navigator.share(...): share()는 Promise를 반환하므로 await로 기다립니다.
 * - try-catch: 공유 취소, 클립보드 접근 실패 등의 예외를 처리합니다.
 * - setTimeout: 일정 시간 후 코드를 실행합니다 (툴팁 자동 숨김에 사용).
 */

// useState: showTooltip 상태 — 클립보드 복사 성공 시 툴팁을 표시하는 플래그
import { useState } from 'react';

// 이 컴포넌트 전용 CSS 모듈
import styles from '../styles/ShareButton.module.css';

/**
 * ShareButtonProps - 이 컴포넌트가 받는 props 구조
 *
 * 모든 필드가 optional (?)입니다:
 * - title?: 공유 시 표시되는 제목 (없으면 현재 페이지 document.title 사용)
 * - text?: 공유 시 본문 내용 (없으면 기본 문구 사용)
 * - url?: 공유할 URL (없으면 현재 페이지 window.location.href 사용)
 *
 * optional이 많은 이유:
 * 이 버튼을 여러 페이지에서 재사용할 수 있도록 합니다.
 * 아무 props 없이 <ShareButton />만 써도 현재 페이지 정보로 공유됩니다.
 */
interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * ShareButton 컴포넌트
 *
 * export default: 기본 내보내기 — import ShareButton from './ShareButton'으로 가져옵니다.
 *
 * 사용 예시 (pages/product/[id].tsx):
 * <ShareButton
 *   title={product.name}
 *   text={`${product.brand} - ${product.name}`}
 *   url={`https://yoursite.com/product/${product.id}`}
 * />
 */
export default function ShareButton({ title, text, url }: ShareButtonProps) {
  /**
   * showTooltip 상태 — 클립보드 복사 완료 툴팁 표시 여부
   *
   * useState(false): 초기값 false (툴팁 숨김 상태)
   * - 클립보드 복사 성공 시 → true (툴팁 표시)
   * - 2초 후 → false (툴팁 숨김)
   *
   * Web Share API가 지원되는 환경(모바일)에서는 이 상태가 변경되지 않습니다.
   * 클립보드 복사 폴백(fallback) 경우에만 사용됩니다.
   */
  const [showTooltip, setShowTooltip] = useState(false);

  /**
   * handleShare - 공유 버튼 클릭 시 실행되는 비동기 함수
   *
   * async 함수:
   * - 내부에서 await를 사용할 수 있습니다.
   * - await: Promise가 완료될 때까지 기다립니다 (비동기를 동기처럼 작성).
   * Java 비유: CompletableFuture 또는 Future.get()으로 결과를 기다리는 것과 유사합니다.
   *
   * 처리 순서:
   * 1. 공유 데이터(shareData) 구성
   * 2. navigator.share 지원 여부 확인
   * 3. 지원하면 네이티브 공유 시트, 아니면 클립보드 복사
   */
  const handleShare = async () => {
    /**
     * shareData 구성:
     *
     * title: title || document.title
     * - title prop이 전달됐으면 사용, 없으면(null/undefined/'') 현재 페이지 제목을 사용합니다.
     * - ||: OR 연산자 — 왼쪽이 falsy이면 오른쪽을 사용합니다.
     * - document.title: 현재 HTML 페이지의 <title> 태그 내용입니다.
     *
     * url: url || window.location.href
     * - window.location.href: 현재 페이지의 전체 URL (프로토콜 포함)
     * - 예: 'https://example.com/product/123?ref=home'
     */
    const shareData = {
      title: title || document.title,
      text: text || '이 상품 어때요?',
      url: url || window.location.href,
    };

    /**
     * Web Share API 지원 여부 확인
     *
     * navigator.share:
     * - Web Share API를 지원하면 이 함수가 존재합니다 (truthy).
     * - 지원하지 않으면 undefined입니다 (falsy).
     * - 주로 모바일 브라우저(iOS Safari, Android Chrome 등)에서 지원합니다.
     * - 일부 데스크톱 Chrome도 지원합니다.
     *
     * if (navigator.share): 함수가 존재하면 네이티브 공유 사용
     */
    if (navigator.share) {
      try {
        /**
         * navigator.share(shareData): 네이티브 공유 시트를 엽니다.
         *
         * await: share()는 Promise<void>를 반환합니다.
         * - 사용자가 공유를 완료하거나 취소하면 Promise가 resolve됩니다.
         * - 취소 시에는 AbortError 예외가 발생합니다.
         *
         * 공유 시트가 열리면 사용자는 원하는 앱을 선택할 수 있습니다:
         * - 카카오톡, 문자, 메일, 메모 등 설치된 앱들이 표시됩니다.
         */
        await navigator.share(shareData);
      } catch {
        /**
         * 예외 처리:
         * - 사용자가 공유를 취소하면 AbortError가 발생합니다.
         * - 취소는 정상적인 동작이므로 에러 메시지 없이 무시합니다.
         */
      }
    } else {
      /**
       * 클립보드 복사 폴백(Fallback)
       * Web Share API를 지원하지 않는 환경(일부 데스크톱 브라우저)에서 사용합니다.
       *
       * navigator.clipboard.writeText(text): 텍스트를 클립보드에 복사합니다.
       * - Promise<void>를 반환합니다.
       * - await로 완료를 기다립니다.
       * - HTTPS 환경이 필요합니다 (HTTP에서는 동작하지 않음).
       */
      try {
        await navigator.clipboard.writeText(shareData.url);

        /**
         * 복사 성공 시 툴팁 표시:
         *
         * setShowTooltip(true): "링크가 복사되었습니다!" 툴팁을 표시합니다.
         * → React가 리렌더링하여 툴팁 div가 DOM에 나타납니다.
         *
         * setTimeout(() => setShowTooltip(false), 2000):
         * - 2000ms(2초) 후에 setShowTooltip(false)를 호출합니다.
         * - 2초 후 툴팁이 사라집니다.
         * - setTimeout: 지정된 시간 후 콜백 함수를 실행하는 브라우저 API입니다.
         *   Java의 ScheduledExecutorService.schedule()과 유사합니다.
         *   단, setTimeout은 비동기이므로 실행을 막지 않습니다 (논블로킹).
         *
         * () => setShowTooltip(false): 화살표 함수 — 2초 후 실행될 콜백
         */
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      } catch {
        /**
         * 클립보드 접근 실패 시 무시합니다.
         * - HTTP 환경이거나 사용자가 클립보드 접근을 거부한 경우
         * - 에러를 사용자에게 표시하지 않습니다 (UX 결정)
         */
      }
    }
  };

  /**
   * JSX 반환 — 공유 버튼 UI
   *
   * 구조:
   * <div container>
   *   <button 공유 버튼>
   *     <svg 공유 아이콘 />
   *   </button>
   *   {showTooltip && <div 복사 완료 툴팁 />}
   * </div>
   */
  return (
    <div className={styles.container}>
      {/**
       * 공유 버튼
       *
       * onClick={handleShare}: 클릭 시 handleShare 함수를 호출합니다.
       * aria-label="공유하기": 스크린 리더용 버튼 설명
       *   버튼에 텍스트 없이 아이콘만 있을 때 필수입니다.
       *   시각 장애인이 "공유하기 버튼"을 들을 수 있습니다.
       */}
      <button onClick={handleShare} className={styles.button} aria-label="공유하기">
        {/**
         * SVG 공유 아이콘 — 세 점이 선으로 연결된 형태 (표준 공유 아이콘)
         *
         * SVG(Scalable Vector Graphics): 벡터 기반 그래픽 형식입니다.
         * - 어떤 크기로 확대해도 선명합니다 (비트맵 이미지와 다름).
         * - CSS로 색상을 제어할 수 있습니다 (stroke="currentColor").
         *
         * xmlns="http://www.w3.org/2000/svg": SVG 네임스페이스 선언 (필수)
         * width="20" height="20": SVG 요소의 표시 크기(픽셀)
         * viewBox="0 0 24 24": SVG 내부 좌표계 (0,0부터 24,24까지)
         *   → 내부는 24×24 좌표계를 사용하지만, 화면에는 20×20으로 표시됩니다.
         *
         * fill="none": 도형 내부를 채우지 않습니다 (윤곽선만 표시).
         * stroke="currentColor": 선(stroke) 색상을 CSS의 color 속성과 동일하게 설정합니다.
         *   → CSS에서 color를 바꾸면 SVG 선 색상도 자동으로 바뀝니다 (다크 모드 지원).
         * strokeWidth="2": 선 두께
         * strokeLinecap="round": 선 끝을 둥글게 처리합니다.
         * strokeLinejoin="round": 선이 만나는 모서리를 둥글게 처리합니다.
         *
         * <circle cx="18" cy="5" r="3">: 중심(18,5)에 반지름 3인 원 (오른쪽 위 점)
         * <circle cx="6" cy="12" r="3">: 중심(6,12)에 반지름 3인 원 (왼쪽 가운데 점)
         * <circle cx="18" cy="19" r="3">: 중심(18,19)에 반지름 3인 원 (오른쪽 아래 점)
         * <line x1="8.59" y1="13.51" x2="15.42" y2="17.49">: 왼쪽 점 → 오른쪽 아래 점 연결선
         * <line x1="15.41" y1="6.51" x2="8.59" y2="10.49">: 오른쪽 위 점 → 왼쪽 점 연결선
         */}
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

      {/**
       * 클립보드 복사 완료 툴팁
       *
       * {showTooltip && <div>...}: 단축 회로 평가(Short-circuit Evaluation)
       * - showTooltip이 true일 때만 <div>가 렌더링됩니다.
       * - false이면 아무것도 렌더링되지 않습니다.
       * - React의 조건부 렌더링 패턴입니다.
       *
       * Web Share API 환경(모바일)에서는 showTooltip이 변경되지 않으므로
       * 이 툴팁이 표시되지 않습니다 (클립보드 복사 폴백에서만 표시됨).
       */}
      {showTooltip && <div className={styles.tooltip}>링크가 복사되었습니다!</div>}
    </div>
  );
}
