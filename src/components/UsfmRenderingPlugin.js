import React from "react";

export function UsfmRenderingPlugin(options) {
    return {
        renderBlock: renderNode,
        renderInline: renderNode
    };
}

function renderNode(props, editor, next) {
    const {isFocused, isSelected, attributes, children, node, parent, readOnly, editor: propsEditor} = props;
    const {pluses, baseTag, number} = destructureTag(node);

    const renderer = nodeRenderers[baseTag];
    if (renderer) {
        return renderer(props);
    } else {
        return next();
    }
}

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
    /** Disregarded inline wrappers */
    'textWrapper':  props => props.children,
    'contentWrapper':  props => props.children,

    /** Disregarded block just to prevent inlines and blocks from being siblings */
    'chapterBody': props => props.children,

    /** Disregarded block just to prevent inlines and blocks from being siblings */
    'verseBody': props => props.children,

    /** Chapter holder */
    'chapter': props =>
        <div {...props.attributes} className="Chapter">{props.children}</div>,

    /** Verse holder */
    'verse': props =>
        <span {...props.attributes} className="Verse">{props.children}</span>,

    /** BookId */
    'id': props =>
        <div {...props.attributes} className="BookId">{props.children}</div>,

    /** ChapterNumber */
    'chapterNumber': props =>
        <h1 {...props.attributes} className={`ChapterNumber ${numberClassNames(props.node)}`}>
            {props.children}
        </h1>,

    /** VerseNumber */
    'verseNumber': props =>
        <sup {...props.attributes} className={`VerseNumber ${numberClassNames(props.node)}`}>
            {props.children}
        </sup>,

    /** Front faux verse number */
    'front': props =>
        <sup {...props.attributes} className={`VerseNumber Front`}>
            {props.children}
        </sup>,

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
            const HeadingTag = `h${number || 3}`;
            return <HeadingTag {...props.attributes}>{props.children}</HeadingTag>;
        }
    },
};
