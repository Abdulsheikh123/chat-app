import { app, server, io } from "./app.js";
import dotenv from 'dotenv';
import DB from '../config/prisma.js';
import { redis } from "../config/redis.js";

dotenv.config();

const PORT = process.env.PORT || 8005;

const createServer = () => {
    server.listen(PORT, () => {
        console.log( DB ? '✅ Connected to the database successfully ' : '❌ Connected to the database failed');  
        console.log(redis ? '✅ Connected to the redis successfully ' : '❌ Connected to the redis failed');  
        console.log(io ? '✅ Connected to the socket successfully ' : '❌ Connected to the socket failed');  
        console.log(`✅ Server is running on port ${PORT}`);
    });
}

createServer();
