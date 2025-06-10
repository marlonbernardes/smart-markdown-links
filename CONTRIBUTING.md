# Contributing to Markdown Link Editor

Thank you for your interest in contributing to this extension! This guide will help you get started with development.

## Development Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

## Setting Up the Development Environment

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd markdown-link-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Open in VS Code:
   ```bash
   code .
   ```

## Development Workflow

### Running the Extension

1. Press `F5` to launch a new Extension Development Host window
2. Open a markdown file in the new window
3. Try the extension features:
   - View links in clean format
   - Click to expand and edit
   - Create new links

### Making Changes

1. Main extension code is in `src/extension.ts`
2. Key components:
   - `MarkdownLinkDecorator` class handles link display and interaction
   - Editor decorations for clean and expanded views
   - Event handlers for clicks and document changes

3. Build and Test:
   ```bash
   npm run compile
   ```
   Then press F5 to test your changes.

### Code Style

1. TypeScript Guidelines:
   - Use strict mode
   - Declare types explicitly
   - Use interfaces for complex objects
   - Follow existing code patterns

2. VS Code API:
   - Use proper event handlers
   - Clean up disposables
   - Follow VS Code extension guidelines
   - Use theme-aware colors

3. Error Handling:
   - Handle edge cases gracefully
   - Provide meaningful error messages
   - Validate user input

## Pull Request Process

1. Create a descriptive branch name
2. Make focused, atomic changes
3. Update documentation as needed
4. Test thoroughly
5. Submit PR with clear description

### Testing Checklist

- [ ] Extension activates correctly
- [ ] Links display in clean format
- [ ] Clicking expands links correctly
- [ ] Link text is selected on expansion
- [ ] Editing works without interference
- [ ] Links collapse correctly
- [ ] Works with various markdown files
- [ ] No console errors

## Need Help?

- Check existing issues
- Create a new issue for questions
- Ask for clarification in PRs

## License

By contributing, you agree to license your code under the MIT License.
