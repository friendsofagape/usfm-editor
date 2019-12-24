import {fauxVerseNumber} from "./numberTypes";
import {normalizeWrapper, createWrapperAndInsert} from "./NormalizeWrapper";
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
import {nodeTypes} from "../utils/nodeTypeUtils";

class Schema {
    constructor(handlerHelpers = null) {
        this.handlerHelpers = handlerHelpers;
    }

    verseBodyStartsWithTextWrapperRule = {
        nodes: [
            {
                match: {type: "textWrapper"},
                min: 1
            },
            {
                match: {object: "block"}
            }
        ],
        normalize: (editor, {node}) => {
            createWrapperAndInsert(
                node,
                nodeTypes.TEXTWRAPPER,
                editor,
                "",
                0
            )
        },
    }

    numberRule = {
        nodes: [
            {
                match: {object: 'text'},
            },
        ],
        text: /^[\w-]+$/,
        normalize: (editor, error) => {
            console.debug("error", error);
            if (error.code === NODE_TEXT_INVALID) {
                const legalValue = this.handlerHelpers
                    ? this.handlerHelpers.findNextVerseNumber()
                    : error.text.replace(/[^\w-]/g, '') || "0";
                editor.moveToRangeOfNode(error.node);
                editor.insertText(legalValue);
                editor.moveToRangeOfNode(error.node);

                // The following would be better, but I think it's blocked by a bug in Slate 0.47.4
                // editor.insertTextByKey(error.node.key, error.text.length, legalValue);
                // editor.removeTextByKey(error.node.key, 0, error.text.length);
            }
        }
    };

    schema = {
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
            chapterNumber: this.numberRule,
            chapterBody: {
                nodes: [
                    {
                        match: [{type: 'verse'}, {object: 'text'}],
                    },
                ],
                normalize: (editor, error) => {
                    console.debug(error.code, error.child);
                    const {child, node} = error;
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
            textWrapper: {
                nodes: [
                    {
                        match: [{object: 'text'}],
                        min: 1,
                        max: 1,
                    },
                ],
                normalize: (editor, { code, node, index, child }) => {
                    normalizeWrapper(editor, node);
                },
            },
            verse: {
                nodes: [
                    {
                        match: [{type: 'verseNumber'}, {type: fauxVerseNumber}, {type: 'verseBody'}, {object: 'text'}],
                    },
                ],
            },
            verseBody: this.verseBodyStartsWithTextWrapperRule,
            verseNumber: this.numberRule,
        },
        inlines: {
            front: {
                // isVoid: true
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
}

export default Schema;
