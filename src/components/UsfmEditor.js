import React from "react";
import PropTypes from "prop-types"
import {Value} from "slate";
import {Editor} from "slate-react";
import usfmjs from "usfm-js";
import "./UsfmEditor.css";
import {UsfmRenderingPlugin} from "./UsfmRenderingPlugin"
import {toUsfmJsonAndSlateJson} from "./jsonTransforms/usfmjsToSlate";

/**
 * A WYSIWYG editor component for USFM
 */
class UsfmEditor extends React.Component {
    static propTypes = {
        /**
         *  USFM contents to be edited. Updating this prop will NOT cause a rerender, so consider also setting
         *  a "key" prop to trigger changes.
         */
        usfmString: PropTypes.string,

        /** SlateJS plugins to to passed to editor. */
        plugins: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

        /** Change notification. */
        onChange: PropTypes.func,
    };

    static deserialize(usfmString) {
        // Return empty values if no input.
        if (!usfmString) return {usfmJsDocument: {}, value: Value.create(), sourceMap: new Map()};

        const {usfmJsDocument, slateDocument, sourceMap} = toUsfmJsonAndSlateJson(usfmString);
        const value = Value.fromJSON(slateDocument);
        console.debug("Deserialized USFM as Slate Value", value);

        return {usfmJsDocument, value, sourceMap};
    }

    /** @type {{plugins, usfmJsDocument, value, sourceMap}} */
    state = {
        plugins: (this.props.plugins || []).concat(UsfmRenderingPlugin()),
        ...UsfmEditor.deserialize(this.props.usfmString)
    };

    render = () => {
        return (
            <Editor
                plugins={this.state.plugins}
                value={this.state.value}
                readOnly={false}
                spellCheck={false}
                onChange={this.handleChange}
            />
        );
    };

    handleChange = (change) => {
        let isDirty = false;

        for (const op of change.operations) {
            console.debug(op.type, op);
            switch (op.type) {
                case 'add_mark':
                case 'remove_mark':
                case 'set_mark':
                case 'set_selection':
                    break;

                case 'insert_text': {
                    isDirty = true;
                    console.debug(op.type, op);
                    const node = this.state.value.document.getClosestInline(op.path);
                    const sourceKey = node.data.get("source");
                    const source = this.state.sourceMap.get(sourceKey);
                    console.debug("insert_text node", node);
                    console.debug("insert_text source", source);
                    const sourceField = source.type === "contentWrapper" ? "content" : "text";
                    const sourceText = source[sourceField];
                    source[sourceField] = sourceText.slice(0, op.offset) + op.text + sourceText.slice(op.offset);
                    console.debug("insert_text updated source", source);
                    break;
                }

                case 'remove_text': {
                    isDirty = true;
                    console.debug(op.type, op);
                    const node = this.state.value.document.getClosestInline(op.path);
                    const sourceKey = node.data.get("source");
                    const source = this.state.sourceMap.get(sourceKey);
                    console.debug("remove_text node", node);
                    console.debug("remove_text source", source);
                    const sourceField = source.type === "contentWrapper" ? "content" : "text";
                    const sourceText = source[sourceField];
                    source[sourceField] = sourceText.slice(0, op.offset) + sourceText.slice(op.offset + op.text.length);
                    console.debug("remove_text updated source", source);
                    break;
                }

                case 'insert_node':
                case 'merge_node':
                case 'move_node':
                case 'remove_node':
                case 'set_node':
                case 'split_node': {
                    isDirty = true;
                    break;
                }

                case 'set_value': {
                    isDirty = true;
                    break;
                }

                default:
                    console.warn("Unknown operation", op.type);
            }

            // TODO: put this whole function into the function version of setState
            this.setState({value: change.value, usfmJsDocument: this.state.usfmJsDocument});

            if (isDirty) {
                console.debug("Serializing and calling onChange");
                const serialized = usfmjs.toUSFM(this.state.usfmJsDocument);
                this.props.onChange(serialized); // TODO: debounce
            }
        }
    };
}

export default UsfmEditor;
