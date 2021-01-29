import * as React from "react"
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor"
import { usfmToSlate } from "../transforms/usfmToSlate"
import { slateToUsfm } from "../transforms/slateToUsfm"
import { OutputUsfm } from "./UsfmContainer"
import "./demo.css"
import { flowRight } from "lodash"
import { withChapterPaging } from "../components/ChapterEditor"
import { ForwardRefUsfmEditor, UsfmEditorRef } from ".."
import { withChapterSelection } from "../components/ChapterSelectionEditor"

/**
 */
export class ChapterSelectionDemo extends React.Component<
    ChapterSelectionDemoProps,
    ChapterSelectionDemoState
> {
    constructor(props: ChapterSelectionDemoProps) {
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
    Editor: ForwardRefUsfmEditor<UsfmEditorRef> = flowRight(
        withChapterSelection,
        withChapterPaging,
        createBasicUsfmEditor
    )()

    render(): React.ReactElement {
        return (
            <div className="row">
                <div className="column column-left">
                    <h2>Editor</h2>
                    <this.Editor
                        usfmString={this.state.usfmInput}
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

type ChapterSelectionDemoProps = {
    usfmString: string
}

type ChapterSelectionDemoState = {
    usfmInput: string
    usfmOutput: string
}
