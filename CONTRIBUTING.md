# Contributing

We welcome every contribution

## Run test locally

If you run the test of all packages, you need the AWS emulation we use [localstack](https://github.com/localstack/localstack). You can run it within Docker with the provided script

```
./localtest.sh
```

## Pull request

To be merged a pull request must:

- build and pass tests
- follow conventional commits
- be approved by one maintainer

## Use your development version in other projects

You can use your development version with the `yarn link` option

In the root of webda.io repository type

```
lerna link
```

Then in your target project just type

```
yarn link @webda/core
```

you can link any of the development package here

### Deployment of development version

Both `packager` and `docker` deployer manage the linked packages
As this is not a good practice to deploy/package development version,
you have to add a parameter in your deployment resources:

`includeLinkModules` must be set to `true` to be able to package the development version

## Release

To release a new version of the packages

```
yarn version
# To create a minor
yarn version:minor
# To create a major
yarn version:major
# To create a patch
yarn version:patch
```
