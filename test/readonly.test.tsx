/* eslint-disable jest/expect-expect */

import * as React from "react"
import { ReactEditor } from "slate-react"
import { BasicUsfmEditor } from "../src/components/BasicUsfmEditor"
import { render, unmountComponentAtNode } from "react-dom"
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

function testReadOnly(readOnly: boolean) {
    const editorRef = React.createRef<BasicUsfmEditor>()
    act(() => {
        render(
            <BasicUsfmEditor
                readOnly={readOnly}
                usfmString={"test"}
                ref={editorRef}
            />,
            container
        )
    })
    expect(ReactEditor.isReadOnly(editorRef.current.slateEditor)).toBe(readOnly)
}
