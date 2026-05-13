chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 380,
        height: 600
    });
});
