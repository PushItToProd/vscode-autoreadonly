import * as vscode from 'vscode';

function setReadOnly() {
  vscode.commands.executeCommand("workbench.action.files.setActiveEditorReadonlyInSession");
}

function getReadOnlyPatterns(uri: vscode.Uri): object | null {
  const readOnlyPatterns = vscode.workspace.getConfiguration("", uri).get("autoReadOnly.files");
  if (typeof readOnlyPatterns !== 'object') {
    throw `invalid type for setting 'autoReadOnly.files': ${typeof readOnlyPatterns}`;
  }
  return readOnlyPatterns;
}

// via https://stackoverflow.com/a/73793753
function documentMatchesGlob(doc: vscode.TextDocument, glob: string): boolean {
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
