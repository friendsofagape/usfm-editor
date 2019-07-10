import React from "react";

function numberClassNames(node) {
    const isFront = node.text === "front";
    const isOne = node.text === "1";
    return isFront ? "Front" : isOne ? "One" : "";
}

function destructureTag(node) {
    const [, pluses, baseTag, number] = node.type.match(/^(\+*)(.*?)(\d*)$/);
    return {pluses, baseTag, number};
}

const components = new Map([
    ['id', props =>
        <div {...props.attributes} className="BookId">{props.children}</div>
    ],
    ['chapterNumber', props =>
        <h1 {...props.attributes} className={`ChapterNumber ${numberClassNames(props.node)}`}>{props.children}</h1>
    ],
    ['verseNumber', props =>
        <sup {...props.attributes} className={`VerseNumber ${numberClassNames(props.node)}`}>{props.children}</sup>
    ],
    ['f', props =>
        <div {...props.attributes} className="Footnote">{props.children}</div>
    ],
    ['p', props =>
        <p {...props.attributes}>{props.children}</p>
    ],
    ['bk', props =>
        <cite {...props.attributes}>{props.children}</cite>
    ],
    ['nd', props =>
        <span className="NomenDomini" {...props.attributes}>{props.children}</span>
    ],
    ['s', props => {
        const {number} = destructureTag(props.node);
        if (number == 5 && props.node.text.trim() === "") {
            // Some editors use \s5 as a chunk delimiter. Separate chunks by horizontal rules.
            return <hr {...props.attributes} />;
        } else {
            const HeadingTag = `h${number || 1}`;
            return <HeadingTag {...props.attributes}>{props.children}</HeadingTag>;
        }
    }],
    ['r', props =>
        <h3 {...attributes}><cite>{children}</cite></h3>
    ]
]);

export function UsfmRenderingPlugin(options) {
    return {
        renderInline: function (props, editor, next) {
            const {isFocused, isSelected, attributes, children, node, parent, readOnly, editor: propsEditor} = props;
            const {pluses, baseTag, number} = destructureTag(node);

            const componentBuilder = components.get(baseTag);
            if (componentBuilder) {
                return componentBuilder(props);
            } else {
                return next();
            }
        }
    };
}

