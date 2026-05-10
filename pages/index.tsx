/**
 * index.tsx - 완전히 새로운 프리미엄 메인 페이지 (TypeScript)
 *
 * 이 페이지는 상품 리스트/필터/무한 스크롤을 모두 담당합니다.
 * TypeScript 문법 포인트:
 * - interface: 객체 구조 정의
 * - useState<타입>: 상태 타입 명시
 * - useMemo/useCallback: 계산 결과/함수를 메모이제이션하여 성능 개선
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import BrandFilter from '../components/BrandFilter'
import GenderFilter from '../components/GenderFilter'
import CategoryFilter from '../components/CategoryFilter'
import DetailedFilters from '../components/DetailedFilters'
import ThemeToggle from '../components/ThemeToggle'
import ProductCard from '../components/ProductCard'
import styles from '../styles/Home.module.css'
import { fetchSaleProducts, fetchSaleProductCount } from '../utils/api'
import useFavorites from '../hooks/useFavorites'
import type { Product, Brand, Gender, Category } from '../types'

/**
 * 확장된 제품 타입 (프론트엔드용)
 * - 백엔드 Product 타입에 화면 표시용 필드를 추가합니다.
 */
interface NormalizedProduct extends Product {
  brandCode: Brand;
  brandName: string;
  mainCategory: Category;
  categoryGroup: string;
  price: number;
  vibe: string | null;
  vibeTags: string[];
}

/**
 * API에서 충분히 많은 상품을 받기 위해 한 번에 불러올 개수를 결정합니다.
 * 값이 너무 작으면 스크롤을 조금만 내려도 계속 네트워크 요청을 하게 됩니다.
 */
// 페이지네이션 기본 크기
const PAGE_SIZE = 12
// 이미지가 없거나 잘못된 경우 사용할 기본 이미지
const FALLBACK_IMAGE = '/placeholder-product.svg'
// API에서 오는 카테고리를 우리 기준 카테고리로 묶기 위한 매핑
const CATEGORY_GROUPS: Record<string, string[]> = {
  TOP: ['SHIRT', 'T_SHIRT', 'KNIT', 'SWEATSHIRT', 'DRESS', 'BLOUSE'],
  BOTTOM: ['PANTS', 'JEANS', 'SHORTS', 'SKIRT'],
  OUTER: ['JACKET', 'COAT', 'PADDING'],
  SHOES: ['SHOES'],
  ETC: ['ACCESSORIES', 'BAG', 'UNCATEGORIZED', 'UNKNOWN'],
}
// 오늘의 시선 - 스타일 제안 (100개)
const DAILY_INSIGHTS = [
  { theme: '레이어드로 완성하는 가을 무드', tip: '긴 셔츠 위에 짧은 니트를 매치하세요' },
  { theme: '미니멀한 하루를 위한 베이직', tip: '화이트 티 · 데님 · 로퍼 조합' },
  { theme: '캐주얼한 주말 스타일링', tip: '오버핏 후디와 슬랙스의 편안한 균형' },
  { theme: '오피스룩에 개성 더하기', tip: '정장 바지에 스니커즈를 매치해보세요' },
  { theme: '톤온톤으로 세련되게', tip: '같은 계열 색상을 여러 레이어로 쌓기' },
  { theme: '빈티지 무드 연출법', tip: '워싱 진 · 오버핏 셔츠 · 레더 슈즈' },
  { theme: '모노크롬 스타일의 힘', tip: '흑백만으로도 충분히 멋진 룩 완성' },
  { theme: '스트리트 감성 살리기', tip: '와이드 카고팬츠에 크롭 후디를 매치' },
  { theme: '심플한 데이트 룩', tip: '슬림 진 · 니트 · 클린한 스니커즈' },
  { theme: '비오는 날 스타일링', tip: '트렌치코트에 첼시부츠로 멋스럽게' },
  { theme: '출근길 세미캐주얼', tip: '블레이저 · 티셔츠 · 치노팬츠 조합' },
  { theme: '주말 브런치 룩', tip: '린넨 셔츠에 반바지, 에스파드류를 더해' },
  { theme: '캠퍼스 스타일 연출', tip: '맨투맨 · 와이드 진 · 캔버스 백팩' },
  { theme: '저녁 약속 룩', tip: '블랙 터틀넥 · 슬랙스 · 로퍼로 세련되게' },
  { theme: '올 블랙 스타일링', tip: '다양한 소재 믹스로 단조로움 탈출' },
  { theme: '프렌치 시크 따라하기', tip: '스트라이프 티 · 베이지 팬츠 · 로퍼' },
  { theme: '노멀코어의 정석', tip: '심플한 아이템만으로 완성하는 스타일' },
  { theme: '레트로 감성 코디', tip: '플레어 팬츠 · 크롭 니트 · 플랫폼 슈즈' },
  { theme: '스포티 캐주얼', tip: '트랙 재킷에 조거팬츠, 러닝화 매치' },
  { theme: '비즈니스 캐주얼 완성', tip: '니트 카디건 · 셔츠 · 치노팬츠' },
  { theme: '아메카지 스타일', tip: '체크 셔츠 · 데님 · 워크부츠 조합' },
  { theme: '올화이트 룩', tip: '다양한 화이트 톤으로 깊이감 연출' },
  { theme: '컬러 포인트 활용법', tip: '베이직한 룩에 밝은 색 아이템 하나만' },
  { theme: '레이어링의 기본', tip: '긴팔 티 위에 반팔 티를 겹쳐 입기' },
  { theme: '패턴 믹스 매치', tip: '스트라이프와 체크를 조화롭게' },
  { theme: '데님 온 데님', tip: '다른 워싱의 데님을 매치해 자연스럽게' },
  { theme: '오버사이즈 핏 활용', tip: '큰 상의에는 슬림한 하의로 밸런스' },
  { theme: '액세서리로 포인트', tip: '심플한 코디에 시계 하나만으로 완성' },
  { theme: '계절 전환기 룩', tip: '가벼운 아우터를 허리에 둘러 연출' },
  { theme: '컬러 블로킹 시도', tip: '대비되는 두 가지 색상으로 강렬하게' },
  { theme: '시티보이 감성', tip: '코치 재킷 · 슬랙스 · 클래식 스니커즈' },
  { theme: '이지 웨어 스타일', tip: '편한 옷도 핏과 소재로 고급스럽게' },
  { theme: '어센틱 룩 완성', tip: '빈티지 가죽 재킷 · 워싱 진 · 부츠' },
  { theme: '클린 미니멀', tip: '장식 없는 깔끔한 라인만으로 승부' },
  { theme: '스마트 캐주얼', tip: '니트 · 셔츠 · 슬랙스로 품격있게' },
  { theme: '힙한 거리 패션', tip: '그래픽 티 · 카고팬츠 · 하이탑 스니커즈' },
  { theme: '젠더리스 스타일', tip: '성별 구분 없는 유니섹스 아이템 활용' },
  { theme: '모던 클래식', tip: '전통적인 아이템을 현대적으로 해석' },
  { theme: '테일러드 룩', tip: '잘 맞는 재킷과 팬츠로 완벽한 실루엣' },
  { theme: '아웃도어 무드', tip: '플리스 · 하이킹 팬츠 · 트레일 슈즈' },
  { theme: '네오 프레피', tip: '폴로 셔츠 · 치노 쇼츠 · 보트슈즈' },
  { theme: '얼리지 룩', tip: '스타디움 점퍼 · 스웨트팬츠 · 스니커즈' },
  { theme: '아티스트 감성', tip: '오버핏 셔츠 · 와이드 팬츠 · 슬립온' },
  { theme: '리조트 웨어', tip: '린넨 셔츠 · 쇼츠 · 샌들로 여유롭게' },
  { theme: '어반 테크', tip: '기능성 재킷 · 테이퍼드 팬츠 · 러닝화' },
  { theme: '핸섬 무드', tip: '셔츠 · 베스트 · 슬랙스로 단정하게' },
  { theme: '소프트 그런지', tip: '오버사이즈 니트 · 스키니 진 · 첼시부츠' },
  { theme: '뉴트로 감성', tip: '90년대 스타일을 현대적으로 재해석' },
  { theme: '에슬레저 룩', tip: '스포츠웨어를 일상에 자연스럽게' },
  { theme: '스칸디나비안 스타일', tip: '미니멀하고 기능적인 북유럽 감성' },
  { theme: '브리티시 클래식', tip: '트렌치 · 울팬츠 · 옥스포드 슈즈' },
  { theme: '이탈리안 스프레차투라', tip: '무심한 듯 세련된 이탈리아 스타일' },
  { theme: '재팬 캐주얼', tip: '심플하고 고품질의 일본 감성' },
  { theme: 'LA 캐주얼', tip: '편안하고 여유로운 서부 해안 스타일' },
  { theme: '뉴요커 스타일', tip: '올블랙 · 레이어드 · 미니멀' },
  { theme: '파리지앵 시크', tip: '자연스러운 멋과 고급스러움의 조화' },
  { theme: '밀리터리 믹스', tip: 'MA-1 · 카고팬츠 · 컴뱃부츠' },
  { theme: '워크웨어 트렌드', tip: '작업복에서 영감받은 실용적 스타일' },
  { theme: '테크웨어 입문', tip: '기능성과 미래지향적 디자인의 만남' },
  { theme: '노르딕 미니멀', tip: '단순함 속의 따뜻함과 아늑함' },
  { theme: '모드 스트리트', tip: '하이패션을 스트리트에 녹여내기' },
  { theme: '캠핑 코어', tip: '아웃도어 무드를 도시에서 즐기기' },
  { theme: '고프코어 스타일', tip: '기능성 아웃도어를 일상복으로' },
  { theme: '블루칼라 시크', tip: '작업복의 실용성을 패셔너블하게' },
  { theme: '아이비 룩', tip: '대학 캠퍼스 느낌의 프레피 스타일' },
  { theme: '소호 아티스트', tip: '창의적이고 자유로운 예술가 룩' },
  { theme: '코지 웨어', tip: '포근하고 편안한 집콕 스타일' },
  { theme: '스마트 레저', tip: '세미 포멀과 캐주얼의 완벽한 중간' },
  { theme: '어글리 슈즈 매치', tip: '투박한 신발로 개성있게 연출' },
  { theme: '크롭 스타일링', tip: '짧은 상의로 시원하고 세련되게' },
  { theme: '롱 실루엣', tip: '긴 기장으로 날씬하고 우아하게' },
  { theme: '하프 앤 하프', tip: '상하의 색상을 대비시켜 재미있게' },
  { theme: '언더웨어 노출', tip: '속옷을 패션 아이템으로 활용' },
  { theme: '니트 온 셔츠', tip: '셔츠 위에 니트 조끼로 지적인 느낌' },
  { theme: '터틀넥 레이어드', tip: '터틀넥 안에 셔츠 칼라만 살짝' },
  { theme: '벨트 포인트', tip: '허리띠 하나로 실루엣 정리' },
  { theme: '삭스 코디', tip: '양말로 포인트 컬러 주기' },
  { theme: '헤드웨어 활용', tip: '모자나 헤어밴드로 완성도 높이기' },
  { theme: '백팩 스타일링', tip: '가방 선택으로 룩의 분위기 바꾸기' },
  { theme: '슬리브 롤업', tip: '소매 걷기로 캐주얼함 더하기' },
  { theme: '언터크 vs 터크인', tip: '상의 넣고 빼기로 분위기 변화' },
  { theme: '버튼 조절', tip: '셔츠 단추 개수로 무드 조정' },
  { theme: '카라 세우기', tip: '칼라를 세워 스타일리시하게' },
  { theme: '레이어 컬러 매치', tip: '겹치는 옷의 색조화로 깊이감' },
  { theme: '소재 믹스 매치', tip: '다른 질감을 조합해 입체감 연출' },
  { theme: '패턴 vs 무지', tip: '패턴 아이템은 하나만 포인트로' },
  { theme: '슬림 vs 오버핏', tip: '상하의 핏 대비로 밸런스 잡기' },
  { theme: '쇼트 vs 롱', tip: '기장 차이로 비율 보정' },
  { theme: '하이웨이스트 활용', tip: '높은 허리선으로 다리 길어보이기' },
  { theme: '로우라이즈 스타일', tip: '낮은 팬츠로 캐주얼하고 편하게' },
  { theme: '와이드 실루엣', tip: '넓은 팬츠로 여유롭고 트렌디하게' },
  { theme: '테이퍼드 핏', tip: '발목으로 갈수록 좁아지는 깔끔한 라인' },
  { theme: '스트레이트 레그', tip: '직선 실루엣으로 클래식하게' },
  { theme: '플레어 팬츠', tip: '발목 아래로 퍼지는 레트로 무드' },
  { theme: '카고 디테일', tip: '주머니 많은 팬츠로 유틸리티 감성' },
  { theme: '조거 스타일', tip: '밴딩 팬츠로 편안하고 스포티하게' },
  { theme: '팬츠 롤업', tip: '바지 단을 접어 발목 노출' },
  { theme: '신발과 양말 매치', tip: '양말 색상으로 신발과 조화롭게' },
]

