import React from "react";

function numberClassNames(node) {
    if (node.text === "front") return "Front";
    if (node.text === "1") return "One";
    return "";
}

function destructureTag(node) {
    const [, pluses, baseTag, number] = node.type.match(/^(\+*)(.*?)(\d*)$/);
    return {pluses, baseTag, number};
}

const nodeRenderers = {
    /** BookId */
    'id': props =>
        <div {...props.attributes} className="BookId">{props.children}</div>,

    /** ChapterNumber */
    'chapterNumber': props =>
        <h1 {...props.attributes} className={`ChapterNumber ${numberClassNames(props.node)}`}>{props.children}</h1>,

    /** VerseNumber */
    'verseNumber': props =>
        <sup {...props.attributes} className={`VerseNumber ${numberClassNames(props.node)}`}>{props.children}</sup>,

    /** Footnote */
    'f': props =>
        <div {...props.attributes} className="Footnote">{props.children}</div>,

    /** Paragraph */
    'p': props =>
        <p {...props.attributes}>{props.children}</p>,

    /** BookReference */
    'bk': props =>
        <cite {...props.attributes}>{props.children}</cite>,

    /** Reference */
    'r': props =>
        <h3 {...props.attributes}><cite>{props.children}</cite></h3>,

    /** NomenDomini */
    'nd': props =>
        <span className="NomenDomini" {...props.attributes}>{props.children}</span>,

    /** SectionHeader and Chunk */
    's': props => {
        const {number} = destructureTag(props.node);
        if (number == 5 && props.node.text.trim() === "") {
            // Some editors use \s5 as a chunk delimiter. Separate chunks by horizontal rules.
            return <hr {...props.attributes} />;
        } else {
            const HeadingTag = `h${number || 1}`;
            return <HeadingTag {...props.attributes}>{props.children}</HeadingTag>;
        }
    },
};

function renderInline(props, editor, next) {
    const {isFocused, isSelected, attributes, children, node, parent, readOnly, editor: propsEditor} = props;
    const {pluses, baseTag, number} = destructureTag(node);

    const renderer = nodeRenderers[baseTag];
    if (renderer) {
        return renderer(props);
    } else {
        return next();
    }
}

export function UsfmRenderingPlugin(options) {
    return {
        renderInline: renderInline
    };
}

