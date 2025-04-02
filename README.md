# Activity Documentation Tool with AI-Powered Analysis

A comprehensive web application that captures, analyzes, and documents user activities using advanced screenshot technology and AI-powered insights.

![Activity Documentation Tool](generated-icon.png)

## Features

- **Advanced Screenshot Capture System**
  - Multiple capture modes (Browser Tab, Window, Full Screen, Selected Element)
  - Persistent screen capture permissions for smoother experience
  - Automatic interval-based capture with configurable timing
  - Memory and resource-efficient screen recording

- **AI-Powered Analysis**
  - Real-time activity recognition using OpenAI's GPT-4o vision model
  - Automatic description generation for each screenshot
  - CrewAI agent-based workflow for complex activity processing

- **Documentation Generation**
  - Multiple export formats (Markdown, HTML, PDF)
  - Customizable detail levels for generated documentation
  - Activity timeline visualization

- **Responsive Interface**
  - Modern, user-friendly design with ShadcN components
  - Real-time capture status and progress tracking
  - Gallery view of captured screenshots with editing capabilities

## Technology Stack

- **Frontend**: React, TanStack Query, Tailwind CSS, ShadcN/UI
- **Backend**: Express.js, Drizzle ORM
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API, CrewAI
- **Screenshot Technology**: HTML2Canvas, Screen Capture API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/activity-documentation-tool.git
   cd activity-documentation-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5000`

## Usage

1. **Configure Capture Settings**:
   - Select capture area (Browser Tab, Window, Full Screen, Element)
   - Set capture interval (1-30 seconds)
   - Enable/disable real-time AI analysis

2. **Start Capture**:
   - Click "Start Capture" to begin recording
   - For Full Screen mode, you'll be prompted to select what to share

3. **Review & Edit**:
   - View captured screenshots in the gallery
   - Edit auto-generated descriptions if needed

4. **Generate Documentation**:
   - Select output format and detail level
   - Generate comprehensive documentation of captured activities

## Architecture

The application follows a modern full-stack architecture:

- **Client**: React-based SPA with component-based UI
- **Server**: Express.js REST API with PostgreSQL database
- **Database**: Drizzle ORM for type-safe database operations
- **AI Processing**: CrewAI agents for complex multi-stage analysis

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for the GPT-4o vision API
- CrewAI for the agent-based workflow system
- ShadcN for the beautiful UI components