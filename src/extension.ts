// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  function getReadOnlyPatterns(uri: vscode.Uri): object | null {
    let readOnlyPatterns = vscode.workspace.getConfiguration("", uri).get("autoReadOnly.files");
    console.log("readOnlyPatterns:", readOnlyPatterns);
    if (typeof readOnlyPatterns !== 'object') {
      throw `invalid type for readOnlyPatterns: ${typeof readOnlyPatterns}`;
    }
    return readOnlyPatterns;
  }

  // via https://stackoverflow.com/a/73793753
  function documentMatchesGlob(doc: vscode.TextDocument, glob: string): boolean {
    return vscode.languages.match({ pattern: glob }, doc) !== 0;
  }

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
        vscode.window.showInformationMessage("Making active editor read only");

        // TODO: keep track of seen editors and don't mark them read only every
        // time. That way, we can make an editor writable if we want.
        setReadOnly();
        return;
      }
    }
  };


  function setReadOnly() {
    vscode.commands.executeCommand("workbench.action.files.setActiveEditorReadonlyInSession");
  }

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

// This method is called when your extension is deactivated
export function deactivate() {}
