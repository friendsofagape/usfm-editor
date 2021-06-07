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
import { UsfmMarkers } from "../utils/UsfmMarkers"
import { OutputUsfm } from "./UsfmContainer"
import { flowRight } from "lodash"
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor"
import { withChapterPaging } from "../components/ChapterEditor"
import { withChapterSelection } from "../components/ChapterSelectionEditor"
import { withToolbar } from "../components/ToolbarEditor"

// In a TypeScript file, It may be necessary to cast the output of flowRight() as ForwardRefUsfmEditor<UsfmEditorRef>.
const Editor = flowRight(
    withChapterSelection,
    withChapterPaging,
    withToolbar,
    createBasicUsfmEditor
)()

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
                        toolbarSpecs={demoToolbarSpecs}
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

const demoToolbarSpecs = {
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
        icon: "BK",
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
