# ✨ Lint Action

**GitHub Action for detecting and fixing linting errors**

This action…

- **Shows linting errors** on GitHub PRs and commits
- Allows **auto-fixing** code style issues
- Supports many [linters and formatters](#supported-tools)

<img src="./.github/screenshots/check-runs.png" alt="Screenshot of check runs" width="75%" />

<img src="./.github/screenshots/check-annotations.png" alt="Screenshot of ESLint annotations" width="90%" />

## Supported tools

- **Go:**
  - [gofmt](https://golang.org/cmd/gofmt)
- **JavaScript:**
  - [ESLint](https://eslint.org)
  - [Prettier](https://prettier.io)
  - [stylelint](https://stylelint.io)
- **Python:**
  - [Black](https://black.readthedocs.io)
  - [Flake8](http://flake8.pycqa.org)
- **Swift:**
  - [SwiftLint](https://github.com/realm/SwiftLint)

## Usage

Create a new GitHub Actions workflow in your project, e.g. at `.github/workflows/lint.yml`. The content of the file should be in the following format:

```yml
name: Lint

on: push

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v1

      # Install your dependencies here

      - name: Run linters
        uses: samuelmeuli/lint-action@v0.1
        with:
          github_token: ${{ secrets.github_token }}
          # Enable your linters here
```

_The GitHub token is required for creating checks on commits and pull requests. It's provided automatically by GitHub, so there's no need to define the secret on GitHub._

## Examples

### JavaScript example (ESLint and Prettier)

```yml
name: Lint

on: push

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v1

      - name: Install Node.js and NPM
        uses: actions/setup-node@v1
        with:
          node-version: 10

      - name: Install dependencies
        run: npm install

      - name: Run linters
        uses: samuelmeuli/lint-action@v0.1
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
  lint:
    runs-on: ubuntu-latest

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v1

      - name: Install Python and pip
        uses: actions/setup-python@v1
        with:
          python-version: 3.8

      - name: Install linters
        run: pip install black flake8

      - name: Run linters
        uses: samuelmeuli/lint-action@v0.1
        with:
          github_token: ${{ secrets.github_token }}
          black: true
          flake8: true
```

## Configuration

All linters are disabled by default. To enable a linter, simply set the option with its name to `true`. For example, if you'd like to enable ESLint:

```yml
- name: Run linters
  uses: samuelmeuli/lint-action@v0.1
  with:
    github_token: ${{ secrets.github_token }}
    eslint: true # Enables ESLint checks
```

`[linter]` can be one of `black`, `eslint`, `flake8`, `gofmt`, `prettier`, `stylelint`, and `swiftlint`:

- **`[linter]`:** Enables the linter in your repository
- **`[linter]_extensions`:** Extensions of files to check with the linter. Example: `eslint_extensions: js,ts` to lint both JavaScript and TypeScript files with ESLint
- **`[linter]_dir`:** Directory where the linting command should be run. Example: `eslint_dir: server/` if ESLint is installed in the `server` subdirectory

Besides the linter-specific options, there's a general `auto_fix` setting:

- **`auto_fix`:** Whether linters should try to fix code style issues automatically. If some issues can be fixed, the action will commit and push the changes to the corresponding branch

<img src="./.github/screenshots/auto-fix.png" alt="Screenshot of auto-fix commit" width="75%" />

## Development

### Contributing

Suggestions and contributions are always welcome! Please discuss larger changes via issue before submitting a pull request.

### Adding a new linter

If you want to add support for an additional linter, please open an issue to discuss its inclusion in the project. Afterwards, you can follow these steps to add support for your linter:

- Clone the repository and install its dependencies with `yarn install`.
- Create a new class for the linter, e.g. `src/linters/my-linter.js`. Have a look at the other files in that directory to see what functions the class needs to implement.
- Import your class in the `src/linters/index.js` file.
- Provide a sample project for the linter under `test/linters/projects/`. It should be simple and contain a few linting errors which your tests will detect.
- Create tests which lint your sample project. Add the test cases to a `test/linters/my-linter.test.js` file. Again, see the other test files in the directory for inspiration. You can run the tests with the `yarn test` command.
- Update the [`action.yml`](./action.yml) file with the options the new linter provides.
- Mention your linter in the [`README.md`](./README.md) file.

## Related

- [Electron Builder Action](https://github.com/samuelmeuli/action-electron-builder) – GitHub Action for building and releasing Electron apps
- [Maven Publish Action](https://github.com/samuelmeuli/action-maven-publish) – GitHub Action for automatically publishing Maven packages
