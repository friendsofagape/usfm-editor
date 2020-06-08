/**
 * Given a list of functions, evaluate them from right to left.
 * The right-most function should have no input arguments.
 * Each other function will take the previous result as its only
 * input argument.
 */
export const compose = (...functions) =>
    args => functions.reduceRight((arg, fn) => fn(arg), args)