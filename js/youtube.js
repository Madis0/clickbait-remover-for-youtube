let styleElement = null;
let firstTimeReplacing = true;

// <executed_on_content_script_loaded>
chrome.storage.sync.get(['video_title_format'], function ({video_title_format}) {
    // only running something for the css change, as the webRequest listeners should be live now.
    if (video_title_format !== 'default') {
        updateCSS(video_title_format);
    }
});
// </executed_on_content_script_loaded>

chrome.runtime.onMessage.addListener(function (message) {
    Object.keys(message).forEach(function (change) {
        switch (change) {
            case 'preferred_thumbnail_file':
                updateThumbnails(
                    message[change].oldValue,
                    message[change].newValue === undefined ? 'hq1' : message[change].newValue
                );
                break;
            case 'video_title_format':
                updateCSS(message[change].newValue);
                break;
        }
    })
});

function updateCSS(option) {

    let appendingElement = false;

    if (styleElement === null) {
        appendingElement = true;
        styleElement = document.createElement('style');
    }

    switch (option) {
        case 'lowercase':
            styleElement.innerHTML = '#video-title,.ytp-videowall-still-info-title{text-transform:lowercase;}';
            break;
        case 'capitalize_first_letter':
            styleElement.innerHTML = '#video-title{text-transform:lowercase;display:block!important;}#video-title::first-letter{text-transform:uppercase;}';
            break;
        case 'default':
            styleElement.remove();
            styleElement = null;
            break;
    }

    if (appendingElement) {
        document.head.appendChild(styleElement);
    }
}

function updateThumbnails(oldImage, newImage) {
    let imgElements = document.getElementsByTagName('img');

    if (firstTimeReplacing) {
        oldImage = 'hqdefault'
    }

    for (let i = 0; i < imgElements.length; i++) {
        if (imgElements[i].src.match(`https://i.ytimg.com/vi/.*/${oldImage}.jpg?.*`)) {

            let url = imgElements[i].src.replace(`${oldImage}.jpg`, `${newImage}.jpg`);

            if (firstTimeReplacing) {
                url += '&stringtokillcache'
            }

            imgElements[i].src = url;
        }
    }

    firstTimeReplacing = false;
}
