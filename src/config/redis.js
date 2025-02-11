import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: process.env.R_Password,
    socket: {
        host: process.env.R_Host,
        port: process.env.R_Port
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client;

