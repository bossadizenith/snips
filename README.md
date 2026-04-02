# snips. 🪄

Create beautiful, animated code presentations and snippets effortlessly.

![snips.](https://snips.bossadizenith.me/og.png)

## Overview

**snips.** is a modern, web-based tool designed for developers who want to share their code in a visually stunning way. Whether you're creating content for social media, technical blogs, or live presentations, **snips.** provides a distraction-free environment to frame your code perfectly.

## Features

- **Beautiful Frames**: Customize padding, background gradients, and themes to make your code pop.
- **Presentation Mode**: Turn your snippets into a slide deck. Navigate through multiple code snippets with ease (Hotkeys: `f5` to start, `left`/`right` to navigate).
- **Syntax Highlighting**: Powered by [Shiki](https://shiki.style/), supporting multiple languages and professional-grade themes.
- **Magic Move**: Smoothly animate code transitions between slides for dynamic presentations.
- **Keyboard Shortcuts**: Optimized for speed with a comprehensive set of hotkeys.
- **Dark Mode**: Full support for light and dark aesthetics.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **State Management**: [Jotai](https://jotai.org/)
- **Syntax Highlighting**: [Shiki](https://shiki.style/) & [Highlight.js](https://highlightjs.org/)
- **Animations**: [Motion](https://motion.dev/) & [Shiki Magic Move](https://shiki-magic-move.netlify.app/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Tooling**: [Biome](https://biomejs.dev/) for linting & formatting.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) (Recommended) or npm/yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bossadizenith/snips.git
   cd snips
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Run the development server:

   ```bash
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⌨️ Shortcuts

| Key              | Action                   |
| ---------------- | ------------------------ |
| `f5`             | Toggle Presentation Mode |
| `Left` / `Right` | Navigate Slides          |
| `Esc`            | Exit Presentation Mode   |
| `Shift + N`      | Add New Slide            |

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

---

Built with ❤️ by [Bossadi Zenith](https://bossadizenith.me)
