import {identity, pathRule} from "json-transforms";

/**
 * json-transforms rules to replace "source" fields with keys into a source map.
 * This allows the JSON to be converted into an immutable Slate Value object and still maintain
 * links to the actual source objects (not just deep-copies).
 * @param {Map<number,Object>} map Map to store the source objects
 * @return {Array<pathRule>} json-transform path rules to replace source fields and place them in map
 */
export const sourceMapRules = (map) => {
    let nextKey = map.size + 1
    return [
        pathRule(
            '.source',
            d => {
                const key = nextKey++;
                map.set(key, d.match);
                return Object.assign({}, d.context, {source: key});
            }
        ),
        identity
    ];
};
