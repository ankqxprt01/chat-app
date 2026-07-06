import { gql } from "@apollo/client";

export const ME = gql`
  query {
    me {
      id
      username
      email
    }
  }
`;

export const GET_USERS = gql`
  query {
    users {
      id
      username
      email
    }
  }
`;