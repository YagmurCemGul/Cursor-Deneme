# AI CV Builder

AI-powered CV and Cover Letter builder with ATS optimization.

## Tech Stack

- React 18.3
- TypeScript 5.6
- Vite 6.0
- Tailwind CSS 3.4
- shadcn/ui
- Zustand (State Management)
- React Router
- React Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/     # React components
├── pages/          # Page components
├── hooks/          # Custom hooks
├── lib/            # Utilities and helpers
├── store/          # Zustand stores
├── types/          # TypeScript types
├── services/       # API services
├── config/         # Configuration files
└── assets/         # Static assets
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values.

## License

MIT
