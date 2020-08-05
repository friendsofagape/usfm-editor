module.exports = {
    presets: [
        [
            "@babel/preset-react",
            {
				"include": ["@babel/plugin-transform-spread"],
                "targets": {
                    "node": "8.9.3",
                    "electron": "2.0.10"
                }
            }
        ],
        [
            "@babel/preset-env", 
            {
                "targets": {
                    "node": "current"
                }
            }
        ],
        '@babel/preset-typescript'
    ],
    "plugins": [
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-object-rest-spread"
    ]
};
