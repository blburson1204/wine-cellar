# Code Review & Standards Skill - Wine Cellar

This skill provides code review guidelines, coding standards, linting
configurations, and quality assurance practices for the Wine Cellar application.

## Why Code Standards Matter

**Benefits of Consistent Code Standards:**

1. **Readability** - Team members can understand code quickly
2. **Maintainability** - Easier to update and refactor over time
3. **Quality** - Catch bugs before they reach production
4. **Collaboration** - Smoother code reviews and onboarding
5. **Professionalism** - Demonstrates engineering excellence

## Code Standards Stack

### Linting & Formatting

- **ESLint** - JavaScript/TypeScript linting with strict rules
- **Prettier** - Automatic code formatting
- **TypeScript** - Strict mode for type safety
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files only

### Code Quality Tools

- **SonarQube / CodeClimate** - Static code analysis
- **TSDoc / JSDoc** - Documentation standards
- **Danger** - Automated PR reviews
- **Commitlint** - Enforce commit message conventions

## ESLint Configuration

### Installation

```bash
# Install ESLint and plugins
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-import \
  eslint-plugin-jsx-a11y \
  eslint-plugin-prettier \
  eslint-config-prettier
```

### Configuration File

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'prettier', // Must be last to override other configs
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'jsx-a11y'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',

    // General JavaScript rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-throw-literal': 'error',

    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // Using TypeScript
    'react/jsx-no-target-blank': 'error',
    'react/jsx-key': ['error', { checkFragmentShorthand: true }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'error',
    'import/no-cycle': 'warn',

    // Accessibility rules
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
  ],
};
```

### Package Scripts

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "lint:report": "eslint . --ext .ts,.tsx,.js,.jsx --format json --output-file eslint-report.json"
  }
}
```

## Prettier Configuration

### Installation

```bash
npm install --save-dev prettier
```

### Configuration File

```javascript
// .prettierrc.js
module.exports = {
  // Formatting rules
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  // JSX specific
  jsxSingleQuote: false,
  jsxBracketSameLine: false,

  // Other options
  arrowParens: 'always',
  endOfLine: 'lf',
  bracketSpacing: true,

  // File overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
  ],
};
```

### Ignore File

```
# .prettierignore
node_modules
dist
build
.next
coverage
*.min.js
*.min.css
package-lock.json
yarn.lock
pnpm-lock.yaml
```

### Package Scripts

```json
// package.json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

## TypeScript Strict Mode

### Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    // Strict mode options
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional type checking
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Module resolution
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // Output options
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "preserve",

    // Quality of life
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*", "types/**/*"],
  "exclude": ["node_modules", "dist", "build"]
}
```

## Git Hooks with Husky

### Installation

```bash
npm install --save-dev husky lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
```

### Pre-commit Hook

```bash
# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### Lint-staged Configuration

```javascript
// .lintstagedrc.js
module.exports = {
  // TypeScript/JavaScript files
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'bash -c "tsc --noEmit"', // Type check
  ],

  // JSON files
  '*.json': ['prettier --write'],

  // Markdown files
  '*.md': ['prettier --write'],

  // Test files
  '*.{test,spec}.{ts,tsx,js,jsx}': ['jest --bail --findRelatedTests'],
};
```

### Commit Message Hook

```bash
# Install commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Create commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

### Commitlint Configuration

```javascript
// .commitlintrc.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system changes
        'ci', // CI/CD changes
        'chore', // Other changes (dependencies, etc)
        'revert', // Revert previous commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
};
```

## Pull Request Templates

### PR Template

```markdown
<!-- .github/pull_request_template.md -->

## Description

<!-- Brief description of what this PR does -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to
      not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test addition or update

## Related Issues

<!-- Link to related issues using #issue-number -->

Fixes # Relates to #

## Changes Made

## <!-- List the specific changes made in this PR -->

-
-

## Testing

<!-- Describe the testing you've done -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing locally

### Test Coverage

<!-- Include test coverage metrics if applicable -->

- Lines: X%
- Statements: X%
- Branches: X%
- Functions: X%

## Screenshots

<!-- If applicable, add screenshots to demonstrate the changes -->

## Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Code comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] No new warnings generated
- [ ] Tests added that prove the fix is effective or feature works
- [ ] New and existing tests pass locally
- [ ] Dependent changes merged and published

## Deployment Notes

<!-- Any special deployment considerations -->

## Reviewer Notes

<!-- Any specific areas you'd like reviewers to focus on -->
```

## Code Review Checklist

### For Reviewers

#### Code Quality

- [ ] Code is clean and follows project conventions
- [ ] No commented-out code or TODO comments
- [ ] Variable and function names are descriptive
- [ ] Functions are small and single-purpose
- [ ] Complex logic is documented with comments
- [ ] No magic numbers or hardcoded values
- [ ] Error handling is appropriate and consistent
- [ ] No console.log statements left in code

