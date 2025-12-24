import * as vscode from 'vscode';

// Invoke the command "File: Set Active Editor Read-only in Session".
function setReadOnly() {
  vscode.commands.executeCommand("workbench.action.files.setActiveEditorReadonlyInSession");
}

function revertFile() {
  vscode.commands.executeCommand("workbench.action.files.revert");
}

// Get the patterns to treat as read only.
function getReadOnlyPatterns(uri: vscode.Uri): object {
  const readOnlyPatterns = vscode.workspace.getConfiguration("", uri).get("autoReadOnly.files");
  if (typeof readOnlyPatterns !== 'object') {
    throw new Error(`invalid type for setting 'autoReadOnly.files': ${typeof readOnlyPatterns}`);
  }
  return readOnlyPatterns ?? {};
}

// Given a TextDocument and glob pattern as a string, check if the underlying
// file matches the glob.
//
// Source - https://stackoverflow.com/a/73793753
// Posted by Jack Punt. See post 'Timeline' for change history.
// Retrieved 2025-12-22, License - CC BY-SA 4.0
export function documentMatchesGlob(doc: vscode.TextDocument, glob: string): boolean {
  // This is pretty janky, but it appears to be the only way to access VS Code's
  // glob implementation from an extension. I'd rather do this so glob behavior
  // is (hopefully) consistent with built-in settings like `files.exclude`.
  return vscode.languages.match({ pattern: glob }, doc) !== 0;
}

// getGlobValueForDocument takes a TextDocument and an object whose keys are
// globs. It tests whether each glob matches the document and returns the value
// of the last glob that matched.
function getGlobValueForDocument<T>(doc: vscode.TextDocument, globs: Record<string, T>): T | undefined
function getGlobValueForDocument<T, D = T>(doc: vscode.TextDocument, globs: Record<string, T>, defaultVal: D): T | D
function getGlobValueForDocument<T>(doc: vscode.TextDocument, globs: Record<string, T>, defaultVal?: T): T | undefined {
  let result: T | undefined = undefined;

  // As of ES2015 (https://stackoverflow.com/a/5525820), object string keys are
  // stored in chronological insertion order, so we can just iterate the list of
  // globs and assume that the user has ordered them from least to most
  // specific. (https://tc39.es/ecma262/#sec-ordinaryownpropertykeys)
  for (let [glob, val] of Object.entries(globs)) {
    if (documentMatchesGlob(doc, glob)) {
      result = val;
    }
  }
  if (result === undefined && defaultVal !== undefined) {
    result = defaultVal;
  }
  return result;
}

// documentMatchesGlobObject takes a TextDocument and an object whose keys are
// globs and whose values are booleans, testing whether the document matches
// each glob one by one. It will return the value of the last glob that matched
// the TextDocument.
export function documentMatchesGlobObject(doc: vscode.TextDocument, globs: Record<string, boolean>): boolean {
  return getGlobValueForDocument(doc, globs, false);
}

// Check if the file open in the active editor should be marked as read only.
function checkIfActiveEditorShouldBeReadOnly(): boolean {
  // Instead of taking the active editor as a function parameter, we retrieve it
  // here every time. There's no point in accepting an arbitrary editor since
  // (as far as I can tell) we can only mark the active text editor as read only
  // with VS Code's extension API.
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return false;
  }

  const fileUri = activeEditor.document.uri;
  const readOnlyPatterns = getReadOnlyPatterns(fileUri);
  if (!readOnlyPatterns) {
    console.debug("no read only patterns configured");
    return false;
  }

  const activeDocument = activeEditor.document;
  return documentMatchesGlobObject(activeDocument, readOnlyPatterns as Record<string, boolean>);
};

// Check if the active editor should be read only and, if it should, mark it as
// read only. Returns true if the editor should be read only, otherwise returns
// false.
function updateActiveEditorReadOnly(): boolean {
  if (!checkIfActiveEditorShouldBeReadOnly()) {
    return false;
  }

  // TODO: keep track of seen editors and don't mark them read only every
  // time. That way, we can make an editor writable if we want.
  setReadOnly();
  return true;
}

export function activate(context: vscode.ExtensionContext) {
  // XXX: consider using vscode.workspace.onDidOpenTextDocument instead of
  // onDidChangeActiveTextEditor.

  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      updateActiveEditorReadOnly();
    }
  }, null, context.subscriptions);

  // Make active editor read only on startup.
  if (updateActiveEditorReadOnly()) {
    // Undo any changes that may have inadvertently happened before the
    // extension loaded. Otherwise, there's a brief period of time where it may
    // be possible to edit the file in the active editor before it's made read
    // only.
    revertFile();
  }
}

export function deactivate() {}
