# usfm-editor
**usfm-editor** is a WYSIWYG editor component for [USFM (Unified Standard
Format Markers)](https://ubsicap.github.io/usfm/). It is a JavaScript React
component based on the [Slate](https://github.com/ianstormtaylor/slate) editor
framework. It aims to enable rich editing capabilities in new and existing
scripture translation applications.

## Demo
A [demo editor](https://friendsofagape.github.io/usfm-editor/) is available, 
and you can examine its source code in this repo for integration info.

## Bugs and contributions
If you use the editor, please let us know how we can best support you by filing
issues (and pull requests).

## Roadmap
This is currently a beta release, with several improvements planned:

#### Framework upgrade
Being based on [Slate](https://github.com/ianstormtaylor/slate), usfm-editor is
subject to the instability of that project (and likewise reaps the benefits of
its continuous innovation). The current release of usfm-editor is built with
Slate 0.47.8, and next steps will include [migrating
](https://docs.slatejs.org/concepts/xx-migrating) to a current version.

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
