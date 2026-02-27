import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SYSTEM_PROMPT, DISCUSSION_SYSTEM_PROMPT } from '@deepdev/prompt-templates';

@Injectable()
export class LlmService {
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
      timeout: 30_000,
      maxRetries: 1,
    });
    this.model = this.config.get<string>('OPENAI_MODEL', 'gpt-4o');
  }

  async chat(
    userPrompt: string,
    systemPrompt: string = SYSTEM_PROMPT,
  ): Promise<{ content: string; tokensUsed: number }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content ?? '{}';
      const tokensUsed = response.usage?.total_tokens ?? 0;

      return { content, tokensUsed };
    } catch (error) {
      this.logger.error('LLM call failed', error);
      throw error;
    }
  }

  async chatWithHistory(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    maxTokens = 500,
  ): Promise<{ content: string; tokensUsed: number }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      });

      const content = response.choices[0]?.message?.content ?? '';
      const tokensUsed = response.usage?.total_tokens ?? 0;

      return { content, tokensUsed };
    } catch (error) {
      this.logger.error('LLM discussion call failed', error);
      throw error;
    }
  }

  parseJson<T>(content: string): T {
    try {
      return JSON.parse(content) as T;
    } catch {
      this.logger.error('Failed to parse LLM JSON response', content);
      throw new Error('Invalid LLM response format');
    }
  }
}
