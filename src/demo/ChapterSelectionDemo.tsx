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
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles"
import { defaultToolbarSpecs } from "../components/UsfmToolbar"

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
    // to have access to the editor API (use React.createRef<UsfmEditorRef>).
    // It may be necessary to cast the output of flowRight() as ForwardRefUsfmEditor<UsfmEditorRef>.
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
                    <ThemeProvider theme={theme}>
                        <this.Editor
                            usfmString={this.state.usfmInput}
                            key={this.state.usfmInput}
                            onChange={this.handleEditorChange}
                            toolbarSpecs={defaultToolbarSpecs}
                        />
                    </ThemeProvider>
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

const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#000000",
        },
    },
})
