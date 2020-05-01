import * as React from "react";
import {UsfmEditor} from "../components/UsfmEditor";
import {InputSelector} from "./InputSelector";
import {InputUsfm} from "./InputUsfm";
import {usfmToSlate} from "../transforms/usfmToSlate.js";
import {slateToUsfm} from "../transforms/slateToUsfm.ts";
import "./demo.css";
import { OutputUsfm } from "./OutputUsfm";

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
            showInputUsfm: false
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
                <div className={ this.state.showInputUsfm ? "" : "row" }>
                    <div className="column column-left">
                        <InputSelector 
                            onChange={this.handleInputChange} 
                            demoUsfmStrings={this.props.usfmStrings}
                        />
                    </div>
                    <div className="column column-right">
                        <InputUsfm
                            usfm={this.state.usfmInput}
                            onShowInputChange={this.handleShowInputChange}
                            showInput={this.state.showInputUsfm}
                        />
                        {
                            this.state.showInputUsfm
                                ? <OutputUsfm usfm={this.state.usfmOutput} />
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
