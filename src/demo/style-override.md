This demo illustrates how to override styles of editor text, tags, and toolbars. Just apply
styling to the classes desired. The best approach will vary depending on your development
framework, but just writing a plain CSS file should always work (as shown in the column to
the right).

You may use [default.css
](https://github.com/friendsofagape/usfm-editor/blob/master/src/components/default.css)
as a reference to the classes available, or use your browser's developer tools to explore
class names.

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
import "./style-override.css"
import styleOverrideCss from "!css-loader!./style-override.css"
import { UsfmContainer } from "./UsfmContainer"

// The following objects should be imported from the "usfm-editor" module like this:
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
                    <UsfmEditor
                        usfmString={usfmString}
                        onChange={this.handleEditorChange}
                    />
                </div>
                <div className="column column-right">
                    <UsfmContainer
                        title="CSS"
                        usfm={styleOverrideCss.toString()}
                    />
                </div>
            </div>
        )
    }
}

;<Demo />
```
