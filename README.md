![Preview](https://raw.githubusercontent.com/mschuchard/linter-icinga-validate/master/linter_icinga_validate.png)

### Linter-Icinga-Validate
[![Build Status](https://travis-ci.com/mschuchard/linter-icinga-validate.svg?branch=master)](https://travis-ci.com/mschuchard/linter-icinga-validate)

`Linter-Icinga-Validate` aims to provide functional and robust `icinga2 daemon --validate` linting functionality within Atom.

### Atom Editor Sunset Updates

`apm` was discontinued prior to the sunset by the Atom Editor team. Therefore, the installation instructions are now as follows:

- Locate the Atom packages directory on your filesystem (normally at `<home>/.atom/packages`)
- Retrieve the code from this repository either via `git` or the Code-->Download ZIP option in Github.
- Place the directory containing the repository's code in the Atom packages directory.
- Execute `npm install` in the package directory.

Additionally, this package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented. However, active development on this package has ceased.

### Installation
The `icinga2-bin` package is required to be installed before using this. The `Linter` and `Language-Icinga2` Atom packages are also required.

### Usage
- The Icinga 2 daemon requires elevated user privileges to execute even though the binary does not actually need them. They have plans to remedy this, but until then this linter requires `sudo` to execute the `icinga2` binary executable. Therefore, this linter is only compatible with \*nix systems.
- The only supported method of using `sudo` with this linter is passwordless sudo. This typically requires a valid sudoers entry similar to `username    ALL=NOPASSWD: /usr/sbin/icinga2`.
