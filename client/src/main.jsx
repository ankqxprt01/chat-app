import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Provider } from "react-redux";
import { store } from "./app/store";

import { ApolloProvider } from "@apollo/client/react";

import client from "./api/apolloClient";

import App from "./App";
import "./index.css";

createRoot(
  document.getElementById("root")
).render(
  // <StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </Provider>
  // </StrictMode>
);