(async () => {
    const prettier = require('prettier');
    const pluginBabel = require('prettier/plugins/babel');
    const pluginTypescript = require('prettier/plugins/typescript');
    const pluginEstree = require('prettier/plugins/estree');


    const parsers = {
        babel: pluginBabel,
        typescript: pluginTypescript,
        estree: pluginEstree
    };

    let els = document.getElementsByClassName("mce-content-body");

    for (let i = 0; i < els.length; i++) {
        let el = els.item(i);
        let content = el.innerText;
        let formattedContent = '';
        let regex = /'''(?:\s*(\w+))?\s*([\s\S]*?)\s*'''/g;
        let lastIndex = 0;
        let match;
        let firstBlock = true;

        while ((match = regex.exec(content)) !== null) {
            let language = match[1] || 'babel';
            let codeBlock = match[2];


            const plugin = parsers[language];
            codeBlock = await prettier.format(codeBlock, {
                parser: language,
                plugins: [plugin, pluginEstree],
                tabWidth: 4,
                useTabs: true
            });

            codeBlock = codeBlock.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\n/g, '<br>');

            formattedContent += content.substring(lastIndex, match.index).trim();
            if (firstBlock) {
                formattedContent += '<br><br>';
                firstBlock = false;
            }
            formattedContent += '<div style="font-family: \'Courier New\', serif; background-color: #161B22; color: white; padding: 0.2rem; border: solid 1px grey; width: fit-content">' +
                codeBlock +
                '</div><br>';
            lastIndex = regex.lastIndex;
        }

        formattedContent += content.substring(lastIndex).trim();
        el.innerHTML = formattedContent.replace(/\n/g, '<br>');
    }
})();