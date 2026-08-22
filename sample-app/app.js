const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>Docker Demo App</title></head>
      <body style="font-family: sans-serif; text-align:center; margin-top:80px;">
        <h1> Hello from inside a Docker container!</h1>
        <p>This simple Node.js app is running in a container built from a custom Dockerfile.</p>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
