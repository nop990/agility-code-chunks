const hljs = require("highlight.js/lib/core");
const hljsCOBOL = require("highlightjs-cobol/src/cobol");
const axios = require("axios").default;

const languages = [
    "markup", "css", "clike", "javascript", "bash", "c", "csharp", "cpp", "cobol", "css-extras", "csv", "git", "gradle", "groovy", "http", "java", "json", "json5", "kotlin", "less", "markdown", "powershell", "python", "r", "jsx", "tsx", "sass", "scss", "shell-session", "sql", "typescript", "typoscript", "xml-doc", "yaml"
];

window.hljs = hljs;

hljs.registerLanguage("markdown", require("highlight.js/lib/languages/markdown"));
hljs.registerLanguage("markup", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("css", require("highlight.js/lib/languages/css"));
hljs.registerLanguage("scss", require("highlight.js/lib/languages/scss"));
hljs.registerLanguage("less", require("highlight.js/lib/languages/less"));
hljs.registerLanguage("typescript", require("highlight.js/lib/languages/typescript"));
hljs.registerLanguage("javascript", require("highlight.js/lib/languages/javascript"));
hljs.registerLanguage("php", require("highlight.js/lib/languages/php"));
hljs.registerLanguage("bash", require("highlight.js/lib/languages/bash"));
hljs.registerLanguage("shell", require("highlight.js/lib/languages/shell"));
hljs.registerLanguage("powershell", require("highlight.js/lib/languages/powershell"));
hljs.registerLanguage("DOS", require("highlight.js/lib/languages/dos"));
hljs.registerLanguage("c", require("highlight.js/lib/languages/c"));
hljs.registerLanguage("c++", require("highlight.js/lib/languages/cpp"));
hljs.registerLanguage("c#", require("highlight.js/lib/languages/csharp"));
hljs.registerLanguage("java", require("highlight.js/lib/languages/java"));
hljs.registerLanguage("python", require("highlight.js/lib/languages/python"));
hljs.registerLanguage("kotlin", require("highlight.js/lib/languages/kotlin"));
hljs.registerLanguage("sql", require("highlight.js/lib/languages/sql"));
hljs.registerLanguage("cobol", hljsCOBOL);
hljs.registerLanguage("json", require("highlight.js/lib/languages/json"));
hljs.registerLanguage("yaml", require("highlight.js/lib/languages/yaml"));
hljs.registerLanguage("groovy", require("highlight.js/lib/languages/groovy"));
hljs.registerLanguage("gradle", require("highlight.js/lib/languages/gradle"));
hljs.registerLanguage("http", require("highlight.js/lib/languages/http"));
hljs.registerLanguage("r", require("highlight.js/lib/languages/r"));
hljs.registerLanguage("dockerfile", require("highlight.js/lib/languages/dockerfile"));
hljs.registerLanguage("plaintext", require("highlight.js/lib/languages/plaintext"));

setTimeout(() => {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        const {type, value} = message;
        if (type === 'buttonFlag' && value === 'true') {
            isConversionOn = true;
            scanDocument().then();
        } else {
            isConversionOn = false;
            revertDocument();
        }
    });
}, 1000);

let isConversionOn = false;

async function convertToPreCode(language, codeContent) {
    let formattedContent = codeContent
        .replace(/<p>/g, '\n')  // Replace remaining <p> tags with newline characters
        .replace(/<\/p>/g, '\n')  // Remove remaining </p> tags
        .replace(/<br([\s\S]*?)>/g, '\n')   // Remove <br> tags
        .replace(/&nbsp;/g, '') // Replace non-breaking space with regular space
        .trim();

    if (!languages.includes(language)) {
        language = 'plaintext';
    } else {
        try {
            const response = await axios.post('https://agility-code-chunks-api.adaptable.app/api/format', {
                code: formattedContent,
                language: language
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            return response.data;
        } catch (error) {
            console.error("Error formatting code:", error);
            return formattedContent;
        }
    }
}

async function scanDocument() {
    if (!isConversionOn) return;

    console.log("%cScanning document", "color: green; font-size: 16px;");
    let els = 0;

    for (const el of document.querySelectorAll('.mce-content-body')) {
        const pattern = /<p>''' (\w+)([\s\S]*?)'''([\s\S]*?)<\/p>/g;
        let matches;
        let bodyContent = el.innerHTML;

        while ((matches = pattern.exec(bodyContent)) !== null) {
            els++;
            const codeBlock = matches[0];
            const language = matches[1];
            const codeContent = matches[2]
                .replace(/^<\/p>/, '')
                .replace(/<p>$/, '');

            let newElement;
            let formattedCode;

            if (languages.includes(language)) {
                await convertToPreCode(language, codeContent).then((result) => {
                    formattedCode = result;
                });
                console.log("code:", formattedCode);
                newElement = createCodeBlockElement(language);
            }
            newElement.querySelector('code').textContent = formattedCode;
            newElement.setAttribute('data-original-codeblock', codeBlock);

            el.innerHTML = el.innerHTML.replace(codeBlock, newElement.outerHTML);
        }
    }

    console.log(`%cConverted ${els} elements`, 'color: green; font-size: 16px;');

    hljs.highlightAll();
}

function revertDocument() {
    if (isConversionOn) return;

    console.log('%cReverting document', 'color: red; font-size: 16px;');
    let els = 0;

    document.querySelectorAll('.code-block').forEach(codeBlock => {
        els++;
        codeBlock.outerHTML = codeBlock.getAttribute('data-original-codeblock');
    });

    console.log(`%cReverted ${els} elements`, 'color: red; font-size: 16px;');
}

document.addEventListener("click", async (event) => {
    if (event.target.tagName.toLowerCase() === "span" && event.target.className === "copy") {
        const text = event.target.parentElement.parentElement.querySelector("code").textContent;
        await copyToClipboard(text, event.target);
    } else if(event.target.className && event.target.className.baseVal && event.target.className.baseVal.includes("close")) {
        revertDocument();
    } else {
        console.log(event.target.className.baseVal);
    }
});

async function copyToClipboard(text, button) {
    const textarea = document.createElement("textarea");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied!";
        setTimeout(() => {
            button.textContent = "Copy";
        }, 1000);
    } catch (err) {
        alert.error("Failed to copy text: ", err);
    }
    document.body.removeChild(textarea);
}

function createCodeBlockElement(language) {
    const codeBlock = document.createElement('div');
    codeBlock.className = 'code-block';
    codeBlock.setAttribute('contenteditable', 'false');

    const buttons = document.createElement('div');
    buttons.className = 'buttons';
    buttons.setAttribute('contenteditable', 'false');

    const copyButton = document.createElement('span');
    copyButton.className = 'copy';
    copyButton.textContent = 'COPY';

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = language.toUpperCase();

    const pre = document.createElement('pre');
    pre.className = 'theme-atom-one-dark text-sm relative overflow-hidden max-w-full';
    pre.setAttribute('contenteditable', 'false');

    const code = document.createElement('code');
    code.className = `language-${language}`;
    code.setAttribute('contenteditable', 'false');

    pre.appendChild(code);
    buttons.appendChild(copyButton);
    buttons.appendChild(label);
    codeBlock.appendChild(buttons);
    codeBlock.appendChild(pre);

    return codeBlock;
}