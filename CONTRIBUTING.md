# Contributing to Seedbringer Rhythmind Interface

Thank you for your interest in contributing to the Seedbringer Rhythmind Interface! This document provides guidelines for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming environment for all contributors.

## Getting Started

### Prerequisites

- Node.js v14 or higher
- npm v6 or higher
- Git
- A GitHub account

### Setting Up Development Environment

1. **Fork the repository:**
   - Visit https://github.com/hannesmitterer/Seedbringer-rhythmind-interface
   - Click "Fork" in the top right

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Seedbringer-rhythmind-interface.git
   cd Seedbringer-rhythmind-interface
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/hannesmitterer/Seedbringer-rhythmind-interface.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your development credentials
   ```

6. **Run tests:**
   ```bash
   npm test
   ```

7. **Start development server:**
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-changed` - Documentation updates
- `refactor/what-changed` - Code refactoring
- `test/what-added` - Test additions

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Comment complex logic
- Update documentation as needed
- Add tests for new features

### 3. Test Your Changes

Before committing:

```bash
# Run tests
npm test

# Test the server
npm start

# Manually test in browser
# http://localhost:3000
```

### 4. Commit Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "Add feature: brief description

Detailed explanation of what changed and why.
- Bullet points for multiple changes
- Reference issues: Fixes #123"
```

Commit message format:
- First line: Brief summary (50 chars or less)
- Blank line
- Detailed description (wrap at 72 chars)
- Reference related issues

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit for review

## Pull Request Guidelines

### PR Title

Use descriptive titles:
- ✅ "Add WebSocket reconnection logic"
- ✅ "Fix OAuth callback error handling"
- ❌ "Update code"
- ❌ "Fix bug"

### PR Description

Include:
- What changed and why
- How to test the changes
- Screenshots (for UI changes)
- Related issues

Template:
```markdown
## Description
Brief description of changes

## Changes Made
- Change 1
- Change 2

## Testing
Steps to test:
1. Step 1
2. Step 2

## Screenshots
(if applicable)

## Related Issues
Fixes #123
Related to #456
```

### PR Checklist

Before submitting:
- [ ] Code follows project style
- [ ] Tests pass (`npm test`)
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No merge conflicts
- [ ] PR description is complete

## Code Style

### JavaScript

Follow standard JavaScript conventions:

```javascript
// Use const for constants
const PORT = 3000;

// Use let for variables
let userCount = 0;

// Use arrow functions when appropriate
const getUserEmail = (user) => user.email;

// Use async/await over promises
async function getUser(id) {
  const response = await fetch(`/api/user/${id}`);
  return response.json();
}

// Use template literals
console.log(`User ${user.name} logged in`);

// Use destructuring
const { email, name } = user;
```

### File Organization

```
├── server.js           # Main server file
├── public/             # Frontend assets
│   ├── css/           # Stylesheets
│   ├── js/            # Frontend JavaScript
│   └── *.html         # HTML pages
├── examples/          # Example code
├── test/              # Test files
└── docs/              # Additional documentation
```

### Comments

```javascript
// Good: Explain WHY, not WHAT
// Use session store instead of memory to support horizontal scaling
const sessionStore = new RedisStore({ client });

// Bad: Obvious comment
// Set port to 3000
const PORT = 3000;

/**
 * Good: Document complex functions
 * Authenticates WebSocket connection with user session
 * @param {string} userId - User ID from session
 * @param {Socket} socket - Socket.IO socket instance
 * @returns {boolean} True if authenticated
 */
function authenticateSocket(userId, socket) {
  // implementation
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
node test/basic.test.js
```

### Writing Tests

When adding features, include tests:

```javascript
// test/feature.test.js
const assert = require('assert');

console.log('Testing new feature...');

try {
  // Test code here
  assert.strictEqual(result, expected);
  console.log('✓ Test passed');
} catch (error) {
  console.error('✗ Test failed:', error.message);
  process.exit(1);
}
```

### Manual Testing

Test checklist:
- [ ] Authentication flow works
- [ ] Messages send/receive correctly
- [ ] UI displays properly
- [ ] WebSocket connection stable
- [ ] Error handling works
- [ ] Works in different browsers

## Documentation

### When to Update Docs

Update documentation when:
- Adding new features
- Changing existing behavior
- Fixing bugs that affect usage
- Adding new configuration options

### Documentation Files

- `README.md` - Project overview and quick start
- `SETUP.md` - Detailed setup instructions
- `API.md` - API documentation
- `DEPLOYMENT.md` - Deployment guide
- `CONTRIBUTING.md` - This file
- `examples/README.md` - Example documentation

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep formatting consistent
- Update table of contents if needed

## Security

### Security Guidelines

- Never commit secrets or credentials
- Always use environment variables
- Validate and sanitize user input
- Use HTTPS in production
- Keep dependencies updated
- Report security issues privately

### Reporting Security Issues

**Do not open public issues for security vulnerabilities.**

Instead:
1. Email security details to the maintainers
2. Include steps to reproduce
3. Wait for acknowledgment
4. Coordinate disclosure timing

## Getting Help

### Resources

- [Setup Guide](SETUP.md)
- [API Documentation](API.md)
- [Examples](examples/README.md)

### Communication

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and ideas
- Pull Requests - Code review and discussion

### Questions

Before asking:
1. Check existing documentation
2. Search closed issues
3. Review pull requests

When asking:
- Be specific
- Provide context
- Include error messages
- Share relevant code

## Review Process

### What Reviewers Look For

- Code quality and style
- Test coverage
- Documentation updates
- Security implications
- Performance impact
- Backward compatibility

### Addressing Feedback

- Be open to suggestions
- Ask questions if unclear
- Make requested changes
- Update PR description if scope changes
- Re-request review after changes

### Merge Criteria

PRs are merged when:
- All tests pass
- Code review approved
- Documentation updated
- No merge conflicts
- Follows contribution guidelines

## Release Process

### Versioning

We use Semantic Versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Release Checklist

1. Update version in `package.json`
2. Update CHANGELOG
3. Run all tests
4. Create git tag
5. Push to repository
6. Create GitHub release

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes (for significant contributions)
- Project documentation (for major features)

## Thank You!

Your contributions help make the Seedbringer Rhythmind Interface better for everyone. We appreciate your time and effort!

---

**Questions?** Open an issue or contact the Seedbringer Collective.

**Last Updated:** 2024  
**Maintainer:** Seedbringer Collective
