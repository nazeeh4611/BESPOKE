
function sortPrice(val) {

    var queryString = window.location.search;

    var params = new URLSearchParams(queryString);
    params.delete('sort');

    params.append('sort', val);

    var newQueryString = params.toString();
    var newUrl = `/shop?${newQueryString}`;

    window.location.href = newUrl;
}




function pagination(val){

    var queryString = window.location.search;

    var params = new URLSearchParams(queryString);
    params.delete('pagination');

    params.append('pagination',val);

    var newQueryString = params.toString();
    var newUrl = `/shop?${newQueryString}`;

    window.location.href = newUrl;

}

 