import { gql } from "@apollo/client";

export const GET_MESSAGES = gql`
  query Messages($chatId: ID!) {
    messages(chatId: $chatId) {
      id
      content
      createdAt
      sender {
        id
        username
      }
    }
  }
`;