import * as React from "react";
import "./demo.css";
import { UsfmEditor } from "../components/UsfmEditor";
import { InputSelector } from "./InputSelector";
import { usfmToSlate } from "../transforms/usfmToSlate.js";
import { slateToUsfm } from "../transforms/slateToUsfm.ts";
import { OptionCheckbox } from "./OptionCheckbox";
import { InputUsfm, OutputUsfm } from "./UsfmContainer";

function transformToOutput(usfm) {
    return slateToUsfm(usfmToSlate(usfm))
}

export class DemoEditor extends React.Component {
    constructor(props) {
        super(props);
        // Get the first usfm string in the dropdown menu
        const initialUsfm = props.usfmStrings.values().next().value
        this.state = {
            usfmInput: initialUsfm,
            usfmOutput: transformToOutput(initialUsfm),
            showInputUsfm: false,
            readOnly: false
        };
        this.handleInputChange =
            input => this.setState(
                { 
                    usfmInput: input,
                    usfmOutput: transformToOutput(input),
                    identification: null
                }
            );
        this.handleEditorChange = (usfm) => this.setState({ usfmOutput: usfm });
        this.handleShowInputChange = () => {
            this.setState({ showInputUsfm: !this.state.showInputUsfm});
        }
        this.handleReadOnlyChange = () => {
            this.setState({ readOnly: !this.state.readOnly});
        }
        this.onIdentificationChange = (id) => {
            this.setState({ identification: id })
        }
    }

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
                                checked={this.state.showInput}
                            />
                            <OptionCheckbox
                                id={"read-only-checkbox"}
                                text={"Read-Only"}
                                onChange={this.handleReadOnlyChange}
                                checked={this.state.readOnly}
                            />
                        </div>
                        {
                            this.state.showInputUsfm
                                ? <React.Fragment>
                                       <InputUsfm usfm={this.state.usfmInput} />
                                       <OutputUsfm usfm={this.state.usfmOutput} />
                                   </React.Fragment>
                                : null
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="column column-left">
                        <h2>Editor</h2>
                        <UsfmEditor
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
                            !this.state.showInputUsfm
                                ? <OutputUsfm usfm={this.state.usfmOutput} />
                                : null
                        }
                    </div>
                </div>
            </div>
        )
    }
}
