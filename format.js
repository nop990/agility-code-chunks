const prettier = require("prettier");
const typescript = require("./node_modules/prettier/plugins/typescript");
const babel = require("./node_modules/prettier/plugins/babel");
const estree = require("./node_modules/prettier/plugins/estree");
const html = require("./node_modules/prettier/plugins/html");
const markdown = require("./node_modules/prettier/plugins/markdown");
const postcss = require("./node_modules/prettier/plugins/postcss");
const yaml = require("./node_modules/prettier/plugins/yaml");

async function formatCode(code, language) {
    try {
        let parser = language;

        return await prettier.format(code, {
            organizeImportsSkipDestructiveCodeActions: true,
            parser: parser,
            plugins: [typescript, babel, estree, html, markdown, postcss, yaml],
            tabWidth: 2,
            useTabs: true,
            semi: true,
            singleQuote: false,
            trailingComma: "none",
            bracketSpacing: true,
            arrowParens: "always",
        });
    } catch (error) {
        console.error("Error formatting code:", error);
        return code;
    }
}

/* Grabs the code chunk from the HTML, parses the code (text) and language from it, and calls formatCode() */
setTimeout(async () => {
    for (const code of document.querySelectorAll("code")) {
        const language = code.className.replace("language-", "");
        if(language != null && language.trim() !== "") {
            code.parentElement.style.setProperty("--before-content", `'${language.toUpperCase()}'`);
            code.innerText = await formatCode(code.innerText, language);
        }
    }

    Prism.highlightAll();
}, 1000)