// Wardrobe Log - 컬러/소재 조합 (100개)
const DAILY_MOODS = [
  { palette: '잿빛 스카이블루', fabric: '워셔블 울', focus: '여유 있는 셔츠', note: '햇빛 아래에서도 거슬리지 않는 차분한 색감', background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.9), rgba(96, 165, 250, 0.85))', textColor: '#f8fafc' },
  { palette: '먼지 낀 네이비', fabric: '코튼 트윌', focus: '하이웨이스트 팬츠', note: '밝고 어두운 아이템을 자연스럽게 연결', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 118, 110, 0.85))', textColor: '#e0f2f1' },
  { palette: '바랜 베이지', fabric: '린넨 & 레이온', focus: '가벼운 드레스', note: '공기를 머금은 느낌이 필요한 날', background: 'linear-gradient(135deg, rgba(244, 224, 196, 0.95), rgba(217, 180, 130, 0.85))', textColor: '#4a3425' },
  { palette: '모래빛 카키', fabric: '나일론 혼방', focus: '가볍게 걸칠 점퍼', note: '도로 먼지를 닮은 무심한 분위기', background: 'linear-gradient(135deg, rgba(64, 64, 59, 0.95), rgba(156, 163, 175, 0.85))', textColor: '#f1f5f9' },
  { palette: '차분한 모브', fabric: '캐시미어 블렌드', focus: '부드러운 터틀넥', note: '보라빛 도는 회색으로 고급스럽게', background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.9), rgba(139, 92, 246, 0.75))', textColor: '#faf5ff' },
  { palette: '따뜻한 테라코타', fabric: '코듀로이', focus: '빈티지 재킷', note: '가을 햇살을 닮은 따뜻한 컬러', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.85), rgba(217, 119, 6, 0.9))', textColor: '#fffbeb' },
  { palette: '올리브 그린', fabric: '헤비 코튼', focus: '밀리터리 파카', note: '자연스러운 그린 톤의 만능 아이템', background: 'linear-gradient(135deg, rgba(77, 124, 15, 0.9), rgba(132, 204, 22, 0.8))', textColor: '#f7fee7' },
  { palette: '크림 화이트', fabric: '메리노 울', focus: '케이블 니트', note: '따뜻하고 포근한 겨울 필수 아이템', background: 'linear-gradient(135deg, rgba(254, 252, 232, 0.95), rgba(254, 243, 199, 0.9))', textColor: '#78350f' },
  { palette: '차콜 그레이', fabric: '울 블렌드', focus: '오버사이즈 코트', note: '깊이 있는 회색으로 세련된 실루엣', background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.95), rgba(75, 85, 99, 0.9))', textColor: '#f9fafb' },
  { palette: '버건디 레드', fabric: '벨벳', focus: '크루넥 스웨터', note: '풍부한 색감이 돋보이는 가을 무드', background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.9), rgba(185, 28, 28, 0.85))', textColor: '#fef2f2' },
  { palette: '머스타드 옐로', fabric: '모직', focus: '체스터 코트', note: '활기찬 노란빛으로 우울함 날리기', background: 'linear-gradient(135deg, rgba(202, 138, 4, 0.9), rgba(234, 179, 8, 0.85))', textColor: '#fefce8' },
  { palette: '포레스트 그린', fabric: '플란넬', focus: '체크 셔츠', note: '깊은 숲 속 같은 편안한 색감', background: 'linear-gradient(135deg, rgba(20, 83, 45, 0.95), rgba(22, 101, 52, 0.9))', textColor: '#f0fdf4' },
  { palette: '아이보리', fabric: '앙고라 혼방', focus: '카디건', note: '부드럽고 따뜻한 상아색 포근함', background: 'linear-gradient(135deg, rgba(255, 251, 235, 0.95), rgba(254, 249, 195, 0.9))', textColor: '#713f12' },
  { palette: '슬레이트 블루', fabric: '데님', focus: '워크 재킷', note: '회색빛 파란색의 중성적 매력', background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9), rgba(100, 116, 139, 0.85))', textColor: '#f1f5f9' },
  { palette: '로즈 핑크', fabric: '실크 혼방', focus: '블라우스', note: '은은한 핑크빛 우아함', background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.7), rgba(251, 207, 232, 0.85))', textColor: '#831843' },
  { palette: '인디고 블루', fabric: '셀비지 데님', focus: '청바지', note: '진정한 빈티지 데님의 깊은 색감', background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(37, 99, 235, 0.85))', textColor: '#dbeafe' },
  { palette: '밀크 티 브라운', fabric: '스웨이드', focus: '트러커 재킷', note: '밀크티처럼 부드러운 갈색 톤', background: 'linear-gradient(135deg, rgba(168, 162, 158, 0.9), rgba(214, 211, 209, 0.85))', textColor: '#1c1917' },
  { palette: '민트 그린', fabric: '코튼 저지', focus: '루즈핏 티', note: '상쾌한 민트색으로 경쾌하게', background: 'linear-gradient(135deg, rgba(167, 243, 208, 0.85), rgba(134, 239, 172, 0.9))', textColor: '#14532d' },
  { palette: '코발트 블루', fabric: '테크니컬 패브릭', focus: '윈드브레이커', note: '강렬한 파란색의 스포티 에너지', background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.9), rgba(59, 130, 246, 0.85))', textColor: '#eff6ff' },
  { palette: '라벤더 퍼플', fabric: '저지 니트', focus: '폴로 셔츠', note: '연보라빛의 부드러운 봄 분위기', background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.8), rgba(233, 213, 255, 0.85))', textColor: '#581c87' },
  { palette: '샌드 베ージ', fabric: '치노 코튼', focus: '치노 팬츠', note: '모래사장처럼 편안한 중성 컬러', background: 'linear-gradient(135deg, rgba(231, 229, 228, 0.9), rgba(245, 245, 244, 0.85))', textColor: '#292524' },
  { palette: '피치 코랄', fabric: '텐셀', focus: '플로우 블라우스', note: '복숭아빛 산호색의 발랄함', background: 'linear-gradient(135deg, rgba(254, 205, 211, 0.85), rgba(252, 165, 165, 0.9))', textColor: '#7f1d1d' },
  { palette: '애쉬 그레이', fabric: '테리 코튼', focus: '후드 집업', note: '재빛 회색의 도시적 감성', background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.9), rgba(209, 213, 219, 0.85))', textColor: '#111827' },
  { palette: '와인 레드', fabric: '울 플란넬', focus: '더블 코트', note: '와인처럼 깊고 우아한 빨강', background: 'linear-gradient(135deg, rgba(153, 27, 27, 0.95), rgba(220, 38, 38, 0.85))', textColor: '#fef2f2' },
  { palette: '세이지 그린', fabric: '오가닉 코튼', focus: '유틸리티 셔츠', note: '허브 같은 연두빛 초록', background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.7), rgba(217, 249, 157, 0.85))', textColor: '#365314' },
  { palette: '스틸 그레이', fabric: '폴리에스터 블렌드', focus: '트랙 재킷', note: '강철 같은 차가운 회색빛', background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(156, 163, 175, 0.85))', textColor: '#f3f4f6' },
  { palette: '카라멜 브라운', fabric: '가죽', focus: '라이더 재킷', note: '캬라멜처럼 달콤한 갈색 톤', background: 'linear-gradient(135deg, rgba(146, 64, 14, 0.9), rgba(194, 65, 12, 0.85))', textColor: '#ffedd5' },
  { palette: '퍼플 그레이', fabric: '울 믹스', focus: '테일러드 블레이저', note: '보라빛 도는 우아한 회색', background: 'linear-gradient(135deg, rgba(126, 34, 206, 0.7), rgba(167, 139, 250, 0.8))', textColor: '#faf5ff' },
  { palette: '다크 초콜릿', fabric: '코듀로이', focus: '밴딩 팬츠', note: '초콜릿처럼 진한 갈색의 깊이', background: 'linear-gradient(135deg, rgba(68, 64, 60, 0.95), rgba(87, 83, 78, 0.9))', textColor: '#fafaf9' },
  { palette: '스카이 블루', fabric: '옥스포드 코튼', focus: '버튼다운 셔츠', note: '맑은 하늘색의 상쾌함', background: 'linear-gradient(135deg, rgba(125, 211, 252, 0.85), rgba(186, 230, 253, 0.9))', textColor: '#0c4a6e' },
  { palette: '더스티 로즈', fabric: '벨루어', focus: '집업 후디', note: '먼지 낀 장미빛 빈티지 무드', background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.6), rgba(251, 113, 133, 0.75))', textColor: '#fff1f2' },
  { palette: '탄 브라운', fabric: '캔버스', focus: '워크 팬츠', note: '태양에 그을린 갈색의 내추럴함', background: 'linear-gradient(135deg, rgba(120, 113, 108, 0.9), rgba(168, 162, 158, 0.85))', textColor: '#fafaf9' },
  { palette: '네온 옐로', fabric: '립스탑', focus: '조끼', note: '형광 노란색의 강렬한 비주얼', background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.85), rgba(253, 224, 71, 0.9))', textColor: '#713f12' },
  { palette: '페일 그레이', fabric: '저지', focus: '크루넥 맨투맨', note: '연한 회색의 심플한 베이직', background: 'linear-gradient(135deg, rgba(243, 244, 246, 0.95), rgba(249, 250, 251, 0.9))', textColor: '#1f2937' },
  { palette: '에메랄드 그린', fabric: '실크 새틴', focus: '오픈 카라 셔츠', note: '보석 같은 녹색의 화려함', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.85), rgba(52, 211, 153, 0.9))', textColor: '#064e3b' },
  { palette: '블러시 핑크', fabric: '시폰', focus: '플리츠 스커트', note: '볼에 홍조 띈 듯한 연분홍', background: 'linear-gradient(135deg, rgba(251, 207, 232, 0.8), rgba(252, 231, 243, 0.85))', textColor: '#9f1239' },
  { palette: '오션 블루', fabric: '폴라 플리스', focus: '플리스 집업', note: '바다처럼 깊은 파란색', background: 'linear-gradient(135deg, rgba(3, 105, 161, 0.9), rgba(14, 165, 233, 0.85))', textColor: '#e0f2fe' },
  { palette: '헤이즐넛 브라운', fabric: '니트', focus: '카라 니트', note: '헤이즐넛처럼 고소한 갈색', background: 'linear-gradient(135deg, rgba(161, 98, 7, 0.9), rgba(217, 119, 6, 0.85))', textColor: '#fffbeb' },
  { palette: '라임 그린', fabric: '메쉬', focus: '스포츠 탱크탑', note: '라임처럼 신선한 연두색', background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.85), rgba(190, 242, 100, 0.9))', textColor: '#1a2e05' },
  { palette: '플럼 퍼플', fabric: '트위드', focus: '자켓', note: '자두 같은 진한 보라색', background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.85), rgba(147, 51, 234, 0.9))', textColor: '#faf5ff' },
  { palette: '골드 옐로', fabric: '새틴', focus: '볼링 셔츠', note: '금빛 노란색의 럭셔리함', background: 'linear-gradient(135deg, rgba(202, 138, 4, 0.9), rgba(245, 158, 11, 0.85))', textColor: '#451a03' },
  { palette: '실버 그레이', fabric: '메탈릭 패브릭', focus: '패딩 조끼', note: '은빛 회색의 미래적 감성', background: 'linear-gradient(135deg, rgba(209, 213, 219, 0.9), rgba(229, 231, 235, 0.85))', textColor: '#111827' },
  { palette: '코퍼 브라운', fabric: '워싱 데님', focus: '데님 셔츠', note: '구리 같은 적갈색 톤', background: 'linear-gradient(135deg, rgba(180, 83, 9, 0.9), rgba(217, 119, 6, 0.85))', textColor: '#fff7ed' },
  { palette: '틸 블루', fabric: '시어서커', focus: '스트라이프 셔츠', note: '청록빛의 시원한 여름 색감', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.85), rgba(34, 211, 238, 0.9))', textColor: '#083344' },
  { palette: '모카 브라운', fabric: '페이크 레더', focus: '바이커 재킷', note: '모카커피 같은 진한 브라운', background: 'linear-gradient(135deg, rgba(87, 83, 78, 0.95), rgba(120, 113, 108, 0.9))', textColor: '#fafaf9' },
  { palette: '아쿠아 민트', fabric: '쿨맥스', focus: '드라이 티셔츠', note: '수영장 물처럼 시원한 청록', background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.8), rgba(165, 243, 252, 0.85))', textColor: '#0e7490' },
  { palette: '체리 레드', fabric: '울 믹스', focus: '비니', note: '체리처럼 선명한 빨강', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9), rgba(239, 68, 68, 0.85))', textColor: '#fef2f2' },
  { palette: '소프트 그린', fabric: '쿨링 패브릭', focus: '헨리넥 티', note: '부드러운 연초록의 자연스러움', background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.8), rgba(187, 247, 208, 0.85))', textColor: '#14532d' },
  { palette: '피죤 그레이', fabric: '울 개버딘', focus: '트렌치 코트', note: '비둘기 같은 회색의 우아함', background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.9), rgba(209, 213, 219, 0.85))', textColor: '#1f2937' },
  { palette: '살몬 핑크', fabric: '저지 니트', focus: '폴로 티셔츠', note: '연어빛 핑크의 활기참', background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.8), rgba(252, 165, 165, 0.85))', textColor: '#7f1d1d' },
  { palette: '제이드 그린', fabric: '실크', focus: '네커치프', note: '비취 같은 녹색의 고급스러움', background: 'linear-gradient(135deg, rgba(6, 95, 70, 0.9), rgba(16, 185, 129, 0.85))', textColor: '#d1fae5' },
  { palette: '매트 블랙', fabric: '코튼 트윌', focus: '카고 팬츠', note: '무광 검정의 강렬함', background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.9))', textColor: '#f9fafb' },
  { palette: '라이트 베이지', fabric: '리넨', focus: '반팔 셔츠', note: '연한 베이지의 여름 청량함', background: 'linear-gradient(135deg, rgba(250, 250, 249, 0.95), rgba(245, 245, 244, 0.9))', textColor: '#292524' },
  { palette: '버프 옐로', fabric: '코튼 트윌', focus: '치노 쇼츠', note: '황토빛 노란색의 따스함', background: 'linear-gradient(135deg, rgba(253, 224, 71, 0.85), rgba(254, 240, 138, 0.9))', textColor: '#713f12' },
  { palette: '프루시안 블루', fabric: '울 플란넬', focus: '오버 셔츠', note: '프러시아 군복 같은 진한 파랑', background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(29, 78, 216, 0.9))', textColor: '#dbeafe' },
  { palette: '러스트 오렌지', fabric: '코듀로이', focus: '트러커 재킷', note: '녹슨 철처럼 빈티지한 주황', background: 'linear-gradient(135deg, rgba(194, 65, 12, 0.9), rgba(234, 88, 12, 0.85))', textColor: '#fff7ed' },
  { palette: '초코 브라운', fabric: '스웨이드', focus: '첼시 부츠', note: '초콜릿처럼 달콤한 짙은 갈색', background: 'linear-gradient(135deg, rgba(41, 37, 36, 0.95), rgba(68, 64, 60, 0.9))', textColor: '#fafaf9' },
  { palette: '클라우드 화이트', fabric: '니트', focus: '터틀넥 스웨터', note: '구름처럼 포근한 순백', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 250, 250, 0.9))', textColor: '#171717' },
  { palette: '페트롤 블루', fabric: '울 블렌드', focus: '피코트', note: '석유 같은 진한 청록색', background: 'linear-gradient(135deg, rgba(8, 51, 68, 0.95), rgba(14, 116, 144, 0.9))', textColor: '#cffafe' },
  { palette: '토프 브라운', fabric: '캐시미어', focus: '롱 머플러', note: '토프처럼 부드러운 회갈색', background: 'linear-gradient(135deg, rgba(120, 113, 108, 0.9), rgba(168, 162, 158, 0.85))', textColor: '#fafaf9' },
  { palette: '스프링 그린', fabric: '코튼 피케', focus: '반팔 폴로', note: '봄날처럼 싱그러운 연두', background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.8), rgba(217, 249, 157, 0.85))', textColor: '#1a2e05' },
  { palette: '오닉스 블랙', fabric: '울 개버딘', focus: '싱글 코트', note: '흑옥처럼 깊은 검정', background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(23, 23, 23, 0.9))', textColor: '#fafafa' },
  { palette: '레몬 옐로', fabric: '코튼 저지', focus: '그래픽 티', note: '레몬처럼 상큼한 노란색', background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.85), rgba(253, 224, 71, 0.9))', textColor: '#713f12' },
  { palette: '아이스 블루', fabric: '나일론', focus: '윈드 재킷', note: '얼음처럼 차가운 하늘색', background: 'linear-gradient(135deg, rgba(186, 230, 253, 0.85), rgba(224, 242, 254, 0.9))', textColor: '#0c4a6e' },
  { palette: '테라 브라운', fabric: '가죽', focus: '벨트', note: '대지 같은 따뜻한 갈색', background: 'linear-gradient(135deg, rgba(146, 64, 14, 0.9), rgba(180, 83, 9, 0.85))', textColor: '#ffedd5' },
  { palette: '미스트 그레이', fabric: '프렌치 테리', focus: '스웨트 팬츠', note: '안개 낀 듯한 연한 회색', background: 'linear-gradient(135deg, rgba(229, 231, 235, 0.9), rgba(243, 244, 246, 0.85))', textColor: '#111827' },
  { palette: '포그 그린', fabric: '윈드스토퍼', focus: '쉘 재킷', note: '안개 속 녹색의 신비로움', background: 'linear-gradient(135deg, rgba(110, 231, 183, 0.7), rgba(167, 243, 208, 0.8))', textColor: '#064e3b' },
  { palette: '선셋 오렌지', fabric: '코튼 블렌드', focus: '후드 티셔츠', note: '노을 같은 따뜻한 주황', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.85), rgba(249, 115, 22, 0.9))', textColor: '#fff7ed' },
  { palette: '딥 퍼플', fabric: '벨벳', focus: '블레이저', note: '깊은 보라색의 고급스러움', background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.9), rgba(126, 34, 206, 0.85))', textColor: '#faf5ff' },
  { palette: '크림 옐로', fabric: '실크', focus: '스카프', note: '크림처럼 부드러운 연노랑', background: 'linear-gradient(135deg, rgba(254, 249, 195, 0.9), rgba(254, 252, 232, 0.85))', textColor: '#713f12' },
  { palette: '스톤 그레이', fabric: '울', focus: '더블 코트', note: '돌처럼 단단한 회색', background: 'linear-gradient(135deg, rgba(120, 113, 108, 0.9), rgba(168, 162, 158, 0.85))', textColor: '#fafaf9' },
  { palette: '바이올렛', fabric: '니트', focus: '카디건', note: '제비꽃 같은 연보라', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.8), rgba(196, 181, 253, 0.85))', textColor: '#581c87' },
  { palette: '피스타치오 그린', fabric: '코튼 혼방', focus: '크루넥 티', note: '피스타치오처럼 연한 초록', background: 'linear-gradient(135deg, rgba(187, 247, 208, 0.85), rgba(220, 252, 231, 0.9))', textColor: '#14532d' },
  { palette: '슬레이트 그린', fabric: '데님', focus: '데님 재킷', note: '회색빛 녹색의 차분함', background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9), rgba(100, 116, 139, 0.85))', textColor: '#f1f5f9' },
  { palette: '샴페인 골드', fabric: '새틴', focus: '셔츠', note: '샴페인 거품 같은 금빛', background: 'linear-gradient(135deg, rgba(253, 224, 71, 0.7), rgba(254, 240, 138, 0.8))', textColor: '#713f12' },
  { palette: '번트 오렌지', fabric: '울 블렌드', focus: '니트 조끼', note: '불탄 듯한 진한 오렌지', background: 'linear-gradient(135deg, rgba(194, 65, 12, 0.9), rgba(234, 88, 12, 0.85))', textColor: '#fff7ed' },
  { palette: '미드나잇 블루', fabric: '벨벳', focus: '턱시도 재킷', note: '한밤의 하늘 같은 검푸른색', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(30, 58, 138, 0.9))', textColor: '#dbeafe' },
  { palette: '세피아 브라운', fabric: '워싱 코튼', focus: '밴딩 팬츠', note: '오래된 사진 같은 갈색', background: 'linear-gradient(135deg, rgba(120, 113, 108, 0.9), rgba(168, 162, 158, 0.85))', textColor: '#fafaf9' },
  { palette: '머큐리 그레이', fabric: '폴리에스터', focus: '트랙 수트', note: '수은 같은 차가운 회색', background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.9), rgba(209, 213, 219, 0.85))', textColor: '#111827' },
  { palette: '토마토 레드', fabric: '코튼', focus: '티셔츠', note: '토마토처럼 생생한 빨강', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9), rgba(239, 68, 68, 0.85))', textColor: '#fef2f2' },
  { palette: '피치 베이지', fabric: '린넨', focus: '와이드 팬츠', note: '복숭아빛 베이지의 부드러움', background: 'linear-gradient(135deg, rgba(254, 215, 170, 0.85), rgba(253, 186, 116, 0.9))', textColor: '#7c2d12' },
  { palette: '일렉트릭 블루', fabric: '나일론', focus: '바람막이', note: '전기처럼 강렬한 파랑', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(59, 130, 246, 0.85))', textColor: '#eff6ff' },
  { palette: '마룬 레드', fabric: '울 플란넬', focus: '체크 셔츠', note: '밤색 빨강의 클래식함', background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(153, 27, 27, 0.9))', textColor: '#fef2f2' },
  { palette: '허니 옐로', fabric: '코튼 니트', focus: '카라 티', note: '꿀처럼 달콤한 노란색', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.85), rgba(251, 191, 36, 0.9))', textColor: '#451a03' },
  { palette: '스모크 블랙', fabric: '테크니컬 울', focus: '싱글 재킷', note: '연기 낀 듯한 검정', background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(55, 65, 81, 0.9))', textColor: '#f9fafb' },
  { palette: '알로에 그린', fabric: '쿨맥스', focus: '기능성 티', note: '알로에처럼 싱그러운 초록', background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.8), rgba(187, 247, 208, 0.85))', textColor: '#14532d' },
  { palette: '실버 화이트', fabric: '새틴', focus: '볼링 셔츠', note: '은빛 도는 순백', background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.9))', textColor: '#0f172a' },
  { palette: '코코아 브라운', fabric: '플리스', focus: '집업 후디', note: '코코아처럼 달콤한 갈색', background: 'linear-gradient(135deg, rgba(87, 83, 78, 0.95), rgba(120, 113, 108, 0.9))', textColor: '#fafaf9' },
  { palette: '스틸 블루', fabric: '데님', focus: '워크 셔츠', note: '강철 같은 청색', background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9), rgba(100, 116, 139, 0.85))', textColor: '#f1f5f9' },
  { palette: '올리브 옐로', fabric: '코튼', focus: '유틸리티 재킷', note: '올리브 기름 같은 황록색', background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.8), rgba(163, 230, 53, 0.85))', textColor: '#1a2e05' },
  { palette: '차콜 블랙', fabric: '울 개버딘', focus: '슬랙스', note: '숯처럼 깊은 검정', background: 'linear-gradient(135deg, rgba(23, 23, 23, 0.95), rgba(38, 38, 38, 0.9))', textColor: '#fafafa' },
  { palette: '블러드 오렌지', fabric: '코튼 저지', focus: '후드 티', note: '블러드 오렌지처럼 진한 주황', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.9), rgba(249, 115, 22, 0.85))', textColor: '#fff7ed' },
  { palette: '페일 핑크', fabric: '시폰', focus: '플리츠 블라우스', note: '연한 핑크의 우아함', background: 'linear-gradient(135deg, rgba(252, 231, 243, 0.85), rgba(253, 242, 248, 0.9))', textColor: '#9f1239' },
  { palette: '네이비 블루', fabric: '울 혼방', focus: '더블 수트', note: '진한 남색의 정통 클래식', background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(37, 99, 235, 0.85))', textColor: '#dbeafe' },
  { palette: '캐러멜', fabric: '스웨이드', focus: '블루종', note: '캐러멜처럼 달콤한 갈색', background: 'linear-gradient(135deg, rgba(161, 98, 7, 0.9), rgba(217, 119, 6, 0.85))', textColor: '#fffbeb' },
  { palette: '민트 블루', fabric: '린넨', focus: '하와이안 셔츠', note: '민트 초콜릿 같은 청록', background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.8), rgba(165, 243, 252, 0.85))', textColor: '#083344' },
]


