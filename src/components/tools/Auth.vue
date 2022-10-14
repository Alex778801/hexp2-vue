<template>
   <Dialog class="p-dialog" :modal="true" :visible="!loggedIn" style="width: 20em">
      <template #header>
         <span class="text-primary"> Авторизация </span>
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
         <Button label="Отмена" @click="cancelBtn()"/>
         <Button label="Вход" icon="fa fa-sign-in" @click="loginBtn()"/>
      </template>
   </Dialog>
</template>

<script>
/* eslint-disable */

import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";
import {clog} from "@/components/tools/vue-utils";

export default {
   name: "Auth",

   emits: ['loggedIn_Changed'],

   watch: {
      loggedIn(newValue, oldValue) {
         this.$emit('loggedIn_Changed', newValue);
      }
   },

   data() {
      return {
         // Имя пользователя в диалоге
         userNameFld: '',
         // Пароль пользователя в диалоге
         passwordFld: '',
         // Флаг ошибки авторизации
         loginError: false,
         // Статус авторизации
         loggedIn: false,
         // Имя зарегистрированного пользователя
         username: '',
      }
   },

   mounted() {
      this.clearSessionData();
   },

   methods: {
      // Кнопка ОК
      loginBtn() {
         this.login(this.userNameFld, this.passwordFld);
      },
      // Кнопка Отмена
      cancelBtn() {
      },
      // **************************************************************************************************************
      // Очистить данные авторизации
      clearSessionData() {
         localStorage.removeItem("token");
         localStorage.removeItem("username");
         localStorage.removeItem("refexpin");
         localStorage.removeItem("payload");
         localStorage.removeItem("user");
         this.userNameFld = '';
         this.passwordFld = '';
         this.loginError = false;
         this.loggedIn = false;
         this.username = '';
      },
      // Вход в систему
      async login(username, password) {
         const loginM = gql(`
         mutation TokenAuth($username: String!, $password: String!) {
            tokenAuth(username: $username, password: $password) {
            token, payload, refreshExpiresIn,
            user { id, firstName, lastName, email }
            }
         }`);
         await apolloClient.mutate({
            mutation: loginM,
            variables: {
               username: username,
               password: password
            }
         }).then( (response) => {
            localStorage.setItem("token",    response.data.tokenAuth.token);
            localStorage.setItem("username", username);
            localStorage.setItem("refexpin", response.data.tokenAuth.refreshExpiresIn);
            localStorage.setItem("payload",  JSON.stringify(response.data.tokenAuth.payload));
            localStorage.setItem("user",     JSON.stringify(response.data.tokenAuth.user));
            this.username = username;
            this.loggedIn = true;
            this.loginError = false;
            this.userNameFld = '';
            this.passwordFld = '';
         }).catch( (error) => {
            this.loginError = true;
            this.passwordFld = '';
            clog('AUTH login failed:', error);
         });
      },
      // Выход из системы
      logout() {
         this.clearSessionData();
      },
      // Проверка валидности логина
      async verifyLogin() {
         const verifyM = gql(`
         mutation VerifyToken($token: String!) {
            verifyToken(token: $token) {
               payload
            }
      }`);
         await apolloClient.mutate({
            mutation: verifyM,
            variables: {
               token: localStorage.getItem("token")
            }
         }).then((response) => {
            // Все ок, ничего не трогаем
         }).catch((error) => {
            this.logout();
            clog('AUTH verifyLogin failed:', error);
         });
      },
      // Обработка ошибок
      err(error)  {
         if (String(error).includes('Error decoding signature')) {
            this.logout();
         }
         clog('AUTH error:', error);
      }
   }
}
</script>

<style scoped>

</style>