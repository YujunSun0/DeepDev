import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const concepts = [
  // Level 1 - 기초 개념 (domain: javascript)
  {
    name: '변수 (Variables)',
    domain: 'javascript',
    description:
      'var, let, const의 차이와 변수 선언, 초기화, 할당의 개념을 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.0,
  },
  {
    name: '타입 (Types)',
    domain: 'javascript',
    description:
      'Primitive 타입과 Reference 타입, typeof 연산자, 타입 변환을 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.0,
  },
  {
    name: '스코프 (Scope)',
    domain: 'javascript',
    description:
      'Global, Function, Block 스코프의 차이와 스코프 체인을 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.2,
  },
  {
    name: '함수 (Functions)',
    domain: 'javascript',
    description:
      '함수 선언식, 표현식, 화살표 함수, 매개변수, 반환값을 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.2,
  },
  {
    name: '배열/객체 (Array & Object)',
    domain: 'javascript',
    description:
      '배열과 객체의 생성, 접근, 순회, 주요 메서드를 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.0,
  },

  // Level 2 - 중급
  {
    name: '실행 컨텍스트 (Execution Context)',
    domain: 'javascript',
    description:
      '실행 컨텍스트의 생성 단계, Variable Environment, Lexical Environment를 이해합니다.',
    level: 2,
    prerequisiteIds: ['스코프 (Scope)', '함수 (Functions)'],
    masteryWeight: 1.5,
  },
  {
    name: '호이스팅 (Hoisting)',
    domain: 'javascript',
    description:
      '변수와 함수의 호이스팅 동작, TDZ(Temporal Dead Zone)를 이해합니다.',
    level: 2,
    prerequisiteIds: ['변수 (Variables)', '실행 컨텍스트 (Execution Context)'],
    masteryWeight: 1.3,
  },
  {
    name: '클로저 (Closure)',
    domain: 'javascript',
    description:
      '클로저의 정의, 렉시컬 스코프, 실용적 활용 패턴을 이해합니다.',
    level: 2,
    prerequisiteIds: ['스코프 (Scope)', '실행 컨텍스트 (Execution Context)'],
    masteryWeight: 1.5,
  },
  {
    name: 'this 바인딩',
    domain: 'javascript',
    description:
      'this의 4가지 바인딩 규칙과 화살표 함수에서의 this를 이해합니다.',
    level: 2,
    prerequisiteIds: ['함수 (Functions)', '실행 컨텍스트 (Execution Context)'],
    masteryWeight: 1.4,
  },
  {
    name: '프로토타입 (Prototype)',
    domain: 'javascript',
    description:
      '프로토타입 체인, __proto__와 prototype의 관계, 상속 메커니즘을 이해합니다.',
    level: 2,
    prerequisiteIds: ['배열/객체 (Array & Object)', '함수 (Functions)'],
    masteryWeight: 1.4,
  },

  // Level 3 - 비동기 심화
  {
    name: 'Event Loop',
    domain: 'javascript',
    description:
      'JavaScript 런타임의 이벤트 루프 동작 원리를 이해합니다.',
    level: 3,
    prerequisiteIds: ['실행 컨텍스트 (Execution Context)'],
    masteryWeight: 1.8,
  },
  {
    name: 'Call Stack',
    domain: 'javascript',
    description:
      '콜 스택의 동작, 스택 프레임, 스택 오버플로를 이해합니다.',
    level: 3,
    prerequisiteIds: ['실행 컨텍스트 (Execution Context)', '함수 (Functions)'],
    masteryWeight: 1.5,
  },
  {
    name: 'Task vs Microtask',
    domain: 'javascript',
    description:
      'Task Queue와 Microtask Queue의 차이, 실행 우선순위를 이해합니다.',
    level: 3,
    prerequisiteIds: ['Event Loop', 'Call Stack'],
    masteryWeight: 1.6,
  },
  {
    name: 'Promise 내부 동작',
    domain: 'javascript',
    description:
      'Promise의 상태 전이, then/catch 체이닝, 에러 전파를 이해합니다.',
    level: 3,
    prerequisiteIds: ['Event Loop', 'Task vs Microtask'],
    masteryWeight: 1.7,
  },
  {
    name: 'async/await 동작 원리',
    domain: 'javascript',
    description:
      'async/await의 내부 동작, Promise와의 관계, 에러 핸들링을 이해합니다.',
    level: 3,
    prerequisiteIds: ['Promise 내부 동작'],
    masteryWeight: 1.6,
  },

  // ========== 자료구조 & 알고리즘 (domain: dsa) ==========

  // Level 1 - 기초
  {
    name: '배열 (Array)',
    domain: 'dsa',
    description:
      '배열의 메모리 구조, 인덱스 접근, 삽입/삭제 시 시간복잡도를 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.0,
  },
  {
    name: '스택 (Stack)',
    domain: 'dsa',
    description:
      'LIFO 구조, push/pop 동작, 스택의 활용(괄호 매칭, DFS 등)을 이해합니다.',
    level: 1,
    prerequisiteIds: ['배열 (Array)'],
    masteryWeight: 1.1,
  },
  {
    name: '큐 (Queue)',
    domain: 'dsa',
    description:
      'FIFO 구조, enqueue/dequeue 동작, 큐의 활용(BFS, 대기열 등)을 이해합니다.',
    level: 1,
    prerequisiteIds: ['배열 (Array)'],
    masteryWeight: 1.1,
  },
  {
    name: '연결 리스트 (Linked List)',
    domain: 'dsa',
    description:
      '노드 구조, 단일/양방향 연결 리스트, 삽입/삭제 시 배열과의 차이를 이해합니다.',
    level: 1,
    prerequisiteIds: ['배열 (Array)'],
    masteryWeight: 1.2,
  },

  // Level 2 - 중급
  {
    name: 'Big O 표기법',
    domain: 'dsa',
    description:
      'O(1), O(n), O(n²) 등 시간복잡도 표기법과 최선/평균/최악의 경우를 이해합니다.',
    level: 2,
    prerequisiteIds: ['배열 (Array)'],
    masteryWeight: 1.3,
  },
  {
    name: '해시 테이블 기초',
    domain: 'dsa',
    description:
      '키-값 저장, 해시 함수, 평균 O(1) 조회의 원리를 이해합니다.',
    level: 2,
    prerequisiteIds: ['배열 (Array)', 'Big O 표기법'],
    masteryWeight: 1.4,
  },
  {
    name: '해시 충돌 해결',
    domain: 'dsa',
    description:
      '체이닝, 개방 주소법 등 충돌 해결 기법을 이해합니다.',
    level: 2,
    prerequisiteIds: ['해시 테이블 기초'],
    masteryWeight: 1.4,
  },
  {
    name: '트리 기초',
    domain: 'dsa',
    description:
      '노드, 부모/자식, 루트, 리프, 이진 트리의 기본 구조를 이해합니다.',
    level: 2,
    prerequisiteIds: ['연결 리스트 (Linked List)'],
    masteryWeight: 1.3,
  },
  {
    name: '그래프 기초',
    domain: 'dsa',
    description:
      '정점(Vertex), 간선(Edge), 방향/무방향 그래프, 인접 리스트/행렬을 이해합니다.',
    level: 2,
    prerequisiteIds: ['배열 (Array)', '연결 리스트 (Linked List)'],
    masteryWeight: 1.4,
  },

  // Level 3 - 심화
  {
    name: '정렬 알고리즘',
    domain: 'dsa',
    description:
      '버블, 선택, 삽입, 병합, 퀵 정렬의 동작과 시간복잡도를 비교 이해합니다.',
    level: 3,
    prerequisiteIds: ['Big O 표기법', '배열 (Array)'],
    masteryWeight: 1.6,
  },
  {
    name: '이진 탐색',
    domain: 'dsa',
    description:
      '정렬된 배열에서 O(log n) 탐색, 이진 탐색 트리와의 관계를 이해합니다.',
    level: 3,
    prerequisiteIds: ['배열 (Array)', 'Big O 표기법', '트리 기초'],
    masteryWeight: 1.5,
  },
  {
    name: '시간·공간 복잡도 분석',
    domain: 'dsa',
    description:
      '알고리즘의 시간·공간 복잡도를 분석하고, 트레이드오프를 판단합니다.',
    level: 3,
    prerequisiteIds: ['Big O 표기법', '정렬 알고리즘', '이진 탐색'],
    masteryWeight: 1.6,
  },

  // ========== OS & 네트워크 (domain: os-network) ==========

  // Level 1 - 기초
  {
    name: '프로세스 vs 스레드',
    domain: 'os-network',
    description:
      '프로세스와 스레드의 차이, 멀티프로세싱 vs 멀티스레딩, 컨텍스트 스위칭을 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.2,
  },
  {
    name: '메모리 관리 기초',
    domain: 'os-network',
    description:
      '스택/힙 메모리, 메모리 할당/해제, 메모리 단편화의 기본 개념을 이해합니다.',
    level: 1,
    prerequisiteIds: ['프로세스 vs 스레드'],
    masteryWeight: 1.2,
  },
  {
    name: 'TCP/IP 기초',
    domain: 'os-network',
    description:
      'OSI 7계층, TCP vs UDP, IP 주소, 포트의 기본 개념을 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.2,
  },

  // Level 2 - 중급
  {
    name: 'CPU 스케줄링',
    domain: 'os-network',
    description:
      'FCFS, SJF, 라운드 로빈, 우선순위 스케줄링의 동작과 특성을 이해합니다.',
    level: 2,
    prerequisiteIds: ['프로세스 vs 스레드'],
    masteryWeight: 1.4,
  },
  {
    name: '동기화 (뮤텍스, 세마포어)',
    domain: 'os-network',
    description:
      '경쟁 조건, 뮤텍스, 세마포어, 데드락 방지를 위한 동기화 기법을 이해합니다.',
    level: 2,
    prerequisiteIds: ['프로세스 vs 스레드'],
    masteryWeight: 1.5,
  },
  {
    name: 'HTTP/HTTPS',
    domain: 'os-network',
    description:
      'HTTP 요청/응답 구조, 상태 코드, HTTPS와 TLS/SSL 암호화를 이해합니다.',
    level: 2,
    prerequisiteIds: ['TCP/IP 기초'],
    masteryWeight: 1.4,
  },
  {
    name: 'REST API',
    domain: 'os-network',
    description:
      'REST 원칙, 리소스와 URI, HTTP 메서드(GET, POST, PUT, DELETE)의 의미를 이해합니다.',
    level: 2,
    prerequisiteIds: ['HTTP/HTTPS'],
    masteryWeight: 1.3,
  },

  // Level 3 - 심화
  {
    name: '데드락',
    domain: 'os-network',
    description:
      '데드락 발생 조건(상호 배제, 점유 대기, 비선점, 순환 대기), 예방과 회피를 이해합니다.',
    level: 3,
    prerequisiteIds: ['동기화 (뮤텍스, 세마포어)'],
    masteryWeight: 1.5,
  },
  {
    name: '가상 메모리',
    domain: 'os-network',
    description:
      '페이징, 페이지 폴트, 스왑, TLB의 개념과 동작을 이해합니다.',
    level: 3,
    prerequisiteIds: ['메모리 관리 기초'],
    masteryWeight: 1.5,
  },
  {
    name: 'DNS',
    domain: 'os-network',
    description:
      '도메인 이름 해석 과정, DNS 레코드(A, CNAME, MX), DNS 캐싱을 이해합니다.',
    level: 3,
    prerequisiteIds: ['TCP/IP 기초', 'HTTP/HTTPS'],
    masteryWeight: 1.4,
  },
  {
    name: '웹소켓',
    domain: 'os-network',
    description:
      '웹소켓 프로토콜, HTTP와의 차이, 양방향 통신과 실시간 데이터 전송을 이해합니다.',
    level: 3,
    prerequisiteIds: ['HTTP/HTTPS'],
    masteryWeight: 1.4,
  },

  // ========== React (domain: react) ==========
  // 선수: JavaScript (함수, 배열/객체)

  // Level 1 - Describing the UI
  {
    name: 'React 컴포넌트',
    domain: 'react',
    description:
      '컴포넌트의 정의, 함수형 컴포넌트, JSX 반환, 컴포넌트 중첩을 이해합니다.',
    level: 1,
    prerequisiteIds: ['함수 (Functions)', '배열/객체 (Array & Object)'],
    masteryWeight: 1.2,
  },
  {
    name: 'JSX',
    domain: 'react',
    description:
      'JSX 문법, HTML과의 차이, className, 자식 요소, 표현식 중괄호를 이해합니다.',
    level: 1,
    prerequisiteIds: ['React 컴포넌트'],
    masteryWeight: 1.1,
  },
  {
    name: 'Props',
    domain: 'react',
    description:
      'Props 전달, 읽기, 기본값, children을 이해합니다.',
    level: 1,
    prerequisiteIds: ['React 컴포넌트'],
    masteryWeight: 1.1,
  },
  {
    name: '조건부 렌더링',
    domain: 'react',
    description:
      '삼항 연산자, && 연산자, 조건에 따른 JSX 분기 렌더링을 이해합니다.',
    level: 1,
    prerequisiteIds: ['JSX', 'Props'],
    masteryWeight: 1.1,
  },
  {
    name: '리스트 렌더링',
    domain: 'react',
    description:
      'map()으로 리스트 렌더링, key prop의 필요성과 올바른 사용을 이해합니다.',
    level: 1,
    prerequisiteIds: ['JSX', 'Props', '배열/객체 (Array & Object)'],
    masteryWeight: 1.2,
  },
  {
    name: '컴포넌트 순수성',
    domain: 'react',
    description:
      '순수 함수, 부수 효과, React의 렌더링 가정을 이해합니다.',
    level: 1,
    prerequisiteIds: ['React 컴포넌트', '함수 (Functions)'],
    masteryWeight: 1.2,
  },

  // Level 2 - Adding Interactivity & Managing State
  {
    name: '이벤트 처리',
    domain: 'react',
    description:
      'onClick, onChange 등 이벤트 핸들러, 인라인 vs 함수 참조를 이해합니다.',
    level: 2,
    prerequisiteIds: ['React 컴포넌트', 'Props'],
    masteryWeight: 1.2,
  },
  {
    name: 'State (useState)',
    domain: 'react',
    description:
      'useState 훅, 상태 업데이트, 배치 처리, State as Snapshot을 이해합니다.',
    level: 2,
    prerequisiteIds: ['이벤트 처리'],
    masteryWeight: 1.4,
  },
  {
    name: 'State 끌어올리기',
    domain: 'react',
    description:
      '공유 상태를 상위로 올리는 패턴, 단방향 데이터 흐름을 이해합니다.',
    level: 2,
    prerequisiteIds: ['State (useState)', 'Props'],
    masteryWeight: 1.3,
  },
  {
    name: 'useReducer',
    domain: 'react',
    description:
      '복잡한 상태 로직, reducer 패턴, dispatch를 이해합니다.',
    level: 2,
    prerequisiteIds: ['State (useState)'],
    masteryWeight: 1.4,
  },
  {
    name: 'Context',
    domain: 'react',
    description:
      'createContext, Provider, useContext, prop drilling 해결을 이해합니다.',
    level: 2,
    prerequisiteIds: ['Props', 'State 끌어올리기'],
    masteryWeight: 1.4,
  },
  {
    name: 'useEffect',
    domain: 'react',
    description:
      '부수 효과, 의존성 배열, 클린업 함수, 타이밍을 이해합니다.',
    level: 2,
    prerequisiteIds: ['State (useState)'],
    masteryWeight: 1.5,
  },

  // Level 3 - Escape Hatches
  {
    name: 'useRef',
    domain: 'react',
    description:
      'DOM 참조, 렌더링과 무관한 값 보관, ref와 state의 차이를 이해합니다.',
    level: 3,
    prerequisiteIds: ['State (useState)', '이벤트 처리'],
    masteryWeight: 1.3,
  },
  {
    name: 'Custom Hooks',
    domain: 'react',
    description:
      'use로 시작하는 커스텀 훅, 로직 재사용, 훅 규칙을 이해합니다.',
    level: 3,
    prerequisiteIds: ['State (useState)', 'useEffect'],
    masteryWeight: 1.5,
  },
  {
    name: 'useReducer + Context',
    domain: 'react',
    description:
      'Reducer와 Context 조합으로 전역 상태 관리, 스케일업 패턴을 이해합니다.',
    level: 3,
    prerequisiteIds: ['useReducer', 'Context'],
    masteryWeight: 1.5,
  },
];

