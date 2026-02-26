import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmService } from '../../llm/llm.service';
import { MasteryService } from '../mastery/mastery.service';
import { ConceptsService } from '../concepts/concepts.service';
import { UsageService } from '../usage/usage.service';
import {
  CONCEPT_EXPLANATION_PROMPT,
  BASIC_QUESTION_PROMPT,
  SUBJECTIVE_QUESTION_PROMPT,
  APPLICATION_QUESTION_PROMPT,
  EVALUATE_SUBJECTIVE_PROMPT,
  EVALUATE_APPLICATION_PROMPT,
  SESSION_SUMMARY_PROMPT,
  DISCUSSION_SYSTEM_PROMPT,
} from '@deepdev/prompt-templates';

/* ── Session states ── */
const STATES = {
  INIT: 'INIT',
  EXPLAINING: 'EXPLAINING',
  OBJECTIVE: 'OBJECTIVE',
  SUBJECTIVE: 'SUBJECTIVE',
  APPLICATION: 'APPLICATION',
  SUMMARY: 'SUMMARY',
  CLOSED: 'CLOSED',
} as const;

/* ── LLM response types ── */
export interface ExplanationResult {
  explanation: string;
  keyPoints: string[];
  codeExample: string;
}

export interface ObjectiveResult {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SubjectiveResult {
  question: string;
  evaluationCriteria: string[];
}

export interface ApplicationResult {
  question: string;
  expectedAnswer: string;
  evaluationCriteria: string[];
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
}

export interface SummaryResult {
  overallAssessment: string;
  masteryLevel: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextSteps: string;
}

/* ── Context stored in session.context JSON ── */
export interface DiscussionMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SessionContext {
  explanation?: ExplanationResult;
  objective?: ObjectiveResult & { userAnswer?: string; score?: number; feedback?: string };
  subjective?: SubjectiveResult & { userAnswer?: string; score?: number; feedback?: string; strengths?: string[]; improvements?: string[] };
  application?: ApplicationResult & { userAnswer?: string; score?: number; feedback?: string; strengths?: string[]; improvements?: string[] };
  summary?: SummaryResult;
  discussions?: Record<string, DiscussionMessage[]>;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly mastery: MasteryService,
    private readonly concepts: ConceptsService,
    private readonly usage: UsageService,
  ) {}

  /* ── Basic CRUD ── */

  async create(userId: string, conceptId: string, level: number) {
    const { allowed, reason } = await this.usage.canCreateSession(userId);
    if (!allowed) throw new ForbiddenException(reason);

    const concept = await this.concepts.findById(conceptId);
    if (!concept) throw new NotFoundException('Concept not found');

    return this.prisma.session.create({
      data: {
        userId,
        conceptId,
        level,
        state: STATES.INIT,
        tokenUsed: 0,
        context: {},
      },
      include: { concept: true },
    });
  }

