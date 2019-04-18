'use babel';

import * as path from 'path';

describe('The Icinga Validate provider for Linter', () => {
  const lint = require(path.join(__dirname, '../lib/main.js')).provideLinter().lint;

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
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("syntax error, unexpected T_IDENTIFIER, expecting ']'");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+syntax\.conf$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[7, 2], [7, 7]]);
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
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('warning');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("Apply rule 'satellite-host' for type 'Dependency' does not match anywhere!");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+warning\.conf$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[1, 0], [1, 41]]);
        });
      });
    });
  });

  it('ignores a file with an import issue', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures', 'templates.conf');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
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
