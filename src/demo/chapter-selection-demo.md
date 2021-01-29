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

import { ChapterSelectionDemo } from "./ChapterSelectionDemo"
;<ChapterSelectionDemo usfmString={usfmString} />
```
