'use babel';

import * as path from 'path';

describe('The Icinga Validate provider for Linter', () => {
  const lint = require(path.join('..', 'lib', 'main.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-icinga-validate');
      return atom.packages.activatePackage('language-icinga2').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures', 'clean.conf'))
      );
    });
  });

  describe('checks a file with a syntax issue', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures', 'syntax.conf');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the first message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual("syntax error, unexpected T_IDENTIFIER, expecting ']'");
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+syntax\.conf$/);
          expect(messages[0].range).toBeDefined();
          expect(messages[0].range.length).toBeDefined();
          expect(messages[0].range.length).toEqual(2);
          expect(messages[0].range).toEqual([[3, 3], [3, 4]]);
        });
      });
    });
  });

  describe('checks a file with a warning', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures', 'warning.conf');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the first message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Warning');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual("Apply rule 'satellite-host' for type 'Dependency' does not match anywhere!']'");
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+warning\.conf$/);
          expect(messages[0].range).toBeDefined();
          expect(messages[0].range.length).toBeDefined();
          expect(messages[0].range.length).toEqual(2);
          expect(messages[0].range).toEqual([[3, 3], [3, 4]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures', 'clean.conf');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });
});
