# ScreenCaptureSummarizer: AI-Powered Activity Documentation Tool

![ScreenCaptureSummarizer Banner](./generated-icon.png)

ScreenCaptureSummarizer is a cutting-edge web application that automatically documents user activities through intelligent screenshot capture, AI-powered analysis, and comprehensive documentation generation. Capture your workflow, let AI analyze what's happening in each screenshot, and generate professional documentation in multiple formats without manual effort.

## Table of Contents

- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Quick Start Guide](#quick-start-guide)
- [Installation](#installation)
- [Step-by-Step User Workflow](#step-by-step-user-workflow)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Key Features

- **Flexible Screen Capture**: Capture browser tabs, application windows, or full screens with customizable intervals and formats
- **AI-Powered Analysis**: Screenshots are automatically analyzed by OpenAI's GPT-4o vision model to identify and describe user activities
- **CrewAI Integration**: Multiple AI agents work together to analyze screenshots, extract insights, and generate comprehensive documentation
- **Interactive Documentation**: Generate documentation in various formats (Markdown, HTML, PDF) with configurable detail levels
- **Session Management**: Organize captures into sessions for different projects or workflows
- **Performance Optimized**: Handles large volumes of screenshots with compression, virtualization, and database storage
- **User-Friendly Interface**: Modern, intuitive UI with clear workflow guidance and real-time feedback

## How It Works

ScreenCaptureSummarizer follows a structured workflow:

1. **Capture Configuration**: Select what to capture and how frequently
2. **Screenshot Collection**: Automatically capture screenshots at defined intervals
3. **AI Analysis**: Each screenshot is analyzed to describe the visible activity
4. **Agent Processing**: CrewAI agents process the screenshots to create a cohesive narrative
5. **Documentation Generation**: Comprehensive documentation is created based on the analyzed screenshots

## Quick Start Guide

1. **Set Up Environment**:
   - Ensure you have Node.js installed
   - Set up your PostgreSQL database
   - Obtain an OpenAI API key

2. **Install & Configure**:
   ```bash
   git clone https://github.com/yourusername/screencapturesummarizer.git
   cd screencapturesummarizer
   npm install
   # Add your OPENAI_API_KEY to environment variables
   ```

3. **Launch Application**:
   ```bash
   npm run dev
   # Navigate to http://localhost:5000 in your browser
   ```

4. **Start Using**:
   - Create a new session
   - Configure capture settings
   - Start capturing
   - Generate documentation when done

## Step-by-Step User Workflow

### 1. Create a New Session
- Click "New Session" in the sidebar
- Enter a descriptive name (e.g., "Tutorial Documentation")
- Click "Create"
- **Result**: New workspace created for your documentation project

### 2. Configure Capture Settings
- Select capture source (screen, window, or tab)
- Set capture interval (how frequently screenshots are taken)
- Choose image quality settings
- Toggle real-time AI analysis if desired
- **Result**: Application knows exactly what to capture and how

### 3. Capture Screenshots
- Click "Start Capture" button
- Watch as screenshots are automatically taken and displayed
- Click "Stop Capture" when finished
- **Result**: Collection of screenshots showing the activity sequence

### 4. Review and Edit
- Browse through captured screenshots in the gallery
- View AI-generated descriptions for each screenshot
- Edit descriptions if needed for clarity or accuracy
- Delete any unwanted screenshots
- **Result**: Clean, well-described set of screenshots ready for processing

### 5. Configure AI Agents
- Navigate to "Agent Configuration" tab
- Customize which AI agents are active (Analyzer, Writer, Reviewer, Orchestrator)
- Adjust settings for each agent if desired
- **Result**: AI system tailored to your documentation needs

### 6. Generate Documentation
- Go to "Documentation" tab
- Select output format (Markdown, HTML, PDF)
- Choose detail level (Minimal, Standard, Detailed)
- Click "Generate Documentation"
- Wait for processing to complete
- Download or share the finished documentation
- **Result**: Professional, comprehensive documentation of the captured activity

For a more detailed guide with screenshots and troubleshooting tips, see the [complete user guide](docs/USER_GUIDE.md).

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