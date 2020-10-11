import { UsfmEditorRef } from "./UsfmEditor";

export class NoopUsfmEditor implements UsfmEditorRef {
    getMarksAtCursor = () => {
        console.debug("Editor not initialized before getMarksAtCursor called. " +
            "This does not necessarily indicate an error.")
        return []
    }
    addMarkAtCursor = () => {
        console.error("Editor not initialized before addMarkAtCursor called")
    }
    removeMarkAtCursor = () => {
        console.error("Editor not initialized before removeMarkAtCursor called")
    }
    getParagraphTypesAtCursor = () => {
        console.debug("Editor not initialized before getParagraphTypesAtCursor called. " +
            "This does not necessarily indicate an error.")
        return []
    }
    setParagraphTypeAtCursor = () => {
        console.error("Editor not initialized before setParagraphTypeAtCursor called")
    }
    goToVerse = () => {
        console.error("Editor not initialized before goToVerse called")
    }
}