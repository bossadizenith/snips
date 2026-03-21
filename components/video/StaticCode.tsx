import React from "react";
import { Token } from "./types";
import styles from "../Editor.module.css";
import classNames from "classnames";

interface StaticCodeProps {
  tokens: Token[][];
  className?: string;
}

export const StaticCode: React.FC<StaticCodeProps> = ({ tokens: propTokens, className }) => {
  // Shiki 1.0+ often returns an object with a tokens property
  const tokens = Array.isArray(propTokens) ? propTokens : (propTokens as any)?.tokens || [];

  return (
    <div className={classNames(styles.formatted, className)}>
      <pre>
        {Array.isArray(tokens) && tokens.map((line: any, i: number) => (
          <div key={i} className={styles.line} data-line={i + 1}>
            {line.map((token: any, j: number) => (
              <span
                key={j}
                style={{
                  color: token.color,
                  fontStyle: token.fontStyle as any,
                }}
              >
                {token.content}
              </span>
            ))}
            {line.length === 0 && "\n"}
          </div>
        ))}
      </pre>
    </div>
  );
};