// 이미지 URL을 안전하게 보정하는 함수
// - rawUrl 타입을 any로 받지만, 내부에서 문자열인지 확인합니다.
const resolveImageUrl = (rawUrl: any): string => {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return FALLBACK_IMAGE
  }

  const trimmed = rawUrl.trim()

  // 절대 경로(URL)면 그대로 사용합니다.
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // 슬래시로 시작하면 Next.js에서 동일 호스트 자원으로 취급할 수 있습니다.
  if (trimmed.startsWith('/')) {
    return trimmed
  }

  // 그 외의 경우(예: assets/hm/... 처럼 상대 경로)는 Next Image가 파싱하지 못하므로
  // 안전하게 플레이스홀더 이미지를 사용합니다.
  return FALLBACK_IMAGE
}

// 숫자 형태로 바꿔주는 유틸 함수
// - 숫자가 아니면 0으로 반환
const coerceNumber = (value: any): number => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''))
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return 0
}

// API에서 받은 상품 객체를 화면에서 쓰기 좋은 형태로 변환
// - 반환 타입을 NormalizedProduct로 명시합니다.
const normalizeProduct = (product: any = {}): NormalizedProduct => {
  const originalPrice = coerceNumber(product.originalPrice)
  const salePriceSource = product.currentPrice !== undefined ? product.currentPrice : product.salePrice
  const salePrice = coerceNumber(salePriceSource)

  const discountRate = typeof product.discountRate === 'number'
    ? product.discountRate
    : (originalPrice
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0)

  const rawImageUrl = Array.isArray(product.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls[0]
    : product.imageUrl

  const imageUrl = resolveImageUrl(rawImageUrl)

  const gender = typeof product.gender === 'string'
    ? product.gender.toUpperCase()
    : 'UNISEX'

  const brand = (product.brandType || product.brandName || 'UNKNOWN').toUpperCase()
  const rawMainCategory = (product.mainCategory || '').toUpperCase()
  const rawSubCategory = (product.category || product.subCategory || '').toUpperCase()
  const categoryKey = rawMainCategory || rawSubCategory || 'UNCATEGORIZED'

  let categoryGroup = 'ETC'
  if (CATEGORY_GROUPS[categoryKey]) {
    categoryGroup = categoryKey
  } else {
    const match = Object.entries(CATEGORY_GROUPS).find(([, items]) => items.includes(categoryKey))
    if (match) {
      categoryGroup = match[0]
    }
  }

  const rawId = product.id ?? product.productCode ?? `${brand}-${product.name ?? 'unknown'}`
  const normalizedId = typeof rawId === 'string' ? rawId : String(rawId)

  const normalized = {
    id: normalizedId,
    brand,
    brandCode: brand, // 찜 기능을 위해 추가
    brandName: product.brandName || brand, // 찜 기능을 위해 추가
    gender,
    category: categoryKey,
    categoryGroup,
    mainCategory: categoryKey, // 찜 기능을 위해 추가
    name: product.name || '이름 미정',
    originalPrice,
    salePrice,
    price: salePrice, // 찜 기능을 위해 추가 (salePrice와 동일)
    discountRate,
    imageUrl,
    productUrl: product.productUrl || '#',
    vibe: Array.isArray(product.tags) && product.tags.length > 0 ? product.tags[0] : null,
    vibeTags: product.tags || [], // 찜 기능을 위해 추가
  }

  return normalized
}

export default function Home() {
  // 상태 관리
  // ▶ products: 화면에 보여줄 전체 상품 목록
  // ▶ selectedBrand / selectedGender: 사용자가 선택한 필터
  // ▶ isInitialLoading / isFetchingMore: 처음 로딩과 추가 로딩을 구분해 UI를 부드럽게 합니다.
  // useState<타입>으로 상태가 어떤 배열/값인지 명확히 선언합니다.
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [selectedBrand, setSelectedBrand] = useState<Brand | 'all'>('all')
  const [selectedGender, setSelectedGender] = useState<Gender | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [selectedDiscount, setSelectedDiscount] = useState<number>(0)
  const [selectedPrice, setSelectedPrice] = useState<number>(Infinity)
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true)
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(0)
  const [searchInput, setSearchInput] = useState<string>('')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [logoStep, setLogoStep] = useState<number>(0)
  // navScrolled: 스크롤이 10px 이상이면 nav 하단 border-bottom을 표시합니다.
  const [navScrolled, setNavScrolled] = useState<boolean>(false)
  const [totalSaleCount, setTotalSaleCount] = useState<number>(0)
  const [animatedCount, setAnimatedCount] = useState<number>(0)
  // useRef는 값이 변경되어도 렌더링을 다시 하지 않는 "mutable 참조"입니다.
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const filterPanelRef = useRef<HTMLDivElement | null>(null)
  const sectionHeaderRef = useRef<HTMLDivElement | null>(null)
  const lastScrollY = useRef<number>(0)

  // 찜 기능 훅
  const { toggleFavorite, isFavorite, getFavoriteCount } = useFavorites()
  const dailyMood = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const index = Number(todayKey) % DAILY_MOODS.length
    return DAILY_MOODS[index]
  }, [])

  const dailyInsight = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const index = Number(todayKey) % DAILY_INSIGHTS.length
    return DAILY_INSIGHTS[index]
  }, [])

  // 로고 애니메이션: 1200ms마다 logoStep 0→1→2→3 순환
  // S(ales) / S·P(roduct) / S·P·A(rchive) 순서로 단어가 펼쳐집니다.
  useEffect(() => {
    const timer = setInterval(() => {
      setLogoStep(prev => (prev + 1) % 4)
    }, 1200)
    return () => clearInterval(timer)
  }, [])

  // 총 할인 상품 개수 가져오기 (헤더에 표시되는 숫자용)
  useEffect(() => {
    const loadSaleCount = async () => {
      const count = await fetchSaleProductCount()
      setTotalSaleCount(count)
    }
    loadSaleCount()
  }, [])

  // 카운트 애니메이션: totalSaleCount가 바뀌면 숫자를 서서히 증가시킵니다.
  useEffect(() => {
    if (totalSaleCount === 0) return undefined

    const duration = 2000 // 2초 동안 애니메이션
    const steps = 60
    const increment = totalSaleCount / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep += 1
      if (currentStep >= steps) {
        setAnimatedCount(totalSaleCount)
        clearInterval(timer)
      } else {
        setAnimatedCount(Math.floor(increment * currentStep))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [totalSaleCount])

  // API에서 받은 원본 데이터를 화면에서 쓰기 좋은 형태로 바꿉니다.
  const normalizeProducts = useCallback((apiProducts: any[] = []) => {
    return apiProducts.map((product) => normalizeProduct(product))
  }, [])

  const mergeUniqueProducts = useCallback((prevProducts: NormalizedProduct[], incomingProducts: NormalizedProduct[], replace: boolean) => {
    if (replace) {
      return incomingProducts
    }

    const seenIds = new Set(prevProducts.map(product => product.id))
    const merged = [...prevProducts]

    incomingProducts.forEach((product) => {
      if (product.id && !seenIds.has(product.id)) {
        seenIds.add(product.id)
        merged.push(product)
      }
    })

    return merged
  }, [])

  /**
   * 실질적으로 데이터를 가져오는 함수입니다.
   * - replace가 true면 기존 목록을 갈아끼우고(브랜드 변경 등),
   * - false면 무한 스크롤처럼 목록 뒤에 이어 붙입니다.
   */
  // useCallback의 인자에 타입을 직접 지정해, 함수가 받는 값의 구조를 명확히 합니다.
  const loadProducts = useCallback(async ({ pageToLoad, replace }: { pageToLoad: number; replace: boolean }) => {
    if (replace) {
      setIsInitialLoading(true)
      setError(null)
    } else {
      setIsFetchingMore(true)
    }

    try {
      // fetchSaleProducts는 이제 { products, totalPages, hasMore, ... } 형식을 반환합니다
      const response = await fetchSaleProducts({
        page: pageToLoad,
        size: PAGE_SIZE,
        brands: selectedBrand !== 'all' ? [selectedBrand] : undefined,
        genders: selectedGender !== 'all' ? [selectedGender] : undefined,
        categories: selectedCategory !== 'all' ? [selectedCategory] : undefined,
        keyword: searchKeyword || undefined,
      })

      // response.products 배열을 정규화합니다
      const apiProducts = response.products ?? []
      const normalized = normalizeProducts(apiProducts)

      // 기존 상품 목록에 병합하거나 교체합니다
      setProducts(prev => mergeUniqueProducts(prev, normalized, replace))
      setPage(pageToLoad)

      // 백엔드에서 제공하는 페이지네이션 정보(hasMore)를 사용합니다
      setHasMore(response.hasMore)
    } catch (err) {
      const message = (err as Error)?.message || ''
      const isNotFoundError = message.includes('(404)') || /not\s+found/i.test(message)

      if (replace && isNotFoundError) {
        setError('NO_RESULTS')
        setHasMore(false)
        setProducts([])
      } else {
        setError(replace
          ? '상품 정보를 가져오는데 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          : '추가 상품을 불러오는데 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        )
        setHasMore(false)
        if (replace) {
          setProducts([])
        }
      }
    } finally {
      if (replace) {
        setIsInitialLoading(false)
      } else {
        setIsFetchingMore(false)
      }
    }
  }, [mergeUniqueProducts, normalizeProducts, searchKeyword, selectedBrand, selectedCategory, selectedGender, selectedDiscount, selectedPrice])

  /**
   * 선택한 브랜드가 바뀌면
   * 1) 목록을 비우고
   * 2) 첫 페이지(0페이지)를 다시 불러옵니다.
   */
  useEffect(() => {
    setProducts([])
    setPage(0)
    setHasMore(true)
    loadProducts({ pageToLoad: 0, replace: true })
  }, [selectedBrand, selectedGender, selectedCategory, selectedDiscount, selectedPrice, searchKeyword, loadProducts])

  /**
   * 클라이언트 사이드 필터링 로직
   * 
   * API에서 1차적으로 필터링된 데이터를 받아오지만,
   * 할인율(minDiscount)이나 가격대(maxPrice) 같은 세부 조건은
   * 현재 로드된 상품 목록 내에서 즉각적으로 반응하도록 클라이언트에서도 한 번 더 검사합니다.
   * 이를 통해 사용자가 필터를 조작할 때 서버 요청 없이도 빠른 피드백을 줄 수 있습니다.
   */
  // useMemo: products/필터 상태가 바뀔 때만 필터링 계산을 다시 실행
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // 이미지 유효성 검사
      const hasValidImage = product.imageUrl && !product.imageUrl.includes('undefined') && !product.imageUrl.includes('null')

      // 브랜드 필터
      const matchesBrand =
        selectedBrand === 'all' ||
        product.brandName === selectedBrand ||
        product.brand === selectedBrand

      // 성별 필터
      const matchesGender =
        selectedGender === 'all' ||
        product.gender === selectedGender ||
        product.gender === 'UNISEX' // 공용은 모두 포함

      // 카테고리 필터
      const matchesCategory =
        selectedCategory === 'all' ||
        product.categoryGroup === selectedCategory

      // 할인율 필터 (선택된 할인율 이상인지)
      const matchesDiscount = product.discountRate >= selectedDiscount

      // 가격대 필터 (선택된 가격 이하인지)
      const matchesPrice = product.salePrice <= selectedPrice

      // 검색어 필터
      const normalizedQuery = searchKeyword.toLowerCase().trim()
      const matchesSearch = normalizedQuery === ''
        || product.name.toLowerCase().includes(normalizedQuery)
        || (product.brand && product.brand.toLowerCase().includes(normalizedQuery))

      return hasValidImage && matchesBrand && matchesGender && matchesCategory && matchesDiscount && matchesPrice && matchesSearch
    })

    return filtered
  }, [products, selectedBrand, selectedGender, selectedCategory, selectedDiscount, selectedPrice, searchKeyword])

  const filteredCountRef = useRef(0)
  useEffect(() => {
    filteredCountRef.current = filteredProducts.length
  }, [filteredProducts.length])

  /**
   * IntersectionObserver를 사용해 화면 하단에 숨겨둔 loadMoreRef 요소가 보이면
   * 다음 페이지를 불러옵니다. (무한 스크롤)
   */
  // 다음 페이지 로드 조건을 체크한 뒤 loadProducts를 호출합니다.
  const loadNextPage = useCallback(() => {
    if (
      isInitialLoading ||
      isFetchingMore ||
      !hasMore ||
      filteredCountRef.current === 0
    ) {
      return
    }

    loadProducts({ pageToLoad: page + 1, replace: false })
  }, [hasMore, isFetchingMore, isInitialLoading, loadProducts, page])

  useEffect(() => {
    // 관찰 대상이 없으면 아무 것도 하지 않음
    if (!loadMoreRef.current) {
      return undefined
    }

    // 뷰포트 근처에 도달하면 다음 페이지 요청
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          loadNextPage()
        }
      },
      { rootMargin: '400px 0px', threshold: 0.1 }, // 미리 여유를 두고 요청하기 위해 여백을 주었습니다.
    )

    const target = loadMoreRef.current
    observer.observe(target)

    return () => observer.unobserve(target)
  }, [loadNextPage])

  useEffect(() => {
    if (
      !isInitialLoading &&
      hasMore &&
      !isFetchingMore &&
      products.length < PAGE_SIZE * 2 &&
      filteredProducts.length > 0
    ) {
      loadProducts({ pageToLoad: page + 1, replace: false })
    }
  }, [filteredProducts.length, hasMore, isFetchingMore, isInitialLoading, loadProducts, page, products.length])

  // 브랜드, 성별, 검색어 변경 핸들러
  const handleBrandChange = (brand: Brand | 'all') => {
    setSelectedBrand(brand)
  }

  const handleGenderChange = (gender: Gender | 'all') => {
    setSelectedGender(gender)
  }

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category)
  }

  const handleDiscountChange = (discount: number) => {
    setSelectedDiscount(discount)
  }

  const handlePriceChange = (price: number) => {
    setSelectedPrice(price)
  }

  // 검색 폼 제출: 입력값을 공백 제거 후 검색어로 적용
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchInput.trim()
    setSearchKeyword(trimmed)
    setSearchInput(trimmed)
  }

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      setShowScrollTop(currentScrollY > 400)
      // 10px 이상 스크롤 시 nav에 border-bottom 표시
      setNavScrolled(currentScrollY > 10)
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    // 섹션 헤더 위치로 스크롤
    if (sectionHeaderRef.current) {
      sectionHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleFilters = () => {
    setShowFilters(prev => !prev)
  }

  // 통계 계산
  const isBrandFilterActive = selectedBrand !== 'all'
  const isNoResultsError = error === 'NO_RESULTS'
  const hasBlockingError = Boolean(error && !isNoResultsError)
  const shouldShowEmptyState = !isInitialLoading && filteredProducts.length === 0 && !hasBlockingError
  const emptyIcon = isBrandFilterActive ? '😔' : '🔍'
  const emptyTitle = isBrandFilterActive ? '현재 할인 중인 옷이 없는 거 같아요' : '상품이 없습니다'
  const emptyDescription = isBrandFilterActive
    ? '다른 브랜드를 선택해 보세요.'
    : '선택하신 조건에 맞는 상품이 아직 없습니다. 다른 필터를 선택해 보세요.'

  return (
    <div className={styles.container}>
      <div className={styles.leftAd}>
        {/* 광고 영역 */}
      </div>
      <div className={styles.mainContent}>
        <Head>
          <title>ARCA - H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 세일 정보 | 매일 업데이트</title>
          <meta name="description" content="H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 인기 SPA 브랜드의 할인 상품을 한눈에 비교하세요. 매일 업데이트되는 세일 정보로 합리적인 쇼핑을 즐기세요." />
          <meta name="google-site-verification" content="Jq8ncQ8slNfWXuqPL_ZZv8f10qrXEApKFkjkwDsy56k" />
          <link rel="canonical" href="https://mion-spa-info.vercel.app" />

          {/* Open Graph 메타 태그 */}
          <meta property="og:title" content="ARCA - SPA 브랜드 세일 정보 | 매일 업데이트" />
          <meta property="og:description" content="H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등 인기 SPA 브랜드의 할인 상품을 한눈에 비교하세요." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://mion-spa-info.vercel.app" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="ARCA - SPA 브랜드 세일 정보" />
          <meta name="twitter:description" content="H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 할인 상품을 한눈에 비교하세요." />

          {/* 구조화된 데이터 (JSON-LD) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'ARCA',
                description: 'SPA 브랜드 세일 정보 큐레이션 서비스 — ARCA',
                url: 'https://mion-spa-info.vercel.app',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://mion-spa-info.vercel.app/?search={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: '할인 중인 SPA 브랜드 상품',
                description: 'H&M, ZARA, UNIQLO, MUJI, 찰스앤키스 등의 세일 상품 모음',
                numberOfItems: totalSaleCount || 0,
                itemListElement: filteredProducts.slice(0, 10).map((product, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'Product',
                    name: product.name,
                    brand: {
                      '@type': 'Brand',
                      name: product.brand,
                    },
                    offers: {
                      '@type': 'Offer',
                      price: product.salePrice,
                      priceCurrency: 'KRW',
                      availability: 'https://schema.org/InStock',
                      url: product.productUrl,
                    },
                  },
                })),
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'ARCA',
                url: 'https://mion-spa-info.vercel.app',
                logo: 'https://mion-spa-info.vercel.app/favicon.ico',
                description: 'ARCA — SPA 브랜드 할인 상품 정보를 제공하는 큐레이션 서비스',
                sameAs: [],
              }),
            }}
          />
        </Head>

        {/* 네비게이션 — Apple HIG sticky glassmorphism nav
            navScrolled 상태에 따라 stickyNavScrolled 클래스를 추가해 하단 border-bottom을 표시합니다.
            3-column grid: [로고] [검색창] [액션] */}
        <header className={`${styles.stickyNav} ${navScrolled ? styles.stickyNavScrolled : ''}`}>
          <div className={styles.navInner}>

            {/* 로고 — ARCA 프리미엄 모노그램 애니메이션
                logoStep 0: "A"만 노출 / logoStep 1~3: "ARCA" 풀네임 노출
                하나의 이니셜에서 브랜드 전체 이름이 펼쳐지는 고급스러운 리빌 효과입니다. */}
            <Link href="/" className={styles.logo}>
              <span className={styles.logoSegment}>
                <span className={styles.logoChar}>A</span>
                <span className={`${styles.logoWord} ${logoStep >= 1 ? styles.logoWordVisible : ''}`}>
                  RCA
                </span>
              </span>
            </Link>

            {/* 검색창 — nav 중앙 배치 (모바일에서는 CSS로 숨김 처리) */}
            <form className={styles.navSearchForm} onSubmit={handleSearchSubmit}>
              <span className={styles.navSearchIcon} aria-hidden="true">🔍</span>
              <input
                type="text"
                name="keyword"
                value={searchInput}
                onChange={handleSearchInputChange}
                className={styles.navSearchInput}
                placeholder="브랜드, 무드, 상품 검색"
                aria-label="상품 검색"
              />
              {/* 검색어가 있을 때만 지우기 버튼 표시 */}
              {searchInput && (
                <button
                  type="button"
                  className={styles.navSearchClear}
                  onClick={() => { setSearchInput(''); setSearchKeyword(''); }}
                  aria-label="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </form>

            {/* 오른쪽 액션 영역 — 찜 목록 링크 + 테마 토글 */}
            <div className={styles.navActions}>
              <Link href="/favorites" className={styles.navIconBtn} aria-label="찜 목록">
                <span aria-hidden="true">♥</span>
                {getFavoriteCount() > 0 && (
                  <span className={styles.navBadge}>{getFavoriteCount()}</span>
                )}
              </Link>
              <ThemeToggle />
            </div>

          </div>
        </header>

        {/* 히어로 섹션 */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <span className={styles.heroKicker}>Sale archive</span>
              <h1 className={styles.heroTitle}>
                흩어진 할인 정보를 한눈에
              </h1>
              <p className={styles.heroSubtitle}>
                돈을 아끼며 무드를 챙기세요.
                <br />
                매일 갱신되는 세일 정보를 한 눈에 확인하세요.
              </p>

              <div className={styles.heroInsights}>
                <div className={styles.heroInsightCard}>
                  <p className={styles.heroInsightLabel}>오늘의 시선</p>
                  <strong>{dailyInsight.theme}</strong>
                  <small>{dailyInsight.tip}</small>
                </div>
                <div className={styles.heroInsightCard}>
                  <p className={styles.heroInsightLabel}>할인 중인 상품</p>
                  <strong className={styles.countNumber}>
                    {(Number.isFinite(animatedCount) ? animatedCount : 0).toLocaleString()}개
                  </strong>
                  <small>매일 갱신되는 세일 정보</small>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div
                className={styles.heroMoodBoard}
                style={{
                  background: dailyMood.background,
                  color: dailyMood.textColor,
                }}
              >
                <p className={styles.heroMoodTitle}>Wardrobe log</p>
                <div className={styles.heroMoodRow}>
                  <span>컬러 힌트</span>
                  <strong>{dailyMood.palette}</strong>
                </div>
                <div className={styles.heroMoodRow}>
                  <span>소재 선택</span>
                  <strong dangerouslySetInnerHTML={{ __html: dailyMood.fabric }} />
                </div>
                <div className={styles.heroMoodRow}>
                  <span>포커스 아이템</span>
                  <strong>{dailyMood.focus}</strong>
                </div>
                <p className={styles.heroMoodNote}>
                  {dailyMood.note}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 메인 컨텐츠 */}
        <main className={styles.main} id="products">
          {/* 섹션 헤더 */}
          <div className={styles.sectionHeader} ref={sectionHeaderRef}>
            <h2 className={styles.sectionTitle}>오늘 챙겨야 할 옷장 업데이트</h2>
            <p className={styles.sectionSubtitle}>
              브랜드·성별·카테고리를 조합해서 지금 역할을 해줄 아이템만 남겨 보세요.
            </p>
          </div>

          {/* 필터 토글 버튼
              searchBarWrap은 nav 검색창으로 이동했으므로 제거되었습니다.
              모바일에서는 이 토글 버튼을 통해 필터 패널을 열고 닫습니다. */}
          <button
            className={styles.filterToggleButton}
            onClick={toggleFilters}
            aria-label={showFilters ? '필터 숨기기' : '필터 보기'}
            aria-expanded={showFilters}
          >
            <span className={styles.filterToggleIcon}>
              {showFilters ? '✕' : '⚙'}
            </span>
            <span className={styles.filterToggleText}>
              {showFilters ? '필터 닫기' : '필터'}
            </span>
          </button>

          {/* 모바일 오버레이 */}
          {showFilters && (
            <div
              className={styles.filterOverlay}
              onClick={toggleFilters}
              aria-hidden="true"
            />
          )}

          {/* 
            필터 패널 
            [수정됨] 이전에는 여기에 불필요한 중첩 div(filterPanel 클래스)가 하나 더 있어 
            모바일 스크롤이 갇히는 문제가 있었습니다. 해당 중첩을 제거하여 해결했습니다.
          */}
          <div
            className={`${styles.filterPanel} ${showFilters ? styles.filterPanelVisible : ''}`}
            ref={filterPanelRef}
          >
            <BrandFilter
              selectedBrand={selectedBrand}
              onBrandChange={handleBrandChange}
            />
            <DetailedFilters
              selectedDiscount={selectedDiscount}
              onDiscountChange={handleDiscountChange}
              selectedPrice={selectedPrice}
              onPriceChange={handlePriceChange}
            />
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <div className={styles.filterLabel}>성별</div>
                <GenderFilter
                  selectedGender={selectedGender}
                  onGenderChange={handleGenderChange}
                />
              </div>
              <div className={styles.filterGroup}>
                <div className={styles.filterLabel}>카테고리</div>
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
            </div>
          </div>

          {/* 초기 로딩 — shimmer 스켈레톤 카드 8개
              스피너 대신 shimmer 애니메이션으로 콘텐츠 영역을 미리 채웁니다.
              Array.from으로 길이 8짜리 배열을 만들어 map으로 렌더링합니다. */}
          {isInitialLoading && (
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine} style={{ width: '35%' }} />
                    <div className={styles.skeletonLine} style={{ width: '75%' }} />
                    <div className={styles.skeletonLine} style={{ width: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 에러 상태 */}
          {!isInitialLoading && hasBlockingError && products.length === 0 && (
            <div className={styles.errorState} role="status">
              <h3 className={styles.errorTitle}>데이터를 가져오는 데 실패했어요</h3>
              <p className={styles.errorDescription}>
                {error}
              </p>
            </div>
          )}

          {/* 상품 그리드 */}
          {!isInitialLoading && !hasBlockingError && (
            <>
              <div className={styles.productsGrid}>
                {shouldShowEmptyState
                  ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>{emptyIcon}</div>
                      <h3 className={styles.emptyTitle}>{emptyTitle}</h3>
                      <p className={styles.emptyDescription}>{emptyDescription}</p>
                    </div>
                  )
                  : (
                    filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        {...product}
                        isFavorite={isFavorite(product.id)}
                        onFavoriteToggle={toggleFavorite}
                        cardIndex={index}
                      />
                    ))
                  )}
              </div>

              {/* 추가 로딩 — shimmer 스켈레톤 카드 4개 (무한 스크롤 시 하단에 표시) */}
              {isFetchingMore && (
                <div className={styles.skeletonGrid}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className={styles.skeletonCard}>
                      <div className={styles.skeletonImage} />
                      <div className={styles.skeletonBody}>
                        <div className={styles.skeletonLine} style={{ width: '40%' }} />
                        <div className={styles.skeletonLine} style={{ width: '65%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isInitialLoading && hasBlockingError && products.length > 0 && (
                <div className={styles.errorState} role="status">
                  <h3 className={styles.errorTitle}>추가 데이터를 가져오지 못했습니다</h3>
                  <p className={styles.errorDescription}>
                    {error}
                  </p>
                </div>
              )}

              {/* 이 div는 화면에 보이지 않지만, 관찰 대상이 되어 다음 페이지를 로드합니다. */}
              <div
                ref={loadMoreRef}
                style={{ width: '100%', height: '200px' }}
                aria-hidden="true"
              />
            </>
          )}
        </main>


      </div >
      <div className={styles.rightAd}>
        {/* 광고 영역 */}
      </div>
      {
        showScrollTop && (
          <button
            type="button"
            className={styles.scrollTopButton}
            onClick={scrollToTop}
            aria-label="맨 위로 이동"
          >
            ↑
          </button>
        )
      }
    </div >
  )
}
