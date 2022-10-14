<template>
   <MainMenu v-if="loggedIn"/>
   <router-view v-if="loggedIn"></router-view>
   <LoginDlg @loggedIn_Changed="(value) => loggedIn = value"/>
</template>

<script>
/* eslint-disable */

import {apolloClient} from "@/apollo-config";
import gql from "graphql-tag";
import {clog} from "@/components/tools/vue-utils";
import MainMenu from "@/components/MainMenu";
import LoginDlg from "@/components/tools/LoginDlg";

export default {
   name: 'App',

   components: {
      LoginDlg,
      MainMenu
   },

   data() {
      return {
         loggedIn: false,
      }
   },

}
</script>

<style>

</style>
