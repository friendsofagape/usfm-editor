const STYLE_TYPES = ['paragraph', 'character', 'note', 'milestone']

export type StyleType = typeof STYLE_TYPES[number]

export function isStyleType(s: string): s is StyleType {
    return STYLE_TYPES.includes(s)
}
