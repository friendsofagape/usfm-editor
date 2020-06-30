import * as React from "react";
import { useMemo, useState, useEffect } from 'react';
import { withReact, Slate, Editable, ReactEditor } from "slate-react";
import { createEditor } from 'slate';
import { renderElementByType, renderLeafByProps } from '../transforms/usfmRenderer';
import { usfmToSlate } from '../transforms/usfmToSlate';
import { withNormalize } from "../plugins/normalizeNode";
import { handleKeyPress, withBackspace, withDelete, withEnter } from '../plugins/keyHandlers';
import { NodeTypes } from "../utils/NodeTypes";
import { HoveringToolbar } from "./HoveringToolbar";
import { slateToUsfm } from "../transforms/slateToUsfm";
import { debounce } from "debounce";
import { flowRight } from "lodash"
import { MyTransforms } from "../plugins/helpers/MyTransforms";
import { UsfmMarkers } from "../utils/UsfmMarkers";

/**
 * A WYSIWYG editor component for USFM
 */
export const UsfmEditor = ({ 
    usfmString, 
    plugins, 
    onChange,
    readOnly,
    identification,
    onIdentificationChange
}) => {
    const [identificationState, setIdentificationState] = useState(identification)

    const initialValue = useMemo(() => {
        const [ slateTree, parsedIdentification ] = usfmToSlate(usfmString)
        setIdentificationState(parsedIdentification)
        onIdentificationChange(parsedIdentification)
        return slateTree
    }, [])

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

    useEffect(
        () => {
            if(!identification ||
                identification == identificationState
            ) {
                return
            }
            const validIdJson = filterInvalidIdentification(identification)
            MyTransforms.updateIdentificationHeaders(editor, validIdJson)
            setIdentificationState(validIdJson)
            onIdentificationChange(validIdJson)
        }, [identification]
    )

    const [value, setValue] = useState(initialValue)

    const handleChange = value => {
        console.debug("after change", value)
        // When a change is made by another focused component, we
        // need to restore focus to the editor.
        if (!ReactEditor.isFocused(editor)) {
            ReactEditor.focus(editor)
        }
        MyTransforms.fixCollapsedSelectionOnNonTextNode(editor)
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

    function filterInvalidIdentification(idJson) {
        const validIdJson = {}
        Object.entries(idJson)
            .filter(entry => 
                UsfmMarkers.isIdentification(
                    entry[0],
                    (invalidMarker) => alert(
                        `Invalid identification marker: ${invalidMarker}`
                    )
                )
            )
            .forEach(entry => 
                validIdJson[entry[0]] = entry[1]
            )
        return validIdJson
    }
}