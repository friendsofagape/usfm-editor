import * as React from "react"
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor"
import { usfmToSlate } from "../transforms/usfmToSlate"
import { slateToUsfm } from "../transforms/slateToUsfm"
import { OutputUsfm } from "./UsfmContainer"
import "../style.css"
import "./demo.css"
import { flowRight } from "lodash"
import { withToolbar } from "../components/ToolbarEditor"
import { ForwardRefUsfmEditor, UsfmEditorRef } from ".."
import { DemoToolbarSpecs } from "./DemoToolbarSpecs"

/**
 * This ToolbarDemo demonstrates the functionality of the basic ToolbarEditor, which
 * is constructed by wrapping a BasicUsfmEditor inside a ToolbarEditor, following the
 * decorator pattern.
 */
export class ToolbarDemo extends React.Component<
    ToolbarDemoProps,
    ToolbarDemoState
> {
    constructor(props: ToolbarDemoProps) {
        super(props)
        const initialUsfm = props.usfmString
        this.state = {
            usfmInput: initialUsfm,
            usfmOutput: slateToUsfm(usfmToSlate(initialUsfm)),
        }
    }

    handleEditorChange = (usfm: string): void =>
        this.setState({ usfmOutput: usfm })

    // This editor can be given a ref of type UsfmEditorRef
    // to have access to the editor API (use React.createRef<UsfmEditorRef>).
    // It may be necessary to cast the output of flowRight() as ForwardRefUsfmEditor<UsfmEditorRef>.
    Editor: ForwardRefUsfmEditor<UsfmEditorRef> = flowRight(
        withToolbar,
        createBasicUsfmEditor
    )() as ForwardRefUsfmEditor<UsfmEditorRef>

    render(): React.ReactElement {
        return (
            <div className="row">
                <div className="column column-left">
                    <h2>Editor</h2>
                    <this.Editor
                        usfmString={this.state.usfmInput}
                        toolbarSpecs={DemoToolbarSpecs}
                        key={this.state.usfmInput}
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

type ToolbarDemoProps = {
    usfmString: string
}

type ToolbarDemoState = {
    usfmInput: string
    usfmOutput: string
}
