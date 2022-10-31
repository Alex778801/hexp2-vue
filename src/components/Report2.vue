<template>

<div class="flex justify-content-center">

   <div v-if="reportReady" id="ReportBody" class="m-2">
      <h2>Отчет форма №2</h2>








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
   name: "Report1",

   data() {
      return {
         // ИД проекта
         projectId: Number(this.$route.params.projId),
         // Проект
         project: { ctList: {}, agList: {} },
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
         if (sum !== undefined && sum !== null && !isNaN(sum))
            return new Intl.NumberFormat('ru-RU').format(sum);
         else
            return ''
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
               report002(projectId: $projectId),
               project(id: $projectId) {
                  id, name, path,
                  ctList { id, name, },
                  agList { id, name, }
               }
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
            this.rd = JSON.parse(response.data.report002);
            this.project = response.data.project;
            clog(this.rd, this.project);
            this.reportReady = true;
         });
      },
   }
}
</script>

<style scoped>

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

#ReportBody {
   width: 100%;
   max-width: 60rem;
}

h1, h2, h3, h4, h5, h6 {
   text-align: center;
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
   padding-top: 1.5em;
   padding-bottom: 0.5em;
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