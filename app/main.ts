import * as net from "net";

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {

    socket.on("data", (data) => {        
        // // console.log(data.toString().split('\r\n'));
        // const params = data.toString().split('\r\n');
        // const req_line = params[0].split(' ');
        // const path = req_line[1]; 

        const request_details = getParams(data);
        const action = request_details.action;
        const path = request_details.url;
        const user_agent = request_details.user_agent;
        const body = request_details.body;

        // const[req_line, path] = getRquestLine(params);
        // const[host, user_agent] = getHeaders(params);     
        // const body = getBody(params);
// console.log(path);console.log(/^\/files\//.test(path));
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
          socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${user_agent[1].length}\r\n\r\n${user_agent[1]}`));
        }
        else if(/^\/files\//.test(path))
        {        
          const endpoint = path.split('/')[2];
          const [dirName, dataToWrite] = getArgs();                    
console.log('action', action, 'files', dirName, 'data', dataToWrite);
          if(dirName)
          {
            const fs = require('node:fs'); // pretty ugly to be fair


            if(action == 'POST')
              {
                fs.writeFile(dirName + endpoint, body, 'utf8', (err, fdata) => {            
                  if (err) {              
                    socket.write(Buffer.from(`HTTP/1.1 404 Not Found\r\n\r\n`));
                    return;
                  }              
                  socket.write(Buffer.from(`HTTP/1.1 201 Created\r\n\r\n`));
                });
              }
              else if(action == 'GET')
              {
                fs.readFile(dirName + endpoint, 'utf8', (err, fdata) => {            
                  if (err) {              
                    socket.write(Buffer.from(`HTTP/1.1 404 Not Found\r\n\r\n`));
                    return;
                  }              
                  socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fdata.length}\r\n\r\n${fdata}`));
                });
              }

          }         
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
  const params = data.toString().split('\r\n');
  let request_details = {};

  params.forEach( (element, index)  => { 
      if(/^GET |^POST /.test(element))
      {        
        const request_line = element.split(' ');
        request_details['action'] = request_line[0];
        request_details['url'] = request_line[1];
        request_details['protocol'] = request_line[2];
      }
      else if(/^Host: /.test(element))
      {        
        request_details['host'] = element.split(' ')[1];       
      } 
      else if(/^User-Agent: /.test(element))
      {        
        request_details['user_agent'] = element.split(' ')[1];
      } 
      else if(/^Accept: /.test(element))
      {        
        request_details['accept'] = element.split(' ')[1];
      } 
      // else if(/\r\n/.test(element))
      else if(!element)
      {
        console.log('EMPTTTY', element);
        if(params[index+1])
        {
          request_details['body'] = params[index+1];
          continue;
        }
      }
  });

  return request_details;
}

function getArgs()
{  
  if(process && process.argv)
  {
    return [process.argv[process.argv.indexOf('--directory') + 1],  process.argv[process.argv.indexOf('--data') + 1]];
  }

  return false;
}

function isData()
{
  return
}

server.listen(4221, "localhost");