#### TypeScript / Type Safety

- [ ] All functions have proper type annotations
- [ ] No use of `any` type (unless absolutely necessary)
- [ ] Interfaces/types are used appropriately
- [ ] Proper null/undefined handling
- [ ] No type assertions without good reason
- [ ] Enums used for fixed sets of values

#### React / Frontend

- [ ] Components are properly structured
- [ ] Hooks follow rules (no conditional hooks)
- [ ] useEffect dependencies are correct
- [ ] No unnecessary re-renders
- [ ] Proper key props on lists
- [ ] Accessibility considerations (ARIA labels, semantic HTML)
- [ ] Responsive design implemented
- [ ] Loading and error states handled

#### Backend / API

- [ ] Input validation implemented
- [ ] Proper error handling and responses
- [ ] Database queries are efficient
- [ ] No N+1 query problems
- [ ] Transactions used where appropriate
- [ ] Proper HTTP status codes
- [ ] API endpoints follow RESTful conventions
- [ ] Rate limiting considered

#### Security

- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Sensitive data not logged
- [ ] Authentication/authorization checks in place
- [ ] Input sanitization performed
- [ ] CORS configured properly
- [ ] Environment variables used for secrets

#### Testing

- [ ] Unit tests cover new functionality
- [ ] Edge cases are tested
- [ ] Error scenarios are tested
- [ ] Tests are readable and maintainable
- [ ] Test coverage meets standards (>70%)
- [ ] Integration tests added if needed

#### Performance

- [ ] No unnecessary database queries
- [ ] Efficient algorithms used
- [ ] Large lists use pagination
- [ ] Images optimized
- [ ] Lazy loading implemented where appropriate
- [ ] Bundle size impact considered

#### Documentation

- [ ] Complex logic is documented
- [ ] API changes documented
- [ ] README updated if needed
- [ ] Type definitions are clear
- [ ] Examples provided for complex features

### Review Response Times

- **Critical Bug Fix**: Within 2 hours
- **Regular PR**: Within 24 hours
- **Large Feature**: Within 48 hours

### Review Comments Guidelines

#### ✅ Good Review Comments:

```
"Consider extracting this logic into a separate function for better testability:

function validateWineData(data: WineInput): ValidationResult {
  // validation logic
}
"
```

```
"This could cause a memory leak. The useEffect cleanup function should
cancel the subscription:

return () => {
  subscription.unsubscribe();
};
"
```

```
"Great use of the nullish coalescing operator here! This makes the
default value behavior very clear."
```

#### ❌ Poor Review Comments:

```
"This is wrong."  // Not helpful, no explanation
```

```
"Why did you do it this way?"  // Sounds accusatory
```

```
"LGTM"  // Too brief, shows no actual review
```

### Code Review Best Practices

1. **Be Respectful** - Assume good intent, focus on the code not the person
2. **Be Specific** - Point to exact lines and suggest alternatives
3. **Explain Why** - Don't just say what's wrong, explain the impact
4. **Ask Questions** - "Could we..." instead of "You should..."
5. **Praise Good Work** - Call out clever solutions and improvements
6. **Timely Reviews** - Don't let PRs sit for days
7. **Test the Code** - Pull down and run the changes locally
8. **Check Tests** - Verify tests actually test what they claim to

## Branch Protection Rules

### Recommended Settings (GitHub)

```yaml
# Branch protection for main/master
Branch: main
Rules:
  - Require pull request reviews before merging
    - Required approving reviews: 1
    - Dismiss stale pull request approvals when new commits are pushed
    - Require review from Code Owners

  - Require status checks to pass before merging
    - Require branches to be up to date before merging
    - Status checks:
      - CI/CD Pipeline
      - ESLint
      - TypeScript Type Check
      - Unit Tests
      - Integration Tests
      - Code Coverage (minimum 70%)

  - Require conversation resolution before merging

  - Require signed commits

  - Include administrators

  - Restrict who can push to matching branches
    - Only maintainers

  - Allow force pushes: Disabled

  - Allow deletions: Disabled
```

## Code Style Guide

### Naming Conventions

```typescript
// ✅ Good naming
const userEmail = 'user@example.com'; // camelCase for variables
const MAX_RETRY_ATTEMPTS = 3; // UPPER_SNAKE_CASE for constants
function calculateTotalPrice() {} // camelCase for functions
class WineRepository {} // PascalCase for classes
interface WineData {} // PascalCase for interfaces
type WineColor = 'red' | 'white' | 'rose'; // PascalCase for types
enum UserRole {
  ADMIN,
  USER,
} // PascalCase for enums

// ❌ Bad naming
const email = 'x'; // Too short
const theUserEmailAddressString = 'x'; // Too long
function getData() {} // Too generic
class wine_repository {} // Wrong case
```

