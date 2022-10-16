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
   // Инициализация
   init() {
      this.clearSessionData();
      this.sendNotifications(false, 'init');
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
         this.username = username;
         this.loggedIn = true;
         this.sendNotifications(true, 'login ok');
         return true;
      }).catch( (error) => {
         this.clearSessionData();
         this.sendNotifications(false, 'login failed');
         clog('AUTH login failed:', error);
         return false;
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
         this.sendNotifications(true, 'token verify ok');
         return true;
      }).catch((error) => {
         this.clearSessionData();
         this.sendNotifications(false, 'token verify failed');
         clog('AUTH token verify failed:', error);
         return false;
      });
   },
   // Обработка ошибок
   err(error)  {
      if (String(error).includes('Error decoding signature')) {
         this.clearSessionData();
         this.sendNotifications(false, 'token not valid');
      }
      clog('AUTH error:', error);
   }
}

authUtils.init();
