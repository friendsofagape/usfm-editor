import * as React from "react";
import { useMemo, useState, useEffect } from 'react';
import { withReact, Slate, Editable } from "slate-react";
import { createEditor, } from 'slate';
import { renderElementByType, renderLeafByProps } from '../transforms/usfmRenderer';
import { usfmToSlate } from '../transforms/usfmToSlate';
import { customNormalizeNode, runInitialNormalize } from "../plugins/normalizeNode";
import { handleKeyPress, withBackspace, withDelete, withEnter } from '../plugins/keyHandlers.ts';
import { NodeTypes } from "../utils/NodeTypes";
import { withSectionHeaders } from '../plugins/sectionHeaderPlugin';
import { HoveringToolbar } from "./HoveringToolbar";

export const UsfmEditor = ({ usfmString, plugins, onChange}) => {

    const initialValue = useMemo(() => usfmToSlate(usfmString), [])
    const editor = useMemo(
        () =>
            compose(
                withSectionHeaders,
                withBackspace,
                withDelete,
                withEnter,
                withReact,
                createEditor
            )(),
        []
    )
    const normalizeNode = useMemo(() => editor.normalizeNode, [])

    const [value, setValue] = useState(initialValue)

    const handleChange = value => {
        console.debug("After change", value)
        setValue(value)
    }

    const onKeyDown = event => {
        handleKeyPress(event, editor)
    }

    editor.normalizeNode = entry => {
        customNormalizeNode(editor, entry, normalizeNode)
    }

    editor.isInline = element => {
        return false
    }

    editor.isVoid = element => {
        return element.type == NodeTypes.HEADERS
    }

    useEffect(() => {
        runInitialNormalize(editor)
    }, [])

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
