import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RichAiMessageProps {
  content: string;
}

export const RichAiMessage: React.FC<RichAiMessageProps> = ({ content }) => {
  return (
    <div className="rich-ai-content text-xs text-zinc-800 leading-relaxed font-sans space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-black text-zinc-950 tracking-tight pb-1 mb-2 border-b border-zinc-200/80 flex items-center gap-1.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-black text-zinc-950 tracking-tight pb-1 mb-1.5 border-b border-zinc-200/60 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <div className="pt-2 pb-1 border-b border-brand-100/80 mb-2">
              <h3 className="text-xs font-black text-brand-950 uppercase tracking-wider flex items-center gap-1.5">
                {children}
              </h3>
            </div>
          ),
          h4: ({ children }) => (
            <div className="my-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200/70 text-brand-900 font-bold text-[11px] shadow-2xs">
              <span>{children}</span>
            </div>
          ),
          p: ({ children }) => (
            <p className="my-1 text-xs text-zinc-700 leading-relaxed">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-zinc-950 bg-zinc-100/90 px-1 py-0.5 rounded text-[11px] tracking-tight">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-600 font-medium">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="my-2 space-y-1.5 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 pl-4 list-decimal space-y-1 text-xs text-zinc-800">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-xs text-zinc-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <div className="flex-1 space-y-0.5">{children}</div>
            </li>
          ),
          hr: () => (
            <hr className="my-3 border-t border-zinc-200/70" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 p-3 rounded-xl bg-gradient-to-r from-brand-50/90 to-teal-50/50 border-l-3 border-brand-500 text-xs text-zinc-800 shadow-2xs leading-relaxed space-y-1">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="w-full overflow-x-auto my-3 rounded-xl border border-zinc-200 shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-100 text-zinc-900 font-bold border-b border-zinc-200">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-100 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-zinc-50/80 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-zinc-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-zinc-700">
              {children}
            </td>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded font-mono text-[11px] bg-zinc-100 text-brand-700 border border-zinc-200/60 font-semibold">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
