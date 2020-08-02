# Contributing

Suggestions and contributions are always welcome! Please discuss larger changes via issue before submitting a pull request.

## Adding a new linter

If you want to add support for an additional linter, please open an issue to discuss its inclusion in the project. Afterwards, you can follow these steps to add support for your linter:

- Clone the repository and install its dependencies with `yarn install`.
- Create a new class for the linter, e.g. `src/linters/my-linter.js`. Have a look at the other files in that directory to see what functions the class needs to implement.
- Import your class in the [`src/linters/index.js`](./src/linters/index.js) file.
- Provide a sample project for the linter under `test/linters/projects/my-linter/`. It should be simple and contain a few linting errors which your tests will detect.
- Provide the expected linting output for your sample project in a `test/linters/params/my-linter.js` file. Import this file in [`test/linters/linters.test.js`](./test/linters/linters.test.js). You can run the tests with `yarn test`.
- Update the [`action.yml`](./action.yml) file with the options provided by the new linter.
- Mention your linter in the [`README.md`](./README.md) file.
- Update the [test workflow file](./.github/workflows/test.yml).
