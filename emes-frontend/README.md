# EMES Frontend

Enterprise MES Solution - Frontend Application

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
emes-frontend/
├── app/                   # App Router
│   ├── (auth)/           # Authentication pages
│   ├── (admin)/          # Admin pages
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
├── lib/                  # Utilities and helpers
│   ├── api/             # API client
│   ├── hooks/           # Custom hooks
│   └── utils/           # Utility functions
├── store/               # Zustand stores
├── types/               # TypeScript types
└── public/              # Static assets
```

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME=EMES Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## License

Proprietary
