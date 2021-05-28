import * as React from "react"
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor"
import { usfmToSlate } from "../transforms/usfmToSlate"
import { slateToUsfm } from "../transforms/slateToUsfm"
import { OutputUsfm } from "./UsfmContainer"
import "./demo.css"
import { flowRight } from "lodash"
import { withToolbar } from "../components/ToolbarEditor"
import { ForwardRefUsfmEditor, UsfmEditorRef } from ".."
import { DemoToolbarSpecs } from "./DemoToolbarSpecs"

/**
 * This CompositionDemo implements a simple toolbar HOC wrapper (which itself implements
 * the UsfmEditor interface, following the Decorator Pattern). It then wraps a basic editor
 * with the toolbar wrapper, and then wraps all that inside another toolbar wrapper instance.
 * So, we can see two toolbars, and each of them works upon the basic editor. Finally,
 * the entire composition is wrapped in a simple div with the "fixed-size" css class and a
 * specified height and width. This demo demonstrates the modularity and composability of the
 * component architecture.
 */
export class CompositionDemo extends React.Component<
    CompositionDemoProps,
    CompositionDemoState
> {
    constructor(props: CompositionDemoProps) {
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
        withToolbar,
        createBasicUsfmEditor
    )()

    render(): React.ReactElement {
        return (
            <div className="row">
                <div className="column column-left">
                    <h2>Editor</h2>
                    <div
                        className="fixed-size"
                        style={{ width: 300, height: 250 }}
                    >
                        <this.Editor
                            usfmString={this.state.usfmInput}
                            toolbarSpecs={DemoToolbarSpecs}
                            key={this.state.usfmInput}
                            onChange={this.handleEditorChange}
                        />
                    </div>
                </div>
                <div className="column column-right">
                    <OutputUsfm usfm={this.state.usfmOutput} />
                </div>
            </div>
        )
    }
}

type CompositionDemoProps = {
    usfmString: string
}

type CompositionDemoState = {
    usfmInput: string
    usfmOutput: string
}
