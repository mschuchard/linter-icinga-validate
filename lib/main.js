'use babel';

export default {
  config: {
    icingaExecutablePath: {
      title: 'Icinga Executable Path',
      type: 'string',
      description: 'Path to Icinga executable (e.g. /usr/sbin/icinga2) if not in shell env path.',
      default: 'icinga2',
    },
  },

  deactivate() {
    this.idleCallbacks.forEach((callbackID) => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'Icinga',
      grammarScopes: ['source.icinga2'],
      scope: 'file',
      lintsOnChange: false,
      lint: async (textEditor) => {
        // setup const vars
        const helpers = require('atom-linter');
        const file = textEditor.getPath();

        // initialize args
        const args = [atom.config.get('linter-icinga-validate.icingaExecutablePath'), 'daemon', '-C', '--config', file];

        // perform validation linting
        return helpers.exec('sudo', args, { ignoreExitCode: true }).then(output => {
          // initialize display output vars
          const toReturn = [];
          let theExcerpt = '';
          let skipImport = false;

          // parse the output
          output.split(/\r?\n/).forEach((line) => {
            // setup matchers from regexps
            const matchesError = /Error: (.*)/.exec(line);
            const matchesLoc = /Location:.*conf: (\d+):(\d+)-\d+:(\d+)/.exec(line);
            const matchesWarning = /warning.*: (.*)\(in.*: (\d+):(\d+)-\d+:(\d+)\) (.*)/.exec(line);
            const matchesImport = /Import/.exec(line);

            // ignore import errors because they only work on a master
            if (matchesImport != null) skipImport = true;
            // capture the error text in a line prior to the location info
            else if (matchesError != null) theExcerpt = matchesError[1];
            // capture the range info and push all info to be returned
            else if (matchesLoc != null) {
              if (skipImport) skipImport = false;
              else {
                toReturn.push({
                  severity: 'error',
                  excerpt: theExcerpt,
                  location: {
                    file,
                    position: [[Number.parseInt(matchesLoc[1], 10) - 1, Number.parseInt(matchesLoc[2], 10) - 1], [Number.parseInt(matchesLoc[1], 10) - 1, Number.parseInt(matchesLoc[3], 10)]],
                  },
                });
              }
            } else if (matchesWarning != null) {
              toReturn.push({
                severity: 'warning',
                excerpt: matchesWarning[1] + matchesWarning[5],
                location: {
                  file,
                  position: [[Number.parseInt(matchesWarning[2], 10) - 1, Number.parseInt(matchesWarning[3], 10) - 1], [Number.parseInt(matchesWarning[2], 10) - 1, Number.parseInt(matchesWarning[4], 10)]],
                },
              });
            }
          });
          return toReturn;
        });
      }
    };
  }
};
