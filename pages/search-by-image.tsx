/**
 * pages/search-by-image.tsx - 사진으로 비슷한 상품 찾기 (/search-by-image)
 *
 * 명품 옷이나 가방 사진을 올리면, 수집해 둔 SPA 세일 상품 중 생김새가 비슷한 것을 보여줍니다.
 *
 * 흐름:
 * 1) 사진 선택(파일 선택 · 끌어다 놓기 · 붙여넣기)
 * 2) 브라우저에서 긴 변 1024px 이하로 줄입니다(전송량을 줄이고, 원본을 그대로 보내지 않기 위해).
 * 3) 서버가 사진을 벡터로 바꿔 비슷한 상품을 찾습니다. 사진은 저장되지 않습니다.
 * 4) 분류·성별을 바꾸면 같은 사진으로 다시 찾습니다.
 *
 * 판단 로직(파일 검사, 응답 → 화면 상태)은 utils/imageSearch.ts에 있고 Node 테스트로 검증합니다.
 * 결과는 "이미지가 비슷한 정도"로 고른 것이라 일치율 같은 수치는 보여주지 않습니다.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/SearchByImage.module.css';
import ProductCard from '../components/ProductCard';
import NotificationBell from '../components/NotificationBell';
import NotificationToast from '../components/NotificationToast';
import useFavorites from '../hooks/useFavorites';
import type { NormalizedProduct, WebImageSearchResult } from '../types';
import { ApiRequestError } from '../utils/api';
import {
  CATEGORY_FILTERS, GENDER_FILTERS, MAX_IMAGE_EDGE,
  describeDetection, describeSearchFailure, describeSearchOutcome, describeWebFailure, describeWebOutcome,
  fitWithin, safeHttpUrl, validateImageFile,
} from '../utils/imageSearch';
import type { SearchView, WebView } from '../utils/imageSearch';
import { normalizeProduct } from '../utils/productNormalization';
import { searchByImage, searchWebByImage } from '../utils/userApi';

/** 서버가 받는 최대 크기(5MB)보다 여유 있게 작은 값. 줄이지 못한 원본을 그대로 보낼 때의 상한입니다. */
const MAX_SEND_BYTES = 4 * 1024 * 1024;

type Phase = 'idle' | 'preparing' | 'searching' | 'done';

/**
 * 사진을 긴 변 1024px 이하의 JPEG로 줄입니다.
 * 브라우저가 열 수 없는 형식(일부 브라우저의 HEIC 등)이면 null을 돌려줍니다.
 */
async function shrinkImage(file: Blob): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_IMAGE_EDGE);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      return null;
    }
    // 투명 배경(PNG)은 JPEG로 바꾸면 검게 변하므로 흰색을 먼저 깝니다.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  } catch {
    return null;
  }
}

