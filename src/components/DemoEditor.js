import * as React from "react";
import {UsfmEditor} from "./UsfmEditor";
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
        this.handleCannedDemoSelectionChange = 
            event => this.setState(
                { 
                    usfmInput: event.target.value, 
                    usfmOutput: transformToOutput(event.target.value)
                }
            );
        this.handleEditorChange = (usfm) => this.setState({ usfmOutput: usfm });
    }

    render() {
        return (
            <div>
                <div class="row">
                    <div class="column">
                        <h2 class="margin-below-15px">Demo text selection</h2>
                        <form>
                            <select required onChange={this.handleCannedDemoSelectionChange}>
                            {
                                Array.from(this.props.usfmStrings).map(function(arr) {
                                    const [k, v] = arr;
                                    return <option key={k} value={v}>{k}</option>;
                                })
                            }
                            </select>
                        </form>
                    </div>
                </div>

                <div>
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
            </div>
        )
    }
}
