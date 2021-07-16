This demo illustrates how to separate the toolbar from the editor pane.

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
`

import * as React from "react"
import "./demo.css"
import { OutputUsfm } from "./UsfmContainer"
import FormatItalicButton from "@material-ui/icons/FormatItalic"

// The following objects should be imported from the "usfm-editor" module like this:
// import { UsfmMarkers, UsfmEditor } from "usfm-editor"
import { UsfmMarkers } from "../utils/UsfmMarkers"
import {
    createBasicUsfmEditor,
    withChapterPaging,
    withChapterSelection,
    UsfmToolbar,
} from "../index"

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
                    <MyEditor
                        // Assign a ref so the toolbar may access the editor API
                        ref={myEditorRef}
                        usfmString={usfmString}
                        onChange={this.handleEditorChange}
                    />
                </div>
                <div className="column column-right">
                    <UsfmToolbar editor={myEditorRef.current} />
                    <OutputUsfm usfm={this.state.usfmOutput} />
                </div>
            </div>
        )
    }
}

// We'll instatiate a Toolbar elsewhere, so omit withToolbarEditor from the HOC chain. (You may
// have multiple toolbars, but it's probably not what you want.) Here, we just use a basic editor,
// but you may compose some other combination like this:
// withChapterSelection(withChapterPaging(createBasicUsfmEditor()))
const MyEditor = createBasicUsfmEditor()

// This ref will be assigned to the editor component so the toolbar can find it.
const myEditorRef = React.createRef()

;<Demo />
```
