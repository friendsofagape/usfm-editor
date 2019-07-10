import React from "react";
import PropTypes from "prop-types"
import {Value} from "slate";
import {Editor} from "slate-react";
import "./UsfmEditor.css";
import {UsfmRenderingPlugin} from "./UsfmRenderingPlugin"
import {usfmJsToSlateJson} from "./usfmJsToSlateJson";

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
        const slateDocument = usfmString && usfmJsToSlateJson(usfmString);
        const value = usfmString ? Value.fromJSON(slateDocument) : Value.create();
        console.debug("Deserialized USFM as Slate Value", value);
        return value;
    }

    state = {
        value: UsfmEditor.deserialize(this.props.usfmString),
        plugins: (this.props.plugins || []).concat(UsfmRenderingPlugin())
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

                case 'remove_text':
                    const node = this.state.value.document.getClosestInline(op.path);
                    const source = node.data.get("source");
                    console.debug("text deleted from node", node);
                    console.debug("text deleted from source", source);
                    break;

                case 'insert_text':

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
            this.setState({ value: change.value });
        }
    };
}

export default UsfmEditor;
