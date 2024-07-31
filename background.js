browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'buttonFlag') sendResponse({buttonFlag: localStorage.getItem('buttonFlag')});
    }
)