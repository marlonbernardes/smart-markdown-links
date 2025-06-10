import * as vscode from 'vscode';

class MarkdownLinkDecorator {
    private decoratedType: vscode.TextEditorDecorationType;
    private expandedType: vscode.TextEditorDecorationType;
    private isExpanded = false;
    private currentRange: vscode.Range | null = null;

    constructor() {
        // Decoration type for collapsed (underlined text only) view
        this.decoratedType = vscode.window.createTextEditorDecorationType({
            textDecoration: 'none',
            cursor: 'pointer',
            opacity: '0',
            letterSpacing: '-100em',
            backgroundColor: new vscode.ThemeColor('editor.background'),
            after: {
                contentText: '',
                textDecoration: 'underline',
                color: new vscode.ThemeColor('textLink.foreground')
            }
        });

        // Decoration type for expanded (raw markdown) view
        this.expandedType = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.selectionBackground'),
            color: new vscode.ThemeColor('editor.foreground')
        });
    }

    public activate(context: vscode.ExtensionContext) {
        // Update decorations when editor changes
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                this.updateDecorations(editor);
            }
        }, null, context.subscriptions);

        // Update decorations when document changes
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                const position = editor.selection.active;
                const link = this.findLinkAtPosition(editor.document, position);
                
                if (link && this.isExpanded) {
                    // Keep expanded state while editing
                    this.currentRange = link.range;
                    this.updateDecorations(editor);
                } else if (!this.isCursorInAnyLink(editor)) {
                    this.isExpanded = false;
                    this.currentRange = null;
                    this.updateDecorations(editor);
                }
            }
        }, null, context.subscriptions);

        // Handle clicks
        vscode.window.onDidChangeTextEditorSelection(event => {
            const editor = event.textEditor;
            const position = event.selections[0].active;

            if (this.isExpanded && this.currentRange && !this.currentRange.contains(position)) {
                // Click outside the expanded link - collapse it
                this.isExpanded = false;
                this.currentRange = null;
                this.updateDecorations(editor);
            } else if (!this.isExpanded) {
                // Check if click is on a link
                const link = this.findLinkAtPosition(editor.document, position);
                if (link) {
                    this.isExpanded = true;
                    this.currentRange = link.range;
                    this.updateDecorations(editor);

                    // Select the text portion of the link (between [ and ])
                    const startPos = editor.document.positionAt(
                        editor.document.offsetAt(link.range.start) + 1
                    );
                    const text = editor.document.getText(link.range);
                    const closeBracket = text.indexOf(']');
                    if (closeBracket > 0) {
                        const endPos = editor.document.positionAt(
                            editor.document.offsetAt(link.range.start) + closeBracket
                        );
                        editor.selection = new vscode.Selection(startPos, endPos);
                    }
                }
            }
        }, null, context.subscriptions);

        // Initial decoration
        if (vscode.window.activeTextEditor) {
            this.updateDecorations(vscode.window.activeTextEditor);
        }
    }

    private isCursorInAnyLink(editor: vscode.TextEditor): boolean {
        const position = editor.selection.active;
        const line = editor.document.lineAt(position.line).text;
        const text = editor.document.getText();

        let lastLinkStart = -1;
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            if (range.contains(position)) {
                return true;
            }
        }

        return false;
    }

    private updateDecorations(editor: vscode.TextEditor) {
        const text = editor.document.getText();
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const decorations: vscode.DecorationOptions[] = [];
        const expandedDecorations: vscode.DecorationOptions[] = [];

        let match;
        while ((match = linkRegex.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            if (this.isExpanded && this.currentRange?.isEqual(range)) {
                // Show raw markdown for the expanded link
                expandedDecorations.push({ range });
            } else {
                // Show only the text for collapsed links
                decorations.push({
                    range,
                    renderOptions: {
                        after: {
                            contentText: match[1] // link text
                        }
                    }
                });
            }
        }

        editor.setDecorations(this.decoratedType, decorations);
        editor.setDecorations(this.expandedType, expandedDecorations);
    }

    private findLinkAtPosition(document: vscode.TextDocument, position: vscode.Position): { range: vscode.Range } | null {
        const text = document.getText();
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

        let match;
        while ((match = linkRegex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            if (range.contains(position)) {
                return { range };
            }
        }

        return null;
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Smart Markdown Links extension is now active!');
    const decorator = new MarkdownLinkDecorator();
    decorator.activate(context);
}

export function deactivate() {
    console.log('Smart Markdown Links extension is now deactivated');
}
