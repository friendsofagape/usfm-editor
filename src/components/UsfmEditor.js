import React from "react";
import {Value} from "slate";
import {Editor} from "slate-react";
import "./UsfmEditor.css";
import {UsfmRenderingPlugin} from "./UsfmRenderingPlugin"
import {usfmJsToSlateJson} from "./usfmJsToSlateJson";

/**
 * Simple pass-through to slate Editor for now....
 */
const UsfmEditor = React.forwardRef(({plugins, usfmString, ...props}, ref) => {
        const value = deserialize(usfmString);
        const amendedPlugins = (plugins || []).concat(UsfmRenderingPlugin());

        return (
            <Editor
                plugins={amendedPlugins}
                value={value}
                {...props}
                // onChange={handleChange}
                // className={className}
                ref={ref}
            />
        );
    }
);

function deserialize(usfm) {
    const slateDocument = usfm && usfmJsToSlateJson(usfm);
    const value = usfm ? Value.fromJSON(slateDocument) : Value.create();
    console.debug("Value object", value);

    return value;
}

export default UsfmEditor;
