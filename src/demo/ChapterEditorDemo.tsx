import * as React from "react"
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor"
import { usfmToSlate } from "../transforms/usfmToSlate"
import { slateToUsfm } from "../transforms/slateToUsfm"
import { OutputUsfm } from "./UsfmContainer"
import "./demo.css"
import { flowRight } from "lodash"
import { withChapterPaging } from "./ChapterEditor"

/**
 * This ChapterEditorDemo demonstrates the functionality of the goToVerse and onVerseChange properties, and the goToVerse() function
 * of the UsfmEditor interface. If the goToVerse property is changed or the goToVerse() function is called, the editor's selection
 * will move to the start of the desired chapter and verse. Additionally, if the user selects a new verse within the editor,
 * onVerseChange will be called so that the change is reflected in the noted section of this demo page. This demo utilizes these
 * properties in a HOC editor; however, the application itself can supply the values of these properties without wrapping another editor.
 */
export class ChapterEditorDemo extends React.Component<
    ChapterEditorDemoProps,
    ChapterEditorDemoState
> {
    constructor(props: ChapterEditorDemoProps) {
        super(props)
        const initialUsfm = props.usfmString
        this.state = {
            usfmInput: initialUsfm,
            usfmOutput: slateToUsfm(usfmToSlate(initialUsfm)),
        }
    }

    handleEditorChange = (usfm: string): void =>
        this.setState({ usfmOutput: usfm })

    // This editor can be given a ref of type UsfmEditor
    Editor = flowRight(withChapterPaging, createBasicUsfmEditor)()

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

type ChapterEditorDemoProps = {
    usfmString: string
}

type ChapterEditorDemoState = {
    usfmInput: string
    usfmOutput: string
}
