# Activity Documentation Tool Documentation

Welcome to the documentation for the Activity Documentation Tool. This index will help you navigate the various documentation files.

## Table of Contents

1. [Project Overview](../README.md) - Main README file with project description and setup instructions
2. [Screen Capture](SCREEN_CAPTURE.md) - Implementation details of the screenshot capture functionality
3. [AI Integration](AI_INTEGRATION.md) - Documentation of OpenAI and CrewAI implementations
4. [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md) - Techniques for handling large screenshot volumes
5. [API Reference](API_REFERENCE.md) - Comprehensive API endpoint documentation
6. [GitHub Backup Guide](GITHUB_BACKUP.md) - Instructions for backing up the project to GitHub

## Recent Improvements

### Screen Capture Enhancements

We've made significant improvements to the screen capture functionality:

- **Fixed Browser Permissions Issue**: Resolved the issue with repeated browser permission dialogs during Full Screen capture by implementing a persistent stream approach
- **Better Resource Management**: Proper cleanup of media streams and resources to prevent memory leaks
- **Improved User Experience**: Added clear status indicators and feedback during the capture process

### Documentation Structure

The documentation is organized as follows:

- **README.md**: Project overview, features, and getting started guide
- **docs/**: Detailed documentation on specific components and functionality
  - **SCREEN_CAPTURE.md**: Details on the screenshot capture implementation
  - **AI_INTEGRATION.md**: Information on OpenAI and CrewAI integration
  - **PERFORMANCE_OPTIMIZATIONS.md**: Techniques for handling large screenshot volumes
  - **API_REFERENCE.md**: API endpoint documentation
  - **GITHUB_BACKUP.md**: Guide for backing up to GitHub

## Contributing

If you'd like to contribute to the documentation:

1. Follow the [GitHub Backup Guide](GITHUB_BACKUP.md) to set up the repository
2. Make your changes to the relevant documentation files
3. Submit a pull request with a clear description of your changes

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.