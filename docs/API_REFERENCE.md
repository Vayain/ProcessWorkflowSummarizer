# API Reference

This document details the API endpoints available in the Activity Documentation Tool.

## Base URL

All API endpoints are relative to the application's base URL.

## Authentication

Currently, the API does not implement authentication. This will be added in future versions.

## Error Handling

Errors are returned with appropriate HTTP status codes and a JSON body:

```json
{
  "error": "Error message description"
}
```

## Endpoints

### Screenshots

#### Get Screenshots

Retrieves screenshots, optionally filtered by session ID.

- **URL**: `/api/screenshots`
- **Method**: `GET`
- **Query Parameters**:
  - `sessionId` (optional): Filter screenshots by session ID

**Response**:
```json
[
  {
    "id": 1,
    "sessionId": 1,
    "timestamp": "2025-04-01T12:00:00.000Z",
    "imageData": "base64_encoded_image_data",
    "description": "User is navigating the dashboard interface",
    "aiAnalysisStatus": "completed"
  },
  // ...more screenshots
]
```

#### Get Screenshot by ID

Retrieves a specific screenshot by its ID.

- **URL**: `/api/screenshots/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: ID of the screenshot to retrieve

**Response**:
```json
{
  "id": 1,
  "sessionId": 1,
  "timestamp": "2025-04-01T12:00:00.000Z",
  "imageData": "base64_encoded_image_data",
  "description": "User is navigating the dashboard interface",
  "aiAnalysisStatus": "completed"
}
```

#### Create Screenshot

Creates a new screenshot.

- **URL**: `/api/screenshots`
- **Method**: `POST`
- **Body**:
```json
{
  "sessionId": 1,
  "imageData": "base64_encoded_image_data",
  "description": "Optional manual description",
  "aiAnalysisStatus": "pending"
}
```

**Response**:
```json
{
  "id": 2,
  "sessionId": 1,
  "timestamp": "2025-04-01T12:01:00.000Z",
  "imageData": "base64_encoded_image_data",
  "description": "Optional manual description",
  "aiAnalysisStatus": "pending"
}
```

#### Update Screenshot

Updates a screenshot's metadata.

- **URL**: `/api/screenshots/:id`
- **Method**: `PATCH`
- **URL Parameters**:
  - `id`: ID of the screenshot to update
- **Body**:
```json
{
  "description": "Updated description",
  "aiAnalysisStatus": "completed"
}
```

**Response**:
```json
{
  "id": 1,
  "sessionId": 1,
  "timestamp": "2025-04-01T12:00:00.000Z",
  "imageData": "base64_encoded_image_data",
  "description": "Updated description",
  "aiAnalysisStatus": "completed"
}
```

#### Delete Screenshot

Deletes a screenshot.

- **URL**: `/api/screenshots/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: ID of the screenshot to delete

**Response**:
```
204 No Content
```

### Sessions

#### Get Sessions

Retrieves all sessions.

- **URL**: `/api/sessions`
- **Method**: `GET`

**Response**:
```json
[
  {
    "id": 1,
    "name": "Dashboard Navigation Session",
    "startTime": "2025-04-01T12:00:00.000Z",
    "endTime": "2025-04-01T12:30:00.000Z",
    "status": "completed"
  },
  // ...more sessions
]
```

#### Get Session by ID

Retrieves a specific session.