  async findById(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { concept: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async findByUser(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      include: { concept: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /* ── Step 1: Start → Explain concept ── */

  async startSession(sessionId: string, userId: string) {
    const session = await this.findById(sessionId);
    if (session.userId !== userId) throw new BadRequestException('Not your session');
    if (session.state !== STATES.INIT) throw new BadRequestException('Session already started');

    const prompt = CONCEPT_EXPLANATION_PROMPT(
      session.concept.name,
      session.level,
      session.concept.description,
    );

    const { content, tokensUsed } = await this.llm.chat(prompt);
    const explanation = this.llm.parseJson<ExplanationResult>(content);

    const ctx: SessionContext = { explanation };
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        state: STATES.EXPLAINING,
        context: ctx as any,
        tokenUsed: { increment: tokensUsed },
      },
    });

    return { state: STATES.EXPLAINING, explanation };
  }

  /* ── Step 2: Generate objective (MC) question ── */

  async getObjectiveQuestion(sessionId: string, userId: string) {
    const session = await this.findById(sessionId);
    if (session.userId !== userId) throw new BadRequestException('Not your session');
    if (session.state !== STATES.EXPLAINING) throw new BadRequestException('Not in correct state');

    const ctx = (session.context as SessionContext) ?? {};
    const prompt = BASIC_QUESTION_PROMPT(
      session.concept.name,
      session.level,
      ctx.explanation?.explanation ?? '',
    );

    const { content, tokensUsed } = await this.llm.chat(prompt);
    const question = this.llm.parseJson<ObjectiveResult>(content);

    ctx.objective = question;
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        state: STATES.OBJECTIVE,
        context: ctx as any,
        tokenUsed: { increment: tokensUsed },
      },
    });

    return {
      state: STATES.OBJECTIVE,
      question: question.question,
      options: question.options,
    };
  }

  /* ── Step 3: Submit objective answer ── */

  async submitObjectiveAnswer(sessionId: string, userId: string, answer: string) {
    const session = await this.findById(sessionId);
    if (session.userId !== userId) throw new BadRequestException('Not your session');
    if (session.state !== STATES.OBJECTIVE) throw new BadRequestException('Not in correct state');

    const ctx = (session.context as SessionContext) ?? {};
    const obj = ctx.objective!;
    const isCorrect = answer.toUpperCase() === obj.correctAnswer.toUpperCase();
    const score = isCorrect ? 100 : 0;

    ctx.objective = {
      ...obj,
      userAnswer: answer,
      score,
      feedback: isCorrect
        ? `정답입니다! ${obj.explanation}`
        : `오답입니다. 정답은 ${obj.correctAnswer}입니다. ${obj.explanation}`,
    };

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { context: ctx as any },
    });

    return {
      isCorrect,
      score,
      correctAnswer: obj.correctAnswer,
      feedback: ctx.objective.feedback,
    };
  }

  /* ── Step 4: Generate subjective question ── */

  async getSubjectiveQuestion(sessionId: string, userId: string) {
    const session = await this.findById(sessionId);
    if (session.userId !== userId) throw new BadRequestException('Not your session');
    if (session.state !== STATES.OBJECTIVE) throw new BadRequestException('Not in correct state');

    const prompt = SUBJECTIVE_QUESTION_PROMPT(
      session.concept.name,
      session.level,
    );

    const { content, tokensUsed } = await this.llm.chat(prompt);
    const question = this.llm.parseJson<SubjectiveResult>(content);

    const ctx = (session.context as SessionContext) ?? {};
    ctx.subjective = question;
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        state: STATES.SUBJECTIVE,
        context: ctx as any,
        tokenUsed: { increment: tokensUsed },
      },
    });

    return {
      state: STATES.SUBJECTIVE,
      question: question.question,
    };
  }

  /* ── Step 5: Submit subjective answer ── */

  async submitSubjectiveAnswer(sessionId: string, userId: string, answer: string) {
    const session = await this.findById(sessionId);
    if (session.userId !== userId) throw new BadRequestException('Not your session');
    if (session.state !== STATES.SUBJECTIVE) throw new BadRequestException('Not in correct state');

    const ctx = (session.context as SessionContext) ?? {};
    const sub = ctx.subjective!;

    const prompt = EVALUATE_SUBJECTIVE_PROMPT(
      sub.question,
      answer,
      sub.evaluationCriteria,
    );

    const { content, tokensUsed } = await this.llm.chat(prompt);
    const evaluation = this.llm.parseJson<EvaluationResult>(content);

    ctx.subjective = {
      ...sub,
      userAnswer: answer,
      score: Math.min(100, Math.max(0, evaluation.score)),
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    };

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        context: ctx as any,
        tokenUsed: { increment: tokensUsed },
      },
    });

    return {
      score: ctx.subjective.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths ?? [],
      improvements: evaluation.improvements ?? [],
    };
  }

  /* ── Step 6: Generate application question ── */

  async getApplicationQuestion(sessionId: string, userId: string) {
    const session = await this.findById(sessionId);
    if (session.userId !== userId) throw new BadRequestException('Not your session');
    if (session.state !== STATES.SUBJECTIVE) throw new BadRequestException('Not in correct state');

    const ctx = (session.context as SessionContext) ?? {};
    const prompt = APPLICATION_QUESTION_PROMPT(
      session.concept.name,
      session.level,
      {
        objective: ctx.objective?.score ?? 0,
        subjective: ctx.subjective?.score ?? 0,
      },
    );

    const { content, tokensUsed } = await this.llm.chat(prompt);
    const question = this.llm.parseJson<ApplicationResult>(content);

    ctx.application = question;
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        state: STATES.APPLICATION,
        context: ctx as any,
        tokenUsed: { increment: tokensUsed },
      },
    });

    return {
      state: STATES.APPLICATION,
      question: question.question,
    };
  }

  /* ── Step 7: Submit application answer ── */

  async submitApplicationAnswer(sessionId: string, userId: string, answer: string) {
    const session = await this.findById(sessionId);
    if (session.userId !== userId) throw new BadRequestException('Not your session');
    if (session.state !== STATES.APPLICATION) throw new BadRequestException('Not in correct state');

    const ctx = (session.context as SessionContext) ?? {};
    const app = ctx.application!;

    const prompt = EVALUATE_APPLICATION_PROMPT(
      app.question,
      answer,
      app.expectedAnswer,
      app.evaluationCriteria,
    );

    const { content, tokensUsed } = await this.llm.chat(prompt);
    const evaluation = this.llm.parseJson<EvaluationResult>(content);

    ctx.application = {
      ...app,
      userAnswer: answer,
      score: Math.min(100, Math.max(0, evaluation.score)),
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    };

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        context: ctx as any,
        tokenUsed: { increment: tokensUsed },
      },
    });

    return {
      score: ctx.application.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths ?? [],
      improvements: evaluation.improvements ?? [],
    };
  }

  /* ── Step 8: Generate summary & update mastery ── */

  async getSessionSummary(sessionId: string, userId: string) {
    const session = await this.findById(sessionId);
    if (session.userId !== userId) throw new BadRequestException('Not your session');
    if (session.state !== STATES.APPLICATION) throw new BadRequestException('Not in correct state');

    const ctx = (session.context as SessionContext) ?? {};
    const scores = {
      objective: ctx.objective?.score ?? 0,
      subjective: ctx.subjective?.score ?? 0,
      application: ctx.application?.score ?? 0,
    };

    const totalScore = this.mastery.calculateSessionScore(
      scores.objective,
      scores.subjective,
      scores.application,
    );

    const prompt = SESSION_SUMMARY_PROMPT(
      session.concept.name,
      scores,
      totalScore,
    );

    const { content, tokensUsed } = await this.llm.chat(prompt);
    const summary = this.llm.parseJson<SummaryResult>(content);

    ctx.summary = summary;

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        state: STATES.CLOSED,
        score: Math.round(totalScore * 100) / 100,
        context: ctx as any,
        tokenUsed: { increment: tokensUsed },
      },
    });

    await this.mastery.updateMastery(userId, session.conceptId, totalScore);

    return {
      state: STATES.CLOSED,
      scores,
      totalScore: Math.round(totalScore * 100) / 100,
      summary,
    };
  }

  /* ── Discussion (follow-up chat) ── */

  private readonly MAX_DISCUSSION_TURNS = 5;

  async discuss(
    sessionId: string,
    userId: string,
    stepType: 'objective' | 'subjective' | 'application',
    message: string,
  ) {
    const session = await this.findById(sessionId);
    if (session.userId !== userId) throw new BadRequestException('Not your session');

    const ctx = (session.context as SessionContext) ?? {};
    const stepData = ctx[stepType];
    if (!stepData) throw new BadRequestException('해당 단계의 데이터가 없습니다');

    if (!ctx.discussions) ctx.discussions = {};
    const key = stepType;
    if (!ctx.discussions[key]) ctx.discussions[key] = [];
    const history = ctx.discussions[key];

    if (history.filter(m => m.role === 'user').length >= this.MAX_DISCUSSION_TURNS) {
      throw new BadRequestException(`토론은 최대 ${this.MAX_DISCUSSION_TURNS}회까지 가능합니다`);
    }

    const questionTypeLabel = {
      objective: '객관식',
      subjective: '서술형',
      application: '응용',
    }[stepType];

    const correctAnswer = stepType === 'objective'
      ? `${(stepData as any).correctAnswer}: ${(stepData as any).explanation}`
      : (stepData as any).expectedAnswer ?? (stepData as any).evaluationCriteria?.join(', ') ?? '';

    const systemPrompt = DISCUSSION_SYSTEM_PROMPT(
      session.concept.name,
      questionTypeLabel,
      (stepData as any).question,
      correctAnswer,
      (stepData as any).userAnswer ?? '',
      (stepData as any).feedback ?? '',
    );

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ];

    const { content, tokensUsed } = await this.llm.chatWithHistory(messages);

    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content });

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        context: ctx as any,
        tokenUsed: { increment: tokensUsed },
      },
    });

    return {
      reply: content,
      remainingTurns: this.MAX_DISCUSSION_TURNS - history.filter(m => m.role === 'user').length,
      tokensUsed,
    };
  }

  /* ── helpers ── */

  async countTodaySessions(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.session.count({
      where: { userId, createdAt: { gte: today } },
    });
  }
}
