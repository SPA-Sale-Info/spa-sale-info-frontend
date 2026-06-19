/**
 * NotificationToast.tsx - 알림 토스트 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 화면 하단에 잠시 나타났다가 사라지는 알림 메시지를 렌더링합니다.
 * "토스트(Toast)" 알림 — 스마트폰의 짧은 팝업 알림과 같은 UI 패턴입니다.
 *
 * 동작 방식:
 * 1. isVisible=true가 되면 토스트가 나타납니다.
 * 2. 4초 후 자동으로 onClose()를 호출하여 토스트가 사라집니다.
 * 3. X 버튼을 클릭하면 즉시 onClose()가 호출됩니다.
 * 4. isVisible=false가 되면 300ms의 fade-out 애니메이션 후 DOM에서 제거됩니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 왜 shouldRender 상태가 따로 필요한가요?
 * ═══════════════════════════════════════════════════════════════
 * isVisible만으로는 CSS 애니메이션이 동작하지 않습니다.
 * - isVisible=false → 즉시 DOM 제거: CSS fade-out 애니메이션이 실행되지 않습니다.
 *   (DOM이 사라지면 애니메이션도 취소됩니다)
 *
 * shouldRender=false를 300ms 후에 설정하면:
 * 1. isVisible=false → CSS가 fade-out 애니메이션 시작
 * 2. 300ms 후 shouldRender=false → DOM에서 완전히 제거
 * → 애니메이션이 완료된 후 DOM이 제거됩니다 (부드러운 사라짐)
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - interface props: message(필수), isVisible(필수), onClose(필수)
 * - () => void: 인자 없이 아무것도 반환하지 않는 함수 타입
 * - clearTimeout(timer): setTimeout으로 등록한 타이머를 취소합니다.
 * - return () => clearTimeout(timer): useEffect의 cleanup 함수
 *   컴포넌트가 unmount되거나 isVisible이 바뀔 때 이전 타이머를 정리합니다.
 */

// useEffect: isVisible이 변경될 때마다 타이머를 설정합니다.
// useState: shouldRender 상태 — 실제 DOM 렌더링 여부를 제어합니다.
import { useEffect, useState } from 'react';

// 이 컴포넌트 전용 CSS 모듈
import styles from '../styles/NotificationToast.module.css';

/**
 * NotificationToastProps - 이 컴포넌트가 받는 props 구조
 *
 * message: 알림으로 표시할 텍스트 (필수)
 *   예: '찜한 상품에 추가되었습니다!'
 *
 * isVisible: 토스트를 보여야 하는지 여부 (필수)
 *   true → 토스트 표시
 *   false → 토스트 숨김 (fade-out 후 DOM 제거)
 *   부모 컴포넌트가 이 상태를 관리합니다.
 *
 * onClose: 토스트를 닫을 때 부모에게 알리는 콜백 함수 (필수)
 *   () => void: 인자 없고 반환값 없는 함수 타입
 *   - 4초 타이머가 만료되면 자동 호출됩니다.
 *   - X 버튼 클릭 시 즉시 호출됩니다.
 *   - 부모는 이 콜백을 받아 isVisible을 false로 설정합니다.
 *   Java 비유: Runnable onClose (실행 가능한 동작)
 */
interface NotificationToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

/**
 * NotificationToast 컴포넌트
 *
 * export default: 기본 내보내기
 *
 * 사용 예시 (부모 컴포넌트):
 * const [toastVisible, setToastVisible] = useState(false);
 *
 * <NotificationToast
 *   message="찜한 상품에 추가되었습니다!"
 *   isVisible={toastVisible}
 *   onClose={() => setToastVisible(false)}
 * />
 *
 * // 토스트 표시:
 * setToastVisible(true);
 */
