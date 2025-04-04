# User Guide

Welcome to the Activity Documentation Tool! This guide will help you get the most out of the application.

## Introduction

The Activity Documentation Tool helps you document user activities through automated screenshots, AI analysis, and documentation generation. Whether you're creating tutorials, documenting workflows, or capturing user testing sessions, this tool makes the process efficient and intelligent.

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Edge, or Safari)
- Internet connection
- Screen or window you wish to capture

### Setting Up

1. Launch the application by navigating to the URL in your browser
2. You'll be presented with the main dashboard
3. The first time you use the application, you'll need to set up a session

### Creating a New Session

1. Click the "New" button in the sidebar under "Current Session"
2. Enter a name for your session (e.g., "Website Tutorial Documentation")
3. Click "Create"

## Capturing Screenshots

### Selecting the Capture Input

1. In the "Capture Settings" section, click the "Choose Input" button
2. Your browser will prompt you to select a capture source:
   - **Entire Screen**: Captures your entire display
   - **Window**: Captures a specific application window
   - **Tab**: Captures only the current browser tab
3. Select the appropriate source
4. You'll see a preview of what will be captured in the live view area

### Configuring Capture Settings

1. **Capture Interval**: Use the slider to set how frequently screenshots are taken (1-60 seconds)
2. **Screenshot Format**: Choose between PNG (higher quality) or JPEG (smaller file size)
3. **Real-time AI Analysis**: Toggle on to have AI analyze each screenshot as it's captured

### Starting and Stopping Capture

1. Once you've selected your input source and configured settings, click the "Start Capture" button
2. Screenshots will be taken automatically at the interval you specified
3. You'll see screenshots appear in the gallery as they're captured
4. To stop capturing, click the "Stop" button

## Working with Screenshots

### Viewing Screenshots

1. All captured screenshots appear in the gallery panel
2. Click on a screenshot to view it in full size
3. The AI-generated description will be shown alongside the screenshot

### Sorting and Filtering

1. Use the sort dropdown to organize screenshots by newest or oldest
2. Filter buttons allow you to view screenshots based on their analysis status

### Editing Descriptions

1. Click the edit icon (pencil) on a screenshot
2. Modify the description in the editor that appears
3. Click "Save" to update the description

### Deleting Screenshots

1. Hover over a screenshot in the gallery
2. Click the delete icon (trash can)
3. Confirm deletion when prompted

## Generating Documentation

### Configuring Documentation

1. Click the "Generate Documentation" button
2. Choose your preferred format:
   - **Markdown**: Simple text format
   - **HTML**: Web-based format
   - **PDF**: Document format for sharing
3. Select the detail level:
   - **Minimal**: Brief overview with key screenshots
   - **Standard**: Balanced documentation with essential details
   - **Detailed**: Comprehensive documentation with all screenshots

### Reviewing Generated Documentation

1. Once generated, the documentation will be displayed in the documentation viewer
2. Review the content to ensure it meets your needs
3. Make any necessary adjustments by editing screenshot descriptions and regenerating

### Exporting Documentation

1. Click the "Download" button in the documentation viewer
2. Choose your preferred download format
3. The file will be saved to your computer

## Advanced Features

### AI Analysis Options

In the settings, you can customize how the AI analyzes your screenshots:

1. **Real-time Analysis**: Analyzes each screenshot as it's captured
2. **Batch Analysis**: Analyzes all screenshots at once when you generate documentation

### Session Management

1. View all previous sessions in the sidebar
2. Click on a session to load its screenshots
3. All sessions are saved automatically

### Customizing the Capture Area

By default, the entire selected input is captured. If your chosen browser or system supports it, you may be able to select specific areas within the input source during the selection process.

## Troubleshooting

### Screenshot Capture Issues

**Problem**: Screenshots aren't being captured
**Solution**:
- Ensure you've granted the necessary permissions to the browser
- Try selecting a different input source
- Check if your browser is up to date

**Problem**: Screenshots are low quality
**Solution**:
- Switch to PNG format in the settings
- Ensure your display resolution is set appropriately

### AI Analysis Issues

**Problem**: AI descriptions seem inaccurate
**Solution**:
- Ensure screenshots clearly show the activity
- Edit descriptions manually where needed
- Consider a different capture angle or zoom level

**Problem**: Analysis is taking too long
**Solution**:
- Turn off real-time analysis for faster capturing
- Process analysis in batch mode later

### Documentation Generation Issues

**Problem**: Documentation is missing some screenshots
**Solution**:
- Check if those screenshots were deleted
- Ensure all screenshots have completed AI analysis

**Problem**: Documentation format doesn't look right
**Solution**:
- Try a different output format
- Ensure your browser is up to date

## Tips and Best Practices

1. **Start with a plan**: Know what you want to document before starting
2. **Use shorter intervals** for fast-changing activities
3. **Use longer intervals** for slow or infrequent changes
4. **Edit descriptions** for important screenshots to ensure accuracy
5. **Review before generating** documentation to ensure quality
6. **Choose the right format** for your audience

## Keyboard Shortcuts

| Key Combination | Action |
|----------------|--------|
| `Ctrl + N` | New session |
| `Ctrl + S` | Start/Stop capture |
| `Ctrl + D` | Generate documentation |
| `Esc` | Close any open modal |

## Privacy and Data

- All screenshots are stored locally in the application's database
- No screenshots are shared with third parties
- AI analysis is performed through secure API calls to OpenAI
- Consider what sensitive information might be visible in your screenshots

## Getting Help

If you encounter any issues or have questions:

1. Check this user guide for instructions
2. Refer to the troubleshooting section
3. Contact support at support@activitydocumentor.com