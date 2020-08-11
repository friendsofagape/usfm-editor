import * as React from "react";
import { withReact, Slate, Editable } from "slate-react";
import { createEditor, Transforms } from 'slate';
import { renderElementByType, renderLeafByProps } from '../transforms/usfmRenderer';
import { usfmToSlate } from '../transforms/usfmToSlate';
import { withNormalize } from "../plugins/normalizeNode";
import { handleKeyPress, withBackspace, withDelete, withEnter } from '../plugins/keyHandlers';
import NodeTypes from "../utils/NodeTypes";
import { HoveringToolbar } from "./HoveringToolbar";
import { slateToUsfm } from "../transforms/slateToUsfm";
import { debounce } from "debounce";
import { flowRight, isEqual } from "lodash"
import { MyTransforms } from "../plugins/helpers/MyTransforms";
import { parseIdentificationFromUsfm, 
         filterInvalidIdentification,
         mergeIdentification,
         normalizeIdentificationValues
} from "../transforms/identificationTransforms";
import { MyEditor } from "../plugins/helpers/MyEditor";
import { PropTypes } from "prop-types" 
import "./default.css";

/**
 * A WYSIWYG editor component for USFM
 */
export class UsfmEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: usfmToSlate(props.usfmString) 
        }
        this.editor = flowRight(
            withBackspace,
            withDelete,
            withEnter,
            withNormalize,
            withReact,
            createEditor
        )()
        this.editor.isInline = element => {
            return false
        }

        this.handleChange = value => {
            console.debug("after change", value)
            if (MyEditor.isVerseOrChapterNumberSelected(this.editor)) {
                Transforms.deselect(this.editor)
                return
            }
            this.setState({ value: value })
            this.scheduleOnChange(value)
        }

        this.scheduleOnChange = debounce(function(newValue) {
            const usfm = slateToUsfm(newValue)
            this.props.onChange(usfm)
        }, 200)

        this.onKeyDown = event => {
            handleKeyPress(event, this.editor)
        }

        this.updateIdentificationFromProp = () => {
            const current = MyEditor.identification(this.editor)
            const validUpdates = this.filterAndNormalize(this.props.identification)
            const updated = mergeIdentification(current, validUpdates)

            if (! isEqual(updated, current)) {
                MyTransforms.setIdentification(this.editor, updated)
                if (this.props.onIdentificationChange) {
                    this.props.onIdentificationChange(updated)
                }
            }
        }

        this.updateIdentificationFromUsfmAndProp = () => {
            const parsedIdentification = parseIdentificationFromUsfm(this.props.usfmString)
            const validParsed = this.filterAndNormalize(parsedIdentification)
            const validUpdates = this.filterAndNormalize(this.props.identification)
            const updated = mergeIdentification(validParsed, validUpdates)

            MyTransforms.setIdentification(this.editor, updated)
            if (this.props.onIdentificationChange) {
                this.props.onIdentificationChange(updated)
            }
        }

        this.filterAndNormalize = (idJson) => {
            const filtered = filterInvalidIdentification(idJson)
            return normalizeIdentificationValues(filtered)
        }
    }

    componentDidMount() {
        this.updateIdentificationFromUsfmAndProp()
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.usfmString != this.props.usfmString) {
            this.updateIdentificationFromUsfmAndProp()
        } else if (prevProps.identification != this.props.identification) {
            this.updateIdentificationFromProp()
        }
    }

    render() {
        return (
            <Slate
                editor={this.editor}
                value={this.state.value}
                onChange={this.handleChange}
            >
                <HoveringToolbar />
                <Editable
                    readOnly={this.props.readOnly}
                    renderElement={renderElementByType}
                    renderLeaf={renderLeafByProps}
                    spellCheck={false}
                    onKeyDown={this.onKeyDown}
                    className={"usfm-editor"}
                />
            </Slate>
        )
    }
}

UsfmEditor.propTypes = {
    usfmString: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool.isRequired,
    identification: PropTypes.object,
    onIdentificationChange: PropTypes.func
}