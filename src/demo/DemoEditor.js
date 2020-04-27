import * as React from "react";
import {UsfmEditor} from "../components/UsfmEditor";
import {InputSelector} from "./InputSelector";
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
            usfmOutput: transformToOutput(initialUsfm)
        };
        this.handleInputChange =
            input => this.setState(
                { 
                    usfmInput: input,
                    usfmOutput: transformToOutput(input)
                }
            );
        this.handleEditorChange = (usfm) => this.setState({ usfmOutput: usfm });
    }

    render() {
        return (
            <div>
                <InputSelector 
                    onChange={this.handleInputChange} 
                    demoUsfmStrings={this.props.usfmStrings}
                />

                <div className="column column-left">
                    <h2>Editor</h2>
                    <UsfmEditor
                        usfmString={this.state.usfmInput}
                        key={this.state.usfmInput}
                        onChange={this.handleEditorChange}
                    />
                    
                    <h2>Input USFM</h2>
                    <pre className="usfm-container">{this.state.usfmInput}</pre>
                </div>
                <div className="column column-right">
                    <h2>Output USFM</h2>
                    <pre className="usfm-container">{this.state.usfmOutput}</pre>
                </div>
            </div>
        )
    }
}
