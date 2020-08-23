import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async() => {
    const orm = await MikroORM.init(microConfig);
    orm.getMigrator().up();

    const app = express();
    app.use(express.json());

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                HelloResolver,
                PostResolver
            ],
            validate: false
        }),
        context: () => ({ em: orm.em })
    });

    apolloServer.applyMiddleware({ app });
    
    app.get('/', (_, res) => {
        res.json({ message:'Hello' });
    });

    app.listen(4000, () => {
        console.log('🚀 Server is running on port 4000...') 
    });
    
}

main().catch((err) => {
    console.error(err);
});