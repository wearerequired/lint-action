# ✨ Lint Action

**GitHub Action for detecting and fixing linting errors**

This action…

- **Shows linting errors** on GitHub PRs and commits
- Allows **auto-fixing** code style issues
- Supports many [linters and formatters](#supported-tools)

<img src="./.github/screenshots/check-runs.png" alt="Screenshot of check runs" width="75%" />

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
- **Python:**
  - [Black](https://black.readthedocs.io)
  - [Flake8](http://flake8.pycqa.org)
- **Ruby:**
  - [RuboCop](https://rubocop.readthedocs.io)
- **Swift:**
  - [SwiftFormat](https://github.com/nicklockwood/SwiftFormat)
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

      # Install your dependencies here

      - name: Run linters
        uses: samuelmeuli/lint-action@v0.4
        with:
          github_token: ${{ secrets.github_token }}
          # Enable your linters here
```

_The GitHub token is required for creating checks on commits and pull requests. It's provided automatically by GitHub, so there's no need to define the secret on GitHub._

The action doesn't install the linters for you, you'll need to make sure they're installed in your CI environment. For example, if you'd like to use the Lint Action to check your code with ESLint, make sure it's declared as a dependency in your project's `package.json` file and run `npm install` before the action.

## Examples

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

      - name: Install Node.js and NPM
        uses: actions/setup-node@v1
        with:
          node-version: 12

      - name: Install dependencies
        run: npm install

      - name: Run linters
        uses: samuelmeuli/lint-action@v0.4
        with:
          github_token: ${{ secrets.github_token }}
          eslint: true
          prettier: true
          prettier_extensions: js,json,md,yml
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

      - name: Install Python and pip
        uses: actions/setup-python@v1
        with:
          python-version: 3.8

      - name: Install linters
        run: pip install black flake8

      - name: Run linters
        uses: samuelmeuli/lint-action@v0.4
        with:
          github_token: ${{ secrets.github_token }}
          black: true
          flake8: true
```

## Configuration

All linters are disabled by default. To enable a linter, simply set the option with its name to `true`. For example, if you'd like to enable ESLint:

```yml
- name: Run linters
  uses: samuelmeuli/lint-action@v0.4
  with:
    github_token: ${{ secrets.github_token }}
    eslint: true # Enables ESLint checks
```

`[linter]` can be one of `black`, `eslint`, `flake8`, `gofmt`, `golint`, `prettier`, `rubocop`, `stylelint`, `swiftformat` and `swiftlint`:

- **`[linter]`:** Enables the linter in your repository. Default: `false`
- **`[linter]_extensions`:** Extensions of files to check with the linter. Example: `eslint_extensions: js,ts` to lint both JavaScript and TypeScript files with ESLint. Default: See [`action.yml`](./action.yml)
- **`[linter]_dir`:** Directory where the linting command should be run. Example: `eslint_dir: server/` if ESLint is installed in the `server` subdirectory. Default: `.`

Besides the linter-specific options, there are a few global settings:

- **`auto_fix`:** Whether linters should try to fix code style issues automatically. If some issues can be fixed, the action will commit and push the changes to the corresponding branch. Default: `false`

<img src="./.github/screenshots/auto-fix.png" alt="Screenshot of auto-fix commit" width="75%" />

- **`commit_message`**: Template for auto-fix commit messages. The `${linter}` variable can be used to insert the name of the linter which has created the auto-fix. Default: `Fix code style issues with ${linter}`

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
