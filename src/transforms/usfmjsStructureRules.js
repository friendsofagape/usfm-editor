import { identity, pathRule } from "json-transforms";

/** json-transforms rules to convert chapter/verse objects to arrays */
export const objectToArrayRules = [
    pathRule(
        '.chapters',
        d => Object.assign({}, d.context, {
            source: d.match,
            chapters: Object.entries(d.match)
                .map(e => ({
                    chapterNumber: e[0],
                    sort: (+e[0] || 0),
                    verses: Object.entries(e[1])
                        .map(f => ({
                            source: f[1],
                            verseNumber: f[0],
                            sort: (+f[0] || 0),
                            nodes: f[1].verseObjects
                        }))
                        .sort((a, b) => a.sort - b.sort)
                }))
                .sort((a, b) => a.sort - b.sort)
        })
    ),
    identity
];
