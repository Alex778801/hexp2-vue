/* eslint-disable */

import {
    ApolloClient, createHttpLink, InMemoryCache,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { createApolloProvider } from "@vue/apollo-option";
import {__backendAddr__} from "@/setup";
import {clog} from "@/components/tools/vue-utils";
import {authUtils} from "@/components/tools/auth-utils";

const httpLink = createHttpLink({
    uri: `${__backendAddr__}/gp/`,
})

const authLink = setContext((_, { headers }) => {
    // Обновим токен, чтобы продлить его срок жизни
    // Задержка нужна, чтобы текущий запрос выполнился со старым токеном
    setTimeout( () => { authUtils.refreshToken() }, 2000);
    // Данные jwt авторизации
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
