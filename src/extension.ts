// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Keep track of the active editor.
  let activeEditor = vscode.window.activeTextEditor;

  function checkIfActiveEditorShouldBeReadOnly() {
    if (!activeEditor) return;

    const fileUri = activeEditor.document.uri;
    console.debug("active editor URI:", fileUri);

    const filePath = fileUri.fsPath;

    if (shouldBeReadOnly(filePath)) {
      console.debug("setting active editor to read only");

      vscode.window.showInformationMessage("Making active editor read only");

      // TODO: keep track of seen editors and don't mark them read only every
      // time. That way, we can make an editor writable if we want.
      setReadOnly();
    }
  };

  function shouldBeReadOnly(filePath: string) {
    // TODO: get patterns to match from settings
    return filePath.indexOf("noedit") !== -1;
  }

  function setReadOnly() {
    vscode.commands.executeCommand("workbench.action.files.setActiveEditorReadonlyInSession");
  }

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
