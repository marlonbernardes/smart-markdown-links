# Smart Markdown Links

A VS Code extension that enhances markdown link readability by showing only the link text while preserving the full markdown syntax. Click to expand and edit, click away to collapse.

## Key Features

- 🔍 Clean View: Shows only underlined link text, hiding markdown syntax
- ✏️ Click-to-Edit: Click any link to expand and edit in full markdown format
- 🎯 Smart Selection: Automatically selects link text when expanded
- ⌨️ Natural Typing: No interference when creating new links


## Usage

1. Open any markdown file in VS Code
2. Links in the format `[text](url)` will be displayed as underlined text
3. Click on any link to edit its URL
4. The link text remains unchanged while you can modify the URL

## Example

Instead of seeing:
```
[test](http://example.com)
```

You'll see:
<u>test</u> (underlined and clickable)

## Installation

### Development Setup

1. Clone or download this repository
2. Install Node.js and npm if not already installed
3. Open the project in VS Code
4. Run `npm install` to install dependencies
5. Press F5 to launch a new Extension Development Host window
6. Open a markdown file to test the extension

### Building

```bash
npm run compile
```

### Running in Development

1. Open this project in VS Code
2. Press F5 to launch the Extension Development Host
3. Open a markdown file in the new window
4. Test the link editing functionality

## Requirements

- Visual Studio Code 1.74.0 or higher
- Node.js and npm for development

## Known Issues

- Currently only supports basic markdown link syntax `[text](url)`
- Links must be on a single line

## Release Notes

### 0.0.1

Initial release with basic link display and editing functionality.

## Contributing

Feel free to submit issues and enhancement requests!

## License

This extension is released under the MIT License.
