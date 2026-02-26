'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const customStyle: Record<string, React.CSSProperties> = {
  ...oneLight,
  'code[class*="language-"]': {
    ...oneLight['code[class*="language-"]'],
    fontSize: '0.8125rem',
    lineHeight: '1.7',
  },
  'pre[class*="language-"]': {
    ...oneLight['pre[class*="language-"]'],
    borderRadius: '1rem',
    padding: '1.25rem',
    fontSize: '0.8125rem',
    lineHeight: '1.7',
    backgroundColor: '#f8f9fc',
    border: '1px solid #e5e7eb',
  },
};

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        code({ className: codeClassName, children, ...props }) {
          const match = /language-(\w+)/.exec(codeClassName || '');
          const codeString = String(children).replace(/\n$/, '');

          if (match) {
            return (
              <SyntaxHighlighter
                style={customStyle}
                language={match[1]}
                PreTag="div"
              >
                {codeString}
              </SyntaxHighlighter>
            );
          }

          return (
            <code
              className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[0.8125rem] font-medium text-violet-600"
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-3 text-sm leading-relaxed text-gray-700 last:mb-0">{children}</p>;
        },
        h1({ children }) {
          return <h1 className="mb-3 mt-4 text-lg font-bold text-gray-900 first:mt-0">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="mb-2 mt-4 text-base font-bold text-gray-900 first:mt-0">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="mb-2 mt-3 text-sm font-bold text-gray-800 first:mt-0">{children}</h3>;
        },
        ul({ children }) {
          return <ul className="mb-3 space-y-1.5 pl-5 text-sm text-gray-700 last:mb-0">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-sm text-gray-700 last:mb-0">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        strong({ children }) {
          return <strong className="font-semibold text-gray-900">{children}</strong>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="mb-3 border-l-3 border-primary-300 bg-primary-50/50 py-2 pl-4 pr-3 text-sm text-gray-600 last:mb-0">
              {children}
            </blockquote>
          );
        },
        table({ children }) {
          return (
            <div className="mb-3 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">{children}</table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-gray-50 text-xs font-semibold text-gray-600">{children}</thead>;
        },
        td({ children }) {
          return <td className="border-t border-gray-100 px-3 py-2 text-gray-700">{children}</td>;
        },
        th({ children }) {
          return <th className="px-3 py-2 text-left">{children}</th>;
        },
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
