var http = require('http');
var fs = require('fs');

var server = new http.Server(function(req, res) {
    switch (req.url) {
        case '/db/skills.json':
            res.setHeader('Content-Type', 'application/json');
            res.end(fs.readFileSync(__dirname + '/db/skills.json', 'utf-8'));
            break;

        case '/css/index.css':
            res.setHeader('Content-Type', 'text/css');
            res.end(fs.readFileSync(__dirname + '/css/index.css', 'utf-8'));
            break;

        case '/js/index.js':
            res.setHeader('Content-Type', 'text/js');
            res.end(fs.readFileSync(__dirname + '/js/index.js', 'utf-8'));
            break;

        default:
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(
                fs.readFileSync(__dirname + '/index.html', 'utf-8')
            );
            break;
    }
});

server.listen(1338, '127.0.0.1');
console.log('listening 127.0.0.1:1338');
