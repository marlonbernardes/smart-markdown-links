import * as vscode from 'vscode';

class MarkdownLinkDecorator {
    private decoratedType: vscode.TextEditorDecorationType;
    private expandedType: vscode.TextEditorDecorationType;
    private hiddenType: vscode.TextEditorDecorationType;
    private isExpanded = false;
    private currentRange: vscode.Range | null = null;

    constructor() {
        // Decoration type for collapsed (underlined text only) view
        this.decoratedType = vscode.window.createTextEditorDecorationType({
            textDecoration: 'none',
            color: 'transparent',
            letterSpacing: '-100em',
            backgroundColor: new vscode.ThemeColor('editor.background'),
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen
        });

        // Decoration type for expanded (raw markdown) view
        this.expandedType = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
            color: new vscode.ThemeColor('editor.foreground'),
            textDecoration: 'none'
        });

        // Decoration type for hiding parts of long links
        this.hiddenType = vscode.window.createTextEditorDecorationType({
            color: 'transparent',
            backgroundColor: 'transparent',
            textDecoration: 'none'
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
            if (editor && event.document === editor.document && !this.isExpanded) {
                this.updateDecorations(editor);
            }
        }, null, context.subscriptions);

        let isProcessingClick = false;

        // Handle clicks
        vscode.window.onDidChangeTextEditorSelection(event => {
            const editor = event.textEditor;
            if (!editor || isProcessingClick) return;

            isProcessingClick = true;
            const position = event.selections[0].active;

            try {
                if (!this.isExpanded) {
                    const link = this.findLinkAtPosition(editor.document, position);
                    if (link) {
                        this.isExpanded = true;
                        this.currentRange = link.range;
                        this.updateDecorations(editor);

                        // Get the URL part
                        const text = editor.document.getText(link.range);
                        const openParen = text.indexOf('(');
                        const closeParen = text.lastIndexOf(')');
                        if (openParen > 0 && closeParen > openParen) {
                            const startPos = editor.document.positionAt(
                                editor.document.offsetAt(link.range.start) + openParen + 1
                            );
                            const endPos = editor.document.positionAt(
                                editor.document.offsetAt(link.range.start) + closeParen
                            );
                            // Use a timeout to prevent selection event recursion
                            setTimeout(() => {
                                editor.selection = new vscode.Selection(startPos, endPos);
                                isProcessingClick = false;
                            }, 50);
                            return;
                        }
                    }
                } else if (this.currentRange && !this.currentRange.contains(position)) {
                    this.isExpanded = false;
                    this.currentRange = null;
                    this.updateDecorations(editor);
                }
            } finally {
                // Reset flag if not done in the timeout
                isProcessingClick = false;
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
        const hiddenDecorations: vscode.DecorationOptions[] = [];

        let match;
        while ((match = linkRegex.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            if (this.isExpanded && this.currentRange?.isEqual(range)) {
                // Show raw markdown for the expanded link
                expandedDecorations.push({ range });
            } else {
                // Get link text
                const textLength = match[1].length;
                const urlStartPos = editor.document.positionAt(match.index + 1);
                const urlEndPos = editor.document.positionAt(match.index + match[0].length - 1);
                
                // Show only the text for collapsed links
                decorations.push({
                    range,
                    hoverMessage: match[2], // Show URL on hover
                    renderOptions: {
                        before: {
                            contentText: match[1], // link text
                            textDecoration: 'underline',
                            color: new vscode.ThemeColor('textLink.foreground')
                        },
                        after: {
                            contentText: ' ', // space after
                            color: new vscode.ThemeColor('editor.foreground')
                        }
                    }
                });

                // Hide the actual URL part
                const urlRange = new vscode.Range(urlStartPos, urlEndPos);
                hiddenDecorations.push({ range: urlRange });
            }
        }

        editor.setDecorations(this.decoratedType, decorations);
        editor.setDecorations(this.expandedType, expandedDecorations);
        editor.setDecorations(this.hiddenType, hiddenDecorations);
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
