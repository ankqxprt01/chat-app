const typeDefs = `#graphql

type User {
  id: ID!
  username: String!
  email: String!
}

type Chat {
  id: ID!
  participants: [User]
  isGroupChat: Boolean
  groupName: String
  lastMessage: Message
}

type Message {
  id: ID!
  content: String!
  sender: User!
  createdAt: String!
}

type AuthResponse {
  token: String!
  user: User!
}

type Query {
  hello: String
  me: User
  users: [User]
  chats: [Chat]
  messages(chatId: ID!): [Message]
}

type Mutation {
  register(
    username: String!
    email: String!
    password: String!
    fav_food: String!
  ): AuthResponse

  login(
    email: String!
    password: String!
  ): AuthResponse

  forgotPassword(
    email: String!
    fav_food: String!
    newPassword: String!
  ): String!

  createChat(
    receiverId: ID!
  ): Chat

  sendMessage(
    chatId: ID!
    content: String!
  ): Message
}

`;

module.exports = typeDefs;