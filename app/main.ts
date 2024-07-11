import * as net from "net";

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {

    socket.on("data", (data) => {        
        // // console.log(data.toString().split('\r\n'));
        // const params = data.toString().split('\r\n');
        // const req_line = params[0].split(' ');
        // const path = req_line[1]; 

        const params = getParams(data);
        const[req_line, path] = getRquestLine(params);
        const[host, user_agent] = getHeaders(params);

        console.log(user_agent);

        if(path == '/')
        {
            socket.write(Buffer.from(`HTTP/1.1 200 OK\r\n\r\n`));
        }
        else if(/^\/echo\//.test(path))
        {
          const endpoint = path.split('/')[2];
          
          // socket.write(Buffer.from(`HTTP/1.1 200 OK\r\n\r\n`));
          socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${endpoint.length}\r\n\r\n${endpoint}`));
        }
        else if(path == '/user-agent')
        {
          // socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${endpoint.length}\r\n\r\n${endpoint}`));
        }
        else
        {
            socket.write(Buffer.from(`HTTP/1.1 404 Not Found\r\n\r\n`));
        }
    });

  socket.on("close", () => {
    socket.end();
  });
});

function getParams(data)
{
  return data.toString().split('\r\n');
}

function getRquestLine(params)
{  
  const req_line = params[0].split(' ');
  const path = req_line[1];

  return [req_line, path];
}

function getHeaders(params)
{

  const host = params[1].split(' ');
  const user_agent = params[2].split(' ');
  
  return [host, user_agent];
}


server.listen(4221, "localhost");
