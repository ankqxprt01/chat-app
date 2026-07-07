import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login(
    $email: String!
    $password: String!
  ) {
    login(
      email: $email
      password: $password
    ) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register(
    $username: String!
    $email: String!
    $password: String!
    $fav_food: String!
  ) {
    register(
      username: $username
      email: $email
      password: $password
      fav_food: $fav_food
    ) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword(
    $email: String!
    $fav_food: String!
    $newPassword: String!
  ) {
    forgotPassword(
      email: $email
      fav_food: $fav_food
      newPassword: $newPassword
    )
  }
`;