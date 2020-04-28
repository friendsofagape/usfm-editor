import * as React from "react";
import {UsfmEditor} from "../components/UsfmEditor";
import {InputSelector} from "./InputSelector";
import {InputUsfm} from "./InputUsfm";
import {usfmToSlate} from "../transforms/usfmToSlate.js";
import {slateToUsfm} from "../transforms/slateToUsfm.ts";
import "./demo.css";

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
            showInputUsfm: true
        };
        this.handleInputChange =
            input => this.setState(
                { 
                    usfmInput: input,
                    usfmOutput: transformToOutput(input)
                }
            );
        this.handleEditorChange = (usfm) => this.setState({ usfmOutput: usfm });
        this.handleShowInputChange = () => {
            this.setState({ showInputUsfm: !this.state.showInputUsfm});
        }
    }

    render() {
        return (
            <div>
                <div className="column column-left">
                    <InputSelector 
                        onChange={this.handleInputChange} 
                        demoUsfmStrings={this.props.usfmStrings}
                    />
                    <h2>Editor</h2>
                    <UsfmEditor
                        usfmString={this.state.usfmInput}
                        key={this.state.usfmInput}
                        onChange={this.handleEditorChange}
                    />
                </div>
                <div className="column column-right">
                    <InputUsfm
                        usfm={this.state.usfmInput}
                        onShowInputChange={this.handleShowInputChange}
                        showInput={this.state.showInputUsfm}
                    />
                    <h2>Output USFM</h2>
                    <pre className="usfm-container">{this.state.usfmOutput}</pre>
                </div>
            </div>
        )
    }
}
