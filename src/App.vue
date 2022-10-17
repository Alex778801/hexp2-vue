<template>
   <MainMenu v-if="loggedIn" />
   <router-view v-if="loggedIn" />
   <AuthDlg v-if="!loggedIn" />
</template>

<script>
/* eslint-disable */

import {clog} from "@/components/tools/vue-utils";
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
      authUtils.login('admin', '111');
   },

   methods: {
      authNotif(loggedIn, event) {
         this.loggedIn = loggedIn;
      }
   }

}
</script>

<style>

:root {
   --screen-width: 100em;
}

html {
   font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}

body {
   margin:0 auto;
   max-width: var(--screen-width) !important;
}

.bottom-toolbar {
   position: fixed;
   width: 100%;
   max-width: var(--screen-width) !important;
   bottom: 0;
   left: 0;
   right: 0;
   margin-left: auto;
   margin-right: auto;
}

button {
   padding-left: 1.2rem !important;
   padding-right: 1.2rem !important;
}

.butWide1 {
   padding-left: 1.6rem !important;
   padding-right: 1.6rem !important;
}

.butWide2 {
   padding-left: 2.1rem !important;
   padding-right: 2.1rem !important;
}

.EnBtn {
   color: var(--yellow-300);
}

</style>
