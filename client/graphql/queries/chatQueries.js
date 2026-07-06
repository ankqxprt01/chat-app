import { gql } from "@apollo/client";

export const GET_CHATS = gql`
  query GetChats {
    chats {
      id

      participants {
        id
        username
      }

      lastMessage {
        id   # 🔥 ADD THIS
        content
        createdAt

        sender {
          id   # 🔥 ALSO ADD THIS
          username
        }
      }
    }
  }
`;