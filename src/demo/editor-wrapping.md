This demo illustrates how to construct an editor by following the decorator pattern.
We build additional functionality on top of the BasicUsfmEditor by calling several
'withXXX' functions, each of which wraps a higher-order component around the editor.
Try experimenting with the pertinent code, and notice how easy it is to add or remove these
additional layers, or even add a second toolbar (just for show!)

```jsx
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

import * as React from "react"
import "../style.css"
import "./demo.css"
import { OutputUsfm } from "./UsfmContainer"

// The following objects should be imported from the "usfm-editor" module like this:
// import { createBasicUsfmEditor, withChapterPaging, ...etc. } from "usfm-editor"
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor"
import { withChapterPaging } from "../components/ChapterEditor"
import { withChapterSelection } from "../components/ChapterSelectionEditor"
import { withToolbar } from "../components/ToolbarEditor"

// In a TypeScript file, It may be necessary to cast the output of
// this chained function call to ForwardRefUsfmEditor<UsfmEditorRef>.
// Note that withChapterSelection must be called after withChapterPaging.
const Editor = withChapterSelection(
    withChapterPaging(withToolbar(createBasicUsfmEditor()))
)

class Demo extends React.Component {
    constructor(props) {
        super(props)
        this.handleEditorChange = this.handleEditorChange.bind(this)
        this.state = { usfmOutput: usfmString }
    }

    handleEditorChange(usfm) {
        this.setState({ usfmOutput: usfm })
    }

    render() {
        return (
            <div className="row">
                <div className="column column-left">
                    <h2>Editor</h2>

                    {/* The editor can be given a ref of type UsfmEditorRef
                     to have access to the editor API (use React.createRef<UsfmEditorRef>)
                    */}
                    <Editor
                        usfmString={usfmString}
                        onChange={this.handleEditorChange}
                    />
                </div>
                <div className="column column-right">
                    <OutputUsfm usfm={this.state.usfmOutput} />
                </div>
            </div>
        )
    }
}

;<Demo />
```
