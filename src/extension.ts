import * as vscode from 'vscode';

// Invoke the command "File: Set Active Editor Read-only in Session".
function setReadOnly() {
  vscode.commands.executeCommand("workbench.action.files.setActiveEditorReadonlyInSession");
}

// Get the patterns to treat as read only.
function getReadOnlyPatterns(uri: vscode.Uri): object | null {
  const readOnlyPatterns = vscode.workspace.getConfiguration("", uri).get("autoReadOnly.files");
  if (typeof readOnlyPatterns !== 'object') {
    throw `invalid type for setting 'autoReadOnly.files': ${typeof readOnlyPatterns}`;
  }
  return readOnlyPatterns;
}

// Given a TextDocument and glob pattern as a string, check if the underlying
// file matches the glob.
//
// Source - https://stackoverflow.com/a/73793753
// Posted by Jack Punt. See post 'Timeline' for change history.
// Retrieved 2025-12-22, License - CC BY-SA 4.0
function documentMatchesGlob(doc: vscode.TextDocument, glob: string): boolean {
  // This is pretty janky, but it appears to be the only way to access VS Code's
  // glob implementation from an extension. I'd rather do this so glob behavior
  // is (hopefully) consistent with built-in settings like `files.exclude`.
  return vscode.languages.match({ pattern: glob }, doc) !== 0;
}

export function activate(context: vscode.ExtensionContext) {
  // Keep track of the active editor.
  let activeEditor = vscode.window.activeTextEditor;

  function checkIfActiveEditorShouldBeReadOnly() {
    if (!activeEditor) return;

    const activeDocument = activeEditor.document;
    const fileUri = activeEditor.document.uri;

    const readOnlyPatterns = getReadOnlyPatterns(fileUri);
    if (!readOnlyPatterns) {
      console.debug("no read only patterns configured");
      return;
    }

    for (let [pattern, enabled] of Object.entries(readOnlyPatterns)) {
      if (!enabled) continue;
      if (documentMatchesGlob(activeDocument, pattern)) {
        // TODO: keep track of seen editors and don't mark them read only every
        // time. That way, we can make an editor writable if we want.
        setReadOnly();
        return;
      }
    }
  };

  // XXX: consider using vscode.workspace.onDidOpenTextDocument instead of
  // onDidChangeActiveTextEditor.

  vscode.window.onDidChangeActiveTextEditor(editor => {
    activeEditor = editor;
    if (editor) {
      checkIfActiveEditorShouldBeReadOnly();
    }
  }, null, context.subscriptions);

  // Make active editor read only on startup.
  checkIfActiveEditorShouldBeReadOnly();
}

export function deactivate() {}
