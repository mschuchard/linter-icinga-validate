![Preview](https://raw.githubusercontent.com/mschuchard/linter-icinga-validate/master/linter_icinga_validate.png)

### Linter-Icinga-Validate
[![Build Status](https://travis-ci.org/mschuchard/linter-icinga-validate.svg?branch=master)](https://travis-ci.org/mschuchard/linter-icinga-validate)

`Linter-Icinga-Validate` aims to provide functional and robust `icinga2 daemon --validate` linting functionality within Atom.

### Installation
The `icinga2-bin` package is required to be installed before using this. The `Linter` and `Language-Icinga2` Atom packages are also required.

### Usage
- The Icinga 2 daemon requires elevated user privileges to execute even though the binary does not actually need them. They have plans to remedy this, but until then this linter requires `sudo` to execute the `icinga2` binary executable. Therefore, this linter is only compatible with \*nix systems.
- The only supported method of using `sudo` with this linter is passwordless sudo. This typically requires a valid sudoers entry similar to `username    ALL=NOPASSWD: /usr/sbin/icinga2`.
