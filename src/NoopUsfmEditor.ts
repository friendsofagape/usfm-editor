import { UsfmEditorRef } from "./UsfmEditor";

export class NoopUsfmEditor implements UsfmEditorRef {
    getMarksAtCursor = (): string[] => {
        console.debug("Editor not initialized before getMarksAtCursor called. " +
            "This does not necessarily indicate an error.")
        return []
    }
    addMarkAtCursor = (): void => {
        console.error("Editor not initialized before addMarkAtCursor called")
    }
    removeMarkAtCursor = (): void => {
        console.error("Editor not initialized before removeMarkAtCursor called")
    }
    getParagraphTypesAtCursor = (): string[] => {
        console.debug("Editor not initialized before getParagraphTypesAtCursor called. " +
            "This does not necessarily indicate an error.")
        return []
    }
    setParagraphTypeAtCursor = (): void => {
        console.error("Editor not initialized before setParagraphTypeAtCursor called")
    }
    goToVerse = (): void => {
        console.error("Editor not initialized before goToVerse called")
    }
}