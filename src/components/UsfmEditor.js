import React from "react";
import PropTypes from "prop-types"
import {Value} from "slate";
import {Editor} from "slate-react";
import debounce from "debounce";
import usfmjs from "usfm-js";
import "./UsfmEditor.css";
import {UsfmRenderingPlugin} from "./UsfmRenderingPlugin"
import {toUsfmJsonAndSlateJson} from "./jsonTransforms/usfmjsToSlate";
import {handleOperation} from "./operationHandlers";
import {schema} from "./schema";

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

        /** Additional SlateJS plugins to be passed to editor. */
        plugins: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

        /** Change notification. */
        onChange: PropTypes.func,
    };

    static deserialize(usfmString) {
        // Return empty values if no input.
        if (!usfmString) return {usfmJsDocument: {}, value: Value.create(), sourceMap: new Map()};

        const {usfmJsDocument, slateDocument, sourceMap} = toUsfmJsonAndSlateJson(usfmString);
        const value = Value.fromJSON(slateDocument);
        console.debug("Deserialized USFM as Slate Value", value.toJS());

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
                schema={schema}
                value={this.state.value}
                readOnly={false}
                spellCheck={false}
                onChange={this.handleChange}
            />
        );
    };

    handleChange = (change) => {
        console.info("handleChange", change);
        console.info("handleChange operations", change.operations.toJS());
        for (const op of change.operations) {
            console.debug(op.type, op);

            const {isDirty} = handleOperation(this.state.sourceMap, op, this.state.value);
            if (isDirty) {
                this.scheduleOnChange();
            }
        }
        this.setState({value: change.value, usfmJsDocument: this.state.usfmJsDocument});
    };

    scheduleOnChange = debounce(() => {
        console.debug("Serializing updated USFM", this.state.usfmJsDocument);
        const serialized = usfmjs.toUSFM(this.state.usfmJsDocument);
        this.props.onChange(serialized);
    }, 1000);
}

export default UsfmEditor;
