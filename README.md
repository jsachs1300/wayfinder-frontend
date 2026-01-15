# Wayfinder Frontend

Front end web app for the managed Wayfinder service - an intelligent LLM routing control plane.

## Features

- **Pre-release Waitlist**: Inline signup form wired to `/api/signup`
- **API Reference v1**: Public endpoint documentation for routing, feedback, and token management
- **Animated API Demo**: Interactive demonstration of Wayfinder's routing capabilities with typing effects
- **Dark Mode**: Built-in dark mode support with persistent theme selection
- **Responsive Design**: Mobile-first responsive layout
- **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion

## Pages

- `/` - Landing page with demo, waitlist, and overview sections
- `/api-reference` - Managed Wayfinder API reference

## Getting Started

### Prerequisites

- Node.js 18+ or later
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

Note: The waitlist form posts to `/api/signup`. The backend is not included in this repo.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── landing/           # Landing page sections
│   ├── layout/            # Layout components
│   ├── ui/                # Reusable UI components
│   └── providers/         # Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── types/                 # TypeScript type definitions
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Syntax Highlighting**: react-syntax-highlighter
- **Icons**: Lucide React
- **Theme**: next-themes

## License

See LICENSE file for details.
