# Contributing to IPTV Player

Thank you for your interest in contributing to IPTV Player! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Constructive feedback is welcome
- Focus on what is best for the project

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies**: `pnpm install`
4. **Create a branch**: `git checkout -b feature/my-feature`
5. **Make your changes** following our coding standards
6. **Test your changes**: `pnpm test`
7. **Commit your changes** using conventional commits
8. **Push to your fork**: `git push origin feature/my-feature`
9. **Open a Pull Request**

## Development Setup

See [Getting Started Guide](docs/development/getting-started.md) for detailed setup instructions.

## Coding Standards

### TypeScript

- 100% TypeScript - no JavaScript files
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Immutable data structures where possible

### Code Style

- Use Prettier for formatting (runs on save)
- Use ESLint for linting
- Follow existing patterns in the codebase
- Keep functions small and focused
- Write self-documenting code

### Testing

- Write tests for all new features
- Maintain >80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:
```typescript
describe('Channel', () => {
  describe('matchesSearch', () => {
    it('should match by name case-insensitively', () => {
      // Arrange
      const channel = Channel.create({
        id: '1',
        name: 'BBC One',
        streamUrl: 'https://example.com/stream.m3u8',
      });

      // Act
      const result = channel.matchesSearch('bbc');

      // Assert
      expect(result).toBe(true);
    });
  });
});
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```
feat(player): add quality selection support

Implement manual quality selection for Shaka Player.
Users can now choose video quality manually instead of
relying solely on adaptive bitrate.

Closes #123

fix(playlist): handle empty M3U files gracefully

Previously, empty M3U files would crash the parser.
Now returns an empty playlist with appropriate warning.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Run tests**: `pnpm test`
2. **Check types**: `pnpm type-check`
3. **Lint code**: `pnpm lint`
4. **Format code**: `pnpm format`
5. **Build project**: `pnpm build`

### PR Guidelines

- Keep PRs focused on a single concern
- Include tests for new functionality
- Update documentation as needed
- Add a clear description of changes
- Reference related issues
- Ensure CI passes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Architecture Guidelines

### Domain Models

- Use immutable classes
- Validate in constructor
- Provide factory methods
- Include serialization methods
- Write comprehensive tests

### Player Implementations

- Implement `IVideoPlayer` interface
- Handle all error cases
- Use `ErrorRecoveryStrategy`
- Emit appropriate events
- Clean up resources in `destroy()`

### State Management

- Use Zustand for client state
- Keep stores small and focused
- Use TypeScript for type safety
- Persist only necessary data
- Write integration tests

### UI Components

- Use React 19 best practices
- Keep components small
- Use TypeScript for props
- Write stories (Storybook)
- Ensure accessibility

## Project Structure

```
packages/
├── core/              # Business logic (platform-agnostic)
├── types/             # Shared types
├── ui-components/     # Shared UI
└── utils/             # Utilities

apps/
├── web/               # Next.js web app
└── tizen/             # TizenOS app
```

**Key Principles:**
- `core` package is platform-agnostic
- Share as much code as possible
- Keep platform-specific code in `apps/`

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions will handle deployment

## Questions?

- Open an issue for bugs
- Start a discussion for questions
- Check existing issues first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
