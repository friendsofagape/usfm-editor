import * as React from "react";
import { useMemo, useState, useCallback, useEffect } from 'react';
import { withReact, Slate, Editable } from "slate-react";
import { createEditor } from 'slate';
import { renderElementByType, renderLeafByProps } from './usfmRenderer';
import { usfmToSlate } from '../transforms/usfmToSlate';
import { customNormalizeNode, runInitialNormalize } from "./normalizeNode";

export const UsfmEditor = ({ usfmString, plugins, onChange}) => {

    const initialValue = useMemo(() => usfmToSlate(usfmString), [])
    const editor = useMemo(() => withReact(createEditor()), [])
    const normalizeNode = useMemo(() => editor.normalizeNode, [])
    const [value, setValue] = useState(initialValue)

    editor.normalizeNode = entry => {
        customNormalizeNode(editor, entry, normalizeNode)
    }

    editor.isInline = element => {
        return false
    }

    useEffect(() => {
        runInitialNormalize(editor)
    }, [])

    const handleChange = value => {
        console.debug("After change", value)
        setValue(value)
    }

    return (
        <Slate
            editor={editor}
            value={value}
            onChange={handleChange}
        >
            <Editable 
                renderElement={renderElementByType}
                renderLeaf={renderLeafByProps}
                spellCheck={false}
            />
        </Slate>
    )
}
