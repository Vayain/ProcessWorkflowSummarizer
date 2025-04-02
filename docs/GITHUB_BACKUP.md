# GitHub Backup Guide

This guide provides step-by-step instructions for backing up your Activity Documentation Tool to GitHub.

## Prerequisites

1. A GitHub account ([Create one here](https://github.com/join) if needed)
2. Git installed on your machine
3. Basic familiarity with Git commands

## Setting Up the GitHub Repository

1. Log in to GitHub at [github.com](https://github.com)
2. Click the "+" icon in the upper right corner and select "New repository"
3. Enter a repository name (e.g., "activity-documentation-tool")
4. Optionally add a description: "A web application that captures, analyzes, and documents user activities using advanced screenshot technology and AI-powered insights."
5. Choose the repository visibility (public or private)
6. Check "Add a README file" if you haven't already created one locally
7. Select "MIT License" from the "Add a license" dropdown if you haven't already created one locally
8. Click "Create repository"

## Configuring Git in Your Project

If you're starting from your Replit project:

1. Open a terminal in your project directory
2. Initialize Git (if not already initialized):
   ```bash
   git init
   ```
3. Add your GitHub repository as the remote origin:
   ```bash
   git remote add origin https://github.com/yourusername/activity-documentation-tool.git
   ```

## Preparing for Backup

1. Make sure your .gitignore file is properly configured to exclude sensitive data and large files (this has already been created for you)
2. Ensure that no API keys or sensitive credentials are hardcoded in your project files

## Backing Up to GitHub

Follow these commands to commit and push your project to GitHub:

```bash
# Stage all files for commit
git add .

# Create an initial commit with a descriptive message
git commit -m "Initial commit: Activity Documentation Tool with AI-powered analysis"

# Push to the GitHub repository
git push -u origin main
```

If you're using a different branch name (like "master" instead of "main"), adjust the command accordingly.

## Updating Your GitHub Repository

After making changes to your project, use these commands to update your GitHub repository:

```bash
# Stage changes
git add .

# Commit with a descriptive message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## Setting Up GitHub Pages (Optional)

If you want to create a project website, you can use GitHub Pages:

1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select the branch you want to deploy (usually "main")
5. Choose the "/docs" folder if you want to use your documentation as a website
6. Click "Save"
7. Your site will be published at `https://yourusername.github.io/activity-documentation-tool/`

## Best Practices

1. Commit frequently with clear, descriptive commit messages
2. Use branches for new features or significant changes
3. Create [Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) for stable versions
4. Update documentation when making significant changes
5. Consider using [GitHub Issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues) to track bugs and feature requests

## Collaboration

If you're working with others:

1. Add collaborators in your repository settings
2. Set up branch protection rules for important branches
3. Use pull requests for code reviews
4. Consider establishing a contributing guide

## GitHub Actions (Advanced)

You can set up GitHub Actions for automated testing, building, or deployment:

1. Create a `.github/workflows` directory
2. Add YAML files defining your workflows
3. Example basic workflow for Node.js:

```yaml
name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test
```

## Additional Resources

- [GitHub Documentation](https://docs.github.com/)
- [GitHub Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub CLI](https://cli.github.com/) for command-line management of GitHub
- [GitHub Desktop](https://desktop.github.com/) for a GUI alternative