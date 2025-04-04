# GitHub Backup Guide for ScreenCaptureSummarizer

This guide provides comprehensive instructions for backing up your ScreenCaptureSummarizer project to GitHub, including specific steps for Replit environments.

## Prerequisites

1. A GitHub account ([Create one here](https://github.com/join) if needed)
2. Git is already installed in your Replit environment
3. Basic familiarity with Git commands

## Setting Up the GitHub Repository

1. Log in to GitHub at [github.com](https://github.com)
2. Click the "+" icon in the upper right corner and select "New repository"
3. Enter a repository name (e.g., "ScreenCaptureSummarizer")
4. Add a description: "An AI-powered application that captures screenshots, analyzes activities, and generates comprehensive documentation through OpenAI GPT-4o and CrewAI agents."
5. Choose the repository visibility (public or private)
6. **Do not** initialize with README, .gitignore, or license (as we already have these files in the project)
7. Click "Create repository"

## Backing Up from Replit Environment

Replit has Git integration built-in, making it easy to back up your project to GitHub.

### Configuring Git in Replit

1. Open the Shell tab in your Replit project
2. Configure your Git identity (if not already set):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```
3. Initialize Git (if not already initialized):
   ```bash
   git init
   ```
4. Add your GitHub repository as the remote origin:
   ```bash
   git remote add origin https://github.com/yourusername/ScreenCaptureSummarizer.git
   ```
   
### Preparing for Backup

1. Create or update your `.gitignore` file to exclude environment files and large data:
   ```bash
   # Create or check .gitignore
   cat .gitignore
   ```
   
   Make sure it includes these entries:
   ```
   # Environment and secrets
   .env
   .env.local
   .replit
   replit.nix
   
   # Node.js
   node_modules/
   
   # Build outputs
   dist/
   build/
   
   # Large data and logs
   *.log
   uploads/
   tmp/
   ```

2. Make sure your OpenAI API key and database credentials are not hardcoded in any files

### Performing the Initial Backup

Follow these steps for your first backup:

```bash
# First, check what files will be included
git status

# Stage all files for commit (except those in .gitignore)
git add .

# Create the initial commit
git commit -m "Initial commit: ScreenCaptureSummarizer with OpenAI GPT-4o and CrewAI integration"

# If this is your first push, you may need to set the upstream branch
git push -u origin main
```

You may be prompted to enter your GitHub credentials. Use your GitHub username and a personal access token (not your password) when prompted.

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

## Regular Backup Process

We recommend making periodic backups of your ScreenCaptureSummarizer project:

1. After significant feature additions or changes
2. Before major refactoring
3. When reaching stable milestones
4. Before taking a break from development

Follow this simple backup process:

```bash
# Pull any changes if you've made updates from elsewhere
git pull origin main

# See what files have changed
git status

# Add all changes (or specify individual files if preferred)
git add .

# Commit with a descriptive message about what you've changed
git commit -m "Added CrewAI agent configuration controls and improved documentation generation"

# Push to GitHub
git push
```

## Setting Up Project Documentation (Optional)

You can publish your documentation to GitHub Pages:

1. Go to your repository on GitHub
2. Click "Settings" → "Pages"
3. Under "Build and deployment" → "Source", select "Deploy from a branch"
4. Under "Branch", select "main" and the "/docs" folder
5. Click "Save"
6. Your documentation will be published at `https://yourusername.github.io/ScreenCaptureSummarizer/`

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