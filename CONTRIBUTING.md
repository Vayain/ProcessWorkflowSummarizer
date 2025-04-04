# Contributing to Activity Documentation Tool

We love your input! We want to make contributing to the Activity Documentation Tool as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Process

1. Update the README.md or documentation with details of changes if applicable
2. Update the types and schema.ts file if you've made schema changes
3. The PR should work in development environment
4. PRs are merged once they are reviewed and approved

## Development Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/activity-documentation-tool.git
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with your configuration
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/activity_docs
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Initialize the database
   ```
   npm run db:push
   ```

5. Start the development server
   ```
   npm run dev
   ```

## Code Standards

### JavaScript/TypeScript Style Guide

- Use TypeScript for all new code
- Follow the ESLint configuration provided in the project
- Use async/await instead of promises where possible
- Document public functions with JSDoc comments
- Keep functions small and focused on a single responsibility

### Component Standards

- Use functional components with hooks
- Organize components in a logical folder structure
- Split large components into smaller, reusable ones
- Use ShadCN UI components whenever possible
- Use TypeScript interfaces for props

### CSS/Styling Standards

- Use Tailwind CSS for styling
- Follow the project's established design patterns
- Ensure responsive design works on mobile, tablet, and desktop
- Use CSS variables for theming when possible

## Testing

- Write tests for all new features
- Ensure all tests pass before submitting a PR
- Test your changes in different browsers if making UI changes

## Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/activity-documentation-tool/issues/new).

### Bug Report Template

**Title**: Clear and descriptive title

**Description**: A clear and concise description of what the bug is.

**Steps To Reproduce**:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**: A clear and concise description of what you expected to happen.

**Screenshots**: If applicable, add screenshots to help explain your problem.

**Environment**:
 - OS: [e.g. Windows, macOS]
 - Browser: [e.g. Chrome, Firefox]
 - Version: [e.g. 22]

**Additional Context**: Add any other context about the problem here.

## Feature Requests

We welcome feature requests. Please use the issue tracker with the "enhancement" label to suggest new features.

### Feature Request Template

**Title**: Clear and descriptive title

**Problem**: A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Proposed Solution**: A clear and concise description of what you want to happen.

**Alternatives**: A clear and concise description of any alternative solutions or features you've considered.

**Additional Context**: Add any other context or screenshots about the feature request here.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.