import {
  type HighlighterCore,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";
import {
  codeToKeyedTokens,
  createMagicMoveMachine,
  type MagicMoveDifferOptions,
  type MagicMoveRenderOptions,
} from "shiki-magic-move/core";
import { MagicMoveRenderer } from "shiki-magic-move/renderer";
import "shiki-magic-move/dist/style.css";

interface MagicMoveOptions
  extends MagicMoveRenderOptions, MagicMoveDifferOptions {
  lang: BundledLanguage;
  theme: BundledTheme;
  onEnd?: () => void;
}

export class MagicMove {
  private machine: ReturnType<typeof createMagicMoveMachine>;
  private renderer: MagicMoveRenderer;
  private container: HTMLPreElement;

  constructor(
    target: Element,
    highlighter: HighlighterCore,
    code: string,
    options: MagicMoveOptions,
  ) {
    const { lang, theme, lineNumbers = false } = options;

    const pre = document.createElement("pre");
    this.container = pre;
    pre.className = "shiki-magic-move-container";
    target.appendChild(pre);
    this.machine = createMagicMoveMachine(
      (code) =>
        codeToKeyedTokens(highlighter, code, { lang, theme }, lineNumbers),
      options,
    );

    this.renderer = new MagicMoveRenderer(pre, options);

    this.machine.commit(code);
    this.renderer.render(this.machine.current).then(() => {
      options.onEnd?.();
    });
  }

  async update(code: string) {
    this.machine.commit(code);
    await this.renderer.render(this.machine.current);
  }

  destroy() {
    this.container.remove();
  }
}
