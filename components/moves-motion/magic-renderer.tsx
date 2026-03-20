import type { KeyedTokensInfo, MagicMoveRenderOptions } from "@/utils/types";
import * as React from "react";
import { normalizeCSSProperties } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export interface ShikiMagicMoveRendererProps {
  animate?: boolean;
  tokens: KeyedTokensInfo;
  previous?: KeyedTokensInfo;
  options?: MagicMoveRenderOptions;
  onStart?: () => void;
  onEnd?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// Split a flat token array (with \n tokens as line breaks) into lines.
// Each line is represented as an array of tokens and its string content hash key.
function splitIntoLines(tokens: KeyedTokensInfo["tokens"]) {
  const lines: { tokens: KeyedTokensInfo["tokens"]; lineKey: string }[] = [];
  let current: KeyedTokensInfo["tokens"] = [];

  for (const token of tokens) {
    if (token.content === "\n") {
      lines.push({
        tokens: current,
        lineKey: current.map((t) => t.key).join("|"),
      });
      current = [];
    } else {
      current.push(token);
    }
  }
  if (current.length > 0) {
    lines.push({
      tokens: current,
      lineKey: current.map((t) => t.key).join("|"),
    });
  }
  return lines;
}

export function ShikiMagicMoveRenderer({
  animate = true,
  tokens,
  previous,
  options,
  onStart,
  onEnd,
  className,
  style,
}: ShikiMagicMoveRendererProps) {
  const duration = (options?.duration ?? 500) / 1000;
  const shouldAnimate = animate && previous && previous.hash !== tokens.hash;

  const transitionBase = {
    type: "tween" as const,
    ease: "easeInOut" as const,
    duration,
  };

  // Notify start/end callbacks
  React.useEffect(() => {
    if (!shouldAnimate) {
      onEnd?.();
      return;
    }
    onStart?.();
    const t = setTimeout(onEnd ?? (() => {}), options?.duration ?? 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens.hash]);

  const lines = React.useMemo(
    () => splitIntoLines(tokens.tokens),
    [tokens.tokens],
  );
  const prevLines = React.useMemo(
    () => (previous ? splitIntoLines(previous.tokens) : []),
    [previous],
  );

  // Build a set of line keys that existed in the previous render
  const prevLineKeys = React.useMemo(
    () => new Set(prevLines.map((l) => l.lineKey)),
    [prevLines],
  );

  return (
    <motion.pre
      layout
      transition={transitionBase}
      className={`shiki-magic-move-container ${className || ""}`.trim()}
      style={{ ...style, overflow: "hidden" }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {lines.map((line, idx) => {
          const isNew = shouldAnimate && !prevLineKeys.has(line.lineKey);

          return (
            <motion.div
              key={line.lineKey || `line-${idx}`}
              layout="position"
              initial={isNew ? { opacity: 0, x: -8 } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={
                isNew
                  ? { ...transitionBase, delay: duration * 0.3 }
                  : transitionBase
              }
              style={{ display: "block", minHeight: "1em" }}
            >
              {line.tokens.map((token) => (
                <span
                  key={token.key}
                  style={{
                    ...normalizeCSSProperties(token.htmlStyle),
                    color: token.color,
                  }}
                  className={["shiki-magic-move-item", token.htmlClass]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {token.content}
                </span>
              ))}
              {"\n"}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.pre>
  );
}
