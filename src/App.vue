<template>
   <MainMenu v-if="loggedIn"/>
   <router-view v-if="loggedIn"></router-view>
   <Auth v-if="!loggedIn"/>
</template>

<script>
/* eslint-disable */

import { settingsUtils } from "./components/tools/settings-utils"
import { authUtils } from "@/components/tools/auth-utils";
import AuthDlg from "@/components/tools/AuthDlg";
import MainMenu from "@/components/MainMenu";

export default {
   name: 'App',

   components: {
      AuthDlg,
      MainMenu,
   },

   data() {
      return {
         loggedIn: false,
      }
   },

   mounted() {
      // Подписка на уведомления авторизации
      authUtils.subscribeNotification(this.authNotif);
      // !!!!!!!!!!!! Автологин
      // authUtils.login('admin', '111');
   },

   methods: {
      authNotif(loggedIn, event) {
         this.loggedIn = loggedIn;
      }
   }

}
</script>

<style>



</style>
