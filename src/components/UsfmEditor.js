import * as React from "react";
import { useMemo, useState } from 'react';
import { withReact, Slate, Editable } from "slate-react";
import { createEditor, } from 'slate';
import { renderElementByType, renderLeafByProps } from '../transforms/usfmRenderer';
import { usfmToSlate } from '../transforms/usfmToSlate';
import { withNormalize } from "../plugins/normalizeNode";
import { handleKeyPress, withBackspace, withDelete, withEnter } from '../plugins/keyHandlers.ts';
import { NodeTypes } from "../utils/NodeTypes";
import { HoveringToolbar } from "./HoveringToolbar";

export const UsfmEditor = ({ usfmString, plugins, onChange }) => {

    const initialValue = useMemo(() => usfmToSlate(usfmString), [])
    const editor = useMemo(
        () =>
            compose(
                withBackspace,
                withDelete,
                withEnter,
                withNormalize,
                withReact,
                createEditor
            )(),
        []
    )

    const [value, setValue] = useState(initialValue)

    const handleChange = value => {
        setValue(value)
    }

    const onKeyDown = event => {
        handleKeyPress(event, editor)
    }

    editor.isInline = element => {
        return false
    }

    editor.isVoid = element => {
        return element.type == NodeTypes.HEADERS
    }

    return (
        <Slate
            editor={editor}
            value={value}
            onChange={handleChange}
        >
            <HoveringToolbar />
            <Editable
                renderElement={renderElementByType}
                renderLeaf={renderLeafByProps}
                spellCheck={false}
                onKeyDown={onKeyDown}
            />
        </Slate>
    )
}

const compose = (...functions) =>
    args => functions.reduceRight((arg, fn) => fn(arg), args)
