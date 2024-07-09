import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {

    socket.on("data", (data) => {        
        // console.log(data.toString().split('\r\n'));
        const path = data.toString().split('\r\n')[0].split(' ')[1];//not an ounce of reilience here

        if(path == '/')
        {
            socket.write(Buffer.from(`HTTP/1.1 200 OK\r\n\r\n`));
        }
        else
        {
            socket.write(Buffer.from(`HTTP/1.1 400 NOT OK\r\n\r\n`));
        }
    });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
