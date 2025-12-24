import * as assert from 'assert';
import * as vscode from 'vscode';
import { documentMatchesGlob, documentMatchesMultiGlob } from '../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('documentMatchesGlob matches patterns correctly', () => {
        const mockMdDoc = {
            uri: vscode.Uri.file('/path/to/file.md'),
            fileName: 'file.md',
            languageId: 'markdown'
        } as unknown as vscode.TextDocument;

        assert.strictEqual(documentMatchesGlob(mockMdDoc, '**/*.md'), true);
        assert.strictEqual(documentMatchesGlob(mockMdDoc, '**/*.ts'), false);

        const mockNodeModulesDoc = {
            uri: vscode.Uri.file('/home/user/my_project/node_modules/file.js'),
            fileName: 'file.js',
            languageId: 'javascript'
        } as unknown as vscode.TextDocument;
        const mockSrcDoc = {
            uri: vscode.Uri.file('/home/user/my_project/src/file.js'),
            fileName: 'file.js',
            languageId: 'javascript'
        } as unknown as vscode.TextDocument;
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

        const mockSrcFileDoc = {
            uri: vscode.Uri.file('/home/user/project/src/file.js'),
            fileName: 'file.js',
            languageId: 'javascript'
        } as unknown as vscode.TextDocument;
        assert.strictEqual(documentMatchesMultiGlob(mockSrcFileDoc, globs), false);

        const mockNodeModulesFileDoc = {
            uri: vscode.Uri.file('/home/user/project/node_modules/some_package/file.js'),
            fileName: 'file.js',
            languageId: 'javascript'
        } as unknown as vscode.TextDocument;
        assert.strictEqual(documentMatchesMultiGlob(mockNodeModulesFileDoc, globs), true);

        const mockSpecialNodeModulesFileDoc = {
            uri: vscode.Uri.file('/home/user/project/node_modules/special/file.js'),
            fileName: 'file.js',
            languageId: 'javascript'
        } as unknown as vscode.TextDocument;
        assert.strictEqual(documentMatchesMultiGlob(mockSpecialNodeModulesFileDoc, globs), false);
    });
});
