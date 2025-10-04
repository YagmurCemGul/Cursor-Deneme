# Developer Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Architecture](#architecture)
5. [Testing](#testing)
6. [Code Style](#code-style)
7. [Contributing](#contributing)

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Chrome browser for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-cv-optimizer.git
cd ai-cv-optimizer

# Install dependencies
npm install

# Start development mode
npm run dev
```

### Building

```bash
# Production build
npm run build

# Development build with watch mode
npm run dev
```

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from your build

## Project Structure

```
ai-cv-optimizer/
├── src/
│   ├── components/          # React components
│   │   ├── __tests__/       # Component tests
│   │   ├── ErrorBoundary.tsx
│   │   ├── CVUpload.tsx
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── __tests__/       # Utility tests
│   │   ├── aiService.ts     # AI service integration
│   │   ├── logger.ts        # Logging utility
│   │   ├── storage.ts       # Chrome storage wrapper
│   │   └── ...
│   ├── data/                # Static data (templates, locales)
│   ├── types/               # TypeScript type definitions
│   ├── popup.tsx            # Main entry point
│   ├── i18n.ts             # Internationalization
│   └── styles.css          # Global styles
├── .github/
│   └── workflows/           # CI/CD workflows
├── dist/                    # Build output (generated)
├── jest.config.js          # Jest configuration
├── tsconfig.json           # TypeScript configuration
├── webpack.config.js       # Webpack configuration
└── package.json

```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow the [Code Style](#code-style) guidelines.

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Architecture

### Core Components

#### AIService (`src/utils/aiService.ts`)

Handles AI-powered features:
- CV optimization
- Cover letter generation
- Multi-provider support (OpenAI, Gemini, Claude)

```typescript
import { aiService } from './utils/aiService';

// Optimize CV
const result = await aiService.optimizeCV(cvData, jobDescription);

// Generate cover letter
const letter = await aiService.generateCoverLetter(cvData, jobDescription);
```

#### Logger (`src/utils/logger.ts`)

Centralized logging system:

```typescript
import { logger } from './utils/logger';

logger.info('Application started');
logger.error('An error occurred', error);
logger.debug('Debug information', { data });
logger.warn('Warning message');
```

**Important:** Always use the logger instead of `console.*` methods. The ESLint configuration will enforce this.

#### StorageService (`src/utils/storage.ts`)

Wrapper around Chrome's storage API:

```typescript
import { StorageService } from './utils/storage';

// Save data
await StorageService.saveDraft(draftData);
await StorageService.saveSettings(settings);

// Retrieve data
const draft = await StorageService.getDraft();
const settings = await StorageService.getSettings();
```

#### ErrorBoundary (`src/components/ErrorBoundary.tsx`)

React error boundary for graceful error handling:

```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    logger.error('Component error:', error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### State Management

- Uses React hooks (`useState`, `useEffect`) for local state
- Chrome storage for persistent data
- No external state management library needed

### Data Flow

1. User uploads CV → `FileParser` extracts data
2. User enters job description
3. User clicks "Optimize" → `AIService.optimizeCV()` 
4. Results displayed → User can apply/reject optimizations
5. User downloads optimized CV → `DocumentGenerator` creates file

## Testing

### Unit Tests

Located in `__tests__` directories alongside source files.

```typescript
// Example test
describe('AIService', () => {
  it('should generate cover letter', async () => {
    const result = await aiService.generateCoverLetter(cvData, jobDesc);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});
```

### Component Tests

Use React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

it('should render component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Coverage Goals

- Target: 80%+ code coverage
- Focus on critical paths
- Test edge cases and error handling

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define types explicitly
- Avoid `any` when possible (use `unknown` or specific types)

### Naming Conventions

- **Components**: PascalCase (`CVUpload`, `ErrorBoundary`)
- **Functions**: camelCase (`parseFile`, `generateCoverLetter`)
- **Constants**: UPPER_SNAKE_CASE (`API_KEY_URLS`, `MAX_RETRIES`)
- **Files**: Match component/class name

### Logging

**DO:**
```typescript
logger.error('Failed to parse file', error);
logger.info('User logged in', { userId });
logger.warn('API rate limit approaching');
```

**DON'T:**
```typescript
console.log('Debug info');  // ❌ Will fail ESLint
console.error('Error');      // ❌ Will fail ESLint
```

### Error Handling

Always handle errors gracefully:

```typescript
try {
  await someAsyncOperation();
} catch (error) {
  logger.error('Operation failed', error);
  // Show user-friendly error message
  alert(t(language, 'error.message'));
}
```

### Imports

Group imports logically:

```typescript
// 1. React/external libraries
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

// 2. Internal utilities
import { logger } from '../utils/logger';
import { StorageService } from '../utils/storage';

// 3. Types
import { CVData, ATSOptimization } from '../types';

// 4. Components
import { ErrorBoundary } from './ErrorBoundary';

// 5. Styles
import './styles.css';
```

## Contributing

### Pull Request Process

1. Update documentation for any user-facing changes
2. Add tests for new features
3. Ensure all tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Ensure type checking passes: `npm run type-check`
6. Update CHANGELOG.md with your changes
7. Request review from maintainers

### Code Review Guidelines

Reviewers will check:
- Code quality and style
- Test coverage
- Documentation
- Performance implications
- Security considerations

### Adding New AI Providers

To add a new AI provider:

1. Implement `AIProviderAdapter` interface in `src/utils/aiProviders.ts`
2. Add provider configuration to `AIConfig` type
3. Update `createAIProvider` factory function
4. Add provider to UI in `AISettings.tsx`
5. Add tests for new provider
6. Update documentation

### Adding New Features

1. Create feature branch
2. Add tests first (TDD approach)
3. Implement feature
4. Update documentation
5. Create PR

## Common Tasks

### Adding a New Component

```typescript
// src/components/MyComponent.tsx
import React from 'react';
import { logger } from '../utils/logger';

interface MyComponentProps {
  data: string;
  onChange: (value: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ data, onChange }) => {
  // Implementation
};
```

### Adding Internationalization

```typescript
// In src/i18n.ts
export const translations = {
  en: {
    myKey: 'My English Text',
  },
  tr: {
    myKey: 'Türkçe Metnim',
  },
};

// In component
import { t } from '../i18n';
const text = t(language, 'myKey');
```

### Debugging

1. Enable development mode: Set `NODE_ENV=development`
2. Use logger with debug level:
   ```typescript
   logger.setLevel(LogLevel.DEBUG);
   ```
3. Use Chrome DevTools:
   - Inspect extension popup
   - Check Background page
   - Monitor network requests
   - View storage data

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Getting Help

- Check existing issues on GitHub
- Join our discussions
- Contact maintainers

## License

See [LICENSE](LICENSE) file for details.
