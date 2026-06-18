# GEMINI.md - Project Context for book_scanner

This document provides architectural context, development standards, and key commands for the `book_scanner` project.

## Project Overview

`book_scanner` is a React-based application built with **Vite 8**, **React 19**, and **TypeScript**. Based on the project name, its intended purpose is likely a tool for scanning or managing books, though it currently utilizes a standard React/Vite template structure.

### Core Technologies
- **Framework:** React 19 (using the new React Compiler).
- **Build Tool:** Vite 8.
- **Language:** TypeScript.
- **Styling:** Vanilla CSS (located in `src/App.css` and `src/index.css`).
- **Linting:** ESLint with TypeScript and React Hooks support.

### Architecture
- `src/main.tsx`: Application entry point.
- `src/App.tsx`: Main component housing the application's top-level structure.
- `src/assets/`: Stores static assets like images and SVG icons.
- `public/`: Contains public assets like `favicon.svg` and `icons.svg`.

## Building and Running

The following commands are defined in `package.json`:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with HMR. |
| `npm run build` | Runs type checking (`tsc`) and builds the project for production. |
| `npm run lint` | Lints the codebase using ESLint. |
| `npm run preview` | Previews the production build locally. |

## Development Conventions

- **React Compiler:** The project is configured to use the [React Compiler](https://react.dev/learn/react-compiler). This is enabled via the `babel-plugin-react-compiler` and `@rolldown/plugin-babel` in `vite.config.ts`.
- **TypeScript:** Strict type checking is encouraged. Configurations are split across `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json`.
- **ESLint:** The project uses a flat ESLint configuration (`eslint.config.js`) extending recommended rules for JavaScript, TypeScript, and React.
- **Styling:** Adheres to the standard CSS-in-JS or CSS-modules-like approach, though it currently uses global/scoped CSS files.

## TODOs / Next Steps
- Implement core book scanning functionality.
- Integrate a book metadata API (e.g., Open Library API, Google Books API).
- Refine the UI/UX for mobile devices (given it's a "scanner").
