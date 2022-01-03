const { Server } = require('net');

const host = '0.0.0.0';
const END = 'END';

const connections = new Map();

const error = (message) => {
    console.error(message);
    process.exit(1);
};

const sendMessage = (message, origin) => {
    console.log('sending all clients');
    for (const socket of connections.keys()) {
        if (socket !== origin) {
            socket.write(message);
        }
    }
}

const listen = (port) => {
    const server = new Server();

    server.on('connection', (socket) => {
        const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`;
        console.log(`new connection from ${remoteSocket}`);
        socket.setEncoding('utf8');

        socket.on('data', (message) => {
            if (!connections.has(socket)) {
                console.log(`Username ${message} set for connection from ${remoteSocket}`)
                connections.set(socket, message);
            }
            else if (message === END) {
                socket.end();
            } else {
                const fullMessage = `[${connections.get(socket)}]: ${message}`;
                console.log(`${remoteSocket} -> ${fullMessage}`);
                sendMessage(fullMessage, socket);
            }
        });

        socket.on('close', () => {
            console.log(`${remoteSocket} disconnected`);
            connections.delete(socket);
        });

        socket.on('error', (err) => console.log(`Error -> ${err.message}`));
    });

    server.listen({ port, host }, () => {
        console.log('listening on port 8000');
    });

    server.on('error', (err) => {
        error(`Error -> ${err.message}`);
    })
};

const main = () => {
    if (process.argv.length != 3) {
        error(`usage: node ${__filename} <port>`);
    }

    let port = process.argv[2];
    if (isNaN(port)) {
        error(`invalid port: ${port}`);
    }

    port = Number(port);

    listen(port);
}

if (require.main === module) {
    main();
}
