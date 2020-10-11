import { identity, pathRule } from "json-transforms";

/** json-transforms rules to convert chapter/verse objects to arrays */
export const objectToArrayRules = [
    pathRule(
        '.chapters',
        d => Object.assign({}, d.context, {
            chapters: Object.entries(d.match)
                .map(e => ({
                    chapterNumber: e[0],
                    sort: (+e[0] || 0),
                    verses: Object.entries(e[1])
                        .map(f => ({
                            source: f[1],
                            verseNumber: f[0],
                            sort: parseStartVerseNumber(f[0]),
                            nodes: f[1].verseObjects
                        }))
                        .sort((a, b) => a.sort - b.sort)
                }))
                .sort((a, b) => a.sort - b.sort)
        })
    ),
    identity
];

/**
 * The 'nextChar' is used by usfm-js to designate the character that should come after
 * a usfm tag node. For our purposes, we will apply the nextChar character to the
 * front of a text node that follows such a designation, but only if there is an immediately following
 * text node.
 */
export const nextCharRules = [
    pathRule(
        '.nodes',
        d => {
            let nodes = []
            let nextChar = null
            d.context.nodes.forEach(value => {
                const node = shouldAddNextChar(nextChar, value)
                    ? addNextChar(nextChar, value)
                    : value

                nodes = nodes.concat(node)
                if (value.hasOwnProperty('nextChar')) {
                    nextChar = value.nextChar
                } else {
                    // The nextChar field should only be applied to a text node immediately
                    // following a node that designates 'nextChar'. Thus we set nextChar to
                    // null so that it does not affect later nodes, even if not a single node
                    // was affected.
                    nextChar = null
                }
            })
            return Object.assign({}, d.context, { nodes: nodes })
        }
    ),
    identity,
]

/**
 * Returns the input if the input is just a verse number (not a range),
 * or the starting verse number if the input is a verse range. 
 */
function parseStartVerseNumber(verseNumberOrRange) {
    return +verseNumberOrRange.match(/^\d*/)[0]
}

function shouldAddNextChar(nextChar, value) {
    return nextChar != null &&
        nextChar != '\n' &&
        value.type == 'text'
}

function addNextChar(nextChar, value) {
    return Object.assign({}, value, { 
        text: nextChar + value.text 
    })
}