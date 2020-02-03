import React, { useEffect, useMemo, useState } from "react";
import { createEditor, Editor } from 'slate'

import { Slate, Editable, withReact } from 'slate-react'

const UsfmEditor = () => {
    const editor = useMemo(() => withReact(createEditor()), [])
    const [value, setValue] = useState([
        {
            type: 'paragraph',
            children: [{ text: 'A line of text in a paragraph.' }],
        },
    ])

    return (
        <Slate editor={editor} value={value} onChange={value => setValue(value)}>
            <Editable />
        </Slate>
    )
}

export default UsfmEditor;