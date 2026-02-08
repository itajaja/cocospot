import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class CopyPublicPlugin {
  constructor(publicPath) {
    this.publicPath = publicPath;
  }
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync("CopyPublicPlugin", (compilation, callback) => {
      const publicDir = path.resolve(__dirname, "public");
      const outDir = compiler.options.output.path;
      const copyRecursive = (src, dest) => {
        for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath);
          } else if (entry.name === "manifest.json") {
            const manifest = JSON.parse(fs.readFileSync(srcPath, "utf8"));
            manifest.start_url = this.publicPath;
            manifest.icons = manifest.icons.map((icon) => ({
              ...icon,
              src: icon.src.replace(/^\//, this.publicPath),
            }));
            fs.writeFileSync(destPath, JSON.stringify(manifest, null, 2));
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      if (fs.existsSync(publicDir)) {
        copyRecursive(publicDir, outDir);
      }
      callback();
    });
  }
}

export default (env, argv) => {
  const publicPath = argv.mode === "production" ? "/cocospot/" : "/";
  return {
  entry: "./src/main.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    publicPath,
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: { syntax: "typescript", tsx: true },
              transform: { react: { runtime: "automatic" } },
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      publicPath,
      templateParameters: { basePath: publicPath },
    }),
    new CopyPublicPlugin(publicPath),
  ],
  devServer: {
    port: 3456,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, "public"),
    },
  },
};};
