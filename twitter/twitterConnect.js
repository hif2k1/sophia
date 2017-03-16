var http = require('http');
var request = require('request');
var url = require('url');

var APIKEY = encodeURIComponent('');
var APISECRET = encodeURIComponent('');
var combinedToken = APIKEY+':'+APISECRET;
var combinedTokenEncoded = new Buffer(combinedToken).toString('base64');
var gotToken = false;

var getBearerOptions = {
    url: 'https://api.twitter.com/oauth2/token',
    headers: {
        'Authorization': 'Basic '+combinedTokenEncoded,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Content-Length': 29,
        'User-Agent': 'sophiaBibleApp',
    },
    method: 'post',
    body: 'grant_type=client_credentials'
}
var getTweetOptions = {
    url: 'https://api.twitter.com/1.1/search/tweets.json',
    qs: {q: ''},
    headers: {
        Authorization: ''
    }
}
function getBearerCallBack(error, response, body) {
    if (!error && response.statusCode == 200) {
        jsonResponse = JSON.parse(body);
        if (jsonResponse.token_type == 'bearer') {
            bearerToken = jsonResponse.access_token;
            if (bearerToken.length>0) {
                gotToken = true;
                getTweetOptions.headers.Authorization = 'Bearer '+bearerToken;                
            }
        }
    }
}
request(getBearerOptions, getBearerCallBack);

function getTweets(queryString, responseObject){
    function callBackTwo(error, response, body) {
        if (!error && response.statusCode == 200) {
            responseObject.setHeader('Access-Control-Allow-Origin', 'http://104.155.6.124:3000');
            responseObject.setHeader('Access-Control-Allow-Methods', 'GET');
            responseObject.writeHead(200, {"Content-Type": "application/json"});
            responseObject.write(body);
            responseObject.end();
        }
        else {
            responseObject.writeHead(404, {"Content-Type": "application/json"});
            responseObject.write('{"error":"error getting response from twitter"}');
            responseObject.end();
        }
    }
    if (gotToken) {
        getTweetOptions.qs.q=queryString;
        request(getTweetOptions, callBackTwo)
    }
    else {
        responseObject.writeHead(404, {"Content-Type": "application/json"});
        responseObject.write('{"error":"error getting token"}');
        responseObject.end();
    }
}

var server = http.createServer(function (request, response) {
    var queryObject = url.parse(request.url,true).query;
    var hashTag = queryObject.hashTag;
    getTweets('%23'+hashTag, response);
});

server.listen(80);
console.log('server is listening');