![Preview](https://raw.githubusercontent.com/mschuchard/linter-icinga-validate/master/linter_icinga_validate.png)

### Linter-Icinga-Validate
Linter-Icinga-Validate aims to provide functional and robust `icinga2 daemon --validate` linting functionality within Pulsar.

This package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented (especially bug fixes). However, active development on this package has ceased.

### Installation
The `icinga2-bin` package is required to be installed before using this. The Atom-IDE-UI and Language-Icinga2 packages are also required.

All testing is performed with the latest stable version of Pulsar. Any version of Atom or any pre-release version of Pulsar is not supported.

### Usage
- The Icinga 2 daemon requires elevated user privileges to execute even though the binary does not actually need them. They have plans to remedy this, but until then this linter requires `sudo` to execute the `icinga2` binary executable. Therefore, this linter is only compatible with \*nix systems.
- The only supported method of using `sudo` with this linter is passwordless sudo. This typically requires a valid sudoers entry similar to `username    ALL=NOPASSWD: /usr/sbin/icinga2`.
