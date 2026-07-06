const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const generateToken = require("../../utils/generateToken");
const Message = require("../../models/Message");
const Chat = require("../../models/Chat");
const resolvers = {
  User: {
    id: (parent) => parent._id.toString(),
  },

  Chat: {
    id: (parent) => parent._id.toString(),
  },

  Message: {
    id: (parent) => parent._id.toString(),
  },

  Query: {
    hello: () => "GraphQL Server Running",

    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Not Authorized");
      }

      return user;
    },

    users: async (_, __, { user }) => {
      //      const allUsers = await User.find();

      // console.log("LOGGED USER:", user.username);
      // console.log("ALL USERS:", allUsers);

      if (!user) {
        throw new Error("Not Authorized");
      }

      return User.find({
        _id: { $ne: user._id },
      });
    },

    // chats
    chats: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Not Authorized");
      }

      return Chat.find({
        participants: user._id,
      })
        .populate("participants")
        .populate({
          path: "lastMessage",
          populate: {
            path: "sender",
          },
        });
    },

    messages: async (_, { chatId }, { user }) => {
      if (!user) {
        throw new Error("Not Authorized");
      }

      return Message.find({
        chatId,
      })
        .populate("sender")
        .sort({ createdAt: 1 });
    },
  },

  Mutation: {
    register: async (_, { username, email, password }) => {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      const token = generateToken(user._id);

      return {
        token,
        user,
      };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("Invalid Credentials");
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error("Invalid Credentials");
      }

      if (user.currentSocketId) {
       throw new Error(
        "User is already active. Please logout from the other device first."
      );
}

      const token = generateToken(user._id);

      return {
        token,
        user,
      };
    },

    createChat: async (_, { receiverId }, { user }) => {
      if (!user) throw new Error("Not Authorized");

      let chat = await Chat.findOne({
        participants: { $all: [user._id, receiverId] },
        isGroupChat: false,
      });

      if (!chat) {
        chat = await Chat.create({
          participants: [user._id, receiverId],
        });
      }

      return await chat.populate("participants");
    },

   sendMessage: async (_, { chatId, content }, { user }) => {
  console.log("SEND MESSAGE USER:", user);

  if (!user) throw new Error("Not Authorized");

  const message = await Message.create({
    chatId,
    sender: user._id,
    content,
    readBy: [user._id],
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
  });

  const fullMessage = await message.populate("sender");

  console.log("EMITTING TO:", chatId);
  console.log("FULL MESSAGE:", fullMessage);

  const io = global.io;

  // 🔥 SAFETY CHECK (IMPORTANT)
  if (!io) {
    console.log("❌ SOCKET IO NOT INITIALIZED");
    return fullMessage;
  }

  io.to(chatId).emit("new-message", {
    ...fullMessage.toObject(),
    chatId,
  });

  return fullMessage;
},
  },
};

module.exports = resolvers;
