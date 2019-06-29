import React from "react";

export function UsfmRenderingPlugin(options) {
    function numberClassNames(node) {
        const isFront = node.text === "front";
        const isOne = node.text === "1";
        return isFront ? "Front" : isOne ? "One" : "";
    }

    function ChapterNumberNode(props) {
        const className = `ChapterNumber ${numberClassNames(props.node)}`;
        return (
            <h1 {...props.attributes} className={className}>
                {props.children}
            </h1>
        )
    }

    function VerseNumberNode(props) {
        const className = `VerseNumber ${numberClassNames(props.node)}`;
        return (
            <sup {...props.attributes} className={className}>
                {props.children}
            </sup>
        )
    }

    function BookIdNode(props) {
        return (
            <div {...props.attributes} className="BookId">
                {props.children}
            </div>
        )
    }

    function Footnote(props) {
        return (
            <div {...props.attributes} className="Footnote">
                {props.children}
            </div>
        )
    }

    return {
        renderInline: function (props, editor, next) {
            //const { node, attributes, children } = props;
            const [, pluses, baseTag, number] = props.node.type.match(/^(\+*)(.*?)(\d*)$/);
            switch (baseTag) {
                case 'id':
                    return <BookIdNode {...props} />;
                case 'chapterNumber':
                    return <ChapterNumberNode {...props} />;
                case 'verseNumber':
                    return <VerseNumberNode {...props} />;
                case 'f':
                    return <Footnote {...props} />;
                case 'p':
                    return <p {...props} />;
                case 'bk':
                    return <cite {...props} />;
                case 'nd':
                    return <span className="NomenDomini" {...props} />;
                case 's':
                    if (number == 5 && props.node.text.trim() === "") {
                        // Some editors use \s5 as a chunk delimiter. Separate chunks by horizontal rules.
                        return <hr />;
                    } else {
                        const HeadingTag = `h${number || 1}`;
                        return <HeadingTag {...props} />;
                    }
                case 'r':
                    return <h3 {...props.attributes}><cite>{props.children}</cite></h3>;
                default:
                    return next()
            }
        }
    };
}

