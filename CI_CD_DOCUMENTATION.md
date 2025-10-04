# CI/CD Pipeline Documentation

## Overview

The AI CV Optimizer project uses GitHub Actions for continuous integration and continuous deployment. The pipeline automatically tests, builds, and deploys the application on every push and pull request.

## Pipeline Configuration

**File**: `.github/workflows/ci-cd.yml`

## Pipeline Jobs

### 1. Lint Job

**Purpose**: Ensure code quality and consistent formatting

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies with `npm ci --legacy-peer-deps`
4. Run ESLint on TypeScript files
5. Check code formatting with Prettier

**Triggers**:
- Push to main, develop, or cursor/** branches
- Pull requests to main or develop

**Duration**: ~2-3 minutes

### 2. Test Job

**Purpose**: Run all unit and integration tests

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Run Jest tests with coverage
5. Upload coverage reports to Codecov

**Features**:
- Code coverage reporting
- Test result artifacts
- Codecov integration (optional)

**Triggers**: Same as lint job

**Duration**: ~3-4 minutes

### 3. Type Check Job

**Purpose**: Verify TypeScript types

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Run TypeScript compiler in check mode (`tsc --noEmit`)

**Benefits**:
- Catches type errors early
- Ensures type safety across codebase
- Prevents runtime type issues

**Triggers**: Same as lint job

**Duration**: ~2 minutes

### 4. Build Job

**Purpose**: Build the Chrome extension

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Build extension with Webpack
5. Upload build artifacts

**Dependencies**: Lint, Test, and Type Check jobs must pass

**Artifacts**:
- Extension build in `dist/` directory
- Retained for 7 days
- Can be downloaded for manual testing

**Triggers**: Same as lint job

**Duration**: ~3-4 minutes

### 5. Build Storybook Job

**Purpose**: Build Storybook documentation

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Build static Storybook
5. Upload Storybook artifacts

**Dependencies**: Lint, Test, and Type Check jobs must pass

**Artifacts**:
- Static Storybook in `storybook-static/` directory
- Retained for 7 days
- Ready for deployment

**Triggers**: Same as lint job

**Duration**: ~4-5 minutes

### 6. Deploy Storybook Job

**Purpose**: Deploy Storybook to GitHub Pages

**Steps**:
1. Download Storybook artifacts
2. Configure GitHub Pages
3. Upload to Pages
4. Deploy to GitHub Pages

**Dependencies**: Build Storybook job must pass

**Triggers**: Only on push to main branch

**Permissions**:
- contents: read
- pages: write
- id-token: write

**Result**: Storybook accessible at `https://<username>.github.io/<repo>/`

**Duration**: ~1-2 minutes

## Workflow Diagram

```
┌─────────────────────────────────────────────┐
│            Push/Pull Request                │
└───────────────┬─────────────────────────────┘
                │
                ├─────────────────┬─────────────────┬──────────────────┐
                │                 │                 │                  │
        ┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐   ┌──────▼──────┐
        │     Lint     │  │    Test     │  │ Type Check  │   │   Build     │
        │  (2-3 min)   │  │  (3-4 min)  │  │  (2 min)    │   │ Storybook   │
        └───────┬──────┘  └──────┬──────┘  └──────┬──────┘   └──────┬──────┘
                │                 │                 │                  │
                └─────────────────┴─────────────────┴──────────────────┘
                                  │
                          ┌───────▼──────┐
                          │    Build     │
                          │  Extension   │
                          │  (3-4 min)   │
                          └───────┬──────┘
                                  │
                          ┌───────▼──────┐
                          │   Upload     │
                          │  Artifacts   │
                          └───────┬──────┘
                                  │
                    (Only on main branch)
                                  │
                          ┌───────▼──────┐
                          │   Deploy     │
                          │  Storybook   │
                          │  to Pages    │
                          └──────────────┘
```

## Total Pipeline Duration

- **Parallel Jobs**: ~4-5 minutes (Lint, Test, Type Check)
- **Build Jobs**: ~4-5 minutes (Extension + Storybook)
- **Deploy**: ~1-2 minutes (only on main)
- **Total**: ~10-12 minutes for full pipeline

## Environment Variables

### Required Secrets

1. **CODECOV_TOKEN** (Optional)
   - Purpose: Upload test coverage to Codecov
   - How to get: Sign up at codecov.io
   - Configuration: GitHub Settings > Secrets > Actions

### Automatic Variables

These are provided by GitHub Actions:
- `GITHUB_TOKEN`: Automatically provided
- `GITHUB_REPOSITORY`: Repository name
- `GITHUB_REF`: Branch or tag ref
- `GITHUB_SHA`: Commit SHA

## Branch Protection Rules

### Recommended Settings

For `main` branch:
- ✅ Require status checks to pass
  - lint
  - test
  - type-check
  - build
- ✅ Require pull request reviews (1 approval)
- ✅ Require conversation resolution
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

For `develop` branch:
- ✅ Require status checks to pass
  - lint
  - test
  - type-check
- ✅ Allow force pushes (for rebasing)

## Artifact Management

### Extension Build Artifacts

- **Name**: `extension-build`
- **Path**: `dist/`
- **Retention**: 7 days
- **Size**: ~5-10 MB
- **Usage**: Manual testing, Chrome Web Store upload

### Storybook Build Artifacts

- **Name**: `storybook-build`
- **Path**: `storybook-static/`
- **Retention**: 7 days
- **Size**: ~10-15 MB
- **Usage**: Documentation hosting, review

## Caching Strategy

### NPM Cache

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
```

**Benefits**:
- Faster dependency installation
- Reduced bandwidth usage
- More consistent builds

**Cache Key**: Based on `package-lock.json`

### Dependency Installation

Using `npm ci` instead of `npm install`:
- Faster installation
- Uses exact versions from lockfile
- Removes existing node_modules first
- Ideal for CI/CD environments

## Troubleshooting

### Pipeline Failing on Lint

**Common Causes**:
- ESLint errors
- Prettier formatting issues
- Missing semicolons, unused variables, etc.

**Solutions**:
```bash
# Fix ESLint issues
npm run lint:fix

# Fix Prettier formatting
npm run format

# Check before committing
npm run lint && npm run format:check
```

### Pipeline Failing on Tests

**Common Causes**:
- Test failures
- Coverage threshold not met
- Missing test dependencies

**Solutions**:
```bash
# Run tests locally
npm test

# Run with coverage
npm run test:coverage

# Watch mode for debugging
npm run test:watch
```

### Pipeline Failing on Type Check

**Common Causes**:
- TypeScript errors
- Missing type definitions
- Type mismatches

**Solutions**:
```bash
# Check types locally
npm run type-check

# Look for specific errors
npx tsc --noEmit --pretty
```

### Build Failing

**Common Causes**:
- Webpack configuration errors
- Missing dependencies
- Asset loading issues

**Solutions**:
```bash
# Clean build
rm -rf dist node_modules
npm ci --legacy-peer-deps
npm run build

# Check Webpack output
npm run build -- --verbose
```

### Storybook Build Failing

**Common Causes**:
- Story configuration errors
- Missing component imports
- Addon conflicts

**Solutions**:
```bash
# Build Storybook locally
npm run build-storybook

# Check Storybook config
rm -rf node_modules/.cache/storybook
npm run storybook
```

## Performance Optimization

### Current Optimizations

1. **Parallel Jobs**: Lint, Test, and Type Check run in parallel
2. **NPM Caching**: Dependencies cached between runs
3. **Conditional Deployment**: Storybook only deployed on main
4. **Artifact Compression**: Automatic compression of artifacts

### Potential Improvements

1. **Test Parallelization**: Split tests across multiple workers
2. **Incremental Builds**: Only build changed files
3. **Docker Layer Caching**: Use Docker for consistent builds
4. **Matrix Strategy**: Test on multiple Node versions
5. **Conditional Jobs**: Skip jobs based on file changes

## Monitoring and Notifications

### GitHub Status Checks

All jobs appear as status checks on PRs:
- ✅ Green checkmark: Passed
- ❌ Red X: Failed
- 🟡 Yellow dot: In progress

### Email Notifications

GitHub sends email notifications for:
- Failed workflow runs
- First failed build on a branch
- Successful build after failures

### Slack Integration (Optional)

Add Slack notifications:

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

### For Developers

1. **Run Locally First**: Test lint, format, and tests before pushing
2. **Small Commits**: Easier to debug pipeline failures
3. **Descriptive Messages**: Help identify what broke
4. **Review Logs**: Check full logs if pipeline fails
5. **Fix Immediately**: Don't let broken builds accumulate

### For Repository Maintainers

1. **Monitor Pipeline Health**: Check success rates regularly
2. **Update Dependencies**: Keep Actions up to date
3. **Optimize Timing**: Aim for <10 minute pipeline
4. **Document Changes**: Update this file when changing CI/CD
5. **Security**: Regularly audit secrets and permissions

## Security Considerations

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Limit secret access to required jobs

### Dependency Security

```yaml
# Add to workflow
- name: Run security audit
  run: npm audit --audit-level=moderate
```

### Code Scanning

```yaml
# Add to workflow
- name: Initialize CodeQL
  uses: github/codeql-action/init@v2
  
- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v2
```

## Comparison with Other CI/CD Tools

| Feature | GitHub Actions | Jenkins | CircleCI | Travis CI |
|---------|---------------|---------|----------|-----------|
| Hosting | Cloud/Self | Self-hosted | Cloud | Cloud |
| Configuration | YAML | Groovy/UI | YAML | YAML |
| Free Tier | 2000 min/mo | N/A | 6000 min/mo | Limited |
| Integration | Native | Plugins | Good | Good |
| Matrix Builds | Yes | Yes | Yes | Yes |
| Artifacts | 7 days free | Manual | 30 days | Limited |

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Action Marketplace](https://github.com/marketplace?type=actions)
- [GitHub Pages Deployment](https://docs.github.com/en/pages)
- [Codecov Integration](https://docs.codecov.io/docs/github-actions)

## Changelog

### Version 1.0.0 (2025-10-04)
- Initial CI/CD pipeline setup
- Lint, test, and type check jobs
- Extension build and artifacts
- Storybook build and GitHub Pages deployment
- Code coverage reporting
- Parallel job execution
