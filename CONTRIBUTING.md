# Contributing to Front Market

Thank you for your interest in contributing to Front Market! We welcome contributions from the community and are pleased to have you join us.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- MongoDB (local or Atlas)

### Types of Contributions

We welcome many types of contributions:

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Tests
- 🔧 Performance improvements
- 🌐 Translations

## 💻 Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/front-market.git
   cd front-market
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔄 Making Changes

### Branch Naming Convention

Use descriptive branch names:
- `feature/add-user-authentication`
- `bugfix/fix-cart-calculation`
- `docs/update-readme`
- `refactor/optimize-database-queries`

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(auth): add user registration functionality
fix(cart): resolve quantity update bug
docs(readme): update installation instructions
```

## 📤 Submitting Changes

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear and descriptive title
   - Provide a detailed description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🎨 Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Write self-documenting code with comments where necessary
- Prefer functional programming patterns

### React Components

- Use functional components with hooks
- Follow the single responsibility principle
- Use proper prop types and interfaces
- Implement proper error boundaries
- Use React Query for data fetching

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use semantic HTML elements

### File Organization

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Layout components
│   └── feature/      # Feature-specific components
├── pages/            # Page components
├── hooks/            # Custom hooks
├── lib/              # Utility functions
├── types/            # Type definitions
└── assets/           # Static assets
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Use meaningful test descriptions
- Follow the AAA pattern (Arrange, Act, Assert)

### Test Structure

```typescript
describe('Component/Function Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test input';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

## 📚 Documentation

### Code Documentation

- Use JSDoc comments for functions and classes
- Document complex algorithms and business logic
- Keep comments up-to-date with code changes

### README Updates

- Update README.md for new features
- Include setup instructions for new dependencies
- Add examples for new functionality

## 🐛 Reporting Bugs

### Before Submitting a Bug Report

- Check if the bug has already been reported
- Ensure you're using the latest version
- Try to reproduce the bug consistently

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

### Before Submitting a Feature Request

- Check if the feature has already been requested
- Consider if the feature fits the project's scope
- Think about how it would benefit other users

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions in project updates

## 📞 Getting Help

If you need help with contributing:

- Join our [Discord community](https://discord.gg/frontmarket)
- Open a [GitHub Discussion](https://github.com/yourusername/front-market/discussions)
- Email us at: contribute@frontmarket.com

## 📄 License

By contributing to Front Market, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Front Market! 🎉
