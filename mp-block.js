/*
 * patch jquery with case-insensitive icontains: selector
 */
$.expr[":"].icontains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});


/*
 * hides forum posts entirely
 * TODO - fix zebra striping
 */
function removeForumPosts(user) {
    $(`div.bio.text-truncate span.hidden-sm-up a[href*="${user.id}"]`)
        .parents('tr.message-row')
        .hide();
}


/*
 * obscures quotes authored by user
 * keep the reply around, but replace the quoted text itself
 */
function removeForumQuotes(user) {
    $(`blockquote > cite:icontains("${user.screenName}")`)
        .parents('blockquote')
        .text('this quote is from a user you have blocked');
}


/*
 * perform blocking actions
 */
function filterDOM() {
    chrome.storage.sync.get(['blocklist'], function(result) {
        blocklist = result.blocklist;
        if (typeof blocklist !== 'undefined') {
            for (var id in blocklist) {
                user = blocklist[id];
                removeForumPosts(user);
                removeForumQuotes(user);
            };
        }
    });
}

filterDOM();

/*
 * set up handler for filter_dom command from bg script
 */
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("received message");
    if (request.cmd == "filter_dom") {
        filterDOM();
    }
  });


/*
 * send message to bg script to create context menus
 * TODO - make this dynamic based on the link contents; 
 * i.e., only for user links; delete_menu for others
 */
chrome.runtime.sendMessage({cmd: "create_menu"});