### File Structure

```
src/
├── components/           # React components
│   ├── common/          # Shared components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.styles.ts
│   │   │   └── index.ts
│   ├── wines/           # Feature-specific components
│   └── layout/          # Layout components
│
├── hooks/               # Custom React hooks
│   ├── useWines.ts
│   └── useAuth.ts
│
├── utils/               # Utility functions
│   ├── api.ts
│   ├── validation.ts
│   └── formatting.ts
│
├── types/               # TypeScript type definitions
│   ├── wine.types.ts
│   └── api.types.ts
│
├── constants/           # Application constants
│   └── config.ts
│
└── services/            # Business logic / API calls
    ├── wineService.ts
    └── authService.ts
```

### Import Order

```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Internal absolute imports
import { Button } from '@/components/common/Button';
import { useWines } from '@/hooks/useWines';

// 3. Internal relative imports
import { WineForm } from './WineForm';
import { formatDate } from '../utils/formatting';

// 4. Type imports (grouped separately)
import type { Wine, WineInput } from '@/types/wine.types';

// 5. Styles (last)
import styles from './Wine.module.css';
```

### Function Structure

```typescript
// ✅ Good: Small, single-purpose functions
function calculateDiscountPrice(
  price: number,
  discountPercent: number
): number {
  return price * (1 - discountPercent / 100);
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// ❌ Bad: Function doing too much
function processOrder(orderId: string) {
  // Fetching data
  const order = getOrder(orderId);

  // Validation
  if (!order) throw new Error('Order not found');
  if (order.items.length === 0) throw new Error('Empty order');

  // Calculation
  const total = order.items.reduce((sum, item) => sum + item.price, 0);
  const tax = total * 0.1;
  const shipping = calculateShipping(order.address);

  // Payment processing
  const payment = processPayment(total + tax + shipping);

  // Notification
  sendEmail(order.email, 'Order confirmed');

  // Database update
  updateOrderStatus(orderId, 'completed');

  return order;
}
```

### Error Handling Patterns

```typescript
// ✅ Good: Specific error handling
async function getWineById(id: string): Promise<Wine> {
  try {
    const wine = await db.wine.findUnique({ where: { id } });

    if (!wine) {
      throw new NotFoundError('Wine', id);
    }

    return wine;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Database error fetching wine', error, { wineId: id });
    throw new DatabaseError('Failed to fetch wine');
  }
}

// ❌ Bad: Generic error handling
async function getWineById(id: string) {
  try {
    return await db.wine.findUnique({ where: { id } });
  } catch (error) {
    console.log('Error:', error);
    return null;
  }
}
```

## Documentation Standards

### TSDoc / JSDoc

````typescript
/**
 * Calculates the optimal drinking window for a wine based on its vintage and type.
 *
 * @param vintage - The year the wine was produced
 * @param color - The color/type of wine (red, white, or rosé)
 * @param ageingPotential - Expected aging potential in years (optional)
 * @returns Object containing the earliest and latest recommended drinking dates
 *
 * @example
 * ```typescript
 * const window = calculateDrinkingWindow(2015, 'red', 15);
 * // Returns: { earliestDate: Date(2020), latestDate: Date(2030) }
 * ```
 *
 * @throws {ValidationError} If vintage is invalid or in the future
 *
 * @see {@link https://docs.example.com/wine-aging | Wine Aging Guide}
 */
function calculateDrinkingWindow(
  vintage: number,
  color: WineColor,
  ageingPotential?: number
): { earliestDate: Date; latestDate: Date } {
  // Implementation
}
````

### README Standards

Every feature module should have a README explaining:

- What the module does
- How to use it
- Key dependencies
- Examples
- Testing approach

```markdown
# Wine Service

## Overview

Service layer for managing wine data operations. Handles CRUD operations,
validation, and business logic for wine management.

## Usage

\`\`\`typescript import { wineService } from '@/services/wineService';

// Create a wine const wine = await wineService.create({ name: 'Château
Margaux', vintage: 2015, // ... });

// Get all wines const wines = await wineService.findAll();

// Update a wine await wineService.update(id, { quantity: 5 });

// Delete a wine await wineService.delete(id); \`\`\`

## Testing

Run tests with: \`\`\`bash npm test src/services/wineService.test.ts \`\`\`

Coverage: 95%
```

## Code Quality Metrics

### Coverage Requirements

- **Overall Coverage**: Minimum 70%
- **Critical Paths**: Minimum 90%
- **New Code**: Minimum 80%

### Complexity Limits

