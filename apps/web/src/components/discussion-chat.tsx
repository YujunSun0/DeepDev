'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Loader2, ChevronUp } from 'lucide-react';
import { sessionApi } from '@/lib/session-api';
import { MarkdownRenderer } from './markdown-renderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

interface DiscussionChatProps {
  sessionId: string;
  stepType: 'explanation' | 'objective' | 'subjective' | 'application';
  maxTurns?: number;
  /** 서버에 저장된 토론 기록 기반 초기값. 페이지 복귀 시 올바른 횟수 표시 */
  initialRemainingTurns?: number;
  initialMessages?: { role: 'user' | 'assistant'; content: string }[];
}

function useTypewriter(text: string, speed = 15) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    setIsDone(false);
    let i = 0;

    const interval = setInterval(() => {
      const chunkSize = Math.random() > 0.85 ? 3 : Math.random() > 0.5 ? 2 : 1;
      i += chunkSize;
      if (i >= text.length) {
        setDisplayed(text);
        setIsDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, isDone };
}

function TypewriterMessage({ content, onDone }: { content: string; onDone: () => void }) {
  const { displayed, isDone } = useTypewriter(content, 12);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDone) onDone();
  }, [isDone, onDone]);

  useEffect(() => {
    if (scrollRef.current) {
      const parent = scrollRef.current.closest('[data-scroll-container]');
      if (parent) parent.scrollTop = parent.scrollHeight;
    }
  }, [displayed]);

  return (
    <div ref={scrollRef} className="inline">
      <MarkdownRenderer content={displayed} inline />
      {!isDone && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary-400" />}
    </div>
  );
}

const MAX_TURNS = 5;

export function DiscussionChat({
  sessionId,
  stepType,
  maxTurns = MAX_TURNS,
  initialRemainingTurns,
  initialMessages,
}: DiscussionChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() =>
    (initialMessages ?? []).map(m => ({ ...m, isTyping: false }))
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [remainingTurns, setRemainingTurns] = useState(
    initialRemainingTurns ?? maxTurns
  );
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleTypingDone = useCallback(() => {
    setTyping(false);
    setMessages(prev =>
      prev.map((m, i) => (i === prev.length - 1 && m.isTyping ? { ...m, isTyping: false } : m)),
    );
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading || typing || remainingTurns <= 0) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError('');

    try {
      const result = await sessionApi.discuss(sessionId, stepType, userMessage);
      setLoading(false);
      setTyping(true);
      setMessages(prev => [...prev, { role: 'assistant', content: result.reply, isTyping: true }]);
      setRemainingTurns(result.remainingTurns);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'AI 응답에 실패했습니다';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stepLabel = { explanation: '개념설명', objective: '객관식', subjective: '서술형', application: '응용' }[stepType];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm font-medium text-gray-400 transition hover:border-primary-300 hover:text-primary-500"
      >
        <MessageCircle className="h-4 w-4" />
        AI와 이 문제에 대해 토론하기
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">{remainingTurns}회 남음</span>
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-bold text-gray-700">AI 토론</span>
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-500">{stepLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">{remainingTurns}회 남음</span>
          <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} data-scroll-container className="max-h-[400px] overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="py-8 text-center">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-gray-200" />
            <p className="text-sm text-gray-400">이 문제에 대해 궁금한 점을 질문해보세요</p>
            <p className="mt-1 text-xs text-gray-300">예: &quot;왜 내 답이 틀린 건가요?&quot; &quot;다른 접근법은 없나요?&quot;</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-50 text-gray-700'
            }`}>
              {msg.role === 'assistant' ? (
                msg.isTyping ? (
                  <TypewriterMessage content={msg.content} onDone={handleTypingDone} />
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl bg-gray-50 px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-500">{error}</div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-4 py-3">
        {remainingTurns > 0 ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요..."
              disabled={loading || typing}
              className="flex-1 rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-primary-200 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || typing || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white transition hover:bg-primary-400 disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-gray-400">토론 횟수를 모두 사용했습니다</p>
        )}
      </div>
    </div>
  );
}
