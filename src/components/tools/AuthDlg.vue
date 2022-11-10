<template>
   <Dialog class="p-dialog" :modal="true" :visible="true" style="width: 20em">
      <template #header>
         <div> <img src="/images/login.gif" style="width: 2.5rem"/></div>
         <div class="text-primary"> Авторизация </div>
      </template>
      <form id="loginForm" autocomplete="on">
         <div class="p-inputgroup pt-2">
            <span class="p-inputgroup-addon"><i class="pi pi-user"></i></span>
            <InputText id="username" v-model="userNameFld" placeholder="логин" autocomplete="username"/>
         </div>
         <div class="p-inputgroup pt-2">
            <span class="p-inputgroup-addon"><i class="pi pi-key"></i></span>
            <Password id="password" v-model="passwordFld" placeholder="пароль" :feedback="false" @keyup.enter="loginBtn()"
                      :inputProps="{autocomplete: 'current-password'}"/>
         </div>
         <small v-if="loginError" id="password-help" class="p-error"> Неверный логин/пароль </small>
      </form>
      <template #footer>
         <Button label="Отмена" class="p-button-sm" @click="cancelBtn()"/>
         <Button label="Вход" class="p-button-sm" icon="fa fa-sign-in" @click="loginBtn()"/>
      </template>
   </Dialog>
</template>

<script>
/* eslint-disable */

import {authUtils} from "@/components/tools/auth-utils";
import {clog} from "@/components/tools/vue-utils";

export default {
   name: "AuthDlg",

   data() {
      return {
         // Имя пользователя в диалоге
         userNameFld: '',
         // Пароль пользователя в диалоге
         passwordFld: '',
         // Ошибка авторизации
         loginError: false,
      }
   },
   mounted() {
      // Подписка на уведомления авторизации
      authUtils.subscribeNotification(this.authNotif);
   },

   methods: {
      // Кнопка ОК
      loginBtn() {
        authUtils.login(this.userNameFld, this.passwordFld);
      },
      // Кнопка Отмена
      cancelBtn() {
      },
      // Уведомения авторизации
      authNotif(loggedIn, event) {
         this.loginError = event === 'login failed';
         this.passwordFld = '';
      }
   }
}
</script>

<style scoped>

</style>