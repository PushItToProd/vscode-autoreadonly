This directory is a VS Code workspace for manual functional testing.

- `.vscode/settings.json` holds the workspace config with the setting `autoReadOnly.files`.
- `bonjour.txt` should be writable since it doesn't match any glob in the settings.
- `hello.noedit.txt` should not be writable since it matches the glob `**/*noedit*`, which is set to `true`.
- `hola.noedit.txt` should be writable since it matches the glob `**/hola.noedit.*`, which is set to `false`.