export default function NotificationToast({ message, isVisible, onClose }: NotificationToastProps) {
  /**
   * shouldRender 상태 — 실제로 DOM에 렌더링할지 여부
   *
   * isVisible vs shouldRender의 차이:
   * - isVisible: 토스트가 "보여야 하는" 논리적 상태 (부모가 제어)
   * - shouldRender: 실제로 DOM에 존재하는지 여부 (이 컴포넌트가 제어)
   *
   * shouldRender=false이면 null을 반환하여 DOM에서 완전히 제거합니다.
   * shouldRender=true이면 toastClassName에 따라 보이거나 안 보이는 상태로 존재합니다.
   *
   * 초기값: false — 처음에는 토스트가 DOM에 없습니다.
   */
  const [shouldRender, setShouldRender] = useState(false);

  /**
   * useEffect — isVisible 상태에 따라 타이머를 설정합니다.
   *
   * 의존성: [isVisible, onClose]
   * → isVisible이나 onClose가 바뀔 때마다 실행됩니다.
   *
   * 분기 처리:
   * - isVisible=true: 토스트를 보여주고 4초 후 자동으로 닫습니다.
   * - isVisible=false: 300ms 후 shouldRender를 false로 설정 (fade-out 완료 후 DOM 제거).
   */
  useEffect(() => {
    if (isVisible) {
      /**
       * 토스트 표시:
       * setShouldRender(true): DOM에 토스트를 렌더링합니다.
       * → CSS의 visible 클래스가 추가되어 fade-in 애니메이션이 시작됩니다.
       *
       * setTimeout(callback, 4000):
       * 4000ms(4초) 후에 callback 함수를 실행합니다.
       * callback: () => { onClose(); } → 부모에게 닫기를 알립니다.
       * → 부모가 isVisible을 false로 설정 → useEffect 재실행 → 두 번째 분기 실행
       *
       * timer: setTimeout이 반환하는 타이머 ID
       * → clearTimeout(timer)으로 취소할 수 있습니다.
       *
       * Java 비유:
       * ScheduledFuture<?> timer = executor.schedule(onClose, 4, TimeUnit.SECONDS);
       */
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      /**
       * cleanup 함수 반환:
       * return () => clearTimeout(timer):
       * - useEffect가 재실행되거나 컴포넌트가 unmount될 때 호출됩니다.
       * - 이전 타이머를 취소하여 메모리 누수와 불필요한 onClose 호출을 방지합니다.
       *
       * 예시: isVisible이 true → false → true로 빠르게 변하면
       * 이전 4초 타이머가 취소되고 새 타이머가 시작됩니다.
       * 타이머를 취소하지 않으면 이전 타이머가 나중에 onClose를 호출할 수 있습니다.
       *
       * Java 비유: @PreDestroy void cleanup() { timer.cancel(false); }
       */
      return () => clearTimeout(timer);
    } else {
      /**
       * 토스트 숨김:
       * isVisible=false가 되면 CSS의 visible 클래스가 제거됩니다.
       * → CSS fade-out 애니메이션 시작 (300ms 소요)
       *
       * 300ms 후 setShouldRender(false): DOM에서 완전히 제거합니다.
       * → 애니메이션이 완료된 후 DOM을 제거하여 부드러운 사라짐 효과를 만듭니다.
       *
       * 300ms는 CSS의 transition duration과 맞추어야 합니다.
       * NotificationToast.module.css에서 transition: 300ms로 설정되어 있습니다.
       */
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer); // 이전 타이머 취소 (cleanup)
    }
  }, [isVisible, onClose]); // isVisible 또는 onClose가 바뀔 때 재실행

  /**
   * 조기 반환: shouldRender=false이면 아무것도 렌더링하지 않습니다.
   * null: React에서 null 반환은 "아무것도 렌더링하지 않음"을 의미합니다.
   * → 토스트가 완전히 사라진 후 DOM에서 제거됩니다.
   */
  if (!shouldRender) return null;

  /**
   * JSX 반환 — 토스트 알림 UI
   *
   * className 동적 조합:
   * `${styles.toast} ${isVisible ? styles.visible : ''}`:
   * - styles.toast: 항상 적용되는 기본 토스트 스타일 (위치, 크기 등)
   * - isVisible ? styles.visible : '': isVisible이 true이면 visible 클래스 추가
   *   → CSS에서 .visible 클래스가 opacity와 transform을 조절하여 보이게 합니다.
   *   → visible 클래스가 없으면 fade-out 상태입니다.
   *
   * 주의: 마지막에 공백(' ')이 있습니다. 의도적인 것인지 확인 필요합니다.
   */
  return (
    <div className={`${styles.toast} ${isVisible ? styles.visible : ''} `}>
      {/**
       * 알림 아이콘 🔔
       * 이모지를 아이콘으로 사용합니다.
       * 이미지 로딩 없이 모든 모던 기기에서 지원됩니다.
       */}
      <div className={styles.icon}>🔔</div>

      {/**
       * 알림 메시지 텍스트
       * message prop으로 전달된 텍스트를 표시합니다.
       * 예: '찜한 상품에 추가되었습니다!'
       */}
      <div className={styles.content}>{message}</div>

      {/**
       * 닫기 버튼
       * onClick={onClose}: 클릭 시 부모의 onClose 함수를 직접 호출합니다.
       * → 4초 타이머를 기다리지 않고 즉시 토스트를 닫습니다.
       *
       * ×: HTML 특수 문자 — 닫기(X) 기호입니다.
       * × (multiply sign)을 닫기 아이콘으로 사용합니다.
       * JSX에서는 × HTML 엔티티 대신 × 문자를 직접 쓸 수 있습니다.
       */}
      <button className={styles.close} onClick={onClose}>
        ×
      </button>
    </div>
  );
}
