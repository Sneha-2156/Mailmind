# Contributing to MailMind AI

Thank you for considering contributing to MailMind AI!

## Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clean, well-documented code
4. Run tests: `pytest tests/ -v` (backend) + `npm test` (frontend)
5. Commit with a descriptive message
6. Push and open a Pull Request

## Code Standards

### Python (Backend)
- Type hints required on all functions
- Docstrings for all public functions and classes
- PEP 8 style (use `black` formatter)
- All endpoints must validate user ownership

### TypeScript (Frontend)
- Strict TypeScript — no `any` types
- Components should be small and focused
- All pages need loading, error, and empty states

## Commit Message Format

```
type(scope): description

feat(inbox): add bulk email selection
fix(auth): handle expired OAuth token refresh
docs(readme): update deployment instructions
test(classifier): add edge case for empty input
```

## Reporting Issues

Include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment details (OS, Python version, Node version)

## Security Issues

For security vulnerabilities, please do NOT open a public issue. Email the maintainer directly.

## Code of Conduct

Be respectful, constructive, and collaborative.
