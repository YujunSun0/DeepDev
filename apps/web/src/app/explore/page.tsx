'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass, Send, Loader2, MessageCircle, Plus,
  ChevronLeft, Sparkles, BookOpen, LogOut,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useConcepts } from '@/hooks/use-api';
import { explorationApi, type ExplorationMessage, type ExplorationDetail } from '@/lib/exploration-api';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { UsageWarning } from '@/components/usage-warning';

function useTypewriter(text: string, speed = 12) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    setIsDone(false);
    let i = 0;

    const interval = setInterval(() => {
      const chunk = Math.random() > 0.85 ? 3 : Math.random() > 0.5 ? 2 : 1;
      i += chunk;
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

function TypewriterBubble({ content, onDone }: { content: string; onDone: () => void }) {
  const { displayed, isDone } = useTypewriter(content);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDone) onDone();
  }, [isDone, onDone]);

  useEffect(() => {
    const parent = ref.current?.closest('[data-scroll-container]');
    if (parent) parent.scrollTop = parent.scrollHeight;
  }, [displayed]);

  return (
    <div ref={ref}>
      <MarkdownRenderer content={displayed} />
      {!isDone && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary-400" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   메인 페이지
   ═══════════════════════════════════════════════════ */

export default function ExplorePage() {
  const queryClient = useQueryClient();

  const [activeExplorationId, setActiveExplorationId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(true);
  const [selectedConceptId, setSelectedConceptId] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [localMessages, setLocalMessages] = useState<(ExplorationMessage & { isTyping?: boolean })[]>([]);
  const [turnsLeft, setTurnsLeft] = useState(20);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const justCreatedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: concepts } = useConcepts();
  const { data: explorations, isLoading: loadingList } = useQuery({
    queryKey: ['explorations'],
    queryFn: explorationApi.getAll,
  });

  const { data: activeExploration } = useQuery({
    queryKey: ['explorations', activeExplorationId],
    queryFn: () => explorationApi.getById(activeExplorationId!),
    enabled: !!activeExplorationId,
  });

  useEffect(() => {
    if (activeExploration) {
      if (justCreatedRef.current) {
        justCreatedRef.current = false;
        setTurnsLeft(activeExploration.turnsLeft);
        return;
      }
      setLocalMessages(activeExploration.messages.map((m) => ({ ...m, isTyping: false })));
      setTurnsLeft(activeExploration.turnsLeft);
    }
  }, [activeExploration]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, loading]);

  const handleTypingDone = useCallback(() => {
    setTyping(false);
    setLocalMessages((prev) =>
      prev.map((m, i) => (i === prev.length - 1 && m.isTyping ? { ...m, isTyping: false } : m)),
    );
  }, []);

  const handleCreateExploration = async () => {
    if (!selectedConceptId || !input.trim() || loading) return;
    const message = input.trim();
    setInput('');
    setShowNewChat(false);
    setLocalMessages([{ role: 'user', content: message, isTyping: false }]);
    setLoading(true);
    setError('');

    try {
      const result = await explorationApi.create(selectedConceptId, message);
      justCreatedRef.current = true;
      setActiveExplorationId(result.id);
      setLoading(false);
      setTyping(true);
      setLocalMessages([
        { role: 'user', content: message, isTyping: false },
        { role: 'assistant', content: result.messages[1]?.content ?? '', isTyping: true },
      ]);
      queryClient.invalidateQueries({ queryKey: ['explorations'] });
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? '탐구 시작에 실패했습니다';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeExplorationId || !input.trim() || loading || typing || turnsLeft <= 0) return;
    const message = input.trim();
    setInput('');
    setLoading(true);
    setError('');
    setLocalMessages((prev) => [...prev, { role: 'user', content: message, isTyping: false }]);

    try {
      const result = await explorationApi.sendMessage(activeExplorationId, message);
      setLoading(false);
      setTyping(true);
      setTurnsLeft(result.turnsLeft);
      setLocalMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.reply, isTyping: true },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'AI 응답에 실패했습니다';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setLoading(false);
    }
  };

  const handleSend = showNewChat ? handleCreateExploration : handleSendMessage;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openExploration = (id: string) => {
    setActiveExplorationId(id);
    setShowNewChat(false);
    setError('');
    setTyping(false);
  };

  const startNewChat = () => {
    setActiveExplorationId(null);
    setShowNewChat(true);
    setLocalMessages([]);
    setInput('');
    setError('');
    setTyping(false);
    setTurnsLeft(20);
    setSelectedConceptId('');
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* ── 사이드바 ── */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 overflow-hidden border-r border-gray-100 bg-white transition-all duration-200`}>
        <div className="flex h-full w-72 flex-col">
          {/* 사이드바 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary-500" />
              <h2 className="text-sm font-bold text-gray-800">탐구 모드</h2>
            </div>
            <button
              onClick={startNewChat}
              className="flex items-center gap-1 rounded-xl bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-500 transition hover:bg-primary-100"
            >
              <Plus className="h-3.5 w-3.5" />
              새 대화
            </button>
          </div>

          {/* 대화 목록 */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {loadingList && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
              </div>
            )}

            {explorations?.length === 0 && !loadingList && (
              <div className="py-8 text-center">
                <Compass className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                <p className="text-xs text-gray-400">아직 탐구 대화가 없습니다</p>
              </div>
            )}

            {explorations?.map((exp) => (
              <button
                key={exp.id}
                onClick={() => openExploration(exp.id)}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                  activeExplorationId === exp.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <p className="truncate text-sm font-medium">{exp.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">{exp.conceptName}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <MessageCircle className="h-2.5 w-2.5" />
                    {exp.messageCount}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 메인 채팅 영역 ── */}
      <div className="flex flex-1 flex-col">
        {/* 헤더 */}
        <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-6 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <ChevronLeft className={`h-4 w-4 transition ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>

          {showNewChat ? (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-bold text-gray-700">새 탐구 시작</span>
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-bold text-gray-700">
                {activeExploration?.title ?? '로딩 중...'}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">
                {activeExploration?.conceptName}
              </span>
              <span className="ml-auto">
                <UsageWarning compact />
              </span>
            </div>
          )}

          <Link
            href="/dashboard"
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-red-500 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            나가기
          </Link>
        </div>

        {/* 메시지 영역 */}
        <div ref={scrollRef} data-scroll-container className="flex-1 overflow-y-auto px-6 py-6">
          {showNewChat ? (
            <NewChatView
              concepts={concepts ?? []}
              selectedConceptId={selectedConceptId}
              onSelectConcept={setSelectedConceptId}
            />
          ) : (
            <div className="mx-auto max-w-4xl space-y-4">
              {localMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-700 shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      msg.isTyping ? (
                        <TypewriterBubble content={msg.content} onDone={handleTypingDone} />
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
                  <div className="flex items-center gap-1.5 rounded-2xl bg-white px-4 py-3 shadow-sm border border-gray-100">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {error && (
                <div className="mx-auto max-w-md rounded-xl bg-red-50 px-4 py-2 text-center text-xs text-red-500">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-gray-100 bg-white px-6 py-4">
          <div className="mx-auto max-w-4xl">
            {showNewChat && !selectedConceptId ? (
              <p className="text-center text-sm text-gray-400">위에서 탐구할 개념을 먼저 선택해주세요</p>
            ) : turnsLeft <= 0 && !showNewChat ? (
              <p className="text-center text-sm text-gray-400">대화 횟수를 모두 사용했습니다. 새 대화를 시작해주세요.</p>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    showNewChat
                      ? '이 개념에 대해 궁금한 것을 물어보세요...'
                      : '질문을 입력하세요...'
                  }
                  disabled={loading || typing}
                  className="flex-1 rounded-2xl bg-gray-50 px-5 py-3 text-sm text-gray-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-primary-200 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || typing || !input.trim() || (showNewChat && !selectedConceptId)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-500 text-white transition hover:bg-primary-400 disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   새 대화 시작 뷰 (개념 선택)
   ═══════════════════════════════════════════════════ */

interface NewChatViewProps {
  concepts: Array<{ id: string; name: string; description: string; level: number }>;
  selectedConceptId: string;
  onSelectConcept: (id: string) => void;
}

function NewChatView({ concepts, selectedConceptId, onSelectConcept }: NewChatViewProps) {
  const levelGroups = concepts.reduce<Record<number, typeof concepts>>((acc, c) => {
    if (!acc[c.level]) acc[c.level] = [];
    acc[c.level].push(c);
    return acc;
  }, {});

  const levelLabels: Record<number, string> = {
    1: '기초',
    2: '초급',
    3: '중급',
    4: '고급',
    5: '심화',
  };

  return (
    <div className="mx-auto max-w-4xl py-4">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50">
          <Compass className="h-8 w-8 text-primary-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">탐구 모드</h1>
        <p className="mt-2 text-sm text-gray-400">
          궁금한 개념을 선택하고, AI와 자유롭게 대화하며 깊이 있게 학습하세요.
          <br />
          AI가 꼬리질문을 통해 당신의 이해도를 파악하고 학습을 도와줍니다.
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(levelGroups)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([level, group]) => (
            <div key={level}>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px]">Lv.{level}</span>
                {levelLabels[Number(level)] ?? ''}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.map((concept) => (
                  <button
                    key={concept.id}
                    onClick={() => onSelectConcept(concept.id)}
                    className={`rounded-2xl border-2 px-3 py-2.5 text-left transition ${
                      selectedConceptId === concept.id
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-100 bg-white hover:border-primary-200 hover:bg-primary-50/30'
                    }`}
                  >
                    <p className={`text-sm font-medium ${
                      selectedConceptId === concept.id ? 'text-primary-600' : 'text-gray-700'
                    }`}>
                      {concept.name}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-gray-400">{concept.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
