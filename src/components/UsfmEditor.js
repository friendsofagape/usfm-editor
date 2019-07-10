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
        plugins: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
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
                onChange={this.handleChange}
            />
        );
    };

    handleChange = (change) => {
        console.debug("change:", change);
        this.setState({ value: change.value })
    };
}

export default UsfmEditor;
