import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmService } from '../../llm/llm.service';
import { UsageService } from '../usage/usage.service';
import {
  EXPLORATION_SYSTEM_PROMPT,
  EXPLORATION_TITLE_PROMPT,
} from '@deepdev/prompt-templates';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

import { getPlanLimit } from '../usage/plan-limits';

@Injectable()
export class ExplorationsService {
  private readonly logger = new Logger(ExplorationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly usage: UsageService,
  ) {}

  async create(userId: string, conceptId: string, firstMessage: string) {
    const { allowed, reason } = await this.usage.canCreateExploration(userId);
    if (!allowed) throw new ForbiddenException(reason);

    const concept = await this.prisma.concept.findUnique({
      where: { id: conceptId },
    });
    if (!concept) throw new NotFoundException('개념을 찾을 수 없습니다.');

    // PRD 7장: 탐구도 플랜 레벨 한도를 따름 (Free는 Level 2까지)
    await this.usage.assertLevelAllowed(userId, concept.level);

    const systemPrompt = EXPLORATION_SYSTEM_PROMPT(
      concept.name,
      concept.description,
      concept.level,
    );

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: firstMessage },
    ];

    const { content: aiReply, tokensUsed } =
      await this.llm.chatWithHistory(messages, 800);

    messages.push({ role: 'assistant', content: aiReply });

    let title = firstMessage.slice(0, 20);
    try {
      const { content: titleJson, tokensUsed: titleTokens } = await this.llm.chat(
        EXPLORATION_TITLE_PROMPT(concept.name, firstMessage),
      );
      const parsed = this.llm.parseJson<{ title: string }>(titleJson);
      if (parsed.title) title = parsed.title;
    } catch {
      this.logger.warn('Failed to generate title, using fallback');
    }

    const exploration = await this.prisma.exploration.create({
      data: {
        userId,
        conceptId,
        title,
        messages: JSON.parse(JSON.stringify(messages)),
        tokenUsed: tokensUsed,
      },
      include: { concept: true },
    });

    return {
      id: exploration.id,
      title: exploration.title,
      conceptName: concept.name,
      messages: messages.filter((m) => m.role !== 'system'),
      tokenUsed: exploration.tokenUsed,
    };
  }

  async sendMessage(explorationId: string, userId: string, message: string) {
    const exploration = await this.prisma.exploration.findUnique({
      where: { id: explorationId },
      include: { concept: true },
    });

    if (!exploration) throw new NotFoundException('탐구 대화를 찾을 수 없습니다.');
    if (exploration.userId !== userId) throw new BadRequestException('권한이 없습니다.');

    const { allowed, reason } = await this.usage.canUseExploration(userId);
    if (!allowed) throw new ForbiddenException(reason);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const maxTurns = getPlanLimit(user?.planType ?? 'FREE').explorationTurns;

    const messages = exploration.messages as unknown as ChatMessage[];

    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length >= maxTurns) {
      throw new BadRequestException(
        `최대 대화 횟수(${maxTurns}회)에 도달했습니다.`,
      );
    }

    messages.push({ role: 'user', content: message });

    const { content: aiReply, tokensUsed } =
      await this.llm.chatWithHistory(messages, 800);

    messages.push({ role: 'assistant', content: aiReply });

    await this.prisma.exploration.update({
      where: { id: explorationId },
      data: {
        messages: JSON.parse(JSON.stringify(messages)),
        tokenUsed: exploration.tokenUsed + tokensUsed,
      },
    });

    return {
      reply: aiReply,
      tokenUsed: exploration.tokenUsed + tokensUsed,
      turnsLeft: maxTurns - (userMessages.length + 1),
    };
  }

  async findByUser(userId: string) {
    const explorations = await this.prisma.exploration.findMany({
      where: { userId },
      include: { concept: true },
      orderBy: { updatedAt: 'desc' },
    });

    return explorations.map((e) => {
      const messages = e.messages as unknown as ChatMessage[];
      const turnCount = messages.filter((m) => m.role === 'user').length;
      return {
        id: e.id,
        title: e.title,
        conceptName: e.concept.name,
        tokenUsed: e.tokenUsed,
        turnCount,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      };
    });
  }

  async findById(explorationId: string, userId: string) {
    const exploration = await this.prisma.exploration.findUnique({
      where: { id: explorationId },
      include: { concept: true },
    });

    if (!exploration) throw new NotFoundException('탐구 대화를 찾을 수 없습니다.');
    if (exploration.userId !== userId) throw new BadRequestException('권한이 없습니다.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const maxTurns = getPlanLimit(user?.planType ?? 'FREE').explorationTurns;

    const messages = exploration.messages as unknown as ChatMessage[];
    const userMessages = messages.filter((m) => m.role === 'user');

    return {
      id: exploration.id,
      title: exploration.title,
      conceptName: exploration.concept.name,
      conceptId: exploration.conceptId,
      messages: messages.filter((m) => m.role !== 'system'),
      tokenUsed: exploration.tokenUsed,
      turnsLeft: maxTurns - userMessages.length,
      createdAt: exploration.createdAt,
      updatedAt: exploration.updatedAt,
    };
  }
}
