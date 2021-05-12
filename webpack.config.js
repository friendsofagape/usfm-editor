module.exports = {
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
        rules: [
            {
                test: /\.(t|j)sx?$/,
                exclude: /node_modules/,
                loader: "ts-loader",
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.js?$/,
                loader: "source-map-loader",
                enforce: "pre",
            },
            {
                test: /\.svg$/,
                use: ["@svgr/webpack", "file-loader"],
            },
        ],
    },
    optimization: {
        minimize: false,
    },
}
