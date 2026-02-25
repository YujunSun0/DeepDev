import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const concepts = [
  // Level 1 - 기초 개념
  {
    name: '변수 (Variables)',
    description:
      'var, let, const의 차이와 변수 선언, 초기화, 할당의 개념을 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.0,
  },
  {
    name: '타입 (Types)',
    description:
      'Primitive 타입과 Reference 타입, typeof 연산자, 타입 변환을 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.0,
  },
  {
    name: '스코프 (Scope)',
    description:
      'Global, Function, Block 스코프의 차이와 스코프 체인을 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.2,
  },
  {
    name: '함수 (Functions)',
    description:
      '함수 선언식, 표현식, 화살표 함수, 매개변수, 반환값을 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.2,
  },
  {
    name: '배열/객체 (Array & Object)',
    description:
      '배열과 객체의 생성, 접근, 순회, 주요 메서드를 이해합니다.',
    level: 1,
    prerequisiteIds: [],
    masteryWeight: 1.0,
  },

  // Level 2 - 중급
  {
    name: '실행 컨텍스트 (Execution Context)',
    description:
      '실행 컨텍스트의 생성 단계, Variable Environment, Lexical Environment를 이해합니다.',
    level: 2,
    prerequisiteIds: ['스코프 (Scope)', '함수 (Functions)'],
    masteryWeight: 1.5,
  },
  {
    name: '호이스팅 (Hoisting)',
    description:
      '변수와 함수의 호이스팅 동작, TDZ(Temporal Dead Zone)를 이해합니다.',
    level: 2,
    prerequisiteIds: ['변수 (Variables)', '실행 컨텍스트 (Execution Context)'],
    masteryWeight: 1.3,
  },
  {
    name: '클로저 (Closure)',
    description:
      '클로저의 정의, 렉시컬 스코프, 실용적 활용 패턴을 이해합니다.',
    level: 2,
    prerequisiteIds: ['스코프 (Scope)', '실행 컨텍스트 (Execution Context)'],
    masteryWeight: 1.5,
  },
  {
    name: 'this 바인딩',
    description:
      'this의 4가지 바인딩 규칙과 화살표 함수에서의 this를 이해합니다.',
    level: 2,
    prerequisiteIds: ['함수 (Functions)', '실행 컨텍스트 (Execution Context)'],
    masteryWeight: 1.4,
  },
  {
    name: '프로토타입 (Prototype)',
    description:
      '프로토타입 체인, __proto__와 prototype의 관계, 상속 메커니즘을 이해합니다.',
    level: 2,
    prerequisiteIds: ['배열/객체 (Array & Object)', '함수 (Functions)'],
    masteryWeight: 1.4,
  },

  // Level 3 - 비동기 심화
  {
    name: 'Event Loop',
    description:
      'JavaScript 런타임의 이벤트 루프 동작 원리를 이해합니다.',
    level: 3,
    prerequisiteIds: ['실행 컨텍스트 (Execution Context)'],
    masteryWeight: 1.8,
  },
  {
    name: 'Call Stack',
    description:
      '콜 스택의 동작, 스택 프레임, 스택 오버플로를 이해합니다.',
    level: 3,
    prerequisiteIds: ['실행 컨텍스트 (Execution Context)', '함수 (Functions)'],
    masteryWeight: 1.5,
  },
  {
    name: 'Task vs Microtask',
    description:
      'Task Queue와 Microtask Queue의 차이, 실행 우선순위를 이해합니다.',
    level: 3,
    prerequisiteIds: ['Event Loop', 'Call Stack'],
    masteryWeight: 1.6,
  },
  {
    name: 'Promise 내부 동작',
    description:
      'Promise의 상태 전이, then/catch 체이닝, 에러 전파를 이해합니다.',
    level: 3,
    prerequisiteIds: ['Event Loop', 'Task vs Microtask'],
    masteryWeight: 1.7,
  },
  {
    name: 'async/await 동작 원리',
    description:
      'async/await의 내부 동작, Promise와의 관계, 에러 핸들링을 이해합니다.',
    level: 3,
    prerequisiteIds: ['Promise 내부 동작'],
    masteryWeight: 1.6,
  },
];

async function main() {
  console.log('Seeding concepts...');

  const conceptMap = new Map<string, string>();

  for (const concept of concepts) {
    const created = await prisma.concept.upsert({
      where: { name: concept.name },
      update: {
        description: concept.description,
        level: concept.level,
        masteryWeight: concept.masteryWeight,
      },
      create: {
        name: concept.name,
        description: concept.description,
        level: concept.level,
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