- **Cyclomatic Complexity**: Maximum 10 per function
- **File Length**: Maximum 300 lines (excluding tests)
- **Function Length**: Maximum 50 lines
- **Function Parameters**: Maximum 4 parameters

### SonarQube Integration

```yaml
# sonar-project.properties
sonar.projectKey=wine-cellar
sonar.organization=your-org
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/*.config.ts

# Quality gates
sonar.qualitygate.wait=true
sonar.qualitygate.timeout=300

# Code smells
sonar.issue.ignore.multicriteria=e1,e2
sonar.issue.ignore.multicriteria.e1.ruleKey=typescript:S1135
sonar.issue.ignore.multicriteria.e1.resourceKey=**/*.ts
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript type check
        run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
```

## Common Code Smells to Avoid

### 1. Magic Numbers

```typescript
// ❌ Bad
if (user.age >= 21) {
  allowPurchase();
}

// ✅ Good
const LEGAL_DRINKING_AGE = 21;
if (user.age >= LEGAL_DRINKING_AGE) {
  allowPurchase();
}
```

### 2. Deep Nesting

```typescript
// ❌ Bad
function processOrder(order) {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        if (order.user) {
          // Process order
        }
      }
    }
  }
}

// ✅ Good
function processOrder(order) {
  if (!order?.items?.length || !order.user) {
    return;
  }

  // Process order
}
```

### 3. Long Parameter Lists

```typescript
// ❌ Bad
function createWine(
  name: string,
  vintage: number,
  producer: string,
  country: string,
  region: string,
  color: WineColor,
  quantity: number,
  notes: string
) {
  // ...
}

// ✅ Good
interface CreateWineInput {
  name: string;
  vintage: number;
  producer: string;
  country: string;
  region?: string;
  color: WineColor;
  quantity?: number;
  notes?: string;
}

function createWine(input: CreateWineInput) {
  // ...
}
```

### 4. Duplicate Code

```typescript
// ❌ Bad
function formatRedWine(wine) {
  return {
    ...wine,
    displayName: `${wine.name} (${wine.vintage})`,
    type: 'Red Wine',
  };
}

function formatWhiteWine(wine) {
  return {
    ...wine,
    displayName: `${wine.name} (${wine.vintage})`,
    type: 'White Wine',
  };
}

// ✅ Good
function formatWine(wine: Wine): FormattedWine {
  return {
    ...wine,
    displayName: `${wine.name} (${wine.vintage})`,
    type: `${wine.color} Wine`,
  };
}
```

## Best Practices Checklist

### Before Committing

- [ ] Code is formatted with Prettier
- [ ] ESLint shows no errors
- [ ] TypeScript compiles with no errors
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] No console.log or debugger statements
- [ ] Commit message follows conventions

### Before Creating PR

- [ ] Branch is up to date with main
- [ ] PR description is clear and complete
- [ ] Screenshots added for UI changes
- [ ] Documentation updated if needed
- [ ] Breaking changes are clearly marked
- [ ] Reviewers assigned

### During Code Review

- [ ] Review comments addressed
- [ ] Requested changes implemented
- [ ] Tests updated based on feedback
- [ ] CI/CD checks passing
- [ ] Conflicts resolved

### Before Merging

- [ ] All review comments resolved
- [ ] Required approvals received
- [ ] CI/CD pipeline passing
- [ ] No merge conflicts
- [ ] Documentation finalized

## Tools Setup Script

```bash
#!/bin/bash
# scripts/setup-code-standards.sh

echo "Setting up code quality tools..."

# Install dependencies
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-import \
  eslint-plugin-jsx-a11y \
  eslint-plugin-prettier \
  eslint-config-prettier \
  prettier \
  husky \
  lint-staged \
  @commitlint/cli \
  @commitlint/config-conventional

# Initialize Husky
npx husky install
npm pkg set scripts.prepare="husky install"

# Create hooks
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'

# Create configuration files
cat > .eslintrc.js << 'EOF'
// ESLint configuration here
EOF

cat > .prettierrc.js << 'EOF'
// Prettier configuration here
EOF

cat > .lintstagedrc.js << 'EOF'
// lint-staged configuration here
EOF

cat > .commitlintrc.js << 'EOF'
// commitlint configuration here
EOF

echo "✅ Code quality tools setup complete!"
echo "Run 'npm run lint' to check your code"
echo "Run 'npm run format' to format your code"
```

## When to Update This Skill

- When adding new linting rules or standards
- After team discussions about coding conventions
- When adopting new tools or frameworks
- After identifying common code quality issues
- When integrating new code quality services
- After major TypeScript or framework updates

## Related Skills

- [error-handling](../error-handling/SKILL.md) - Error handling patterns
- [testing](../testing/SKILL.md) - Testing strategies and best practices
