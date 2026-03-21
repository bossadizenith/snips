import React from "react";
import { Token } from "./types";
import styles from "../Editor.module.css";
import classNames from "classnames";

interface StaticCodeProps {
  tokens: Token[][];
  className?: string;
}

export const StaticCode: React.FC<StaticCodeProps> = ({ tokens, className }) => {
  return (
    <div className={classNames(styles.formatted, className)}>
      <pre>
        {tokens.map((line, i) => (
          <div key={i} className={styles.line} data-line={i + 1}>
            {line.map((token, j) => (
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
