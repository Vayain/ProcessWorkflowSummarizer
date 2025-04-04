#!/bin/bash

# GitHub Backup Script for Activity Documentation Tool
# This script helps you push your local repository to GitHub

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git first."
    exit 1
fi

# Initialize variables
GITHUB_USERNAME=""
REPO_NAME="activity-documentation-tool"
GITHUB_TOKEN=""

# Ask for GitHub username if not provided
if [ -z "$GITHUB_USERNAME" ]; then
    read -p "Enter your GitHub username: " GITHUB_USERNAME
fi

# Ask for GitHub personal access token if not provided
if [ -z "$GITHUB_TOKEN" ]; then
    read -p "Enter your GitHub personal access token: " GITHUB_TOKEN
fi

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Initialize git repository if not already initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Check if remote origin exists
if ! git remote | grep -q "origin"; then
    echo "Adding GitHub remote repository..."
    git remote add origin https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git
else
    echo "Updating GitHub remote repository..."
    git remote set-url origin https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git
fi

# Create repository on GitHub if it doesn't exist
echo "Creating repository on GitHub if it doesn't exist..."
curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"${REPO_NAME}\",\"description\":\"Activity Documentation Tool with AI-Powered Analysis\",\"private\":false}" > /dev/null

# Stage all files
git add .

# Commit changes if there are any
if git diff --staged --quiet; then
    echo "No changes to commit"
else
    echo "Committing changes..."
    git commit -m "Backup: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin master || git push -u origin main

echo "Backup completed successfully!"
echo "Your repository is available at: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"