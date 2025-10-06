import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            AI CV Builder
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Create professional, ATS-optimized CVs and cover letters with AI assistance
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Count is {count}
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Setup Complete ✅ - Ready for development
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
