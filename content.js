const languages = [
    "markup", "css", "clike", "javascript", "bash", "c", "csharp", "cpp", "cobol", "css-extras", "csv", "git", "gradle", "groovy", "http", "java", "json", "json5", "kotlin", "less", "markdown", "powershell", "python", "r", "jsx", "tsx", "sass", "scss", "shell-session", "sql", "typescript", "typoscript", "xml-doc", "yaml"
];

setTimeout(() => {
    Prism.plugins.NormalizeWhitespace.setDefaults({
        'remove-trailing': true,
        'remove-indent': true,
        'left-trim': true,
        'right-trim': true
    });

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
    // Remove the first </p> and the last <p>
    const formattedContent = codeContent
        .replace(/<p>/g, '\n')  // Replace remaining <p> tags with newline characters
        .replace(/<\/p>/g, '')  // Remove remaining </p> tags
        .replace(/<br>/g, '')   // Remove <br> tags
        .trim();
    console.log('Converted', formattedContent);
    return `<pre class="language-${language}" data-src="plugins/toolbar/prism-toolbar.js" contenteditable="false"><code class="language-${language}">${formattedContent}</code></pre>`;
}

function scanDocument() {
    if (!isConversionOn) return;

    console.log("%cScanning document...", "color: green; font-size: 16px;");

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
            console.log('Found', originalCode);
            console.log('Found content', codeContent);
            const formattedCode = convertToPreCode(language, codeContent);
            modifiedContent = modifiedContent.replace(originalCode, formattedCode);
        }
    }

    document.body.innerHTML = modifiedContent;
    Prism.highlightAll();
    console.log("Scan Complete.");
}

function revertDocument() {
    if (isConversionOn) return;

    console.log('%cReverting document...', 'color: red; font-size: 16px;');

    document.querySelectorAll('pre > code').forEach(codeElement => {
        const preElement = codeElement.parentElement;
        console.log('Reverting', codeElement.innerText);
        const languageClass = Array.from(codeElement.classList).find(cls => cls.startsWith('language-'));
        if (languageClass) {
            const language = languageClass.replace('language-', '');
            if (languages.includes(language)) {
                const formattedCode = preElement.outerHTML;
                if (formattedCode) {
                    const lines = formattedCode.split('\n');
                    console.log('%cLines', 'color: blue;', lines);
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
                    console.log('%cReverted Code', 'color: purple;', revertedCode);
                    const finalCode = revertedCode.join('');

                    console.log('Reverted', finalCode);
                    preElement.outerHTML = finalCode;

                    document.querySelectorAll('div.toolbar > div.toolbar-item > button').forEach(button => {
                        button.outerHTML = '';
                    });
                }
            }
        }
    });
    console.log("Reversion Complete.");
}
