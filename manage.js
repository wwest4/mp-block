/*
 * remove user from blocklist
 */
function unblockUser(id) {
    chrome.storage.sync.get(['blocklist'], function(result) {
        var blocklist;
        blocklist = result.blocklist;
        if (typeof blocklist === 'undefined') {
            console.log('blocklist already appears to be empty');
            return;
        }

        delete blocklist[id];

        chrome.storage.sync.set({'blocklist': blocklist}, function() {
            console.log(`delete: ${id} -> ${name}`);
        });

        refreshTable();
    });
}


function deleteAllRowsExceptFirst() {
    $('div.mp-blocklist > table')
        .find('tr:gt(0)')
        .remove();
}


/*
 * add current blocklist to table with unblock buttons
 */
function refreshTable() {
    deleteAllRowsExceptFirst();
    chrome.storage.sync.get(['blocklist'], function(result) {
        blocklist = result.blocklist;
        if (typeof blocklist !== 'undefined') {
            if (Object.keys(blocklist).length == 0) {
                $('h3').text('The block list is empty!');
                return;
            }
            $('h3').text('Block List');
            for (var id in blocklist) {
                user = blocklist[id];
                lastRow = $('div.mp-blocklist > table > tr:last');
                $('div.mp-blocklist table tr:last')
                    .after(`<tr>` +
                           `<td>${user.id}</td>` +
                           `<td>${user.screenName}</td>` +
                           `<td><button class="unblock" id="unblock-${user.id}">Unblock</button></td>` +
                           `</tr>`);
            }
            addButtonHandlers();
        } else {
           $('h3').text('There is no blocklist yet!');
        }
    });
}



/*
 * attach unblock handler to each button
 */
function addButtonHandlers() {
    $('button.unblock').map(function() {
       $(this).click(function() {
            var id = this.id.split('-')[1];
            unblockUser(id);
            $(this).parents('tr').remove();
        });
    });
}


$(document).ready(function() {
    refreshTable();

    /*
     * refresh the blocklist on visibility
     */
    document.addEventListener('visibilitychange', function(){
        refreshTable();
    })
});
