import { Text } from 'slate'

export const MyText = {
    ...Text,
    marks
}

function marks(text: Text): string[] {
    return Object.keys(text)
        .filter(key => key != "text")
}
