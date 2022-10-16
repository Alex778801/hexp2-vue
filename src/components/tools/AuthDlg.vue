<template>
   <Dialog class="p-dialog" :modal="true" style="width: 20em">
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

   methods: {
      // Кнопка ОК
      loginBtn() {
         this.loginError = !authUtils.login(this.userNameFld, this.passwordFld);
      },
      // Кнопка Отмена
      cancelBtn() {
      },
   }
}
</script>

<style scoped>

</style>