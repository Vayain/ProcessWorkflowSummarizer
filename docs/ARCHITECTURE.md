# Technical Architecture

This document describes the technical architecture of the Activity Documentation Tool.

## Overview

The Activity Documentation Tool is built as a modern full-stack web application with a React frontend and Express.js backend. The application leverages AI technologies through OpenAI's GPT-4o vision models for automatic screenshot analysis and documentation generation.

![Architecture Diagram](./architecture-diagram.png)

## System Components

### Frontend

The frontend is built with React and TypeScript, featuring a responsive design implemented with Tailwind CSS and ShadCN UI components.

#### Key Frontend Technologies

- **React**: Core UI library
- **TypeScript**: Type-safe JavaScript
- **TanStack Query**: Data fetching and state management
- **ShadCN UI**: Component library
- **Tailwind CSS**: Utility-first CSS framework
- **html2canvas**: Browser-based screenshot capture

#### Frontend Architecture

The frontend follows a component-based architecture with React Context API for state management. Key architectural patterns include:

1. **Container/Presentational Pattern**: Separating logic from presentation
2. **Context API for Global State**: Managing application-wide state
3. **Custom Hooks**: Encapsulating reusable logic
4. **Responsive Design**: Mobile-first approach with Tailwind CSS

#### Component Structure

- **Layout Components**: Basic layout structure (Header, Sidebar, etc.)
- **Feature Components**: Implementation of specific features (CaptureControls, ScreenshotGallery, etc.)
- **UI Components**: Reusable UI elements (Button, Card, etc.)
- **Page Components**: Top-level components for each route

### Backend

The backend is built with Express.js and TypeScript, providing a RESTful API for the frontend and handling data persistence with PostgreSQL.

#### Key Backend Technologies

- **Express.js**: Web server framework
- **TypeScript**: Type-safe JavaScript
- **Drizzle ORM**: Database ORM for PostgreSQL
- **OpenAI API**: AI model integration
- **CrewAI**: Agent orchestration for complex tasks
- **PostgreSQL**: Relational database

#### Backend Architecture

The backend follows a layered architecture with clear separation of concerns:

1. **Routes Layer**: API endpoint definitions
2. **Service Layer**: Business logic implementation
3. **Data Access Layer**: Database interaction through Drizzle ORM
4. **AI Integration Layer**: Integration with OpenAI and CrewAI

### Database

PostgreSQL is used as the primary database, with a schema designed to support the application's core features.

#### Key Database Tables

- **users**: User account information
- **sessions**: Capture sessions
- **screenshots**: Captured screenshots with metadata
- **agent_configs**: Configuration for AI agents
- **documentations**: Generated documentation

#### Database Schema

```
users
  id SERIAL PRIMARY KEY
  username TEXT NOT NULL UNIQUE
  email TEXT NOT NULL UNIQUE
  password_hash TEXT NOT NULL
  created_at TIMESTAMP DEFAULT NOW()

sessions
  id SERIAL PRIMARY KEY
  name TEXT NOT NULL
  user_id INTEGER REFERENCES users(id)
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
  status TEXT DEFAULT 'active'

screenshots
  id SERIAL PRIMARY KEY
  session_id INTEGER REFERENCES sessions(id)
  timestamp TIMESTAMP DEFAULT NOW()
  image_data TEXT NOT NULL
  description TEXT
  ai_analysis_status TEXT DEFAULT 'pending'

agent_configs
  id SERIAL PRIMARY KEY
  type TEXT NOT NULL UNIQUE
  system_prompt TEXT NOT NULL
  is_active BOOLEAN DEFAULT true

documentations
  id SERIAL PRIMARY KEY
  session_id INTEGER REFERENCES sessions(id)
  content TEXT NOT NULL
  format TEXT NOT NULL
  created_at TIMESTAMP DEFAULT NOW()
```

### AI Components

The application leverages AI capabilities through multiple integrated services:

#### OpenAI Integration

- **GPT-4o**: Used for visual analysis of screenshots
- **Text Generation**: Used for documentation creation
- **Vision API**: Used for understanding visual content

#### CrewAI Integration

CrewAI is used to orchestrate multiple specialized AI agents that work together to analyze and document user activities:

1. **Analyzer Agent**: Examines screenshots and extracts key information
2. **Writer Agent**: Creates coherent documentation from analyzed data
3. **Reviewer Agent**: Ensures quality and accuracy of the documentation
4. **Orchestrator Agent**: Coordinates the workflow between agents

## Data Flow

1. **Screen Capture**:
   - User initiates capture process in the UI
   - Browser captures screen using browser APIs or html2canvas
   - Captured image is encoded as base64
   - Image is sent to backend API

2. **Image Storage**:
   - Backend receives screenshot
   - Image is stored in PostgreSQL
   - A reference is created linking the screenshot to the active session

3. **AI Analysis**:
   - Screenshot is sent to OpenAI's vision model via API
   - AI analyzes the image content and generates a description
   - Description is stored in the database with the screenshot

4. **Documentation Generation**:
   - User initiates documentation generation
   - Backend retrieves all screenshots from the session
   - CrewAI agents process the screenshots and their descriptions
   - Final documentation is generated and stored

5. **Visualization**:
   - Frontend retrieves and displays screenshots
   - AI-generated descriptions are shown alongside screenshots
   - Generated documentation is presented in the selected format

## Performance Optimizations

The application implements several optimizations to ensure good performance even with large amounts of data:

1. **Image Compression**: Screenshots are compressed before storage
2. **Lazy Loading**: Images are loaded only when needed
3. **Virtualized Lists**: Only visible items are rendered in long lists
4. **Pagination**: Data is fetched in small batches
5. **Caching**: TanStack Query provides client-side caching
6. **Efficient Queries**: Database queries are optimized for performance

## Security Considerations

1. **API Key Security**: OpenAI API keys are stored securely as environment variables
2. **Data Validation**: Input validation on all API endpoints
3. **CORS Protection**: Proper CORS configuration
4. **Content Security**: Safe handling of user-generated content
5. **Database Security**: Parameterized queries to prevent SQL injection

## Deployment Architecture

The application is designed to be deployed as a single application with both frontend and backend served from the same Express.js server:

1. **Development**: Vite dev server with proxying to Express
2. **Production**: Frontend built as static assets served by Express
3. **Database**: PostgreSQL database (can be deployed separately)

## Future Architecture Considerations

1. **Microservices**: Splitting into separate services for capture, analysis, and documentation
2. **Worker Queue**: Adding a job queue for processing large volumes of screenshots
3. **WebSockets**: Real-time updates for collaborative features
4. **CDN Integration**: Offloading image storage to a CDN
5. **Authentication**: Adding OAuth or similar authentication solutions