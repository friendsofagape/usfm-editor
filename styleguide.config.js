const path = require('path'); 

module.exports = {
    "skipComponentsWithoutExample": true,
    "styleguideDir": "docs",
    propsParser: (filePath, source, resolver, handlers) => {
        const { ext } = path.parse(filePath);
        return ext === '.tsx'
        ? require('react-docgen-typescript').parse(
            filePath,
            source,
            resolver,
            handlers
            )
        : require('react-docgen').parse(source, resolver, handlers);
    },
};
