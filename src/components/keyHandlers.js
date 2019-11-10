import {usfmToSlateJson} from "./jsonTransforms/usfmToSlate";

export function handleKeyPress(event, editor, next) {
    if (event.key == "Enter") {
        event.preventDefault()
        const slateJson = usfmToSlateJson("\\p", false)
        editor.insertInline(slateJson)
    } else {
        return next()
    }
}