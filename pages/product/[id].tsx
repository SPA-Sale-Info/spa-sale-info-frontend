/**
 * [id].tsx - 동적 상품 상세 페이지 (TypeScript)
 *
 * Next.js 동적 라우팅을 사용한 상품 상세 페이지
 * URL: /product/{productId}
 *
 * 주요 기능:
 * - 상품 이미지 갤러리
 * - 가격 분석 그래프
 * - 상품 정보 표시
 * - 찜하기 기능
 * - 구매 링크
 *
 * TypeScript 문법 포인트:
 * - interface로 데이터 구조를 선언합니다.
 * - useState<타입>으로 상태 타입을 명시합니다.
 * - union 타입(예: string | null)로 "없을 수도 있음"을 표현합니다.
 */

// 컴포넌트 및 훅 임포트
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import PriceHistoryChart from '../../components/PriceHistoryChart'
import FavoriteButton from '../../components/FavoriteButton'
import useFavorites from '../../hooks/useFavorites'
import { fetchProductDetail } from '../../utils/api'
import RecentlyViewed from '../../components/RecentlyViewed'
import useRecentlyViewed from '../../hooks/useRecentlyViewed'
import ShareButton from '../../components/ShareButton'
import styles from '../../styles/ProductDetail.module.css'
import type { Brand, Category, Gender, Product } from '../../types'

/**
 * 성별 메타 정보
 */
interface GenderMeta {
  label: string;
  emoji: string;
}

/**
 * 확장된 상품 정보 (상세 페이지용)
 * - 기본 Product 타입에 상세 페이지에서 필요한 필드를 추가합니다.
 */
interface ProductDetail extends Product {
  brandCode: Brand;
  brandName: string;
  productCode: string;
  description?: string;
  mainCategory: Category;
  categoryGroup: Category;
  subCategory?: string;
  price: number;
  currentPrice: number;
  onSale: boolean;
  imageUrls: string[];
  colors?: string[];
  sizes?: string[];
  inStock?: boolean;
  material?: string;
  tags?: string[];
  vibeTags?: string[];
  vibe?: string | null;
  saleStartDate?: string;
  saleEndDate?: string;
  viewCount?: number;
  likeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 브랜드 코드를 표시용 이름으로 변환
 */
function getBrandDisplayName(brandCode: Brand): string {
  const brandNames: Record<Brand, string> = {
    HM: 'H&M',
    ZARA: 'ZARA',
    UNIQLO: 'UNIQLO',
    MUJI: 'MUJI',
    CHARLESKEITH: 'Charles & Keith',
  }
  return brandNames[brandCode] || brandCode
}

/**
 * 성별 표시 메타 정보
 */
function getGenderDisplayMeta(genderCode: Gender): GenderMeta | null {
  const genderMap: Record<Gender, GenderMeta> = {
    MAN: { label: '남성', emoji: '👔' },
    WOMAN: { label: '여성', emoji: '👗' },
    UNISEX: { label: '공용', emoji: '🧥' },
  }
  return genderMap[genderCode] || null
}

/**
 * 카테고리 표시 이름
 */
function getCategoryDisplayName(category: Category): string {
  const categoryNames: Record<Category, string> = {
    TOP: '상의',
    BOTTOM: '하의',
    OUTER: '아우터',
    SHOES: '신발',
    ETC: '기타',
  }
  return categoryNames[category] || category
}

// 값이 문자열/숫자일 수 있을 때 안전하게 숫자로 변환
function coerceNumber(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''))
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return 0
}

// 숫자 값을 "1,000원" 형태의 문자열로 변환
function formatPriceValue(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '가격 정보 없음'
  }

  return `${value.toLocaleString('ko-KR')}원`
}

/**
 * 상품 상세 페이지 컴포넌트
 * 
 * @description
 * 개별 상품의 상세 정보를 보여주는 페이지입니다.
 * - 상품 이미지, 가격, 상세 설명 표시
 * - 가격 변동 그래프 제공
 * - 찜하기, 공유하기 기능
 * - 최근 본 상품 목록 표시
 * - 동적 SEO 메타 태그 생성 (Open Graph)
 */
