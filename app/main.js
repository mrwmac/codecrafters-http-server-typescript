"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
// Uncomment this to pass the first stage
var server = net.createServer(function (socket) {
    socket.on("data", function (data) {
        // // console.log(data.toString().split('\r\n'));
        // const params = data.toString().split('\r\n');
        // const req_line = params[0].split(' ');
        // const path = req_line[1]; 
        var params = getParams(data);
        var _a = getRquestLine(params), req_line = _a[0], path = _a[1];
        var _b = getHeaders(params), host = _b[0], user_agent = _b[1];
        if (path == '/') {
            socket.write(Buffer.from("HTTP/1.1 200 OK\r\n\r\n"));
        }
        else if (/^\/echo\//.test(path)) {
            var endpoint = path.split('/')[2];
            // socket.write(Buffer.from(`HTTP/1.1 200 OK\r\n\r\n`));
            socket.write(Buffer.from("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ".concat(endpoint.length, "\r\n\r\n").concat(endpoint)));
        }
        else if (path == '/user-agent') {
            socket.write(Buffer.from("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ".concat(user_agent[1].length, "\r\n\r\n").concat(user_agent[1])));
        }
        else if (/^\/files\//.test(path)) {
            var endpoint_1 = path.split('/')[2];
            var fs = require('node:fs');
            fs.readFile(path, 'utf8', function (err, fdata) {
                if (err) {
                    console.log(fdata, err);
                    socket.write(Buffer.from("HTTP/1.1 404 Not Found\r\n\r\n"));
                    return;
                }
                socket.write(Buffer.from("HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ".concat(endpoint_1.length, "\r\n\r\n").concat(endpoint_1)));
            });
        }
        else {
            socket.write(Buffer.from("HTTP/1.1 404 Not Found\r\n\r\n"));
        }
    });
    socket.on("close", function () {
        socket.end();
    });
});
function getParams(data) {
    return data.toString().split('\r\n');
}
function getRquestLine(params) {
    var req_line = params[0].split(' ');
    var path = req_line[1];
    return [req_line, path];
}
function getHeaders(params) {
    var host = params[1].split(' ');
    var user_agent = params[2].split(' ');
    return [host, user_agent];
}
console.log('here');
server.listen(4221, "localhost");
