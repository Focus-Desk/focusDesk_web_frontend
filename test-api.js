const http = require('http');

http.get('http://localhost:8000/api/library/44beb9cb-f3bf-45e8-b1d8-f6197c714c94/librarians', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(JSON.parse(data)); });
}).on("error", (err) => { console.log("Error: " + err.message); });