export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query

  // 상태: 상품 정보, 로딩, 에러 메시지
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 커스텀 훅 사용 (찜/최근 본 상품)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { addRecentItem, recentItems } = useRecentlyViewed()

  // API 호출 중복 방지를 위한 ref (상품 ID별로 관리)
  // useRef는 값이 바뀌어도 리렌더가 발생하지 않습니다.
  const lastFetchedIdRef = useRef<string | null>(null)

  /**
   * 상품 정보 로드
   * API를 통해 상품 상세 정보를 가져옵니다
   */
  useEffect(() => {
    const productId = Array.isArray(id) ? id[0] : id
    // id가 준비되지 않았거나 문자열이 아니면 요청하지 않습니다.
    if (!productId || typeof productId !== 'string') return

    // React Strict Mode의 이중 실행 방지
    // 같은 ID로 이미 호출했으면 스킵
    if (lastFetchedIdRef.current === productId) return
    lastFetchedIdRef.current = productId

    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        // API를 통해 상품 정보 가져오기
        const productData = await fetchProductDetail(productId)

        if (!productData) {
          throw new Error('상품 정보를 불러올 수 없습니다.')
        }

        const product = productData.product
        const originalPrice = coerceNumber(product.originalPrice)
        const salePriceSource = (product as { currentPrice?: number }).currentPrice ?? product.salePrice
        const salePrice = coerceNumber(salePriceSource)
        const discountRate = typeof product.discountRate === 'number'
          ? product.discountRate
          : (originalPrice
            ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
            : 0)
        const rawImageUrls = Array.isArray((product as { imageUrls?: string[] }).imageUrls)
          ? (product as { imageUrls?: string[] }).imageUrls!.filter(Boolean)
          : []
        const fallbackImageUrl = product.imageUrl || '/placeholder-product.svg'
        const imageUrls = rawImageUrls.length > 0 ? rawImageUrls : [fallbackImageUrl]
        const imageUrl = rawImageUrls[0] || product.imageUrl || '/placeholder-product.svg'

        // API 응답을 프론트엔드 형식으로 변환
        // - 숫자/문자 타입을 정리하고, 없는 값은 기본값으로 채웁니다.
        const normalizedProduct: ProductDetail = {
          id: product.id ? String(product.id) : productId,
          brand: product.brand,
          brandCode: product.brand,
          brandName: product.brand,
          productCode: String(product.id ?? productId),
          name: product.name,
          description: undefined,
          gender: product.gender,
          mainCategory: product.category,
          category: product.category,
          categoryGroup: product.category,
          subCategory: undefined,
          originalPrice,
          salePrice,
          price: salePrice,
          currentPrice: salePrice,
          discountRate,
          onSale: discountRate > 0,
          imageUrl,
          imageUrls,
          productUrl: product.productUrl,
          colors: [],
          sizes: [],
          inStock: undefined,
          material: undefined,
          tags: [],
          vibeTags: [],
          vibe: null,
          saleStartDate: undefined,
          saleEndDate: undefined,
          viewCount: 0,
          likeCount: 0,
          createdAt: undefined,
          updatedAt: undefined,
        }

        setProduct(normalizedProduct)

      } catch (err) {
        setError((err as Error).message || '상품 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  // 최근 본 상품 추가 효과
  // 상품 데이터가 로드되면 addRecentItem을 호출하여 로컬 스토리지에 저장합니다.
  useEffect(() => {
    if (product) {
      addRecentItem(product)
    }
  }, [product, addRecentItem])

  /**
   * 로딩 상태
   */
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  /**
   * 에러 상태
   */
  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>😕</div>
          <h2>{error || '상품을 찾을 수 없습니다'}</h2>
          <Link href="/" className={styles.backButton}>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const genderMeta = getGenderDisplayMeta(product.gender)
  const brandName = getBrandDisplayName(product.brand)

  return (
    <>
      {/* 
        동적 SEO 메타 태그 설정 
        상품 정보를 기반으로 Open Graph 태그를 생성하여 SNS 공유 시 미리보기를 최적화합니다.
      */}
      <Head>
        <title>{product ? `${product.brand} ${product.name} - Sale Archive` : '상품 상세 - Sale Archive'}</title>
        <meta name="description" content={product ? `${product.brand} ${product.name} ${product.discountRate}% 할인 중! 현재 가격: ${formatPriceValue(product.salePrice)}` : 'SPA 브랜드 세일 정보'} />

        {/* Open Graph (Facebook, KakaoTalk 등) */}
        <meta property="og:title" content={product ? `${product.brand} ${product.name} (${product.discountRate}% 할인)` : 'Sale Archive'} />
        <meta property="og:description" content={product ? `정가 ${formatPriceValue(product.originalPrice)} → 할인가 ${formatPriceValue(product.salePrice)}` : 'SPA 브랜드 세일 정보를 확인하세요.'} />
        <meta property="og:image" content={product?.imageUrl} />
        <meta property="og:url" content={`https://mion-spa-info.vercel.app/product/${id}`} />
      </Head>

      <div className={styles.container}>
        {/* 뒤로 가기 헤더 */}
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← 목록으로
          </Link>
          <div className={styles.headerActions}>
            <ShareButton
              title={`${product.name} - ${brandName}`}
              text={`${product.discountRate}% 할인! ${product.name} 확인해보세요.`}
            />
            <FavoriteButton
              product={product}
              isFavorite={isFavorite(product.id)}
              onToggle={toggleFavorite}
              size="large"
            />
          </div>
        </header>

        <div className={styles.content}>
          {/* 왼쪽: 이미지 영역 */}
          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className={styles.productImage}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* 할인 뱃지 */}
              {product.discountRate > 0 && (
                <div className={styles.discountBadge}>
                  {product.discountRate}% OFF
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 상품 정보 영역 */}
          <div className={styles.infoSection}>
            {/* 브랜드 & 카테고리 */}
            <div className={styles.meta}>
              <div className={styles.brandBadge}>{brandName}</div>
              {genderMeta && (
                <div className={styles.genderBadge}>
                  <span>{genderMeta.emoji}</span>
                  <span>{genderMeta.label}</span>
                </div>
              )}
              {product.categoryGroup && (
                <div className={styles.categoryBadge}>
                  {getCategoryDisplayName(product.categoryGroup)}
                </div>
              )}
            </div>

            {/* 상품명 */}
            <h1 className={styles.productName}>{product.name}</h1>

            {/* Vibe 태그 */}
            {product.vibe && (
              <div className={styles.vibeTags}>
                <span className={styles.vibeTag}>#{product.vibe}</span>
              </div>
            )}

            {/* 가격 정보 */}
            <div className={styles.priceSection}>
              <div className={styles.currentPrice}>
                {formatPriceValue(product.salePrice)}
              </div>
              {product.originalPrice && product.originalPrice > product.salePrice && (
                <div className={styles.originalPrice}>
                  {formatPriceValue(product.originalPrice)}
                </div>
              )}
            </div>

            {/* CTA 버튼 */}
            <div className={styles.actions}>
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.purchaseButton}
              >
                <span className={styles.buttonIcon}>🛒</span>
                <span>{brandName}에서 구매하기</span>
              </a>
            </div>

            {/* 가격 히스토리 차트 */}
            {product.originalPrice && product.originalPrice > product.salePrice && (
              <div className={styles.chartSection}>
                <PriceHistoryChart
                  originalPrice={product.originalPrice}
                  salePrice={product.salePrice}
                  discountRate={product.discountRate}
                />
              </div>
            )}

            {/* 상품 상세 정보 */}
            {((product.colors?.length ?? 0) > 0 || (product.sizes?.length ?? 0) > 0 || product.material) && (
              <div className={styles.productSpecs}>
                <h3 className={styles.specsTitle}>상품 정보</h3>

                {(product.colors?.length ?? 0) > 0 && (
                  <div className={styles.specItem}>
                    <div className={styles.specLabel}>🎨 색상</div>
                    <div className={styles.specValue}>
                      {product.colors?.join(', ')}
                    </div>
                  </div>
                )}

                {(product.sizes?.length ?? 0) > 0 && (
                  <div className={styles.specItem}>
                    <div className={styles.specLabel}>📏 사이즈</div>
                    <div className={styles.specValue}>
                      {product.sizes?.join(', ')}
                    </div>
                  </div>
                )}

                {product.material && (
                  <div className={styles.specItem}>
                    <div className={styles.specLabel}>🧵 소재</div>
                    <div className={styles.specValue}>
                      {product.material}
                    </div>
                  </div>
                )}

                {product.inStock !== undefined && (
                  <div className={styles.specItem}>
                    <div className={styles.specLabel}>📦 재고</div>
                    <div className={styles.specValue}>
                      {product.inStock ? (
                        <span className={styles.inStock}>재고 있음</span>
                      ) : (
                        <span className={styles.outOfStock}>품절</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 상품 설명 */}
            {product.description && (
              <div className={styles.descriptionSection}>
                <h3 className={styles.descriptionTitle}>상품 설명</h3>
                <p className={styles.descriptionText}>{product.description}</p>
              </div>
            )}

            {/* 추가 정보 */}
            <div className={styles.additionalInfo}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>ℹ️</div>
                <div className={styles.infoContent}>
                  <h3 className={styles.infoTitle}>구매 안내</h3>
                  <ul className={styles.infoList}>
                    <li>실시간 가격은 브랜드 사이트에서 확인하세요</li>
                    <li>재고 및 사이즈는 공식 사이트에서 확인 가능합니다</li>
                    <li>할인율은 시간에 따라 변동될 수 있습니다</li>
                  </ul>
                </div>
              </div>

              {/* 조회수 & 좋아요 */}
              {((product.viewCount ?? 0) > 0 || (product.likeCount ?? 0) > 0) && (
                <div className={styles.statsCard}>
                  {(product.viewCount ?? 0) > 0 && (
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>👀</span>
                      <span className={styles.statLabel}>조회수</span>
                      <span className={styles.statValue}>{(product.viewCount ?? 0).toLocaleString()}</span>
                    </div>
                  )}
                  {(product.likeCount ?? 0) > 0 && (
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>❤️</span>
                      <span className={styles.statLabel}>좋아요</span>
                      <span className={styles.statValue}>{(product.likeCount ?? 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <RecentlyViewed products={recentItems} />
      </div>
    </>
  )
}
