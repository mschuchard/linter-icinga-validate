'use babel';

export default {
  config: {
    icingaExecutablePath: {
      title: 'Icinga Executable Path',
      type: 'string',
      description: 'Path to Icinga executable (e.g. /usr/sbin/icinga2) if not in shell env path.',
      default: 'icinga2',
    }
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

        // setup capturing regexps
        const regexError = /Error: (.*)/;
        const regexLoc = /Location:.*conf: (\d+):(\d+)-\d+:(\d+)/;
        const regexWarning = /warning.*: (.*)\(in.*: (\d+):(\d+)-\d+:(\d+)\) (.*)/;
        const regexImport = /Import/

        // initialize args
        const args = [atom.config.get('linter-icinga-validate.icingaExecutablePath'), 'daemon', '-C', '--config', file];

        // perform validation linting
        return helpers.exec('sudo', args, {ignoreExitCode: true}).then(output => {
          // initialize display output vars
          var toReturn = [];
          var theText = '';
          var skipImport = false;

          //parse the output
          output.split(/\r?\n/).forEach((line) => {
            // setup matchers from regexps
            const matchesError = regexError.exec(line);
            const matchesLoc = regexLoc.exec(line);
            const matchesWarning = regexWarning.exec(line);
            const matchesImport = regexImport.exec(line);

            // ignore import errors because they only work on a master
            if (matchesImport != null)
              skipImport = true;
            // capture the error text in a line prior to the location info
            else if (matchesError != null)
              theText = matchesError[1];
            // capture the range info and push all info to be returned
            else if (matchesLoc != null) {
              if (skipImport)
                skipImport = false;
              else {
                toReturn.push({
                  severity: 'error',
                  excerpt: theText,
                  location: {
                    file: file,
                    position: [[Number.parseInt(matchesLoc[1]) - 1, Number.parseInt(matchesLoc[2]) - 1], [Number.parseInt(matchesLoc[1]) - 1, Number.parseInt(matchesLoc[3])]],
                  },
                });
              }
            }
            else if (matchesWarning != null) {
              toReturn.push({
                severity: 'warning',
                excerpt: matchesWarning[1] + matchesWarning[5],
                location: {
                  file: file,
                  position: [[Number.parseInt(matchesWarning[2]) - 1, Number.parseInt(matchesWarning[3]) - 1], [Number.parseInt(matchesWarning[2]) - 1, Number.parseInt(matchesWarning[4])]],
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
