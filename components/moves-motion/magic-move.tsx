import type { HighlighterCore } from "shiki/core";
import type { KeyedTokensInfo, MagicMoveDifferOptions, MagicMoveRenderOptions } from "@/utils/types";
import * as React from "react";
import { codeToKeyedTokens, createMagicMoveMachine } from "./core";
import { ShikiMagicMoveRenderer } from "./magic-renderer";

export interface ShikiMagicMoveProps {
  highlighter: HighlighterCore;
  lang: string;
  theme: string;
  code: string;
  previousCode?: string;
  animate?: boolean;
  options?: MagicMoveRenderOptions & MagicMoveDifferOptions;
  onStart?: () => void;
  onEnd?: () => void;
  className?: string;
  tabindex?: number;
}

export function ShikiMagicMove(props: ShikiMagicMoveProps) {
  const codeToTokens = React.useRef<(code: string, lineNumbers?: boolean) => KeyedTokensInfo>((code, lineNumbers) =>
    codeToKeyedTokens(
      props.highlighter,
      code,
      {
        lang: props.lang,
        theme: props.theme,
      },
      lineNumbers,
    ),
  );

  // eslint-disable-next-line react-hooks/refs
  codeToTokens.current = (code, lineNumbers) =>
    codeToKeyedTokens(
      props.highlighter,
      code,
      {
        lang: props.lang,
        theme: props.theme,
      },
      lineNumbers,
    );

  // eslint-disable-next-line react-hooks/refs
  const [machine] = React.useState(() =>
    createMagicMoveMachine((code, lineNumbers) => codeToTokens.current!(code, lineNumbers)),
  );

  const lineNumbers = props.options?.lineNumbers ?? false;

  const result = React.useMemo(() => {
    if (
      props.code === machine.current.code &&
      props.theme === machine.current.themeName &&
      props.lang === machine.current.lang &&
      lineNumbers === machine.current.lineNumbers
    ) {
      return machine;
    }
    return machine.commit(props.code, props.options);
  }, [props.code, props.options, props.theme, props.lang, lineNumbers, machine]);

  return (
    <ShikiMagicMoveRenderer
      tokens={result.current}
      previous={result.previous}
      options={props.options}
      animate={props.animate}
      onStart={props.onStart}
      onEnd={props.onEnd}
      className={props.className}
    />
  );
}
