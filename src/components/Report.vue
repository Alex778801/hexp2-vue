<template>

   <div v-if="reportReady" id="ReportBody" class="m-2">
      <div class="row justify-content-center my-3">
         <h2>Отчет форма №1</h2>
      </div>

<!--      Заголовок-->
      <div>
         <table class="table">
            <thead class="bc_green">
            <tr>
               <th style="width: 50%" class="ar"> Проект: </th>
               <th style="width: 50%" class="al"> {{ rd.proj }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(l, idx) in rd.head" :key="idx">
               <td class="ar"> {{ l.param }}: </td>
               <td> {{ l.value }} </td>
            </tr>
            </tbody>
         </table>
      </div>

<!--      Бюджет-->
      <div class="mt-3">
         <table class="table">
            <caption> Бюджет </caption>
            <thead class="bc_yellow">
            <tr>
               <th style="width: 25%"> Статья </th>
               <th style="width: 25%"> План </th>
               <th style="width: 25%"> Факт </th>
               <th style="width: 25%"> Долг </th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(l, idx) in rd.budget" :key="idx">
               <tr v-if="l.grp" class="bc_yellow">
                  <th> {{ l.ct }} </th>
                  <th> {{ fs(l.sumb) }} </th>
                  <th> {{ fs(l.sumo) }} </th>
                  <th :class="{'neg': l.sumdiff < 0}"> {{ fs(l.sumdiff) }} </th>
               </tr>
               <tr v-else>
                  <template v-if="l.type === 'bud'">
                     <td> {{ l.notes }} </td>
                     <td class="nc"> {{ fs(l.summ) }} </td>
                     <td class="nc"> --- </td>
                     <td class="nc"> --- </td>
                  </template>
                  <template v-else>
                     <td> <router-link :to="'/finoper/' + l.pk">{{ fd(l.moment) }}</router-link> </td>
                     <td> {{ l.notes }} </td>
                     <td class="nc"> {{ fs(l.summ) }} </td>
                     <td class="nc"> --- </td>
                  </template>
               </tr>
            </template>
            </tbody>
         </table>
      </div>



   </div>



</template>

<script>
/* eslint-disable */

import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";
import {clog} from "@/components/tools/vue-utils";
import moment from "moment/moment";

export default {
   name: "Report",

   data() {
      return {
         // ИД отчета
         reportId: Number(this.$route.params.id),
         // ИД проекта
         projectId: Number(this.$route.params.projId),
         // Данные отчета
         rd: {},
         // Отчет готов
         reportReady: false,
      }
   },

   mounted() {
      // Локаль
      moment.locale("RU");
      // Получить данные отчета
      this.fetchReportData();
   },

   methods: {
      // Форматирование суммы
      fs(sum) {
         return new Intl.NumberFormat('ru-RU').format(sum);
      },

      // Форматировать дату
      fd(ts) {
         // return moment.unix(ts).format("DD MMM YY ddd HH:mm");
         return moment(ts).format("DD MMM YY ddd HH:mm");
      },

      // Форматировать дату 2
      fd2(ts) {
         return moment(ts).format("DD MMMM YYYY ddd HH:mm:ss");
      },

      // Отобразить отчет
      async fetchReportData() {
         // Запрос данных
         const reportQ = gql(`
            #graphql
            query ($projectId: Int!) {
                report001(projectId: $projectId)
            }
         `);
         await apolloClient.query({
            query: reportQ,
            variables: {
               projectId: this.projectId,
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Выгрузка жанных
            this.rd = JSON.parse(response.data.report001);
            clog(this.rd);
            this.reportReady = true;
         });
      },
   }
}
</script>

<style scoped>

/*body {*/
/*   max-width: 75em !important;*/
/*   margin:0 auto !important;*/
/*}*/

@supports (-webkit-touch-callout: none) {
   @media print {
      body {
         zoom: 80%;
         font-size: 0.6em;
      }
      .no-print, .no-print *  {
         display: none !important;
      }
   }
}

@media print
{
   .no-print, .no-print *  {
      display: none !important;
   }

   body {
      zoom: 70%;
      column-count: 2;
      -webkit-column-count: 2;
      -moz-column-count: 2;
      -webkit-filter: grayscale(100%);
      filter: grayscale(100%);
   }
}

.btn-primary, .btn-primary:hover, .btn-primary:active, .btn-primary:visited {
   background-color: #519df8 !important;
}

.btn-outline-primary:hover {
   color: darkslateblue;
}

.btn-outline-primary, .btn-outline-primary:hover, .btn-outline-primary:active, .btn-outline-primary:visited {
   background-color: white !important;
}

h1, h2, h3, h4, h5, h6 {
   text-align: center;
}

.ItemBtnIcon {
   font-size: 1.8em;
   color: #519df8;
}

.wideBtn {
   width: 4em;
}

table {
   font-size: 0.9em;
   width: 100%;
   border-collapse: collapse;
}

table caption {
   caption-side: top;
   text-align: center;
   font-size: 1.5em;
   color: black;
}

td, th {
   padding: 0.4em !important;
   /*text-align: center;*/
   border: 1px solid black;
}

th {
   height: 2em;
   text-align: center;
   vertical-align: middle;
}

td {
   height: 1.6em;
   vertical-align: middle;
}

.nc {
   text-align: center;
}

.ar {
   text-align: end;
}

.al {
   text-align: start;
}

/*.tform th {*/
/*   border-color: #659de7;*/
/*   vertical-align: middle;*/
/*   text-align: end;*/
/*   color: #2372f6;*/
/*}*/

/*.tform td {*/
/*   border-color: #659de7;*/
/*   vertical-align: middle;*/
/*   padding: 0.6em;*/
/*}*/

/*.tform select {*/
/*   border-color: #659de7;*/
/*   border-radius: 0.3em;*/
/*   font-size: 1.2em;*/
/*}*/

/*.tform input {*/
/*   border-width: 1px;*/
/*   border-color: #659de7;*/
/*   border-radius: 0.3em;*/
/*}*/

/*.tform input[type=date], .tform input[type=month] {*/
/*   font-size: 1.2em;*/
/*   padding-left: 0.3em;*/
/*}*/

.errorlist {
   color: red !important;
}

.red {
   color: red !important;
}

.neg {
   color: darkred !important;
}

.agarw {
   color: #737373;
}

.bc_green {
   background-color: #b4cf90;
}

.bc_yellow {
   background-color: #f7e59c;
}

.bc_yellow_50 {
   background-color: #fff7d9;
}

.bc_orange {
   background-color: #eccaad;
}

.bc_orange_50 {
   background-color: #fff1e6;
}

.bc_purple {
   background-color: #dab5fc;
}

.bc_brown {
   background-color: #aba1a1;
}

.bc_blue {
   background-color: #c4d6eb;
}

</style>