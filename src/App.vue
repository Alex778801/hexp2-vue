<template>
   <Toast />
   <MainMenu v-if="loggedIn" :dbLogoName="sysParams?.dbLogoName"/>
   <router-view v-if="loggedIn" :key="$route.path"/>
   <AuthDlg v-if="!loggedIn"/>
</template>

<script>
/* eslint-disable */

import {clog} from "@/components/tools/vue-utils";
import { authUtils } from "@/components/tools/auth-utils";
import AuthDlg from "@/components/tools/AuthDlg";
import MainMenu from "@/components/MainMenu";
import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";

const { schema } = require('/schema.json');

export default {
   name: 'App',

   components: {
      AuthDlg,
      MainMenu,
   },

   data() {
      return {
         // Системные параметры
         sysParams: null,
         // Пользователь авторизован
         loggedIn: authUtils.loggedIn,
      }
   },

   watch: {
      // Заголовок страницы
      $route: {
         handler(to, from) {
            document.title = to.meta.title || 'hExpenses';
         },
         immediate: true,
      },
   },

   mounted() {
      // Инит системы авторизации
      authUtils.init(this.$toast);
      // Подписка на уведомления авторизации
      authUtils.subscribeNotification(this.authNotif);

      // !!!!!!!!!!!! Автологин
      // authUtils.login('admin', '111');
      // authUtils.login('user_test', '222');

      // Загрузка системных параметров
      this.loadSysParams();
   },

   methods: {
      // Уведомления авторизации
      authNotif(loggedIn, event) {
         this.loggedIn = loggedIn;
      },

      // Загрузка системных параметров
      async loadSysParams() {
         // Запрос справочника
         const sysParamsQ = gql(`
            #graphql
            query { sysParams }
         `);
         await apolloClient.query({query: sysParamsQ, fetchPolicy: "no-cache"}).then((response) => {
            // Копируем данные из ответа
            this.sysParams = JSON.parse(response.data.sysParams);
            // clog(this.sysParams);
         }).catch((error) => authUtils.err(error));
      },
   }

}
</script>

<style>

:root {
   /* Ширина главного экрана*/
   --screen-width: 100em;
   /* Базовый размер шрифта для масштабирования интерфейса */
   --base-font-size: 0.9em;
   /* Цвет суммы прихода */
   --incomeColor: #116223;
   /* Цвет суммы расхода */
   --outcomeColor: #8a2128;
}

html {
   font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
   font-size:  var(--base-font-size);
}

body {
   margin:0 auto;
   max-width: var(--screen-width) !important;
}

@media print
{
   .no-print, .no-print *  {
      display: none !important;
   }

   .prn1col {
      zoom: 70% !important;
      column-count: 1 !important;
      filter: grayscale(100%) !important;
   }

   .prn2col {
      zoom: 70% !important;
      column-count: 2 !important;
      filter: grayscale(100%) !important;
   }
}

label {
   font-size: 0.85rem;
}

/* Нижняя панель инструментов */
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

/* Верхняя информационная плашка */
.top-infobar {
   background-color: var(--primary-100);
   position: sticky;
   top: 0.3rem;
   z-index: 1000;
}

/* Типовые кнопки различной ширины */
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

/* Кнопка с подстветкой - отображать режим */
.EnBtn {
   color: var(--yellow-300);
}

/* Мигающая кнопка */
@keyframes glowing {
   0% { background-color: var(--primary-600); box-shadow: 0 0 5px var(--primary-600); }
   50% { background-color: var(--primary-100); box-shadow: 0 0 20px var(--primary-100); }
   100% { background-color: var(--primary-600); box-shadow: 0 0 5px var(--primary-600); }
}
.glowBtn {
   animation: glowing 200ms 1;
}

/* Цвет суммы прихода */
.SumIncomeColor {
   color: var(--incomeColor) !important;
}

/* Цвет суммы расхода */
.SumOutcomeColor {
   color: var(--outcomeColor) !important;
}

</style>
