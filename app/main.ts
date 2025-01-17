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
        const encoding = getEncodings(request_details.encodings);
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

          const output = processData(endpoint, encoding); console.log(output); console.log(endpoint)
          
          // socket.write(Buffer.from(`HTTP/1.1 200 OK\r\n\r\n`));
          socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n${encoding}Content-Length: ${output.length}\r\n\r\n`));
          socket.write(output);
        }
        else if(path == '/user-agent')
        {
          socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n${encoding}Content-Length: ${user_agent.length}\r\n\r\n${user_agent}`));
        }
        else if(/^\/files\//.test(path))
        {
          const endpoint = path.split('/')[2];
          const [dirName, dataToWrite] = getArgs();                    

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

                const output = processData(fdata, encoding);
                socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\n${encoding}Content-Length: ${output.length}\r\n\r\n${output}`));
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
      else if(/^Accept-Encoding: /.test(element))
      {
        request_details['encodings'] = element.split(' ');
      }
    // else if(/\r\n/.test(element))
      else if(!element)
      {
        if(params[index+1])
        {
          request_details['body'] = params[index+1];
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

function getEncodings(encodings)
{  
  if(!encodings)
  {
    return '';
  }

  for(let i=0; i<encodings.length; i++)
  {
    if(encoding_types.includes(encodings[i].replace(',','')))
    {
      return `Content-Encoding: ${encodings[i].replace(',','')}\r\n`;
    }
  }
  return '';
}

function processData(data, compress)
{
  if(!compress)
  {
    return data;
  }
    
  const { gzipSync } = require('node:zlib');

  const buffer = Buffer.from(data, 'utf8');
  const zipped = gzipSync(buffer);

  return zipped;
}

//will be able to accommodate all valid comperessions
const encoding_types = ['gzip'];

server.listen(4221, "localhost");
