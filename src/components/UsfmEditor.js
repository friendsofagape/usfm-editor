import React from "react";
import PropTypes from "prop-types"
import {Value} from "slate";
import {Editor} from "slate-react";
import usfmjs from "usfm-js";
import "./UsfmEditor.css";
import {UsfmRenderingPlugin} from "./UsfmRenderingPlugin"
import {toUsfmJsonAndSlateJson} from "./usfmJsToSlateJson";

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
        if (!usfmString) return {usfmJsDocument: {}, value: Value.create()};

        const {usfmJsDocument, slateDocument} = toUsfmJsonAndSlateJson(usfmString);
        const value = Value.fromJSON(slateDocument);
        console.debug("Deserialized USFM as Slate Value", value);
        return {usfmJsDocument, value};
    }

    /** {plugins, usfmJsDocument, value} */
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
        console.debug("change:", change);
        for (const op of change.operations) {
            switch (op.type) {
                case 'set_selection':
                    break;

                case 'insert_text': {
                    console.debug(op.type, op);
                    const node = this.state.value.document.getClosestInline(op.path);
                    const source = node.data.get("source");
                    console.debug("insert_text node", node);
                    console.debug("insert_text source", source);
                    const sourceField = source.type === "contentWrapper" ? "content" : "text";
                    const sourceText = source[sourceField];
                    source[sourceField] = sourceText.slice(0, op.offset) + op.text + sourceText.slice(op.offset);
                    console.debug("insert_text updated source", source);
                    break;
                }

                case 'remove_text': {
                    console.debug(op.type, op);
                    const node = this.state.value.document.getClosestInline(op.path);
                    const source = node.data.get("source");
                    console.debug("remove_text node", node);
                    console.debug("remove_text source", source);
                    const sourceField = source.type === "contentWrapper" ? "content" : "text";
                    const sourceText = source[sourceField];
                    source[sourceField] = sourceText.slice(0, op.offset) + sourceText.slice(op.offset + op.text.length);
                    console.debug("remove_text updated source", source);
                    break;
                }

                case 'add_mark':
                case 'remove_mark':
                case 'set_mark':

                case 'insert_node':
                case 'merge_node':
                case 'move_node':
                case 'remove_node':
                case 'set_node':
                case 'split_node':

                case 'set_value':

                default:
                    console.debug(op.type, op);
            }

            this.setState({ value: change.value, usfmJsDocument: this.state.usfmJsDocument});

            const serialized = usfmjs.toUSFM(this.state.usfmJsDocument);
            this.props.onChange(serialized)
        }
    };
}

export default UsfmEditor;
