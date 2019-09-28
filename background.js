/*
 * set up click handler for context menu
 */
function onClickHandler(info, tab) {
    if (info.menuItemId == 'context(link)') {
        updateUserBlock(info.linkUrl);
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {cmd: 'filter_dom'}, function(response) {
          });
        });
    } else {
        // noop
        console.log(`i cannot handle ${info.menuItemId}`);
    }
};


/*
 * add/update a block for given user profile url
 */
function updateUserBlock(url) {
    urlParts = url.split('/');
    screenName = urlParts[urlParts.length - 1];
    id = urlParts[urlParts.length - 2];
    resource = urlParts[urlParts.length - 3];

    if(resource !== 'user') {
        console.log('ignoring non-user link');
        return;
    }

    chrome.storage.sync.get(['blocklist'], function(result) {
        var blocklist;
        blocklist = result.blocklist;
        if (typeof blocklist === 'undefined') {
            blocklist = {};
        }

        blocklist[id] = {
            'id': id,
            'screenName': screenName
        }

        chrome.storage.sync.set({'blocklist': blocklist}, function() {
            console.log(`upsert: ${id} -> ${name}`);
        });
    });
}


/*
 * handle refresh response for screen name refresh
 */
function updateScreenName() {
    if (this.readyState == 4 && this.status == 200) {
        url = this.responseURL;
        urlParts = url.split('/');
        name = urlParts[urlParts.length - 1];
        id = urlParts[urlParts.length - 2];
        updateUserBlock(url);
    }
}


/*
 * (async) refresh screen names for everyone in block list
 */
function refreshScreenName(id) {
    url = `https://www.mountainproject.com/user/${id}`;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = updateScreenName;
    xhr.open('HEAD', url, true);
    xhr.send();
}


/*
 * register the menu click handler
 */
chrome.contextMenus.onClicked.addListener(onClickHandler);


/*
 * set up context menu
 * TODO - add icon to the block icon
 */
function createContextMenu() {
    var contexts = ['link'];
    for (var i = 0; i < contexts.length; i++) {
        var context = contexts[i];
        var title = 'Block this user';
        var id = chrome.contextMenus.create({
            'title': title,
            'contexts': [context],
            'id': `context(${context})`,
            'documentUrlPatterns': ['https://*.mountainproject.com/*']
        });
    }
}


/*
 * log current blocklist
 */
chrome.storage.sync.get(['blocklist'], function(result) {
    blocklist = result.blocklist;
    if (typeof blocklist !== 'undefined') {
        for (var id in blocklist) {
            user = blocklist[id];
            console.log(`retrieved: ${user.id} -> ${user.screenName}`);
            refreshScreenName(user.id);
        }

    } else {
        console.log('there is no blocklist yet!');
    }
});


/*
 * process messages from content script
 */
chrome.runtime.onMessage.addListener(function(request) {
    if(request.cmd == "create_menu") {
        chrome.contextMenus.removeAll(function() {
            console.log('creating menu...');
            createContextMenu();
        });
    } else if(request.cmd == "delete_menu") {
        chrome.contextMenus.removeAll();
    }
});
