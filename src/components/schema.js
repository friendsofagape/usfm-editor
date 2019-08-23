import {chapterNumberName, fauxVerseNumber, verseNumberName} from "./numberTypes";

const numberRule = {
    nodes: [
        {
            match: {object: 'text'},
        },
    ],
    text: /^[\w-]+$/,
    normalize: (editor, error) => {
        console.debug("error", error);
        if (error.code === 'node_text_invalid') {
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
        chapterBody: {
            nodes: [
                {
                    match: [{type: 'verse'}, {type: 'text'}],
                },
            ],
        },
        verse: {
            nodes: [
                {
                    match: [{type: 'verseNumber'}, {type: fauxVerseNumber}, {type: 'verseBody'}],
                },
            ],
        },
        chapterNumber: numberRule,
        verseNumber: numberRule,
        front: { isVoid: true }
    },
    inlines: {
        p: {
            isVoid: true,
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

