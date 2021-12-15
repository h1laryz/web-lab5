import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

export const getHttpLink = (token) => {
  return new HttpLink({
    uri: "https://laba5-web.herokuapp.com/v1/graphql",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getWsLink = (token) => {
  return new WebSocketLink({
    uri: "wss://laba5-web.herokuapp.com/v1/graphql",
    options: {
      reconnect: true,
      connectionParams: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  });
};

export const getSplitLink = (token) => {
  const httpLink = getHttpLink(token);
  const wsLink = getWsLink(token);
  return split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink,
  );
};

export const createApolloClient = () => {
  return new ApolloClient({
    cache: new InMemoryCache(),
  });
};

export const client = createApolloClient();
