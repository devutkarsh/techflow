# ⚡ TechFlow — Interactive Software Architecture Book

**TechFlow** is a modern, responsive **Software Architecture Book & Technology Showcase** built with React 19, TypeScript, Vite, and ReactFlow. All architecture chapters are fully data-driven from JSON schemas in code with automatic discovery.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173/
```

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with Hot Module Replacement (HMR) |
| `npm run build` | Compiles TypeScript with `tsc -b` and builds production bundle |
| `npm run preview` | Locally preview the production build output in `dist/` |
| `npm run lint` | Runs `oxlint` for fast code linting |

---

## 📁 Adding New Architecture Chapters

Architecture pages are dynamically discovered from [`src/data/architectures/`](file:///Users/plotkai/products/techflow/src/data/architectures/).

To add a new chapter to the book:
1. Create a new `.json` file inside `src/data/architectures/` (e.g. `my-new-architecture.json`).
2. Follow the standard schema structure with nodes, edges, simulationFlow, overview, and tradeoffs.
3. Vite automatically discovers and appends it to the chapter stepper and Table of Contents without changing any code.

---

## ⌨️ Keyboard Shortcuts

- `[← / →]` : Navigate to previous / next architecture chapter
- `[S]` : Toggle step-by-step request flow simulation
- `[F]` : Toggle fullscreen diagram canvas
- `[Esc]` : Close node inspector sheet / chapter modal / exit fullscreen

