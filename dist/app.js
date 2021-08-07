"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const lodash_1 = require("lodash");
const app = express_1.default();
let users = [];
app.use(express_1.default.json());
async function startApolloServer() {
    const typeDefs = apollo_server_express_1.gql `
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
    const resolvers = {
        Query: {
            hello: () => "Hello world!",
            getUsers: () => users,
        },
        Mutation: {
            addUser: (_, args) => {
                const user = args.data;
                if (lodash_1.isEmpty(user)) {
                    throw new Error("Body cannot be empty");
                }
                users.push(user);
                return {
                    user,
                    success: true,
                };
            },
            updateUser: (_, args) => {
                const { username, isOnline } = args;
                if (!username) {
                    throw new Error("Username is required");
                }
                const indexToFind = lodash_1.findIndex(users, (u) => u.username === username);
                if (indexToFind < 0) {
                    throw new Error("Cannot find user");
                }
                users[indexToFind].isOnline = isOnline || false;
                return {
                    user: users[indexToFind],
                    success: true,
                };
            },
            deleteUser: (_, args) => {
                const { username } = args;
                if (!username) {
                    throw new Error("Username is required");
                }
                const indexToFind = lodash_1.findIndex(users, (u) => u.username === username);
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
    const server = new apollo_server_express_1.ApolloServer({ typeDefs, resolvers });
    await server.start();
    const app = express_1.default();
    server.applyMiddleware({ app });
    await new Promise((resolve) => app.listen({ port: 8080 }, resolve));
    console.log(`🚀 Server ready at http://localhost:8080${server.graphqlPath}`);
    return { server, app };
}
try {
    startApolloServer();
}
catch (error) {
    console.error(error);
}
//# sourceMappingURL=app.js.map