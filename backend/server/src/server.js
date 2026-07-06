const { Server } = require("socket.io");
const express = require("express");
require("dotenv").config();

const http = require("http");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");

const app = require("./app");
const connectDB = require("./config/db");
const schema = require("./graphql/schema");
const auth = require("./middleware/auth");

const initializeSocket = require("./sockets");

const startServer = async () => {
  await connectDB();

  const apolloServer = new ApolloServer({ schema });
  await apolloServer.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace(
          "Bearer ",
          ""
        );

        const user = await auth(token);

        return { user };
      },
    })
  );

  const server = http.createServer(app);

// ✅ initialize socket properly (PASS server, not io)
const { io, onlineUsers } = initializeSocket(server);
  // attach io globally
  global.io = io;
  app.set("io", io);

  // move all socket logic here
  // initializeSocket(io);
  app.set("onlineUsers", onlineUsers);

  server.listen(process.env.PORT, () => {
    console.log(`Server Running On Port ${process.env.PORT}`);
  });
};

startServer();