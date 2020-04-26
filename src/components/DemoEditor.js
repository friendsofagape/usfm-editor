import * as React from "react";
import {UsfmEditor} from "./UsfmEditor";
import {DemoInputSelector} from "./DemoInputSelector";
import {usfmToSlate} from "../transforms/usfmToSlate.js";
import {slateToUsfm} from "../transforms/slateToUsfm.ts";
import "./demo.css";

function transformToOutput(usfm) {
    return slateToUsfm(usfmToSlate(usfm))
}

export class DemoEditor extends React.Component {
    constructor(props) {
        super(props);
        const initialUsfm = props.usfmStrings.get("small");
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
                <DemoInputSelector 
                    onChange={this.handleInputChange} 
                    demoUsfmStrings={this.props.usfmStrings}
                />

                <div class="column column-left">
                    <h2>Editor</h2>
                    <UsfmEditor
                        usfmString={this.state.usfmInput}
                        key={this.state.usfmInput}
                        onChange={this.handleEditorChange}
                    />
                    
                    <h2>Input USFM</h2>
                    <pre class="usfm-container">{this.state.usfmInput}</pre>
                </div>
                <div class="column column-right">
                    <h2>Output USFM</h2>
                    <pre class="usfm-container">{this.state.usfmOutput}</pre>
                </div>
            </div>
        )
    }
}
