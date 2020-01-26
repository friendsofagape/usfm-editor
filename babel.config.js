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
    ],
    "plugins": [
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-object-rest-spread"
    ]
};
