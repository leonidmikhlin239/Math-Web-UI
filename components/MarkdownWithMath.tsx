import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

// CSS for KaTeX and highlight.js is loaded in index.html

type Props = {
  /** Текст от модели (Markdown + LaTeX) */
  source: string;
  /** Опционально: ограничить ширину изображений */
  maxImageWidth?: number | string;
};

const isSafeUrl = (url: string | null | undefined) => {
  if (!url) return false;
  try {
    const u = new URL(url, "http://localhost");
    return ["http:", "https:", "data:"].includes(u.protocol);
  } catch {
    return false;
  }
};

export default function MarkdownWithMath({ source, maxImageWidth = "100%" }: Props) {
  return (
    <div className="markdown-body" style={{ lineHeight: 1.6 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeKatex, { throwOnError: false, strict: "ignore" }],
          [rehypeHighlight, { ignoreMissing: true }],
        ]}
        components={{
          a: ({ href, children, ...props }) => {
            const safe = isSafeUrl(href);
            return (
              <a
                href={safe ? href! : undefined}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
                style={{ textDecoration: "underline" }}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt, ...props }) => {
            if (!isSafeUrl(src)) return null;
            return (
              <img
                src={src!}
                alt={alt || ""}
                {...props}
                style={{ maxWidth: maxImageWidth, height: "auto" }}
                loading="lazy"
                decoding="async"
              />
            );
          },
          code({ inline, className, children, ...props }) {
            if (inline) {
              return (
                <code className={className} {...props} style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", padding: "0.1em 0.25em", borderRadius: 4, background: "rgba(127,127,127,.12)" }}>
                  {children}
                </code>
              );
            }
            return (
              <pre style={{ overflowX: "auto", padding: "0.75rem", borderRadius: 8, background: "rgba(127,127,127,.12)" }}>
                <code className={className} {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ children, ...props }) => (
            <div style={{ overflowX: "auto" }}>
              <table {...props} style={{ borderCollapse: "collapse", width: "100%" }}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th {...props} style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "6px 8px" }}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td {...props} style={{ borderBottom: "1px solid #eee", padding: "6px 8px", verticalAlign: "top" }}>
              {children}
            </td>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}