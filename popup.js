if (localStorage.getItem('buttonFlag') === null) {
    localStorage.setItem('buttonFlag', 'false');
}

if (localStorage.getItem('buttonFlag') === 'true') {
    document.getElementById('onButton').classList.add('pressed');
    document.getElementById('offButton').classList.remove('pressed');
} else {
    document.getElementById('offButton').classList.add('pressed');
    document.getElementById('onButton').classList.remove('pressed');
}


document.getElementById('onButton').addEventListener('click', function () {
    this.classList.add('pressed');
    document.getElementById('offButton').classList.remove('pressed');
    browser.tabs.query({active: true, currentWindow: true}, function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, {type: 'buttonFlag', value: 'true'}, function (response) {
            localStorage.setItem('buttonFlag', 'true');
            console.log(response);
        });
    });
});

document.getElementById('offButton').addEventListener('click', function () {
    this.classList.add('pressed');
    document.getElementById('onButton').classList.remove('pressed');
    browser.tabs.query({active: true, currentWindow: true}, function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, {type: 'buttonFlag', value: 'false'}, function (response) {
            localStorage.setItem('buttonFlag', 'false');
            console.log(response);
        });
    });
});
