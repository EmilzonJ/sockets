const { Socket } = require('net');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
})

const END = 'END';

const error = (message) => {
    console.error(message);
    process.exit(1);
};

const connect = (host, port) => {
    console.log(`connecting to ${host}:${port}`);

    const socket = new Socket();
    socket.connect({ host, port });
    socket.setEncoding('utf8');

    socket.on('connect', () => {
        console.log(`connected`);

        readline.question('Choose your username: ', (username) => {
            socket.write(username);
            console.log(`Type any message to send it, type ${END} to end the connection`);
        });

        readline.on('line', (message) => {
            socket.write(message);
            if (message == END) {
                socket.end();
            }
        });

        socket.on('data', (message) => {
            console.log(message);
        })
    });

    socket.on('close', () => process.exit(0));

    socket.on('error', (err) => {
        error(`Error -> ${err.message}`);
    })
}

const main = () => {
    if (process.argv.length != 4) {
        error(`usage: node ${__filename} <host> <port>`);
    }

    let [, , host, port] = process.argv;
    if (isNaN(port)) {
        error(`invalid port: ${port}`);
    }
    port = Number(port);
    connect(host, port);

}

if (require.main === module) {
    main();
}