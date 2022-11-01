<template>

   <div class="flex justify-content-center">

      <div v-if="reportReady" id="ReportBody" class="m-2">
         <h2>Отчет форма №1</h2>

   <!--      Заголовок              -->
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

   <!--      Бюджет                 -->
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

   <!--      Приход по статьям      -->
         <table class="table">
            <caption> Приход по статьям </caption>
            <thead class="bc_orange">
            <tr>
               <th style="width: 50%"> Статья прихода </th>
               <th style="width: 25%"> Сумма </th>
               <th style="width: 15%"> % </th>
               <th style="width: 10%"> * </th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(l, idx) in rd.prihps" :key="idx">
               <tr>
                  <td> <a :href="'#ctdet_' + l.ctId"> {{ l.ct }} </a> </td>
                  <td class="nc"> {{ fs(l.summ) }} </td>
                  <td class="nc"> {{ fs(l.pr) }} </td>
                  <td class="nc"> {{ fs(l.qnty) }} </td>
               </tr>
            </template>
            </tbody>
            <tr>
               <th> {{ rd.prihps_.ct }} </th>
               <th> {{ fs(rd.prihps_.summ) }} </th>
               <th> {{ fs(rd.prihps_.pr) }} </th>
               <th> {{ fs(rd.prihps_.qnty) }} </th>
            </tr>
         </table>

   <!--      Расход по статьям      -->
         <table class="table">
            <caption> Расход по статьям </caption>
            <thead class="bc_purple">
            <tr>
               <th style="width: 50%"> Статья расход </th>
               <th style="width: 25%"> Сумма </th>
               <th style="width: 15%"> % </th>
               <th style="width: 10%"> * </th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(l, idx) in rd.rashps" :key="idx">
               <tr>
                  <td> <a :href="'#ctdet_' + l.ctId"> {{ l.ct }} </a> </td>
                  <td class="nc"> {{ fs(l.summ) }} </td>
                  <td class="nc"> {{ fs(l.pr) }} </td>
                  <td class="nc"> {{ fs(l.qnty) }} </td>
               </tr>
            </template>
            </tbody>
            <tr>
               <th> {{ rd.rashps_.ct }} </th>
               <th> {{ fs(rd.rashps_.summ) }} </th>
               <th> {{ fs(rd.rashps_.pr) }} </th>
               <th> {{ fs(rd.rashps_.qnty) }} </th>
            </tr>
         </table>

   <!--      Обороты агентов        -->
         <table class="table">
            <caption> Обороты агентов </caption>
            <thead class="bc_brown">
            <tr>
               <th style="width: 50%"> Агент </th>
               <th style="width: 20%"> Приход </th>
               <th style="width: 20%"> Расход </th>
               <th style="width: 10%"> * </th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(l, idx) in rd.obk" :key="idx">
               <template v-if="l.isOut == null">
                  <tr class="bc_brown">
                     <th colspan="4"> {{ l.ag }} </th>
                  </tr>
               </template>
               <template v-else>
                  <template v-if="l.isOut">
                     <tr>
                        <td v-if="l.ag != null"> {{ l.ag }} </td>
                        <td v-else>  --- </td>
                        <td class="nc"> </td>
                        <td class="nc"> {{ fs(l.summ) }} </td>
                        <td class="nc"> {{ fs(l.qnty) }} </td>
                     </tr>
                  </template>
                  <template v-else>
                     <tr>
                        <td v-if="l.ag != null"> {{ l.ag }} </td>
                        <td v-else>  --- </td>
                        <td class="nc"> {{ fs(l.summ) }} </td>
                        <td class="nc"> 0 </td>
                        <td class="nc"> {{ fs(l.qnty) }} </td>
                     </tr>
                  </template>
               </template>
            </template>
            </tbody>
         </table>

   <!--      Детализация по статьям -->
         <table class="table">
            <caption> Детализация по статьям </caption>
            <thead class="bc_blue">
            <tr>
               <th style="width: 30%"> Дата </th>
               <th style="width: 40%"> Операция </th>
               <th style="width: 30%"> Сумма </th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(l, idx) in rd.detct" :key="idx">
               <template v-if="l.grp">
                  <tr class="bc_blue">
                     <th :id="'ctdet_' + l.ctId" colspan="2"> {{ l.ct }} </th>
                     <th class="nc"> {{ fs(l.summ) }} </th>
                  </tr>
               </template>
               <template v-else>
                  <tr>
                     <td>
                        <router-link :to="'/finoper/' + l.pk">{{ fd(l.moment) }}</router-link>
                        <span class="font-monospace text-info" :style="{'color': l.userColor}">  @{{ l.user }} </span>
                     </td>
                     <td> <strong> {{ l.agF }} <span class="agarw">→</span> {{ l.agT }} </strong> <br> {{ l.notes }} </td>
                     <td class="nc"> {{ fs(l.summ) }} </td>
                  </tr>
               </template>
            </template>
            </tbody>
         </table>

   <!-- Нижняя панель инструментов -->
         <Toolbar class="mx-0 my-1 p-2">
            <template #end>
               <!--  Кнопки действий формы      -->
               <Button label="Закр" icon="fa fa-ban" class="p-button-danger" @click="$router.go(-1)"/>
            </template>
         </Toolbar>

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
            return new Intl.NumberFormat('ru-RU').format(Math.round(sum));
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
            // Выгрузка данных
            this.rd = JSON.parse(response.data.report001);
            document.title = `Отч 1: ${this.rd.proj}`;
            // clog(this.rd);
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