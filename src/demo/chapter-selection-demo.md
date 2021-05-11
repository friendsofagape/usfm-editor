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
\\c 11
\\p
\\v 1 the first verse of chapter 11
\\v 2 the second verse of chapter 11
\\c 12
\\p
\\v 1 the first verse of chapter 12
\\v 2 the second verse of chapter 12
`

import { ChapterSelectionDemo } from "./ChapterSelectionDemo"
;<ChapterSelectionDemo usfmString={usfmString} />
```
