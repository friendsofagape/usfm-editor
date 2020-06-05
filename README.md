# usfm-editor
**usfm-editor** is a WYSIWYG editor component for [USFM (Unified Standard
Format Markers)](https://ubsicap.github.io/usfm/). It is a JavaScript React
component based on the [Slate](https://github.com/ianstormtaylor/slate) editor
framework. It aims to enable rich editing capabilities in new and existing
scripture translation applications.

## Demo
A [demo editor](https://friendsofagape.github.io/usfm-editor/) is available, 
and you can examine its source code in this repo for integration info.

## NPM
Builds are published on [NPM](https://www.npmjs.com/package/usfm-editor) and
can be installed with `npm i usfm-editor`

## Bugs and contributions
If you use the editor, please let us know how we can best support you by filing
issues (and pull requests).

To build and test locally, install [npm](https://www.npmjs.com/get-npm), clone
the repo, and run the following in its directory:
```shell
npm install
npm install -g npx
npx styleguidist server
```
Then monitor the live-updated demo at http://localhost:6060/

## Roadmap
This is currently a beta release, with several improvements planned:

#### Tags
The number of USFM tags supported is very low (`\id \c \v \p \s`). Supporting
more tags is a priority. (For now though, your documents are safe: Unsupported
tags, while not rendered properly and not providing semantic meaning, are
preserved and uneditable.)

#### Document structure
We wish to allow verse joining and reordering, and will explore adding this
capability to the [USFM parser](https://github.com/unfoldingWord/usfm-js)
library.

#### Styling
Integrating usfm-editor into other applications will require easy styling of
the component and how tags are rendered. Our stylesheets can be reworked to
make these integrations simpler.
