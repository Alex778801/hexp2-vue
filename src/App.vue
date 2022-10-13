<template>
  <router-view></router-view>
</template>

<script>
/* eslint-disable */

import { useUserStore } from "@/stores/user";
import {apolloClient} from "@/apollo-config";
import gql from "graphql-tag";
import {clog} from "@/components/tools/vue-utils";

export default {
  name: 'App',

  setup() {



     const authQ = gql(`
         mutation TokenAuth($username: String!, $password: String!) {
           tokenAuth(username: $username, password: $password) {
             token
             payload
             refreshExpiresIn
           }
         }
      `);

     apolloClient.mutate({
        mutation: authQ,
        variables: {
           username: 'admin',
           password: '111'
        }
     }).then( (response) => {
        clog(response)

        const userStore = useUserStore();
        userStore.setToken(response.data.tokenAuth.token);
        userStore.setUser(response.data.tokenAuth.payload.username);


     })

  }
}
</script>

<style>

</style>
