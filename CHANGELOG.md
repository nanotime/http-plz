## [1.1.4](https://github.com/nanotime/http-plz/compare/v1.1.3...v1.1.4) (2025-11-29)


### Bug Fixes

* **src/utils/pathFactory:** path resolution bug resolved [release] ([2262b28](https://github.com/nanotime/http-plz/commit/2262b2882528d54852182af4ed96319cc9c18f48))

## [1.1.3](https://github.com/nanotime/http-plz/compare/v1.1.2...v1.1.3) (2025-11-29)


### Bug Fixes

* **build:** ensure proper module exports for cjs and esm ([f9c4831](https://github.com/nanotime/http-plz/commit/f9c48318383fdaf219ce83c32607382fe9163674))

## [1.1.2](https://github.com/nanotime/http-plz/compare/v1.1.1...v1.1.2) (2025-11-27)


### Bug Fixes

* **core:** allow null resolver to return raw stream ([0af93c6](https://github.com/nanotime/http-plz/commit/0af93c6f965f39a547694cd0aa59832509fbaff0))

## [1.1.1](https://github.com/nanotime/http-plz/compare/v1.1.0...v1.1.1) (2025-11-27)


### Bug Fixes

* allowing release to push [release] ([da72751](https://github.com/nanotime/http-plz/commit/da72751faaaf32862152c5b8a3ff3416c836b320))
* changed the secret [release] ([25730bb](https://github.com/nanotime/http-plz/commit/25730bb0f67e7815e77886b05af4b4e50b02c55b))
* **core:** ensure response body is not consumed by middlewares ([2e3946f](https://github.com/nanotime/http-plz/commit/2e3946f93392c3156529444b293575a9b84f2b6b))
* **utils:** handle ArrayBuffer views in processBody ([287cea0](https://github.com/nanotime/http-plz/commit/287cea0b103cf76a429a4f811058a459712d86f6))

# [1.1.0](https://github.com/nanotime/http-plz/compare/v1.0.0...v1.1.0) (2025-07-05)


### Features

* added middleware system ([4fa9974](https://github.com/nanotime/http-plz/commit/4fa99746cf42c59856ab25ede777e4bad0cfd9b5))

# 1.0.0 (2025-07-02)


### Bug Fixes

* added better body management ([54e0f5a](https://github.com/nanotime/http-plz/commit/54e0f5a428fc8efa7bcff1188046583352ccfafe))
* added patch method, fixed build process, optional body ([5e6a263](https://github.com/nanotime/http-plz/commit/5e6a263118cf2ed8559b944d10decef436f3b99c))
* cloning response to avoid re-using streams ([2e57199](https://github.com/nanotime/http-plz/commit/2e571999fbedc2a056fef1e54243ddd2a7a32766))


### Features

* better error management and exports ([5d9563b](https://github.com/nanotime/http-plz/commit/5d9563b6676f40e96cefc707cadeb6b1b4e0d81f))
* core functionality and testing ([7a1f652](https://github.com/nanotime/http-plz/commit/7a1f6528ae97541b31c903ce6ae9dcfe5441b6e5))
