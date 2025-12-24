import * as assert from 'assert';
import * as vscode from 'vscode';
import { documentMatchesGlob, documentMatchesGlobObject } from '../extension';

// Create a mock TextDocument suitable for testing documentMatchesGlob().
function mockTextDocument(path: string): vscode.TextDocument {
  // Just specifying a uri is sufficient for vscode.languages.match() (which
  // documentMatchesGlob() relies on) to check if it matches the glob.
  return {uri: vscode.Uri.file(path)} as vscode.TextDocument;
}

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('documentMatchesGlob matches patterns correctly', () => {
        const mockMdDoc = mockTextDocument('/path/to/file.md');

        assert.strictEqual(documentMatchesGlob(mockMdDoc, '**/*.md'), true);
        assert.strictEqual(documentMatchesGlob(mockMdDoc, '**/*.ts'), false);

        const mockNodeModulesDoc = mockTextDocument('/home/user/my_project/node_modules/file.js');
        const mockSrcDoc = mockTextDocument('/home/user/my_project/src/file.js');
        const nodeModulesGlob = '**/node_modules/**';
        const srcGlob = '**/src/**';

        assert.strictEqual(documentMatchesGlob(mockNodeModulesDoc, nodeModulesGlob), true);
        assert.strictEqual(documentMatchesGlob(mockSrcDoc, nodeModulesGlob), false);
        assert.strictEqual(documentMatchesGlob(mockNodeModulesDoc, srcGlob), false);
        assert.strictEqual(documentMatchesGlob(mockSrcDoc, srcGlob), true);
    });

    test('documentMatchesMultiGlob matches multiple patterns correctly', () => {
        const globs = {
            '**/node_modules/**': true,
            '**/node_modules/special/**': false,
            '**/src/**': false,
            '**/src/out/**': true,
        };

        const mockSrcFileDoc = mockTextDocument('/home/user/project/src/file.js');
        assert.strictEqual(documentMatchesGlobObject(mockSrcFileDoc, globs), false);

        const mockNodeModulesFileDoc = mockTextDocument('/home/user/project/node_modules/some_package/file.js');
        assert.strictEqual(documentMatchesGlobObject(mockNodeModulesFileDoc, globs), true);

        const mockSpecialNodeModulesFileDoc = mockTextDocument('/home/user/project/node_modules/special/file.js');
        assert.strictEqual(documentMatchesGlobObject(mockSpecialNodeModulesFileDoc, globs), false);
    });
});
