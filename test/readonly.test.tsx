/* eslint-disable jest/expect-expect */

import * as React from "react"
import { ReactEditor } from "slate-react"
import { BasicUsfmEditor } from "../src/components/BasicUsfmEditor"
import { render, unmountComponentAtNode } from "react-dom"
import { act } from "react-dom/test-utils"

let container: HTMLElement | null = null

beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
})

afterEach(() => {
    if (container) {
        unmountComponentAtNode(container)
        container?.remove()
    }
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

    const actual = ReactEditor.isReadOnly(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        editorRef.current!.slateEditor
    )
    expect(actual).toBe(readOnly)
}