- **URL**: `/api/sessions/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: ID of the session to retrieve

**Response**:
```json
{
  "id": 1,
  "name": "Dashboard Navigation Session",
  "startTime": "2025-04-01T12:00:00.000Z",
  "endTime": "2025-04-01T12:30:00.000Z",
  "status": "completed"
}
```

#### Create Session

Creates a new session.

- **URL**: `/api/sessions`
- **Method**: `POST`
- **Body**:
```json
{
  "name": "New User Onboarding Session",
  "startTime": "2025-04-01T13:00:00.000Z",
  "status": "active"
}
```

**Response**:
```json
{
  "id": 2,
  "name": "New User Onboarding Session",
  "startTime": "2025-04-01T13:00:00.000Z",
  "endTime": null,
  "status": "active"
}
```

#### Update Session

Updates a session.

- **URL**: `/api/sessions/:id`
- **Method**: `PATCH`
- **URL Parameters**:
  - `id`: ID of the session to update
- **Body**:
```json
{
  "endTime": "2025-04-01T13:30:00.000Z",
  "status": "completed"
}
```

**Response**:
```json
{
  "id": 2,
  "name": "New User Onboarding Session",
  "startTime": "2025-04-01T13:00:00.000Z",
  "endTime": "2025-04-01T13:30:00.000Z",
  "status": "completed"
}
```

### AI Analysis

#### Analyze Screenshot

Analyzes a screenshot using OpenAI's vision API.

- **URL**: `/api/analyze-screenshot`
- **Method**: `POST`
- **Body**:
```json
{
  "screenshotId": 1,
  "imageData": "base64_encoded_image_data"
}
```

**Response**:
```json
{
  "description": "The user is navigating through a dashboard interface with multiple widgets displaying data analytics. The main chart shows website traffic trends over time."
}
```

#### Get Description Suggestions

Generates alternative description suggestions for a screenshot.

- **URL**: `/api/description-suggestions`
- **Method**: `POST`
- **Body**:
```json
{
  "imageData": "base64_encoded_image_data",
  "currentDescription": "Optional current description to improve"
}
```

**Response**:
```json
{
  "suggestions": [
    "User navigating dashboard with analytics widgets and traffic trends chart",
    "Dashboard view showing analytics data with multiple interactive widgets",
    "Analytics interface displaying website performance metrics and traffic data"
  ]
}
```

### Documentation

#### Generate Documentation

Generates documentation from a series of screenshots.

- **URL**: `/api/generate-documentation`
- **Method**: `POST`
- **Body**:
```json
{
  "sessionId": 1,
  "format": "markdown",
  "detailLevel": "standard"
}
```

**Response**:
```json
{
  "id": 1,
  "sessionId": 1,
  "content": "# Activity Documentation\n\n## Session: Dashboard Navigation\n\n### 12:00:00 PM - Dashboard Overview\nThe user is navigating through a dashboard interface with multiple widgets...",
  "format": "markdown",
  "timestamp": "2025-04-01T12:35:00.000Z"
}
```

#### Get Documentation

Retrieves generated documentation.

- **URL**: `/api/documentation/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: ID of the documentation to retrieve

**Response**:
```json
{
  "id": 1,
  "sessionId": 1,
  "content": "# Activity Documentation\n\n## Session: Dashboard Navigation\n\n### 12:00:00 PM - Dashboard Overview\nThe user is navigating through a dashboard interface with multiple widgets...",
  "format": "markdown",
  "timestamp": "2025-04-01T12:35:00.000Z"
}
```

### Agent Configurations

#### Get Agent Configurations

Retrieves all agent configurations for the CrewAI integration.

- **URL**: `/api/agent-configs`
- **Method**: `GET`

**Response**:
```json
{
  "analyzer": {
    "type": "analyzer",
    "systemPrompt": "You are an expert analyst reviewing screenshots of user activities...",
    "isActive": true
  },
  "writer": {
    "type": "writer",
    "systemPrompt": "You are a technical writer specializing in creating clear documentation...",
    "isActive": true
  },
  "reviewer": {
    "type": "reviewer",
    "systemPrompt": "You are a detail-oriented reviewer examining activity documentation...",
    "isActive": true
  }
}
```

#### Update Agent Configurations

Updates the agent configurations.

- **URL**: `/api/agent-configs`
- **Method**: `POST`
- **Body**:
```json
{
  "analyzer": {
    "type": "analyzer",
    "systemPrompt": "Updated prompt for analyzer agent",
    "isActive": true
  },
  "writer": {
    "type": "writer",
    "systemPrompt": "Updated prompt for writer agent",
    "isActive": false
  },
  "reviewer": {
    "type": "reviewer",
    "systemPrompt": "Updated prompt for reviewer agent",
    "isActive": true
  }
}
```

**Response**:
```json
{
  "analyzer": {
    "type": "analyzer",
    "systemPrompt": "Updated prompt for analyzer agent",
    "isActive": true
  },
  "writer": {
    "type": "writer",
    "systemPrompt": "Updated prompt for writer agent",
    "isActive": false
  },
  "reviewer": {
    "type": "reviewer",
    "systemPrompt": "Updated prompt for reviewer agent",
    "isActive": true
  }
}
```

#### Preview Agent Output

Previews the output from the configured agents.

- **URL**: `/api/preview-agent-output`
- **Method**: `POST`
- **Body**:
```json
{
  "analyzer": {
    "type": "analyzer",
    "systemPrompt": "You are an expert analyst reviewing screenshots of user activities...",
    "isActive": true
  },
  "writer": {
    "type": "writer",
    "systemPrompt": "You are a technical writer specializing in creating clear documentation...",
    "isActive": true
  }
}
```

**Response**:
```json
{
  "preview": "# Example Documentation\n\nThis is a preview of how the documentation would look with the current agent configurations...",
}
```

### Processing Status

#### Get Processing Status

Gets the status of processing for a session.

- **URL**: `/api/processing-status/:sessionId`
- **Method**: `GET`
- **URL Parameters**:
  - `sessionId`: ID of the session to check

**Response**:
```json
{
  "analysisProgress": {
    "current": 5,
    "total": 10
  },
  "processingProgress": {
    "status": "Processing screenshots",
    "percent": 50
  },
  "documentationProgress": {
    "status": "Waiting for analysis to complete",
    "percent": 0
  }
}
```

## Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded, no content to return
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error