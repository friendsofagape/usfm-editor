import * as React from "react";
import { useMemo, useState, useEffect } from 'react';
import { withReact, Slate, Editable } from "slate-react";
import { createEditor } from 'slate';
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

/**
 * A WYSIWYG editor component for USFM
 */
export const UsfmEditor = ({ 
    usfmString, 
    onChange,
    readOnly,
    identification,
    onIdentificationChange,
    onEditorChange = () => {} // for testing, to have a reference to the editor
}) => {

    const editor = useMemo(
        () =>
            flowRight(
                withBackspace,
                withDelete,
                withEnter,
                withNormalize,
                withReact,
                createEditor
            )(),
        []
    )
    onEditorChange(editor)

    const initialValue = useMemo(() => usfmToSlate(usfmString), [])

    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        updateIdentificationFromUsfmAndProp()
    }, [usfmString])

    useEffect(() => {
        updateIdentificationFromProp()
    }, [identification])

    const handleChange = value => {
        console.debug("after change", value)
        setValue(value)
        scheduleOnChange(value)
    }

    const scheduleOnChange = useMemo(() => 
        debounce(function(newValue) {
            const usfm = slateToUsfm(newValue)
            onChange(usfm)
        }, 200),
    [])

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
                readOnly={readOnly}
                renderElement={renderElementByType}
                renderLeaf={renderLeafByProps}
                spellCheck={false}
                onKeyDown={onKeyDown}
            />
        </Slate>
    )

    function updateIdentificationFromProp() {
        const current = MyEditor.identification(editor)
        const validUpdates = filterAndNormalize(identification)
        const updated = mergeIdentification(current, validUpdates)

        if (! isEqual(updated, current)) {
            MyTransforms.setIdentification(editor, updated)
            if (onIdentificationChange) {
                onIdentificationChange(updated)
            }
        }
    }

    function updateIdentificationFromUsfmAndProp() {
        const parsedIdentification = parseIdentificationFromUsfm(usfmString)
        const validParsed = filterAndNormalize(parsedIdentification)
        const validUpdates = filterAndNormalize(identification)
        const updated = mergeIdentification(validParsed, validUpdates)

        MyTransforms.setIdentification(editor, updated)
        if (onIdentificationChange) {
            onIdentificationChange(updated)
        }
    }

    function filterAndNormalize(idJson) {
        const filtered = filterInvalidIdentification(idJson)
        return normalizeIdentificationValues(filtered)
    }
}