import * as React from "react";
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor";
import { InputSelector } from "./InputSelector";
import { usfmToSlate } from "../transforms/usfmToSlate";
import { slateToUsfm } from "../transforms/slateToUsfm";
import { OptionCheckbox } from "./OptionCheckbox";
import { InputUsfm, OutputUsfm } from "./UsfmContainer";
import { IdentificationSetter } from "./IdentificationSetter";
import "./demo.css";
import { IdentificationHeaders } from "../UsfmEditor";

export class EditorDemo extends React.Component<EditorDemoProps, EditorDemoState> {
    constructor(props: EditorDemoProps) {
        super(props);
        // Get the first usfm string in the dropdown menu
        const initialUsfm = props.usfmStrings.values().next().value
        this.state = {
            usfmInput: initialUsfm,
            usfmOutput: transformToOutput(initialUsfm),
            showInputUsfm: false,
            readOnly: false,
            identification: null
        };
    }

    handleInputChange = (input: string): void => this.setState({
        usfmInput: input,
        usfmOutput: transformToOutput(input),
        identification: null,
    })

    handleEditorChange = (usfm: string): void => this.setState({ usfmOutput: usfm });
    handleShowInputChange = (): void => this.setState({ showInputUsfm: !this.state.showInputUsfm });
    handleReadOnlyChange = (): void => this.setState({ readOnly: !this.state.readOnly});
    onIdentificationChange = (id: string | IdentificationHeaders): void => {
        const identification = (typeof id == "string") ? JSON.parse(id) : id
        this.setState({ identification })
    }

    // This editor can be given a ref of type UsfmEditorRef
    // to have access to the editor API (use React.createRef<UsfmEditorRef>)
    Editor = createBasicUsfmEditor()

    render(): React.ReactElement {
        return (
            <div>
                <div className={ this.state.showInputUsfm ? "" : "row" }>
                    <div className="column column-left">
                        <InputSelector 
                            onChange={this.handleInputChange} 
                            demoUsfmStrings={this.props.usfmStrings}
                        />
                    </div>
                    <div className="column column-right">
                        <div className="center-horizontal">
                            <OptionCheckbox
                                id={"show-input-checkbox"}
                                text={"Show Input"}
                                onChange={this.handleShowInputChange}
                                checked={this.state.showInputUsfm}
                            />
                            <OptionCheckbox
                                id={"read-only-checkbox"}
                                text={"Read-Only"}
                                onChange={this.handleReadOnlyChange}
                                checked={this.state.readOnly}
                            />
                        </div>
                        {
                            this.state.showInputUsfm &&
                                <React.Fragment>
                                       <InputUsfm usfm={this.state.usfmInput} />
                                       <OutputUsfm usfm={this.state.usfmOutput} />
                                </React.Fragment>
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="column column-left">
                        <IdentificationSetter 
                            idJson={JSON.stringify(this.state.identification)} 
                            onChange={this.onIdentificationChange} />
                        <h2>Editor</h2>
                        <this.Editor 
                            usfmString={this.state.usfmInput}
                            key={this.state.usfmInput}
                            onChange={this.handleEditorChange}
                            readOnly={this.state.readOnly}
                            identification={this.state.identification}
                            onIdentificationChange={this.onIdentificationChange}
                        />
                    </div>
                    <div className="column column-right">
                        {
                            this.state.showInputUsfm ||
                                <OutputUsfm usfm={this.state.usfmOutput} />
                        }
                    </div>
                </div>
            </div>
        )
    }
}

function transformToOutput(usfm: string) {
    return slateToUsfm(usfmToSlate(usfm))
}

type EditorDemoProps = {
    usfmStrings: Map<string, string>
}

type EditorDemoState = {
    usfmInput: string,
    usfmOutput: string,
    showInputUsfm: boolean,
    readOnly: boolean,
    identification: IdentificationHeaders
}