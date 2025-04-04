# Activity Documentation Tool with AI-Powered Analysis

![Activity Documentation Tool Banner](./generated-icon.png)

A comprehensive web application for intelligent screenshot capture, analysis, and documentation powered by advanced AI technologies. This tool helps you document user activities by capturing screenshots at regular intervals, analyzing them with AI, and generating detailed documentation automatically.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Intelligent Screen Capture**: Capture screenshots from tabs, windows, or full screens at customizable intervals.
- **AI-Powered Analysis**: Each screenshot is processed by OpenAI's GPT-4o vision model to generate detailed descriptions of the user's activity.
- **Real-time Processing**: See your captures and their AI-generated descriptions as they happen.
- **Documentation Generation**: Automatically create structured documentation in various formats from your session's screenshots.
- **Optimized Performance**: Efficient image handling with compression, virtualized lists, and pagination to maintain performance even with numerous screenshots.
- **Fully Responsive UI**: Clean, intuitive interface built with modern design principles using React and ShadCN UI.

## Demo

[Live Demo](https://your-app-url.com) - *Coming soon*

![Demo Video](docs/demo.gif)

## Quick Start

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up your OpenAI API key in environment variables
4. Start the application with `npm run dev`
5. Navigate to http://localhost:5000 in your browser

## Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- OpenAI API key

### Step 1: Clone the repository

```bash
git clone https://github.com/yourusername/activity-documentation-tool.git
cd activity-documentation-tool
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/activity_docs
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 4: Initialize the database

```bash
npm run db:push
```

### Step 5: Start the development server

```bash
npm run dev
```

## Usage Guide

### Getting Started

1. **Choose Input Source**: Click the "Choose Input" button to select which screen, window, or tab you want to capture.
2. **Configure Capture Settings**: Set the capture interval and format in the settings panel.
3. **Start Capturing**: Click "Start Capture" to begin taking screenshots at the specified interval.
4. **Review Captures**: View your screenshots in the gallery as they are captured and analyzed.
5. **Generate Documentation**: When you're finished capturing, click "Generate Documentation" to create a structured document from your screenshots.

### Advanced Features

- **Real-time AI Analysis**: Toggle this option to get immediate AI descriptions of each screenshot as it's captured.
- **Custom Descriptions**: Edit the AI-generated descriptions to add your own notes or corrections.
- **Session Management**: Create and switch between multiple capture sessions.
- **Filtering & Sorting**: Organize your screenshots by time, analysis status, or custom filters.

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: React with TypeScript, ShadCN UI, and TanStack Query
- **Backend**: Express.js API server
- **Database**: PostgreSQL with Drizzle ORM
- **AI Processing**: OpenAI GPT-4o integration for vision-based analysis
- **State Management**: React Context API with custom hooks

### Directory Structure

```
/
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── lib/         # Utility functions and modules
│   │   ├── hooks/       # Custom React hooks
│   │   └── pages/       # Page components for routing
├── server/           # Backend Express server
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Data access layer
│   └── openai.ts        # OpenAI integration
├── shared/           # Shared code between frontend and backend
│   └── schema.ts        # Database schema definitions
└── docs/             # Documentation
```

## API Reference

The application exposes the following API endpoints:

### Screenshots

- `GET /api/screenshots` - Get screenshots (with optional filtering)
- `POST /api/screenshots` - Create a new screenshot
- `GET /api/screenshots/:id` - Get a specific screenshot
- `PATCH /api/screenshots/:id` - Update a screenshot (e.g., edit description)
- `DELETE /api/screenshots/:id` - Delete a screenshot

### Sessions

- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:id` - Get a specific session
- `PATCH /api/sessions/:id` - Update a session
- `DELETE /api/sessions/:id` - Delete a session

### Documentation

- `POST /api/documentation/generate` - Generate documentation from screenshots
- `GET /api/documentation/:id` - Get generated documentation

See the [full API documentation](docs/API.md) for details on request and response formats.

## Dependencies

### Frontend

- React
- TypeScript
- TanStack Query (React Query)
- ShadCN UI
- Tailwind CSS
- html2canvas

### Backend

- Express.js
- Drizzle ORM
- OpenAI Node.js SDK
- CrewAI (for agent orchestration)
- PostgreSQL

## Configuration

The application can be configured through environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port for the server to listen on | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `OPENAI_API_KEY` | API key for OpenAI services | - |
| `NODE_ENV` | Environment (development/production) | `development` |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ using React, Express, and OpenAI