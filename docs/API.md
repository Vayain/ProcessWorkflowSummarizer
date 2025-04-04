# API Reference

This document provides detailed information about the API endpoints available in the Activity Documentation Tool.

## Base URL

All API endpoints are relative to the base URL of your server:

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not implement authentication. This may change in future versions.

## Response Format

All API responses are in JSON format with the following structure for successful requests:

```json
{
  "data": { ... },  // The response data (object or array)
  "success": true   // Indicates successful operation
}
```

For error responses:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  },
  "success": false
}
```

## Screenshots

### Get Screenshots

Retrieves screenshots with optional filtering.

- **URL**: `/screenshots`
- **Method**: `GET`
- **Query Parameters**:
  - `sessionId` (optional): Filter by session ID
  - `sort` (optional): Sort order (`newest` or `oldest`)
  - `limit` (optional): Maximum number of results to return
  - `offset` (optional): Number of results to skip
  - `aiStatus` (optional): Filter by AI analysis status (`pending`, `completed`, `failed`)

#### Response

```json
[
  {
    "id": 1,
    "sessionId": 123,
    "timestamp": "2023-04-01T12:00:00.000Z",
    "imageData": "base64_encoded_image_data",
    "description": "User is viewing the dashboard with active charts",
    "aiAnalysisStatus": "completed"
  },
  ...
]
```

### Create Screenshot

Creates a new screenshot.

- **URL**: `/screenshots`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "sessionId": 123,
  "imageData": "base64_encoded_image_data",
  "aiAnalysisStatus": "pending"
}
```

#### Response

```json
{
  "id": 1,
  "sessionId": 123,
  "timestamp": "2023-04-01T12:00:00.000Z",
  "imageData": "base64_encoded_image_data",
  "description": null,
  "aiAnalysisStatus": "pending"
}
```

### Get Screenshot

Retrieves a specific screenshot by ID.

- **URL**: `/screenshots/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Screenshot ID

#### Response

```json
{
  "id": 1,
  "sessionId": 123,
  "timestamp": "2023-04-01T12:00:00.000Z",
  "imageData": "base64_encoded_image_data",
  "description": "User is viewing the dashboard with active charts",
  "aiAnalysisStatus": "completed"
}
```

### Update Screenshot

Updates a specific screenshot.

- **URL**: `/screenshots/:id`
- **Method**: `PATCH`
- **Content-Type**: `application/json`
- **URL Parameters**:
  - `id`: Screenshot ID
- **Request Body** (all fields optional):

```json
{
  "description": "Updated description",
  "aiAnalysisStatus": "completed"
}
```

#### Response

```json
{
  "id": 1,
  "sessionId": 123,
  "timestamp": "2023-04-01T12:00:00.000Z",
  "imageData": "base64_encoded_image_data",
  "description": "Updated description",
  "aiAnalysisStatus": "completed"
}
```

### Delete Screenshot

Deletes a specific screenshot.

- **URL**: `/screenshots/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: Screenshot ID

#### Response

```json
{
  "success": true
}
```

## Sessions

### Get All Sessions

Retrieves all sessions.

- **URL**: `/sessions`
- **Method**: `GET`

#### Response

```json
[
  {
    "id": 123,
    "name": "Website Testing Session",
    "createdAt": "2023-04-01T10:00:00.000Z",
    "updatedAt": "2023-04-01T12:00:00.000Z",
    "status": "active"
  },
  ...
]
```

### Create Session

Creates a new session.

- **URL**: `/sessions`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "name": "New Session"
}
```

#### Response

```json
{
  "id": 124,
  "name": "New Session",
  "createdAt": "2023-04-02T10:00:00.000Z",
  "updatedAt": "2023-04-02T10:00:00.000Z",
  "status": "active"
}
```

### Get Session

Retrieves a specific session by ID.

- **URL**: `/sessions/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Session ID

#### Response

```json
{
  "id": 123,
  "name": "Website Testing Session",
  "createdAt": "2023-04-01T10:00:00.000Z",
  "updatedAt": "2023-04-01T12:00:00.000Z",
  "status": "active",
  "screenshotsCount": 15
}
```

### Update Session

Updates a specific session.

- **URL**: `/sessions/:id`
- **Method**: `PATCH`
- **Content-Type**: `application/json`
- **URL Parameters**:
  - `id`: Session ID
- **Request Body** (all fields optional):

```json
{
  "name": "Updated Session Name",
  "status": "completed"
}
```

#### Response

```json
{
  "id": 123,
  "name": "Updated Session Name",
  "createdAt": "2023-04-01T10:00:00.000Z",
  "updatedAt": "2023-04-02T09:00:00.000Z",
  "status": "completed"
}
```

### Delete Session

Deletes a specific session.

- **URL**: `/sessions/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: Session ID

#### Response

```json
{
  "success": true
}
```

## Documentation

### Generate Documentation

Generates documentation from screenshots in a session.

- **URL**: `/documentation/generate`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "sessionId": 123,
  "format": "markdown",    // Options: markdown, html, pdf
  "detailLevel": "standard" // Options: minimal, standard, detailed
}
```

#### Response

```json
{
  "id": 1,
  "sessionId": 123,
  "content": "# User Activity Documentation\n\n## Session: Website Testing Session\n\n...",
  "format": "markdown",
  "createdAt": "2023-04-02T11:00:00.000Z"
}
```

### Get Documentation

Retrieves a specific documentation item.

- **URL**: `/documentation/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Documentation ID

#### Response

```json
{
  "id": 1,
  "sessionId": 123,
  "content": "# User Activity Documentation\n\n## Session: Website Testing Session\n\n...",
  "format": "markdown",
  "createdAt": "2023-04-02T11:00:00.000Z"
}
```

## AI Analysis

### Analyze Screenshot

Triggers AI analysis on a specific screenshot.

- **URL**: `/ai/analyze/:id`
- **Method**: `POST`
- **URL Parameters**:
  - `id`: Screenshot ID

#### Response

```json
{
  "id": 1,
  "description": "User is navigating through the product catalog, viewing items in the electronics category. The shopping cart in the top right shows 3 items.",
  "aiAnalysisStatus": "completed"
}
```

### Get Analysis Status

Gets the status of AI processing for a session.

- **URL**: `/processing-status/:sessionId`
- **Method**: `GET`
- **URL Parameters**:
  - `sessionId`: Session ID

#### Response

```json
{
  "analysisProgress": {
    "current": 8,
    "total": 10
  },
  "processingProgress": {
    "status": "Processing",
    "percent": 80
  },
  "documentationProgress": {
    "status": "Waiting",
    "percent": 0
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | The requested resource could not be found |
| `INVALID_REQUEST` | The request is malformed or contains invalid data |
| `SERVER_ERROR` | An internal server error occurred |
| `AI_SERVICE_ERROR` | An error occurred with the AI service |
| `DATABASE_ERROR` | An error occurred with the database operation |

## Rate Limiting

The API currently does not implement rate limiting. However, be cautious with the frequency of requests to avoid overloading the server or hitting OpenAI API rate limits.