export default function SearchByImagePage() {
  const { isFavorite, toggleFavorite, lastError: favoriteNotice, clearError: clearFavoriteNotice } = useFavorites();

  const [phase, setPhase] = useState<Phase>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [view, setView] = useState<SearchView | null>(null);
  const [detection, setDetection] = useState<string | null>(null);

  // 사진 검색 서버는 안 쓸 때 꺼져 있어 첫 검색이 느립니다. 화면이 열릴 때 미리 깨워 둡니다.
  useEffect(() => {
    fetch('/api/v1/products/search/by-image/warmup').catch(() => undefined);
  }, []);
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [genderIndex, setGenderIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  // 웹에서 찾은 SPA 브랜드 상품. 사진이 바뀔 때만 다시 찾습니다(분류·성별 필터와 무관).
  const [webView, setWebView] = useState<WebView | null>(null);
  const [webItems, setWebItems] = useState<WebImageSearchResult['items']>([]);
  const [webSearching, setWebSearching] = useState(false);
  const webRequestIdRef = useRef(0);

  // 줄인 사진을 보관해, 필터를 바꿀 때 다시 줄이지 않고 그대로 보냅니다.
  const preparedRef = useRef<Blob | null>(null);
  // 늦게 도착한 이전 요청의 응답이 최신 결과를 덮어쓰지 않도록 요청 번호를 셉니다.
  const requestIdRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (image: Blob, category: number, gender: number) => {
    const requestId = ++requestIdRef.current;
    setPhase('searching');
    setView(null);
    try {
      const result = await searchByImage(image, {
        mainCategory: CATEGORY_FILTERS[category].mainCategory,
        subCategory: CATEGORY_FILTERS[category].subCategory,
        gender: GENDER_FILTERS[gender].gender,
      });
      if (requestId !== requestIdRef.current) {
        return;
      }
      setProducts(result.items.map((item) => normalizeProduct(item.product)).filter((product) => product.id));
      setView(describeSearchOutcome(result));
      setDetection(describeDetection(result));
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setProducts([]);
      setView(error instanceof ApiRequestError
        ? describeSearchFailure(error.status, error.message)
        : describeSearchFailure(undefined));
    } finally {
      if (requestId === requestIdRef.current) {
        setPhase('done');
      }
    }
  }, []);

  /** 사진과 비슷한 이미지를 웹에서 찾아 SPA 브랜드 사이트의 결과만 받습니다. */
  const runWebSearch = useCallback(async (image: Blob) => {
    const requestId = ++webRequestIdRef.current;
    setWebSearching(true);
    setWebView(null);
    setWebItems([]);
    try {
      const result = await searchWebByImage(image);
      if (requestId !== webRequestIdRef.current) {
        return;
      }
      // 외부에서 온 주소는 http(s)인 것만 링크로 씁니다.
      setWebItems(result.items.filter((item) => safeHttpUrl(item.pageUrl)));
      setWebView(describeWebOutcome(result));
    } catch (error) {
      if (requestId !== webRequestIdRef.current) {
        return;
      }
      setWebView(describeWebFailure(error instanceof ApiRequestError ? error.status : undefined));
    } finally {
      if (requestId === webRequestIdRef.current) {
        setWebSearching(false);
      }
    }
  }, []);

  /** 새 사진을 받아 검사 → 축소 → 검색합니다. */
  const handleFile = useCallback(async (file: File | Blob | null | undefined) => {
    if (!file) {
      return;
    }
    const check = validateImageFile(file);
    if (!check.ok) {
      setInputError(check.reason);
      return;
    }
    setInputError(null);
    setPhase('preparing');
    setView(null);
    setProducts([]);

    const shrunk = await shrinkImage(file);
    // 줄이지 못했더라도 충분히 작은 원본이면 그대로 보냅니다(서버가 읽을 수 있을 수 있음).
    const prepared = shrunk ?? (file.size <= MAX_SEND_BYTES ? file : null);
    if (!prepared) {
      setPhase('idle');
      setInputError('이 사진은 열 수 없습니다. JPG나 PNG 사진으로 시도해 주세요.');
      return;
    }
    preparedRef.current = prepared;
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return URL.createObjectURL(prepared);
    });
    // 웹 검색과 우리 DB 검색을 함께 시작합니다. 한쪽이 실패해도 다른 쪽 결과는 보여줍니다.
    void runWebSearch(prepared);
    await runSearch(prepared, categoryIndex, genderIndex);
  }, [runSearch, runWebSearch, categoryIndex, genderIndex]);

  // 붙여넣기(Ctrl/⌘+V)로 클립보드의 이미지를 받습니다.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((entry) => entry.type.startsWith('image/'));
      const file = item?.getAsFile();
      if (file) {
        event.preventDefault();
        void handleFile(file);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handleFile]);

  // 페이지를 떠날 때 미리보기 주소를 해제합니다.
  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = ''; // 같은 파일을 다시 골라도 change 이벤트가 나도록 비웁니다.
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  };

  const selectCategory = (index: number) => {
    setCategoryIndex(index);
    if (preparedRef.current) {
      void runSearch(preparedRef.current, index, genderIndex);
    }
  };

  const selectGender = (index: number) => {
    setGenderIndex(index);
    if (preparedRef.current) {
      void runSearch(preparedRef.current, categoryIndex, index);
    }
  };

  const busy = phase === 'preparing' || phase === 'searching';

  return (
    <>
      <Head>
        <title>사진으로 비슷한 상품 찾기 | DUPE</title>
        <meta
          name="description"
          content="옷이나 가방 사진을 올리면 H&M, ZARA, UNIQLO, MUJI 등 SPA 브랜드의 세일 상품 중 비슷하게 생긴 상품을 찾아 드립니다."
        />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.backLink}>← 홈으로</Link>
            <div className={styles.headerActions}>
              <Link href="/favorites" className={styles.backLink}>찜한 상품</Link>
              <NotificationBell />
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.pageHead}>
            <p className={styles.eyebrow}>Search by image</p>
            <h1 className={styles.title}>사진으로 비슷한 상품 찾기</h1>
            <p className={styles.lead}>
              마음에 드는 옷이나 가방 사진을 올리면, 지금 세일 중인 SPA 상품 가운데 비슷하게 생긴 것을 찾아 드립니다.
            </p>
          </div>

          <div className={styles.uploadRow}>
            <label
              className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ''}`}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handleInputChange}
                aria-describedby="upload-help"
              />
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- 사용자가 방금 고른 로컬 사진의 미리보기
                <img src={previewUrl} alt="선택한 사진" className={styles.preview} />
              ) : (
                <span className={styles.dropzoneText}>
                  <strong>사진을 끌어다 놓거나 눌러서 선택하세요</strong>
                  <span>복사한 사진을 붙여넣어도 됩니다</span>
                </span>
              )}
            </label>

            <div className={styles.uploadSide}>
              <p id="upload-help" className={styles.note}>
                사진은 비슷한 상품을 찾는 데만 쓰이고 이 서비스에 저장되지 않습니다. 올리기 전에 이 기기에서 크기를 줄여 보내며,
                웹에서 찾기 위해 Google의 이미지 분석 서비스로 전송될 수 있습니다.
              </p>
              {previewUrl && (
                <button type="button" className={styles.ghostButton} onClick={() => fileInputRef.current?.click()}>
                  다른 사진 선택
                </button>
              )}
              {inputError && <p className={styles.error} role="alert">{inputError}</p>}
            </div>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup} role="group" aria-label="분류">
              {CATEGORY_FILTERS.map((filter, index) => (
                <button
                  key={filter.label}
                  type="button"
                  className={`${styles.chip} ${index === categoryIndex ? styles.chipOn : ''}`}
                  aria-pressed={index === categoryIndex}
                  onClick={() => selectCategory(index)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className={styles.filterGroup} role="group" aria-label="성별">
              {GENDER_FILTERS.map((filter, index) => (
                <button
                  key={filter.label}
                  type="button"
                  className={`${styles.chip} ${index === genderIndex ? styles.chipOn : ''}`}
                  aria-pressed={index === genderIndex}
                  onClick={() => selectGender(index)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* 웹에서 찾은 결과: 우리 DB와 무관하게 웹 전체에서 찾아 SPA 브랜드 사이트만 보여줍니다. */}
          {(webSearching || (webView && webView.kind !== 'hidden')) && (
            <section className={styles.webSection} aria-live="polite" aria-busy={webSearching}>
              <h2 className={styles.resultsTitle}>
                웹에서 찾은 SPA 브랜드 상품
                {webView?.kind === 'results' && <span className={styles.resultsCount}>{webItems.length}</span>}
              </h2>
              {webSearching && <p className={styles.webNote}>웹에서 찾는 중입니다…</p>}
              {webView?.kind === 'note' && <p className={styles.webNote}>{webView.message}</p>}
              {webView?.kind === 'results' && (
                <>
                  <p className={styles.webNote}>
                    웹에서 사진과 비슷한 이미지가 실린 브랜드 사이트의 페이지입니다. 가격과 재고는 브랜드 사이트에서 확인해 주세요.
                  </p>
                  <ul className={styles.webList}>
                    {webItems.map((item) => {
                      const thumbnail = safeHttpUrl(item.imageUrl);
                      return (
                        <li key={item.pageUrl}>
                          <a
                            href={item.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.webCard}
                          >
                            <span className={styles.webThumb}>
                              {thumbnail && (
                                // eslint-disable-next-line @next/next/no-img-element -- 임의의 외부 호스트라 next/image를 쓸 수 없음
                                <img
                                  src={thumbnail}
                                  alt=""
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                />
                              )}
                            </span>
                            <span className={styles.webBrand}>{item.brandName}</span>
                            <span className={styles.webTitle}>{item.title}</span>
                            <span className={styles.webLink}>브랜드 사이트에서 보기 →</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </section>
          )}

          <section className={styles.results} aria-live="polite" aria-busy={busy}>
            {phase === 'preparing' && <p className={styles.state}>사진을 준비하는 중입니다…</p>}
            {phase === 'searching' && <p className={styles.state}>비슷한 상품을 찾는 중입니다…</p>}

            {phase === 'done' && view?.kind === 'results' && (
              <>
                <h2 className={styles.resultsTitle}>
                  지금 세일 중인 비슷한 상품 <span className={styles.resultsCount}>{products.length}</span>
                </h2>
                {detection && <p className={styles.webNote}>{detection}</p>}
                <div className={styles.grid}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      brand={product.brand}
                      name={product.name}
                      salePrice={product.salePrice}
                      originalPrice={product.originalPrice}
                      discountRate={product.discountRate}
                      imageUrl={product.imageUrl}
                      isFavorite={isFavorite(product.id)}
                      onFavoriteToggle={toggleFavorite}
                    />
                  ))}
                </div>
              </>
            )}

            {phase === 'done' && view && view.kind !== 'results' && (
              <div className={styles.state}>
                <p>{view.message}</p>
                {view.kind === 'unavailable' && view.retryable && preparedRef.current && (
                  <button
                    type="button"
                    className={styles.ghostButton}
                    onClick={() => preparedRef.current && runSearch(preparedRef.current, categoryIndex, genderIndex)}
                  >
                    다시 시도
                  </button>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      <NotificationToast message={favoriteNotice ?? ''} isVisible={Boolean(favoriteNotice)} onClose={clearFavoriteNotice} />
    </>
  );
}
