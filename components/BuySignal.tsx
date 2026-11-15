/**
 * components/BuySignal.tsx - 현재 가격이 추적 기간 중 어느 위치인지 한 줄로 보여줍니다.
 *
 * 예: "추적 시작 이후 최저가", "최저가보다 5,000원 높음 · 10월 2일에 24,900원"
 *
 * 보여줄 것이 없으면(기록 부족, 호출 실패) 아무것도 그리지 않습니다. 부가 정보라서 실패해도
 * 페이지의 나머지를 방해하지 않아야 하기 때문입니다. 구매를 권하지 않고 사실만 적습니다.
 */

import { useEffect, useState } from 'react';
import styles from '../styles/BuySignal.module.css';
import { describePriceInsight } from '../utils/priceInsightCopy';
import type { PriceInsightCopy } from '../utils/priceInsightCopy';
import { getPriceInsight } from '../utils/userApi';

interface BuySignalProps {
  productId: string;
}

export default function BuySignal({ productId }: BuySignalProps) {
  const [copy, setCopy] = useState<PriceInsightCopy | null>(null);

  useEffect(() => {
    // 상품이 바뀌면 이전 요청의 늦은 응답이 화면을 덮어쓰지 않도록 막습니다.
    let cancelled = false;
    setCopy(null);
    getPriceInsight(productId)
      .then((insight) => {
        if (!cancelled) {
          setCopy(describePriceInsight(insight));
        }
      })
      .catch(() => {
        // 통계가 없는 서버이거나 일시 오류: 조용히 생략합니다.
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!copy) {
    return null;
  }
  return (
    <p className={`${styles.signal} ${copy.tone === 'good' ? styles.good : ''}`}>
      {copy.text}
    </p>
  );
}
