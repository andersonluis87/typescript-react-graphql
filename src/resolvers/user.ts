import  { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType } from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/User';
import { MyContext } from 'src/types';

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType() 
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}   


@ObjectType() 
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {

        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'username must have at least 3 characters'
                    }
                ]
            }
        }

        if (options.password.length <= 2) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'password must have at least 3 characters'
                    }
                ]
            }
        }

        const userExists = await em.findOne(User, { username: options.username });
        if (userExists) {
            return { 
                errors: [
                    {
                        field: "username",
                        message: "username already exists"
                    }
                ]
            }
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, { username: options.username, password: hashedPassword });
        
        await em.persistAndFlush(user);
       
        return { 
            user
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return { 
                errors: [
                    {
                        field: "username",
                        message: "username does not exist"
                    }
                ]
            }
        }
        
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return { 
                errors: [
                    {
                        field: "password",
                        message: "incorrect password"
                    }
                ]
            }
        }
        await em.persistAndFlush(user);

        return { 
            user
        };
    }
}