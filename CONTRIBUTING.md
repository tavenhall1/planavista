# Contributing to PlanaVista

Thank you for your interest in contributing to PlanaVista! This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, constructive, and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/tavenhall1/planavista/issues) to avoid duplicates
2. Open a new issue with:
   - Home Assistant version
   - PlanaVista version
   - Browser and device info
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Open a [GitHub Discussion](https://github.com/tavenhall1/planavista/discussions) or issue
2. Describe the feature and why it would be useful
3. Include mockups or examples if possible

### Submitting Code

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make changes** following the code style below
4. **Test locally** in a Home Assistant instance
5. **Commit** with clear, descriptive messages
6. **Open a Pull Request** with a description of your changes

### Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Include screenshots for any UI changes
- Ensure frontend builds without errors (`cd custom_components/planavista/frontend && npm run build`)
- Don't introduce breaking changes without discussion first
- Update documentation if your change affects user-facing behavior

## Development Setup

See the repository structure and code comments for architecture details.

### Quick Start

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/planavista.git
cd planavista

# Frontend development
cd custom_components/planavista/frontend
npm install
npm run build    # Production build
npm run start    # Watch mode with rebuilds
```

### Testing Changes

- **Backend (Python)**: Requires Home Assistant restart
- **Frontend (TypeScript)**: Build + hard refresh (Ctrl+Shift+R), no restart needed

## Code Style

### Python
- PEP 8 compliant
- Type hints on all function signatures
- Async for all I/O operations

### TypeScript / Frontend
- TypeScript strict mode
- LitElement for all components
- `pv-` prefix for internal component tags
- camelCase for variables, PascalCase for classes

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE) — Copyright (c) 2025-2026 Stephen Hall.
