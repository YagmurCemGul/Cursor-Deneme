# Storybook Documentation

## Overview

Storybook has been integrated into the AI CV Optimizer project to provide interactive component documentation and testing. This allows developers to view, test, and document React components in isolation.

## Features

### Installed Addons

- **@storybook/addon-essentials** - Essential addons bundle including:
  - Controls: Interactive props testing
  - Actions: Event handler logging
  - Viewport: Responsive design testing
  - Backgrounds: Background color switching
  - Toolbars: Custom toolbar controls
  
- **@storybook/addon-docs** - Automatic documentation generation
- **@storybook/addon-interactions** - Component interaction testing
- **@storybook/addon-links** - Navigation between stories
- **@storybook/addon-onboarding** - First-time user guide

### Available Component Stories

#### 1. CVUpload Component
- **Location**: `src/components/CVUpload.stories.tsx`
- **Stories**:
  - Default: Basic upload component
  - WithError: Error handling demonstration

#### 2. PersonalInfoForm Component
- **Location**: `src/components/PersonalInfoForm.stories.tsx`
- **Stories**:
  - Empty: Empty form state
  - Filled: Pre-filled form with sample data

#### 3. SkillsForm Component
- **Location**: `src/components/SkillsForm.stories.tsx`
- **Stories**:
  - Empty: No skills added
  - WithSkills: Multiple skills demonstration
  - FewSkills: Small skill set

#### 4. ATSScoreCard Component
- **Location**: `src/components/ATSScoreCard.stories.tsx`
- **Stories**:
  - LowScore: 45% match
  - MediumScore: 68% match
  - HighScore: 92% match
  - PerfectScore: 100% match

#### 5. InterviewQuestionsGenerator Component
- **Location**: `src/components/InterviewQuestionsGenerator.stories.tsx`
- **Stories**:
  - Default: Basic usage
  - WithJobDescription: With job requirements
  - MinimalCV: Basic CV data

#### 6. TalentGapAnalysis Component
- **Location**: `src/components/TalentGapAnalysis.stories.tsx`
- **Stories**:
  - HighMatch: 80%+ skill alignment
  - MediumMatch: 40-60% alignment
  - JuniorRole: Entry-level position matching

## Running Storybook

### Development Mode

Start Storybook in development mode with hot reload:

```bash
npm run storybook
```

This will start Storybook at `http://localhost:6006`

### Building for Production

Build a static version of Storybook:

```bash
npm run build-storybook
```

The static files will be generated in the `storybook-static` directory.

## Configuration

### Main Configuration
- **File**: `.storybook/main.ts`
- **Purpose**: Configure Storybook behavior, addons, and build settings

### Preview Configuration
- **File**: `.storybook/preview.ts`
- **Purpose**: Configure global decorators, parameters, and story display

## Writing New Stories

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import YourComponent from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered', // or 'padded', 'fullscreen'
    docs: {
      description: {
        component: 'Component description here',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof YourComponent>;

export const Default: Story = {
  args: {
    // Component props
  },
};
```

### Best Practices

1. **Use Autodocs**: Add `tags: ['autodocs']` to auto-generate documentation
2. **Descriptive Names**: Use clear, descriptive names for stories
3. **Complete Props**: Provide all necessary props for realistic rendering
4. **Multiple States**: Create stories for different component states
5. **Interactive Controls**: Enable prop controls for interactive testing
6. **Documentation**: Add descriptions for components and stories

## Integration with CI/CD

Storybook is integrated into the CI/CD pipeline (see `.github/workflows/ci-cd.yml`):

- Automatically builds Storybook on every push
- Deploys to GitHub Pages on main branch
- Artifacts are stored for 7 days

## Benefits

### For Developers
- **Isolated Development**: Build components without running the full app
- **Visual Testing**: See component variations side-by-side
- **Documentation**: Automatic documentation generation
- **Debugging**: Easier to debug component-specific issues

### For Teams
- **Design System**: Centralized component library
- **Collaboration**: Shared component reference
- **Consistency**: Ensures UI consistency across the app
- **Onboarding**: New team members can quickly understand components

### For QA
- **Visual Regression Testing**: Compare component snapshots
- **Manual Testing**: Test different states and props easily
- **Accessibility Testing**: Built-in accessibility checks
- **Responsive Testing**: Test across different viewports

## Troubleshooting

### Port Already in Use
If port 6006 is already in use, specify a different port:
```bash
npm run storybook -- -p 6007
```

### Build Errors
If you encounter build errors:
1. Clear the Storybook cache: `rm -rf node_modules/.cache/storybook`
2. Reinstall dependencies: `npm ci --legacy-peer-deps`
3. Rebuild: `npm run build-storybook`

### Missing Stories
If stories don't appear:
1. Check the story file matches the pattern in `.storybook/main.ts`
2. Ensure the story is exported properly
3. Restart Storybook

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Storybook for React](https://storybook.js.org/docs/react/get-started/introduction)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Essential Addons](https://storybook.js.org/docs/react/essentials/introduction)
