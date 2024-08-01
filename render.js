const languages = [
    "markup", "css", "clike", "javascript", "bash", "c", "csharp", "cpp", "cobol", "css-extras", "csv", "git", "gradle", "groovy", "http", "java", "json", "json5", "kotlin", "less", "markdown", "powershell", "python", "r", "jsx", "tsx", "sass", "scss", "shell-session", "sql", "typescript", "typoscript", "xml-doc", "yaml"
];

const formatCode = require('./format.js');

setTimeout(() => {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        const {type, value} = message;
        if (type === 'buttonFlag' && value === 'true') {
            isConversionOn = true;
            scanDocument();
        } else {
            isConversionOn = false;
            revertDocument();
        }
    });
}, 1000);

let isConversionOn = false;

function convertToPreCode(language, codeContent) {
    let formattedContent = codeContent
        .replace(/<p>/g, '\n')  // Replace remaining <p> tags with newline characters
        .replace(/<\/p>/g, '')  // Remove remaining </p> tags
        .replace(/<br>/g, '')   // Remove <br> tags
        .trim();
    formattedContent = formatCode(formattedContent, language);
    return `<pre class="language-${language}" data-src="plugins/toolbar/prism-toolbar.js" contenteditable="false"><code class="language-${language}">${formattedContent}</code></pre>`;
}

function scanDocument() {
    if (!isConversionOn) return;

    console.log("%cScanning document", "color: green; font-size: 16px;");

    const pattern = /<p>''' (\w+)([\s\S]*?)'''<\/p>/g;
    let matches;
    let bodyContent = document.body.innerHTML;
    let modifiedContent = bodyContent;

    while ((matches = pattern.exec(bodyContent)) !== null) {
        const language = matches[1];
        const codeContent = matches[2]
            .replace(/^<\/p>/, '')  // Remove the first </p>
            .replace(/<p>$/, '')    // Remove the last <p>;
        if (languages.includes(language)) {
            const originalCode = matches[0];
            const formattedCode = convertToPreCode(language, codeContent);
            modifiedContent = modifiedContent.replace(originalCode, formattedCode);
        }
    }

    document.body.innerHTML = modifiedContent;
    Prism.highlightAll();
}

function revertDocument() {
    if (isConversionOn) return;

    console.log('%cReverting document', 'color: red; font-size: 16px;');

    document.querySelectorAll('pre > code').forEach(codeElement => {
        const preElement = codeElement.parentElement;
        const languageClass = Array.from(codeElement.classList).find(cls => cls.startsWith('language-'));
        if (languageClass) {
            const language = languageClass.replace('language-', '');
            if (languages.includes(language)) {
                const formattedCode = preElement.outerHTML;
                if (formattedCode) {
                    const lines = formattedCode.split('\n');
                    const revertedCode = [`<p>''' ${language}</p>`]
                    lines.map(line => {
                            line = line
                                .replace(/<pre[^>]*><code[^>]*>/g, '')
                                .replace(/<\/code><\/pre>/g, '')
                                .replace(/<span[^>]*>/g, '')
                                .replace(/<\/span>/g, '')
                                .replace(/<\/p><p><\/p>/g, '</p>')
                        revertedCode.push(`<p>${line.trim()}</p>`);
                        }
                    );
                    revertedCode.push(`<p>'''</p>`);
                    preElement.outerHTML = revertedCode.join('');

                    document.querySelectorAll('div.toolbar > div.toolbar-item > button').forEach(button => {
                        button.outerHTML = '';
                    });
                }
            }
        }
    });
}
