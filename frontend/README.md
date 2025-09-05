# Days AI Frontend

A React TypeScript frontend for the Days AI chat application with a clean, modern UI design.

## Features

- **Modern UI Design**: Clean black and white theme with outlined social media icons
- **Chat Interface**: Interactive chat page with real-time responses
- **Landing Page**: Beautiful landing page with DAYS pattern background
- **Responsive Design**: Mobile-first design that works on all devices
- **TypeScript**: Full TypeScript support for better development experience
- **Tailwind CSS**: Utility-first CSS framework for styling

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios for API calls
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see main README.md)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```bash
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ChatPage.tsx      # Main chat interface
│   └── LandingPage.tsx   # Landing page with DAYS pattern
├── services/
│   └── api.ts           # API service for backend communication
├── App.tsx              # Main app component with routing
├── App.css              # Global styles
└── index.css            # Tailwind CSS imports
```

## API Integration

The frontend communicates with the backend at `http://localhost:5000` through the following endpoints:

- `POST /api/chat/ai/query` - Send chat queries
- `GET /api/chat/ai/sources` - Get web sources
- `GET /api/chat/ai/related` - Get related prompts

## UI Design

The application follows a clean, minimalist design with:

- **Color Scheme**: Black, white, and gray tones
- **Typography**: Clean sans-serif fonts
- **Icons**: Outlined style icons from Lucide React
- **Layout**: Mobile-first responsive design
- **Background**: Subtle DAYS pattern on landing page

## Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- Consistent naming conventions

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Test your changes thoroughly
4. Update documentation as needed
