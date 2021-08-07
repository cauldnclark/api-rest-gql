import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
import { findIndex, isEmpty } from "lodash";
import { User, UserMutationResponse } from "./types";

const app = express();
let users: User[] = [];

app.use(express.json());

async function startApolloServer() {
  // Construct a schema, using GraphQL schema language
  const typeDefs = gql`
    scalar Date

    type User {
      username: String
      age: Int
      dateOfBirth: Date
      isOnline: Boolean
    }

    type UserMutationResponse {
      user: User
      success: Boolean
    }

    type Query {
      hello: String
      getUsers: [User]
    }

    input AddUserInput {
      username: String!
      age: Int!
      dateOfBirth: Date!
      isOnline: Boolean
    }

    type Mutation {
      addUser(data: AddUserInput!): UserMutationResponse
      updateUser(username: String!, isOnline: Boolean): UserMutationResponse
      deleteUser(username: String!): UserMutationResponse
    }
  `;

  // Provide resolver functions for your schema fields
  const resolvers = {
    Query: {
      hello: () => "Hello world!",
      getUsers: () => users,
    },
    Mutation: {
      addUser: (_: any, args: { data: User }): UserMutationResponse => {
        const user: User = args.data;

        if (isEmpty(user)) {
          throw new Error("Body cannot be empty");
        }

        users.push(user);

        return {
          user,
          success: true,
        };
      },
      updateUser: (
        _: any,
        args: { isOnline?: boolean; username: string }
      ): UserMutationResponse => {
        const { username, isOnline } = args;
        if (!username) {
          throw new Error("Username is required");
        }

        const indexToFind = findIndex(users, (u) => u.username === username);

        if (indexToFind < 0) {
          throw new Error("Cannot find user");
        }

        users[indexToFind].isOnline = isOnline || false;

        return {
          user: users[indexToFind],
          success: true,
        };
      },
      deleteUser: (
        _: any,
        args: { username: string }
      ): UserMutationResponse => {
        const { username } = args;
        if (!username) {
          throw new Error("Username is required");
        }

        const indexToFind = findIndex(users, (u) => u.username === username);

        if (indexToFind < 0) {
          throw new Error("Cannot find user");
        }

        users.splice(indexToFind, 1);

        return {
          user: users[indexToFind],
          success: true,
        };
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();

  server.applyMiddleware({ app });

  await new Promise((resolve: any) => app.listen({ port: 8080 }, resolve));
  console.log(`🚀 Server ready at http://localhost:8080${server.graphqlPath}`);
  return { server, app };
}

try {
  startApolloServer();
} catch (error) {
  console.error(error);
}
