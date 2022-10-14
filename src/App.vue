<template>
   <MainMenu v-if="loggedIn"/>
   <router-view v-if="loggedIn"></router-view>
   <Auth ref="auth" @loggedIn_Changed="(value) => loggedIn = value"/>
</template>

<script>
/* eslint-disable */

import Auth from "@/components/tools/Auth";
import MainMenu from "@/components/MainMenu";

export default {
   name: 'App',

   components: {
      Auth,
      MainMenu,
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
