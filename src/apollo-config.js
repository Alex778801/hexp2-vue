/* eslint-disable */

import {
    ApolloClient, createHttpLink, InMemoryCache,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { createApolloProvider } from "@vue/apollo-option";

const httpLink = createHttpLink({
    // uri: 'http://127.0.0.1:8000/gp/',
    uri: 'http://192.168.1.222:8000/gp/',
})

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            ...headers,
            authorization: 'JWT ' + token || '',
        },
    };
});

export const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
})

export const apolloProvider = createApolloProvider({
    defaultClient: apolloClient,
});
