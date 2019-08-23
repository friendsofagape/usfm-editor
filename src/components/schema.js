import {fauxVerseNumber} from "./numberTypes";
import {
    CHILD_OBJECT_INVALID,
    CHILD_REQUIRED,
    CHILD_TYPE_INVALID,
    CHILD_UNKNOWN,
    FIRST_CHILD_OBJECT_INVALID,
    FIRST_CHILD_TYPE_INVALID,
    LAST_CHILD_OBJECT_INVALID,
    LAST_CHILD_TYPE_INVALID,
    NODE_DATA_INVALID,
    NODE_IS_VOID_INVALID,
    NODE_MARK_INVALID,
    NODE_TEXT_INVALID,
    PARENT_OBJECT_INVALID,
    PARENT_TYPE_INVALID,
} from 'slate-schema-violations'

const numberRule = {
    nodes: [
        {
            match: {object: 'text'},
        },
    ],
    text: /^[\w-]+$/,
    normalize: (editor, error) => {
        console.debug("error", error);
        if (error.code === NODE_TEXT_INVALID) {
            editor.moveToRangeOfNode(error.node);
            editor.insertText(error.text.replace(/[^\w-]/g, ''));
            // The following would be better, but I think it's blocked by a bug in Slate 0.47.4
            // editor.insertTextByKey(error.node.key, error.text.length, error.text.replace(/[^\d-]/g, ''));
            // editor.removeTextByKey(error.node.key, 0, error.text.length);
        }
    }
};

export const schema = {
    document: {
        nodes: [
            {
                match: [
                    {type: 'book'},
                    {type: 'headers'},
                    {type: 'textWrapper'},
                    {type: 'contentWrapper'},
                    {type: 'inlineBlock'},
                ],
            },
        ],
    },
    blocks: {
        book: {
            nodes: [
                {
                    match: [{type: 'headers'}, {type: 'chapter'}],
                },
            ],
        },
        chapter: {
            nodes: [
                {
                    match: [{type: 'chapterNumber'}, {type: 'chapterBody'}],
                },
            ],
        },
        chapterNumber: numberRule,
        chapterBody: {
            nodes: [
                {
                    match: [{type: 'verse'}, {object: 'text'}],
                },
            ],
            normalize: (editor, error) => {
                console.debug(error.code, error.child);
                const { child, node } = error;
                switch (error.code) {
                    case CHILD_OBJECT_INVALID:
                    case CHILD_TYPE_INVALID:
                    case CHILD_UNKNOWN:
                    case FIRST_CHILD_OBJECT_INVALID:
                    case FIRST_CHILD_TYPE_INVALID:
                    case LAST_CHILD_OBJECT_INVALID:
                    case LAST_CHILD_TYPE_INVALID:
                        editor.removeNodeByKey(child.key);
                }
            }
        },
    },
    inlines: {
        verse: {
            nodes: [
                {
                    match: [{type: 'verseNumber'}, {type: fauxVerseNumber}, {type: 'verseBody'}, {object: 'text'}],
                },
            ],
        },
        verseNumber: numberRule,
        front: {
            // isVoid: true
        },
        p: {
            // isVoid: true,
        },
        id: {
            isVoid: true,
        },

        // image: {
        //     isVoid: true,
        //     data: {
        //         src: v => v && isUrl(v),
        //     },
        // },
    },
};

