import * as React from "react"
import { small } from "./usfm";
import { ReactEditor } from 'slate-react'
import { UsfmEditor } from "../src/components/UsfmEditor";

let container = null
let editor = null
let readonly = false

beforeAll(() => {
    editor = <UsfmEditor
        usfmString={small}
        onChange={() => {}}
        readOnly={readonly}
        identification={{}}
        onIdentificationChange={() => {}}
    />
})

test('', () => {
    expect(ReactEditor.isReadOnly(editor)).toBe(false)

    readonly = true
    expect(ReactEditor.isReadOnly(editor)).toBe(true)
})