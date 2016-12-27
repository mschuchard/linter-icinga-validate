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

  activate: () => {
    require('atom-package-deps').install('linter-icinga-validate');
  },

  provideLinter: () => {
    return {
      name: 'Icinga',
      grammarScopes: ['source.icinga2'],
      scope: 'file',
      lintOnFly: false,
      lint: (activeEditor) => {
        const helpers = require('atom-linter');
        const path = require('path');
        const file = activeEditor.getPath();
        const regex = /Error: (.*)/;

        if (aton.config.get('linter-icinga-validate.passwordlessSudo')) {
          return helpers.exec('sudo', [atom.config.get('linter-icinga-validate.icingaExecutablePath'), 'daemon', '-C', '--config', path.dirname(file)], {ignoreExitCode: true}).then(output => {
            var toReturn = [];
            output.split(/\r?\n/).forEach(function (line) {
              const matches = regex.exec(line);
              if (matches != null) {
                toReturn.push({
                  type: 'Error',
                  severity: 'error',
                  text: matches[1],
                  range: 1,
                  //range: [[Number.parseInt(matches[2]) - 1, Number.parseInt(matches[3]) - 1], [Number.parseInt(matches[2]) - 1, Number.parseInt(matches[3])]],
                  filePath: file,
                });
              }
            });
            return toReturn;
          });
        }
        else {
          return helpers.exec('sudo', ['-S', atom.config.get('linter-icinga-validate.icingaExecutablePath'), 'daemon', '-C', '--config', path.dirname(file)], {ignoreExitCode: true, stdin: atom.config.get('linter-icinga-validate.sudoPassword') + "\n", throwOnStdErr: false}).then(output => {
            var toReturn = [];
            output.split(/\r?\n/).forEach(function (line) {
              const matches = regex.exec(line);
              if (matches != null) {
                toReturn.push({
                  type: 'Error',
                  severity: 'error',
                  text: matches[1],
                  range: 1,
                  //range: [[Number.parseInt(matches[2]) - 1, Number.parseInt(matches[3]) - 1], [Number.parseInt(matches[2]) - 1, Number.parseInt(matches[3])]],
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
