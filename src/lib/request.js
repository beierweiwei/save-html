export default function (url, callback, errBack) {
    let ajax = new XMLHttpRequest();
    ajax.open("GET", url, true);
    // ajax.responseType = 'blob';
    ajax.onload = function(e) {
        callback(e.target.response, url);
    };
    ajax.onerror = function(error) {
    	errBack(error, url)
    }
    ajax.send()
}