# ✨ Lint Action

- **Shows linting errors** on GitHub commits and PRs
- Allows **auto-fixing** issues
- Supports [many linters and formatters](#supported-tools)

_**Note:** The behavior of actions like this one is currently limited in the context of forks. See [Limitations](#limitations)._

## Screenshots

- Checks on pull requests:

  <img src="./.github/screenshots/check-runs.png" alt="Screenshot of check runs" width="75%" />

- Commit annotations:

  <img src="./.github/screenshots/check-annotations.png" alt="Screenshot of ESLint annotations" width="90%" />

## Supported tools

- **CSS:**
  - [stylelint](https://stylelint.io)
- **Go:**
  - [gofmt](https://golang.org/cmd/gofmt)
  - [golint](https://github.com/golang/lint)
- **JavaScript:**
  - [ESLint](https://eslint.org)
  - [Prettier](https://prettier.io)
  - [XO](https://github.com/xojs/xo)
- **PHP:**
  - [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer)
- **Python:**
  - [Black](https://black.readthedocs.io)
  - [Flake8](http://flake8.pycqa.org)
  - [Mypy](https://mypy.readthedocs.io/)
- **Ruby:**
  - [RuboCop](https://rubocop.readthedocs.io)
- **Swift:**
  - [swift-format](https://github.com/apple/swift-format) (official)
  - [SwiftFormat](https://github.com/nicklockwood/SwiftFormat) (by Nick Lockwood)
  - [SwiftLint](https://github.com/realm/SwiftLint)

## Usage

Create a new GitHub Actions workflow in your project, e.g. at `.github/workflows/lint.yml`. The content of the file should be in the following format:

```yml
name: Lint

on: push

jobs:
  run-linters:
    name: Run linters
    runs-on: ubuntu-latest

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v2

      # Install your linters here

      - name: Run linters
        uses: samuelmeuli/lint-action@v1
        with:
          github_token: ${{ secrets.github_token }}
          # Enable your linters here
```

## Examples

All linters are disabled by default. To enable a linter, simply set the option with its name to `true`, e.g. `eslint: true`.

The action doesn't install the linters for you; you are responsible for installing them in your CI environment.

### JavaScript example (ESLint and Prettier)

```yml
name: Lint

on: push

jobs:
  run-linters:
    name: Run linters
    runs-on: ubuntu-latest

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v1
        with:
          node-version: 12

      # ESLint and Prettier must be in `package.json`
      - name: Install Node.js dependencies
        run: npm install

      - name: Run linters
        uses: samuelmeuli/lint-action@v1
        with:
          github_token: ${{ secrets.github_token }}
          # Enable linters
          eslint: true
          prettier: true
```

### Python example (Flake8 and Black)

```yml
name: Lint

on: push

jobs:
  run-linters:
    name: Run linters
    runs-on: ubuntu-latest

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v1
        with:
          python-version: 3.8

      - name: Install Python dependencies
        run: pip install black flake8

      - name: Run linters
        uses: samuelmeuli/lint-action@v1
        with:
          github_token: ${{ secrets.github_token }}
          # Enable linters
          black: true
          flake8: true
```

## Configuration

### Linter-specific options

`[linter]` can be one of `black`, `eslint`, `flake8`, `gofmt`, `golint`, `mypy`, `prettier`, `rubocop`, `stylelint`, `swift_format_official`, `swift_format_lockwood`, `swiftlint` and `xo`:

- **`[linter]`:** Enables the linter in your repository. Default: `false`
- **`[linter]_args`**: Additional arguments to pass to the linter. Example: `eslint_args: "--max-warnings 0"` if ESLint checks should fail even if there are no errors and only warnings. Default: `""`
- **`[linter]_dir`**: Directory where the linting command should be run. Example: `eslint_dir: server/` if ESLint is installed in the `server` subdirectory. Default: Repository root
- **`[linter]_extensions`:** Extensions of files to check with the linter. Example: `eslint_extensions: js,ts` to lint JavaScript and TypeScript files with ESLint. Default: Varies by linter, see [`action.yml`](./action.yml)
- **`[linter]_command_prefix`:** Command prefix to be run before the linter command. Default: `""`.

### General options

- **`auto_fix`:** Whether linters should try to fix code style issues automatically. If some issues can be fixed, the action will commit and push the changes to the corresponding branch. Default: `false`

  <p align="center">
    <img src="./.github/screenshots/auto-fix.png" alt="Screenshot of auto-fix commit" width="80%" />
  </p>

- **`git_name`**: Username for auto-fix commits. Default: `"Lint Action"`

- **`git_email`**: Email address for auto-fix commits. Default: `"lint-action@samuelmeuli.com"`

- **`commit_message`**: Template for auto-fix commit messages. The `${linter}` variable can be used to insert the name of the linter. Default: `"Fix code style issues with ${linter}"`

## Limitations

There are currently some limitations as to how this action (or any other action) can be used in the context of `pull_request` events from forks:

- The action doesn't have permission to push auto-fix changes to the fork. This is because the `pull_request` event runs on the upstream repo, where the `github_token` is lacking permissions for the fork. [Source](https://github.community/t5/GitHub-Actions/Can-t-push-to-forked-repository-on-the-original-repository-s/m-p/35916/highlight/true#M2372)
- The action doesn't have permission to create annotations for commits on forks and can therefore not display linting errors. [Source 1](https://github.community/t5/GitHub-Actions/Token-permissions-for-forks-once-again/m-p/33839), [source 2](https://github.com/actions/labeler/issues/12)

For details and comments, please refer to [#13](https://github.com/samuelmeuli/lint-action/issues/13).

## Development

### Contributing

Suggestions and contributions are always welcome! Please discuss larger changes via issue before submitting a pull request.

### Adding a new linter

If you want to add support for an additional linter, please open an issue to discuss its inclusion in the project. Afterwards, you can follow these steps to add support for your linter:

- Clone the repository and install its dependencies with `yarn install`.
- Create a new class for the linter, e.g. `src/linters/my-linter.js`. Have a look at the other files in that directory to see what functions the class needs to implement.
- Import your class in the [`src/linters/index.js`](./src/linters/index.js) file.
- Provide a sample project for the linter under `test/linters/projects/my-linter/`. It should be simple and contain a few linting errors which your tests will detect.
- Provide the expected linting output for your sample project in a `test/linters/params/my-linter.js` file. Import this file in [`test/linters/linters.test.js`](./test/linters/linters.test.js). You can run the tests with `yarn test`.
- Update the [`action.yml`](./action.yml) file with the options provided by the new linter.
- Mention your linter in the [`README.md`](./README.md) file.
- Update the [test workflow file](./.github/workflows/test.yml).

## Related

- [Electron Builder Action](https://github.com/samuelmeuli/action-electron-builder) – GitHub Action for building and releasing Electron apps
- [Maven Publish Action](https://github.com/samuelmeuli/action-maven-publish) – GitHub Action for automatically publishing Maven packages
