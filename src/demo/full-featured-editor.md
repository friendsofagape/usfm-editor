This demo shows the typical use-case of the Usfm Editor. It makes use of the
UsfmEditor component, which includes a toolbar, as well as chapter paging
functionality and a chapter selection dropdown menu.

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

// The following object should be imported from the "usfm-editor" module like this:
// import { UsfmEditor } from "usfm-editor"
import { UsfmEditor } from "../index"

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
                    <UsfmEditor
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
