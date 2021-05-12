This ToolbarDemo demonstrates the functionality of the basic ToolbarEditor, which is constructed by wrapping a BasicUsfmEditor inside a ToolbarEditor, following the [Decorator Pattern](https://en.wikipedia.org/wiki/Decorator_pattern)).

```js
const usfmString = `
\\id 1CO Unlocked Literal Bible
\\ide UTF-8
\\h 1 Corinthians
\\toc1 The First Letter of Paul to the Corinthians
\\toc2 First Corinthians
\\toc3 1Co
\\c 12
\\p
\\v 24 Now our presentable members have no such need. Rather, God has composed the body, giving greater honor to those members that lack it.
\\v 25 He did this so there may be no division within the body, but that the members should care for one another with the same affection.
`

import { ToolbarDemo } from "./ToolbarDemo"
;<ToolbarDemo usfmString={usfmString} />
```
