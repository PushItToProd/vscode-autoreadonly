# Auto-readonly for VS Code

This extension automatically sets VS Code editors to read only when viewing files matching a set of patterns. This is accomplished using the built-in command "File: Set Active Editor Read-only in Session", leaving the underlying file and its permissions unchanged on disk.

To temporarily override this for a particular file, you can use the commands "File: Reset Active Editor Read-only in Session" or "File: Set Active Editor Writeable in Session".

## Motivation

* I frequently look at the source code of libraries I'm using, but it's annoyingly easy to edit these by mistake (e.g. starting to type thinking a different editor is currently focused).
* Similarly, when using a language like TypeScript or Go with `go:generate`, I've found it annoyingly easy to mistakenly edit a generated file.

 I've never actually had either of these problems cause me any issues, but an unnoticed stray keystroke in the wrong file could be a serious pain.

Ideally, I'd like library files and generated files to be marked readonly, but lots of tools don't do that, so this is my fallback option to avoid making silly mistakes.

## Features

By default, this extension includes patterns for a few common paths that may contain library code: 

* `node_modules` for JavaScript
* `venv` and `.venv` for Python
* `/home/linuxbrew` and `/opt/homebrew` for Homebrew
* `/home/*/go/pkg` and  `/home/*/go/pkg` for Golang

You can add more using the setting `autoReadOnly.files`. This setting can be overriden on a workspace and folder level.

Another use case is for generated code files. For example, if you're writing a project in pure TypeScript, you might add `**/*.js` to your workspace settings to avoid editing any JS files by mistake.

## Requirements

None.

## Extension Settings

* `autoReadOnly.files`: An object whose keys should be glob patterns matching files to mark as read only and with boolean values. Patterns will be ignored if their boolean value is not `true`.

## Known Issues

* Currently, this runs every time the active editor changes, so if you manually set a document as writable, switch focus, and switch back, the editor will become readonly again. I have no need for this use case, so I don't think it's currently worth trying to fix.
