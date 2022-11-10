/* eslint-disable */

import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";
import {clog} from "@/components/tools/vue-utils";

export const authUtils = {
   // Статус авторизации
   loggedIn: false,

   // Имя зарегистрированного пользователя
   username: '',

   // Колбэки событий авторизации
   notifications: [(loggedIn, event)=>{}],

   // Выскакивающие плашки оповещений
   toast: null,

   // Инициализация
   init(toast) {
      this.toast = toast;
      //this.clearSessionData();
      this.verifyToken();
   },

   // Подписаться на уведомления авторизации
   subscribeNotification(callback) {
      this.notifications.push(callback)
   },

   // Разослать уведомления авторизации
   sendNotifications(loggedIn, event) {
     this.notifications.forEach( n => n(loggedIn, event) );
   },

   // Очистить данные авторизации
   clearSessionData() {
      localStorage.removeItem("token");
      localStorage.removeItem("login");
      this.username = '';
      this.loggedIn = false;
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
         localStorage.setItem("token", response.data.tokenAuth.token);
         localStorage.setItem("login", username);
         this.username = username;
         this.loggedIn = true;
         this.sendNotifications(true, 'login ok');
      }).catch( (error) => {
         this.clearSessionData();
         this.sendNotifications(false, 'login failed');
         clog('AUTH login failed:', error);
      });
   },

   // Выход из системы
   logout() {
      this.clearSessionData();
      this.sendNotifications(false, 'logout');
   },

   // Проверка валидности логина
   async verifyToken() {
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
         this.username = localStorage.getItem("login");
         this.loggedIn = true;
         this.sendNotifications(true, 'token verify ok');
      }).catch((error) => {
         this.clearSessionData();
         this.sendNotifications(false, 'token verify failed');
         clog('AUTH token verify failed:', error);
      });
   },

   // Обработка ошибок
   err(error)  {
      clog('AUTH error:', error);
      const errStr = String(error);
      // ошибка в сигнатуре токене
      if (errStr.includes('Error decoding signature')) {
         this.clearSessionData();
         this.sendNotifications(false, 'token is not valid');
         this.toast.add({severity: 'error', summary: `Ошибка`, detail: 'Токен авторизации не действителен'});
      }
      // срок действия токен истек
      else if (errStr.includes('Signature has expired')) {
         this.clearSessionData();
         this.sendNotifications(false, 'token has expired');
         // this.toast.add({severity: 'error', summary: `Ошибка`, detail: 'Срок действия токена авторизации истек'});
      }
      else {
         this.toast.add({severity: 'error', summary: `Ошибка`, detail: errStr});
      }
      // --
   }
}