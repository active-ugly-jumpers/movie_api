const http = require('http'),
    fs = require('fs');

http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const pathname = requestUrl.pathname;

    // Log request URL and timestamp to log.txt
    const timestamp = new Date().toISOString();
    const logEntry = `URL: ${request.url}, Timestamp: ${timestamp}\n`;

    fs.appendFile('log.txt', logEntry, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });

    // Determine which file to serve based on URL
    let fileName;
    if (pathname.includes('documentation')) {
        fileName = (__dirname + 'documentation.html');
    } else {
        fileName = (__dirname + 'index.html');
    }

    // Read and serve the appropriate file
    fs.readFile(fileName, (err, data) => {
        if (err) {
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end('File not found');
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(data);
        }
    });

}).listen(8080);

console.log('My first Node test server is running on Port 8080.');