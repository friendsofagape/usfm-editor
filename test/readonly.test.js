import * as React from "react"
import { ReactEditor } from 'slate-react'
import { UsfmEditor } from "../src/components/UsfmEditor";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils"

let container = null

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
    testReadOnly(true)
})

it("should not be readonly", () => {
    testReadOnly(false)
})

const UsfmEditorTest = React.forwardRef(({readOnly}, ref) => (
    <UsfmEditor
        readOnly={readOnly}
        usfmString={'test'}
        onChange={jest.fn()}
        identification={{}}
        onIdentificationChange={jest.fn()}
        ref={ref}
    />
))

function testReadOnly(readOnly) {
    const ref = React.createRef()
    act(() => {
        render(<UsfmEditorTest readOnly={readOnly} ref={ref} />, container)
    })
    expect(ReactEditor.isReadOnly(ref.current.editor)).toBe(readOnly)
}