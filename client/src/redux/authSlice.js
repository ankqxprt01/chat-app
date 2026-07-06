import { createSlice } from "@reduxjs/toolkit";

const storedUser =
  localStorage.getItem("user");

const initialState = {
  user: storedUser
    ? JSON.parse(storedUser)
    : null,

  token:
    localStorage.getItem("token") ||
    null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (
      state,
      action
    ) => {
      state.user =
        action.payload.user;

      state.token =
        action.payload.token;

      localStorage.setItem(
        "token",
        action.payload.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          action.payload.user
        )
      );
    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );
    },
  },
});

export const {
  setCredentials,
  logout,
} = authSlice.actions;

export default authSlice.reducer;