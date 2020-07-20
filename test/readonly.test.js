import * as React from "react"
import { ReactEditor } from 'slate-react'
import { UsfmEditor } from "../src/components/UsfmEditor";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils"

let container = null
let editor = null
const onEditorChange = (e) => editor = e

const UsfmEditorTest = ({readOnly}) => {
    return <UsfmEditor
        readOnly={readOnly}
        usfmString={'test'}
        onChange={jest.fn()}
        identification={{}}
        onIdentificationChange={jest.fn()}
        onEditorChange={onEditorChange}
    />
}

beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
})

afterEach(() => {
    unmountComponentAtNode(container)
    container.remove()
    container = null
})

it("should be readonly", () => {
    act(() => {
        render(<UsfmEditorTest readOnly={true} />, container)
    })
    expect(ReactEditor.isReadOnly(editor)).toBe(true)
})

it("should not be readonly", () => {
    act(() => {
        render(<UsfmEditorTest readOnly={false} />, container)
    })
    expect(ReactEditor.isReadOnly(editor)).toBe(false)
})