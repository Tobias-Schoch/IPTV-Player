# Getting Started - Development Guide

## Prerequisites

### Required Software

1. **Node.js 20+**
   ```bash
   # Using nvm (recommended)
   nvm install 20
   nvm use 20

   # Or download from https://nodejs.org/
   ```

2. **pnpm 8+**
   ```bash
   npm install -g pnpm@8
   ```

3. **Git**
   ```bash
   git --version
   ```

### Optional (but recommended)

- **VS Code** - Recommended IDE
- **Docker** - For containerized development
- **Tizen Studio** - For TizenOS development

## Initial Setup

### 1. Clone and Install

```bash
# Navigate to project
cd /Users/tobiasschoch/IdeaProjects/iptvPlayer

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### 2. Verify Setup

```bash
# Type check
pnpm type-check

# Run tests
pnpm test

# Lint
pnpm lint
```

## Development Workflow

### Running in Development Mode

```bash
# Start all packages in watch mode
pnpm dev

# Or start specific package
pnpm --filter @iptv/web dev
pnpm --filter @iptv/core dev
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @iptv/core build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm --filter @iptv/core test:watch

# Run with coverage
pnpm --filter @iptv/core test -- --coverage
```

### Linting and Formatting

```bash
# Lint all files
pnpm lint

# Format all files
pnpm format

# Check formatting without changes
pnpm format:check
```

## Project Structure

```
iptvPlayer/
├── apps/                      # Applications
│   ├── web/                   # Next.js web app
│   └── tizen/                 # TizenOS app
│
├── packages/                  # Shared packages
│   ├── core/                  # Business logic
│   │   ├── src/
│   │   │   ├── domain/        # Domain models
│   │   │   ├── player/        # Player abstraction
│   │   │   ├── playlist/      # Playlist parsing
│   │   │   ├── epg/           # EPG services
│   │   │   └── state/         # State management
│   │   └── package.json
│   │
│   ├── types/                 # Shared TypeScript types
│   ├── ui-components/         # Shared UI components
│   └── utils/                 # Utilities
│
├── configs/                   # Shared configs
│   ├── typescript/            # TS configs
│   ├── eslint/                # ESLint configs
│   └── prettier/              # Prettier configs
│
└── docs/                      # Documentation
```

## Working with Packages

### Adding a New Package

```bash
# Create package directory
mkdir -p packages/my-package/src

# Create package.json
cd packages/my-package
pnpm init

# Add to workspace
# (already included via pnpm-workspace.yaml)
```

### Adding Dependencies

```bash
# Add to specific package
pnpm --filter @iptv/core add lodash

# Add dev dependency
pnpm --filter @iptv/core add -D @types/lodash

# Add workspace dependency
pnpm --filter @iptv/web add @iptv/core@workspace:*
```

### Creating Cross-Package References

In `package.json`:
```json
{
  "dependencies": {
    "@iptv/core": "workspace:*",
    "@iptv/types": "workspace:*"
  }
}
```

In `tsconfig.json`:
```json
{
  "references": [
    { "path": "../types" },
    { "path": "../core" }
  ]
}
```

## Common Tasks

### Create a New Domain Model

1. Create file in `packages/core/src/domain/`
2. Implement as immutable class
3. Export from `packages/core/src/domain/index.ts`
4. Add unit tests

### Add a New Player Implementation

1. Create file in `packages/core/src/player/implementations/`
2. Implement `IVideoPlayer` interface
3. Register in `PlayerFactory`
4. Add unit tests

### Update Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update lodash

# Update with interactive mode
pnpm update -i
```

## Troubleshooting

### Build Errors

```bash
# Clean all builds
pnpm clean

# Rebuild everything
pnpm build
```

### Type Errors

```bash
# Check all types
pnpm type-check

# Rebuild type declarations
pnpm --filter @iptv/types build
pnpm --filter @iptv/core build
```

### Module Resolution Issues

```bash
# Clear node_modules
rm -rf node_modules packages/*/node_modules apps/*/node_modules

# Reinstall
pnpm install
```

## Git Workflow

### Commit Messages

Follow Conventional Commits:

```
feat: add channel search functionality
fix: resolve player buffering issue
docs: update getting started guide
refactor: simplify playlist parser
test: add unit tests for Channel model
chore: update dependencies
```

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

## Next Steps

- [Architecture Overview](../architecture/overview.md)
- [Testing Guide](./testing.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)
