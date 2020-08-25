import 'reflect-metadata';
import { __prod__ } from "./constants";
import express from 'express';

import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";

import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';

import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';


const main = async() => {
    const orm = await MikroORM.init(microConfig);
    orm.getMigrator().up();

    const app = express();
    app.use(express.json());


    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true, 
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax', // csrf
                secure: __prod__ // cookie only works in https 
            },
            saveUninitialized: false,
            secret: "ThiSisMyS3cr3T!#",
            resave: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                HelloResolver,
                PostResolver,
                UserResolver,
            ],
            validate: false
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res })
    });

    apolloServer.applyMiddleware({ app });
    
    app.get('/', (_, res) => {
        res.json({ message: 'Hello' });
    });

    app.listen(4000, () => {
        console.log('🚀 Server is running on port 4000...')
    });
    
}

main().catch((err) => {
    console.error(err);
});