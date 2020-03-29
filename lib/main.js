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

  provideLinter() {
    return {
      name: 'Icinga',
      grammarScopes: ['source.icinga2'],
      scope: 'file',
      lintsOnChange: false,
      lint: (activeEditor) => {
        // setup const vars
        const helpers = require('atom-linter');
        const file = activeEditor.getPath();

        // setup capturing regexps
        const regex_error = /Error: (.*)/;
        const regex_loc = /Location:.*conf: (\d+):(\d+)-\d+:(\d+)/;
        const regex_warning = /warning.*: (.*)\(in.*: (\d+):(\d+)-\d+:(\d+)\) (.*)/;
        const regex_import = /Import/

        // initialize args and settings
        var args = [atom.config.get('linter-icinga-validate.icingaExecutablePath'), 'daemon', '-C', '--config', file];
        var opts = {ignoreExitCode: true};

        // perform validation linting
        return helpers.exec('sudo', args, opts).then(output => {
          // initialize display output vars
          var toReturn = [];
          var the_text = '';
          var skipImport = false;

          //parse the output
          output.split(/\r?\n/).forEach((line) => {
            // setup matchers from regexps
            const matches_error = regex_error.exec(line);
            const matches_loc = regex_loc.exec(line);
            const matches_warning = regex_warning.exec(line);
            const matches_import = regex_import.exec(line);

            // ignore import errors because they only work on a master
            if (matches_import != null)
              skipImport = true;
            // capture the error text in a line prior to the location info
            else if (matches_error != null)
              the_text = matches_error[1];
            // capture the range info and push all info to be returned
            else if (matches_loc != null) {
              if (skipImport)
                skipImport = false;
              else {
                toReturn.push({
                  severity: 'error',
                  excerpt: the_text,
                  location: {
                    file: file,
                    position: [[Number.parseInt(matches_loc[1]) - 1, Number.parseInt(matches_loc[2]) - 1], [Number.parseInt(matches_loc[1]) - 1, Number.parseInt(matches_loc[3])]],
                  },
                });
              }
            }
            else if (matches_warning != null) {
              toReturn.push({
                severity: 'warning',
                excerpt: matches_warning[1] + matches_warning[5],
                location: {
                  file: file,
                  position: [[Number.parseInt(matches_warning[2]) - 1, Number.parseInt(matches_warning[3]) - 1], [Number.parseInt(matches_warning[2]) - 1, Number.parseInt(matches_warning[4])]],
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
