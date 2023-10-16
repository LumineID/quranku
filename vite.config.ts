import { defineConfig, splitVendorChunkPlugin, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { join } from "path";
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import eslintPlugin from "vite-plugin-eslint";
import svgLoader from "vite-svg-loader";
import requireTransform from "vite-plugin-require-transform";

Object.assign(process.env, loadEnv(process.env.NODE_ENV, process.cwd(), ""));

const cacheCSSName: Record<string, { prefix: string, cache: Record<string, string> }> = {}

function randomString(length: number, possibleChars: null | string = null) {
    possibleChars = possibleChars || "abcdefghijklmnopqrstuvwxyz";
    let text = "";

    for (let i = 0; i < length; i++)
        text += possibleChars.charAt(
            Math.floor(Math.random() * possibleChars.length)
        );

    return text
}

// https://vitejs.dev/config/
export default defineConfig({
    base: process.env.VITE_APP_BASE_URL,
    plugins: [
        vue(),
        svgLoader(),
        vueJsx(),
        eslintPlugin(),
        requireTransform(),
        splitVendorChunkPlugin(),
        createHtmlPlugin({
            minify: true,
            inject: {
                data: {
                    baseurl: process.env.VITE_APP_BASE_URL,
                    title: process.env.VITE_APP_NAME,
                    description: "Baca dan dengarkan ayat-ayat Al-Qur`an secara online",
                    author: "lumine.id",
                    keywords: "Al-Qur`an online, Al-Qur`an Indonesia, Quran ku, Quran App, Islam, Quran",
                }
            }
        })
    ],
    css: {
        preprocessorOptions: {
            extract: true,
            scss: {
                additionalData: `@import "./src/assets/scss/variables"; @import "~bootstrap/scss/variables-dark";`,
                sassOptions: {
                    queueMicrotask: true,
                    module: true,
                }
            },
        },
        modules: {
            generateScopedName(name: string, filename: string) {
                if (!cacheCSSName[filename]) {
                    cacheCSSName[filename] = {prefix: Object.keys(cacheCSSName).length.toString(), cache: {}}
                }
                
                if (!cacheCSSName[filename].cache[name]) {
                    cacheCSSName[filename].cache[name] = [
                        randomString(1) + Object.keys(cacheCSSName[filename].cache).length.toString() + randomString(1),
                        randomString(4)
                    ].join("-");
                }

                return [
                    "style",
                    cacheCSSName[filename].prefix + cacheCSSName[filename].cache[name]
                ].map(String).join("-");
            }
        }
    },
    resolve: {
        alias: {
            "@": join(__dirname, "src"),
            "~bootstrap": join(__dirname, "node_modules/bootstrap")
        }
    }
})
