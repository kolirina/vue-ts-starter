var path = require("path");
var webpack = require("webpack");

module.exports = {
    devServer: {
        historyApiFallback: true,
        noInfo: true,
    },
    devtool: "#eval-source-map",
    entry: "./src/index.ts",
    mode: process.env.NODE_ENV,
    module: {
        rules: [
            {
                exclude: /node_modules/,
                loader: "ts-loader",
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
                test: /\.tsx?$/,
            },
            {
                loader: "file-loader",
                options: {
                    name: "[name].[ext]?[hash]",
                },
                test: /\.(png|jpg|gif|svg)$/,
            },
            {
                loader: ["style-loader", "css-loader", "stylus-loader"],
                test: /\.styl$/,
            },
        ],
    },
    node: {
        fs: "empty",
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

if (process.env.NODE_ENV === "production") {
    module.exports.devtool = "source-map";
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins.push(...[
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: '"production"',
            },
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ]);
}
