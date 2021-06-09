This demo illustrates how to construct a custom toolbar for the usfm editor.

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
import "./demo.css"
import { OutputUsfm } from "./UsfmContainer"
import FormatItalicButton from "@material-ui/icons/FormatItalic"

// The following objects should be imported from the "usfm-editor" module like this:
// import { UsfmMarkers, FullUsfmEditor } from "usfm-editor"
import { UsfmMarkers } from "../utils/UsfmMarkers"
import { FullUsfmEditor } from "../components/FullUsfmEditor"

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
                    <FullUsfmEditor
                        usfmString={usfmString}
                        onChange={this.handleEditorChange}
                        toolbarSpecs={customToolbarSpecs}
                    />
                </div>
                <div className="column column-right">
                    <OutputUsfm usfm={this.state.usfmOutput} />
                </div>
            </div>
        )
    }
}

// See src/components/UsfmToolbar.tsx for information regarding creating a
// ToolbarSpecs object like the one below.
const customToolbarSpecs = {
    "Section Header": {
        icon: "S",
        cssClass: "s-toolbar-button",
        actionSpec: {
            buttonType: "ParagraphButton",
            usfmMarker: UsfmMarkers.TITLES_HEADINGS_LABELS.s,
            additionalAction: () =>
                console.log("Section header button pressed!"),
        },
    },
    "Quoted Book Title": {
        icon: FormatItalicButton,
        cssClass: "bk-toolbar-button",
        actionSpec: {
            buttonType: "MarkButton",
            usfmMarker: UsfmMarkers.SPECIAL_TEXT.bk,
        },
    },
    "Nomen Domini": {
        icon: "ND",
        cssClass: "nd-toolbar-button",
        actionSpec: {
            buttonType: "MarkButton",
            usfmMarker: UsfmMarkers.SPECIAL_TEXT.nd,
        },
    },
}

;<Demo />
```
