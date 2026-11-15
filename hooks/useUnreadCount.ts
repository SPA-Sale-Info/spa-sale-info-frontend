/**
 * hooks/useUnreadCount.ts - 읽지 않은 알림 개수
 *
 * 페이지가 화면에 보이는 동안에만 60초마다 다시 가져옵니다. 탭이 숨겨지면 멈추고,
 * 다시 보이면 즉시 한 번 가져온 뒤 주기를 다시 시작합니다(보이지 않는 탭에서 요청을 낭비하지 않기 위해).
 *
 * 조회에 실패하면 이전 값을 그대로 두고 오류를 표시하지 않습니다. 종 아이콘은 부가 정보라서
 * 실패가 사용자를 방해하면 안 됩니다.
 */

import { useCallback, useEffect, useState } from 'react';
import { getUnreadCount, isUserFeatureAvailable } from '../utils/userApi';

/** 다시 가져오는 주기(ms) */
const REFRESH_INTERVAL_MS = 60_000;

interface UseUnreadCountReturn {
  count: number;
  /** 기능을 쓸 수 있는 브라우저인지 (localStorage 접근 가능 여부) */
  available: boolean;
  refresh: () => void;
}

export default function useUnreadCount(): UseUnreadCountReturn {
  const [count, setCount] = useState(0);
  const [available, setAvailable] = useState(false);

  const refresh = useCallback(() => {
    if (!isUserFeatureAvailable()) {
      return;
    }
    getUnreadCount()
      .then(setCount)
      .catch(() => {
        // 이전 값을 유지합니다.
      });
  }, []);

  useEffect(() => {
    if (!isUserFeatureAvailable()) {
      return undefined;
    }
    setAvailable(true);

    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
    };
    const start = () => {
      stop();
      refresh();
      timer = setInterval(refresh, REFRESH_INTERVAL_MS);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === 'visible') {
      start();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refresh]);

  return { count, available, refresh };
}
