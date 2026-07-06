import { gql } from "@apollo/client";

export const CREATE_CHAT = gql`
  mutation CreateChat($receiverId: ID!) {
    createChat(receiverId: $receiverId) {
      id
      participants {
        id
        username
      }
    }
  }
`;