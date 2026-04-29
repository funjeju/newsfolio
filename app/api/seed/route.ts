import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

const sectorsData = [
  {
    "id": "semiconductor",
    "name": "반도체",
    "description": "메모리, 시스템반도체, 파운드리, 장비 산업",
    "keywords": ["반도체", "메모리", "DRAM", "NAND", "파운드리", "삼성전자", "SK하이닉스", "TSMC", "ASML"],
    "icon": "💻",
    "order": 1,
    "representativeCompanies": ["삼성전자", "SK하이닉스"],
    "influencingFactors": ["미국·중국 무역 분쟁", "AI·자동차 수요", "메모리 가격 사이클", "반도체 설비 투자"]
  },
  {
    "id": "automotive",
    "name": "자동차",
    "description": "완성차, 부품, 전기차, 자율주행",
    "keywords": ["자동차", "현대차", "기아", "전기차", "EV", "배터리", "자율주행", "테슬라"],
    "icon": "🚗",
    "order": 2,
    "representativeCompanies": ["현대자동차", "기아", "현대모비스"],
    "influencingFactors": ["전기차 보조금 정책", "원자재 가격", "글로벌 판매 추세", "환율"]
  },
  {
    "id": "game",
    "name": "게임",
    "description": "게임 개발사, 출시, 매출, e스포츠",
    "keywords": ["게임", "엔씨소프트", "넥슨", "크래프톤", "카카오게임즈", "스팀", "출시"],
    "icon": "🎮",
    "order": 3,
    "representativeCompanies": ["엔씨소프트", "넥슨", "크래프톤"],
    "influencingFactors": ["신작 출시 흥행", "주요 IP 매출", "e스포츠 인기", "글로벌 진출"]
  },
  {
    "id": "content",
    "name": "콘텐츠·연예",
    "description": "음반, 영상, OTT, K-콘텐츠",
    "keywords": ["K팝", "BTS", "넷플릭스", "OTT", "드라마", "영화", "엔터테인먼트", "하이브"],
    "icon": "🎬",
    "order": 4,
    "representativeCompanies": ["하이브", "JYP", "SM", "CJ ENM"],
    "influencingFactors": ["글로벌 K-콘텐츠 수요", "신곡·신작 흥행", "OTT 플랫폼 경쟁", "팬덤 활동"]
  },
  {
    "id": "travel",
    "name": "여행·관광",
    "description": "항공, 호텔, 여행사, 면세",
    "keywords": ["여행", "항공", "호텔", "관광", "면세", "대한항공", "아시아나", "하나투어"],
    "icon": "✈️",
    "order": 5,
    "representativeCompanies": ["대한항공", "아시아나항공", "하나투어"],
    "influencingFactors": ["여행 수요 회복", "유가", "환율", "외국인 관광객 수"]
  },
  {
    "id": "green_energy",
    "name": "친환경에너지",
    "description": "태양광, 풍력, 수소, 배터리",
    "keywords": ["태양광", "풍력", "수소", "배터리", "이차전지", "ESG", "신재생", "LG에너지솔루션"],
    "icon": "🌱",
    "order": 6,
    "representativeCompanies": ["LG에너지솔루션", "삼성SDI", "SK이노베이션"],
    "influencingFactors": ["탄소중립 정책", "원자재 가격", "주요국 보조금", "전기차 수요"]
  },
  {
    "id": "food",
    "name": "식품",
    "description": "가공식품, 외식, 농수산",
    "keywords": ["식품", "외식", "농산물", "수산물", "CJ", "오뚜기", "농심"],
    "icon": "🍔",
    "order": 7,
    "representativeCompanies": ["CJ제일제당", "농심", "오뚜기"],
    "influencingFactors": ["원재료 가격", "환율", "소비자 트렌드", "K-푸드 글로벌 수요"]
  },
  {
    "id": "construction",
    "name": "건설",
    "description": "건설사, 부동산, 인프라",
    "keywords": ["건설", "아파트", "부동산", "현대건설", "삼성물산", "GS건설", "분양"],
    "icon": "🏗️",
    "order": 8,
    "representativeCompanies": ["현대건설", "삼성물산", "GS건설"],
    "influencingFactors": ["금리", "부동산 정책", "원자재 가격", "해외 수주"]
  },
  {
    "id": "geopolitics",
    "name": "국제정세",
    "description": "외교, 안보, 무역분쟁, 남북관계",
    "keywords": ["외교", "안보", "무역", "관세", "미중", "남북", "정상회담"],
    "icon": "🌐",
    "order": 9,
    "representativeCompanies": [],
    "influencingFactors": ["미·중 무역 분쟁", "남북관계", "환율", "글로벌 공급망"]
  },
  {
    "id": "global_trade",
    "name": "글로벌무역",
    "description": "수출입, 환율, 해운, 물류",
    "keywords": ["수출", "수입", "환율", "해운", "물류", "HMM", "관세"],
    "icon": "🚢",
    "order": 10,
    "representativeCompanies": ["HMM", "팬오션", "CJ대한통운"],
    "influencingFactors": ["환율", "유가", "글로벌 경기", "물류 운임"]
  }
];

export async function GET() {
  try {
    const batch = db.batch();
    
    for (const sector of sectorsData) {
      const docRef = db.collection('sectors').doc(sector.id);
      batch.set(docRef, sector);
    }
    
    await batch.commit();
    return NextResponse.json({ success: true, message: 'Sectors seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
