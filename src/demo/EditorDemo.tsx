import * as React from "react";
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor";
import { InputSelector } from "./InputSelector";
import { usfmToSlate } from "../transforms/usfmToSlate.js";
import { slateToUsfm } from "../transforms/slateToUsfm";
import { OptionCheckbox } from "./OptionCheckbox";
import { InputUsfm, OutputUsfm } from "./UsfmContainer";
import { IdentificationSetter } from "./IdentificationSetter";
import "./demo.css";

export class EditorDemo extends React.Component<DemoProps, DemoState> {
    constructor(props: DemoProps) {
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

    handleInputChange =
        (input: string) => this.setState(
            { 
                usfmInput: input,
                usfmOutput: transformToOutput(input),
                identification: null,
            }
        )

    handleEditorChange = (usfm: string) => this.setState({ usfmOutput: usfm });
    handleShowInputChange = () => {
        this.setState({ showInputUsfm: !this.state.showInputUsfm});
    }
    handleReadOnlyChange = () => {
        this.setState({ readOnly: !this.state.readOnly});
    }
    onIdentificationChange = (id: Object) => {
        if (typeof id == "string") {
            id = JSON.parse(id)
        }
        this.setState({ identification: id })
    }

    // This editor can be given a ref of type UsfmEditorRef
    // to have access to the editor API (use React.createRef<UsfmEditorRef>)
    Editor = createBasicUsfmEditor()

    render() {
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

function transformToOutput(usfm) {
    return slateToUsfm(usfmToSlate(usfm))
}

type DemoProps = {
    usfmStrings: string[]
}

type DemoState = {
    usfmInput: string,
    usfmOutput: string,
    showInputUsfm: boolean,
    readOnly: boolean,
    identification: Object
}