async function main() {
  console.log('Seeding concepts...');

  const conceptMap = new Map<string, string>();

  for (const concept of concepts) {
    const domain = (concept as { domain?: string }).domain ?? 'javascript';
    const created = await prisma.concept.upsert({
      where: { name: concept.name },
      update: {
        description: concept.description,
        level: concept.level,
        domain,
        masteryWeight: concept.masteryWeight,
      },
      create: {
        name: concept.name,
        description: concept.description,
        level: concept.level,
        domain,
        prerequisiteIds: [],
        masteryWeight: concept.masteryWeight,
      },
    });
    conceptMap.set(concept.name, created.id);
  }

  for (const concept of concepts) {
    if (concept.prerequisiteIds.length > 0) {
      const prereqIds = concept.prerequisiteIds
        .map((name) => conceptMap.get(name))
        .filter((id): id is string => id !== undefined);

      await prisma.concept.update({
        where: { name: concept.name },
        data: { prerequisiteIds: prereqIds as string[] },
      });
    }
  }

  console.log(`Seeded ${concepts.length} concepts`);

  // Achievements (기획 문서 기준)
  console.log('Seeding achievements...');

  // 3-1. Personal Records (최고 기록)
  const records = [
    { code: 'STREAK_MAX', name: '최장 연속 학습', description: 'N일 연속 학습', icon: null, category: 'record', targetValue: 0, tier: null, sortOrder: 1 },
    { code: 'SESSION_TOTAL', name: '총 세션 수', description: '완료한 세션 수', icon: null, category: 'record', targetValue: 0, tier: null, sortOrder: 2 },
    { code: 'SCORE_MAX', name: '최고 점수', description: '단일 세션 최고 점수', icon: null, category: 'record', targetValue: 0, tier: null, sortOrder: 3 },
    { code: 'CONCEPT_MASTERED', name: '마스터한 개념', description: '숙련도 80+ 개념 수', icon: null, category: 'record', targetValue: 0, tier: null, sortOrder: 4 },
    { code: 'DOMAIN_EXPLORER', name: '도메인 탐험가', description: '학습한 도메인 수', icon: null, category: 'record', targetValue: 0, tier: null, sortOrder: 5 },
  ];

  // 3-2. Awards (단계별 배지)
  const awards = [
    { code: 'STREAK_3', name: '연속 학습왕', description: '3일 연속 학습', icon: '/achievements/acv_1-rmbg.png', category: 'award', targetValue: 3, tier: 1, sortOrder: 10 },
    { code: 'STREAK_7', name: '연속 학습왕', description: '7일 연속 학습', icon: '/achievements/acv_1-rmbg.png', category: 'award', targetValue: 7, tier: 2, sortOrder: 11 },
    { code: 'STREAK_14', name: '연속 학습왕', description: '14일 연속 학습', icon: '/achievements/acv_1-rmbg.png', category: 'award', targetValue: 14, tier: 3, sortOrder: 12 },
    { code: 'STREAK_30', name: '연속 학습왕', description: '30일 연속 학습', icon: '/achievements/acv_1-rmbg.png', category: 'award', targetValue: 30, tier: 4, sortOrder: 13 },
    { code: 'SESSION_5', name: '세션 마스터', description: '5개 세션 완료', icon: '/achievements/acv_3-rmbg.png', category: 'award', targetValue: 5, tier: 1, sortOrder: 14 },
    { code: 'SESSION_10', name: '세션 마스터', description: '10개 세션 완료', icon: '/achievements/acv_3-rmbg.png', category: 'award', targetValue: 10, tier: 2, sortOrder: 15 },
    { code: 'SESSION_25', name: '세션 마스터', description: '25개 세션 완료', icon: '/achievements/acv_3-rmbg.png', category: 'award', targetValue: 25, tier: 3, sortOrder: 16 },
    { code: 'SESSION_50', name: '세션 마스터', description: '50개 세션 완료', icon: '/achievements/acv_3-rmbg.png', category: 'award', targetValue: 50, tier: 4, sortOrder: 17 },
    { code: 'SESSION_100', name: '세션 마스터', description: '100개 세션 완료', icon: '/achievements/acv_3-rmbg.png', category: 'award', targetValue: 100, tier: 5, sortOrder: 18 },
    { code: 'PERFECT_1', name: '만점왕', description: '100점 1회', icon: '/achievements/acv_4-rmbg.png', category: 'award', targetValue: 1, tier: 1, sortOrder: 19 },
    { code: 'PERFECT_5', name: '만점왕', description: '100점 5회', icon: '/achievements/acv_4-rmbg.png', category: 'award', targetValue: 5, tier: 2, sortOrder: 20 },
    { code: 'PERFECT_10', name: '만점왕', description: '100점 10회', icon: '/achievements/acv_4-rmbg.png', category: 'award', targetValue: 10, tier: 3, sortOrder: 21 },
    { code: 'EARLY_BIRD_5', name: '새벽형 개발자', description: '새벽(5~7시) 학습 5회', icon: '/achievements/acv_5-rmbg.png', category: 'award', targetValue: 5, tier: 1, sortOrder: 22 },
    { code: 'EARLY_BIRD_20', name: '새벽형 개발자', description: '새벽(5~7시) 학습 20회', icon: '/achievements/acv_5-rmbg.png', category: 'award', targetValue: 20, tier: 2, sortOrder: 23 },
    { code: 'EXPLORER_3', name: '탐구왕', description: '탐구 대화 3턴', icon: '/achievements/acv_6-rmbg.png', category: 'award', targetValue: 3, tier: 1, sortOrder: 24 },
    { code: 'EXPLORER_10', name: '탐구왕', description: '탐구 대화 10턴', icon: '/achievements/acv_6-rmbg.png', category: 'award', targetValue: 10, tier: 2, sortOrder: 25 },
    { code: 'EXPLORER_30', name: '탐구왕', description: '탐구 대화 30턴', icon: '/achievements/acv_6-rmbg.png', category: 'award', targetValue: 30, tier: 3, sortOrder: 26 },
    { code: 'CONCEPT_COLLECTOR_5', name: '개념 수집가', description: '학습한 개념 5개', icon: '/achievements/acv_7-rmbg.png', category: 'award', targetValue: 5, tier: 1, sortOrder: 27 },
    { code: 'CONCEPT_COLLECTOR_15', name: '개념 수집가', description: '학습한 개념 15개', icon: '/achievements/acv_7-rmbg.png', category: 'award', targetValue: 15, tier: 2, sortOrder: 28 },
    { code: 'CONCEPT_COLLECTOR_30', name: '개념 수집가', description: '학습한 개념 30개', icon: '/achievements/acv_7-rmbg.png', category: 'award', targetValue: 30, tier: 3, sortOrder: 29 },
    { code: 'ALL_ROUNDER_4', name: '올라운더', description: '4개 도메인 모두 학습', icon: '/achievements/acv_8-rmbg.png', category: 'award', targetValue: 4, tier: 1, sortOrder: 30 },
    { code: 'SPEED_LEARNER_3', name: '빠른 학습자', description: '하루 3세션 완료', icon: '/achievements/acv_2-rmbg.png', category: 'award', targetValue: 3, tier: 1, sortOrder: 31 },
  ];

  const allAchievements = [...records, ...awards];
  const allCodes = new Set(allAchievements.map((a) => a.code));
  const toRemove = await prisma.achievement.findMany({
    where: { code: { notIn: Array.from(allCodes) } },
    select: { id: true },
  });
  if (toRemove.length > 0) {
    await prisma.achievement.deleteMany({
      where: { id: { in: toRemove.map((r) => r.id) } },
    });
  }
  for (const a of allAchievements) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: { name: a.name, description: a.description, icon: a.icon, category: a.category, targetValue: a.targetValue, tier: a.tier, sortOrder: a.sortOrder },
      create: a,
    });
  }
  console.log(`Seeded ${allAchievements.length} achievements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
