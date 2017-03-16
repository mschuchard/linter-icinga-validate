'use babel';

export default {
  config: {
    icingaExecutablePath: {
      title: 'Icinga Executable Path',
      type: 'string',
      description: 'Path to Icinga executable (e.g. /usr/sbin/icinga2) if not in shell env path.',
      default: 'icinga2',
    },
    passwordlessSudo: {
      title: 'Use passwordless sudo with Icinga 2.',
      type: 'boolean',
      default: true,
    },
    sudoPassword: {
      title: 'Sudo Password',
      type: 'string',
      description: 'Your sudo password (if not using passwordless sudo with Icinga2).',
      default: 'password',
    }
  },

  // activate linter
  activate() {
    require('atom-package-deps').install('linter-icinga-validate');
  },

  provideLinter() {
    return {
      name: 'Icinga',
      grammarScopes: ['source.icinga2'],
      scope: 'file',
      lintOnFly: false,
      lint: (activeEditor) => {
        // setup const vars
        const helpers = require('atom-linter');
        const path = require('path');
        const file = activeEditor.getPath();
        const regex_error = /Error: (.*)/;
        const regex_loc = /Location:.*conf: (\d+):(\d+)/

        // icinga validate performed with passwordless sudo
        if (atom.config.get('linter-icinga-validate.passwordlessSudo')) {
          return helpers.exec('sudo', [atom.config.get('linter-icinga-validate.icingaExecutablePath'), 'daemon', '-C', '--config', file], {ignoreExitCode: true}).then(output => {
            var toReturn = [];
            var the_text = '';

            //parse the output
            output.split(/\r?\n/).forEach(function (line) {
              // setup matchers from regexps
              const matches_error = regex_error.exec(line);
              const matches_loc = regex_loc.exec(line);

              // capture the error text in a line prior to the location info
              if (matches_error != null) {
                the_text = matches_error[1]
              }
              // capture the range info and push all info to be returned
              else if (matches_loc != null) {
                toReturn.push({
                  type: 'Error',
                  severity: 'error',
                  text: the_text,
                  range: [[Number.parseInt(matches_loc[1]) - 1, Number.parseInt(matches_loc[2]) - 1], [Number.parseInt(matches_loc[1]) - 1, Number.parseInt(matches_loc[2])]],
                  filePath: file,
                });
              }
            });
            return toReturn;
          });
        }
        // icinga validate with sudo password
        else {
          return helpers.exec('sudo', ['-S', atom.config.get('linter-icinga-validate.icingaExecutablePath'), 'daemon', '-C', '--config', file], {ignoreExitCode: true, stdin: atom.config.get('linter-icinga-validate.sudoPassword') + "\n", throwOnStdErr: false}).then(output => {
            var toReturn = [];
            var the_text = '';

            //parse the output
            output.split(/\r?\n/).forEach(function (line) {
              // setup matchers from regexps
              const matches_error = regex_error.exec(line);
              const matches_loc = regex_loc.exec(line);

              // capture the error text in a line prior to the location info
              if (matches_error != null) {
                the_text = matches_error[1]
              }
              // capture the range info and push all info to be returned
              else if (matches_loc != null) {
                toReturn.push({
                  type: 'Error',
                  severity: 'error',
                  text: the_text,
                  range: [[Number.parseInt(matches_loc[1]) - 1, Number.parseInt(matches_loc[2]) - 1], [Number.parseInt(matches_loc[1]) - 1, Number.parseInt(matches_loc[2])]],
                  filePath: file,
                });
              }
            });
            return toReturn;
          });
        }
      }
    };
  }
};
