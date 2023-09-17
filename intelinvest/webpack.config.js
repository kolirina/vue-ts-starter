const path = require("path");
const webpack = require("webpack");

module.exports = {
    devServer: {
        historyApiFallback: true,
        noInfo: true,
    },
    devtool: "eval-source-map",
    entry: "./src/index.ts",
    mode: process.env.NODE_ENV,
    module: {
        rules: [
            {
                exclude: /node_modules/,
                loader: "ts-loader",
                test: /\.ts$/,
                options: {
                }
            }
        ]
    },
    output: {
        filename: "build.js",
        path: path.resolve(__dirname, "./dist"),
        publicPath: "/dist/",
    },
    performance: {
        hints: false,
    },
    plugins: [],
    resolve: {
        alias: {
            "vue$": "vue/dist/vue.esm.js",
        },
        extensions: [".ts", ".js", ".json"],
    },
};
