# Koharu Project Rules

Koharu is an ML-powered local-first manga translator.
Tech stack: Rust (Tauri backend, candle, llama.cpp), Bun, Next.js (React 19), Tailwind CSS 4.

## Structure
```text
docs/            # Documentation
e2e/             # Playwright e2e tests
koharu/          # Main Tauri application
koharu-app/      # Platform-specific app code
koharu-core/     # Core application logic
koharu-llm/      # Local LLM inference backend (llama.cpp)
koharu-ml/       # Computer vision models backend (candle)
koharu-psd/      # Layered PSD export module
koharu-renderer/ # Manga-oriented text renderer (HarfRust, ICU4X, skrifa)
ui/              # Next.js frontend application
```

## Commands
```bash
# Run development server (Next.js + Tauri)
bun dev

# Build the desktop application
bun run build

# Run code formatter
bun run format

# Run end-to-end tests
bun run test:e2e
```

## Conventions
- Use `bun` for managing Node dependencies and running package scripts.
- The frontend is located in the `ui/` directory. It uses Next.js, React 19, Tailwind CSS 4, and Radix UI.
- State management in the frontend is done with `zustand`; data fetching uses `@tanstack/react-query`.
- Use the provided npm scripts for building, formatting, and testing. Do not invoke `cargo` or `next` directly when top-level `bun` scripts exist.
