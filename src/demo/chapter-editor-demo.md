This ChapterEditorDemo demonstrates the functionality of the goToVerse and onVerseChange properties, and the goToVerse() function
of the UsfmEditor interface. If the goToVerse property is changed or the goToVerse() function is called, the editor's selection
will move to the start of the desired chapter and verse. Additionally, if the user selects a new verse within the editor,
onVerseChange will be called so that the change is reflected in the noted section of this demo page. This demo utilizes these
properties in a HOC editor; however, the application itself can supply the values of these properties without wrapping another editor.
Note that the chapter and verse input fields are not kept up to date with the current value of the goToVerse property.

```js
const usfmString = `
\\id GEN
\\c 1
\\p
\\v 1 the first verse of chapter 1
\\v 2 the second verse of chapter 1
\\c 2
\\p
\\v 1 the first verse of chapter 2
\\v 2 the second verse of chapter 2
`

import { ChapterEditorDemo } from "./ChapterEditorDemo"
;<ChapterEditorDemo usfmString={usfmString} />
```
