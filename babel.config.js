module.exports = {
    presets: [
        [
            "@babel/preset-react",
            {
                include: ["@babel/plugin-transform-spread"],
            },
        ],
        [
            "@babel/preset-env",
            {
                useBuiltIns: "usage",
                corejs: 3,
                targets: {
                    node: "10",
                    electron: "4",
                },
            },
        ],
        "@babel/preset-typescript",
    ],
    plugins: ["@babel/plugin-proposal-class-properties"],
}
