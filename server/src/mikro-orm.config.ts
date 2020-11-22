import path from 'path';
import { __prod__ } from "./constants";

import { MikroORM } from "@mikro-orm/core";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
        disableForeignKeys: false
    },
    entities: [Post, User],
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    type: 'postgresql',
    debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];