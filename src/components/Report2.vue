<template>

<div class="flex justify-content-center">

   <div v-if="reportReady" id="ReportBody" class="m-2">
      <h2>Отчет форма №2</h2>

<!--  Поля фильтра                    -->
      <div class="FieldsHeader" :class="{'TwoColumns': !mobile}">
         <div class="field">
            <label for="beginF">Дата начала</label>
            <Calendar inputId="beginF" v-model="begin" dateFormat="dd MM yy (D)" showIcon/>
<!--            <small v-if="errEmptyBegin" id="inputText-help" class="p-error"> Пустое значение не допустимо </small>-->
         </div>
         <div class="field">
            <label for="endF">Дата конца</label>
            <Calendar inputId="endF" v-model="end" dateFormat="dd MM yy (D)" showIcon/>
<!--            <small v-if="errEmptyEnd" id="inputText-help" class="p-error"> Пустое значение не допустимо </small>-->
         </div>
         <div class="field">
            <label for="monthF">Месяц/год</label>
            <Calendar inputId="monthF" v-model="month" view="month" dateFormat="MM yy" showIcon/>
         </div>
         <div class="field">
            <label for="yearF">Год</label>
            <Calendar inputId="yearF" v-model="year" view="year" dateFormat="yy" showIcon/>
         </div>
         <div class="field">
            <label for="costType">Статья</label>
            <Dropdown inputId="costType" placeholder="<все статьи>" filter showClear
                      v-model="costTypeId" :options="project.ctList" optionLabel="name" optionValue="id" />
         </div>
         <div class="field">
            <label for="agentFrom">Агент откуда</label>
            <Dropdown inputId="agentFrom" placeholder="<все агенты>" filter showClear
                      v-model="agentFromId" :options="project.agList" optionLabel="name" optionValue="id" />
         </div>
         <div class="field">
            <label for="agentTo">Агент куда</label>
            <Dropdown inputId="agentTo" placeholder="<все агенты>" filter showClear
                      v-model="agentToId" :options="project.agList" optionLabel="name" optionValue="id" />
         </div>
         <div class="field" style="margin-top: 2.6rem">
            <Button label="Применить фильтр" icon="pi pi-check" class="p-button-sm" @click="buildReport()" style="height: 2.3rem"/>
         </div>
      </div>

<!--      Заголовок                   -->
      <table class="table">
         <thead class="bc_green">
         <tr>
            <th style="width: 50%" class="ar"> Проект: </th>
            <th style="width: 50%" class="al">
               <router-link :to="'/project/' + projectId">{{ rd.proj }}</router-link>
            </th>
         </tr>
         </thead>
         <tbody>
         <tr v-for="(l, idx) in rd.head" :key="idx">
            <td class="ar"> {{ l.param }}: </td>
            <td> {{ l.value }} </td>
         </tr>
         </tbody>
      </table>

<!--      Обороты по статьям          -->
      <div>
         <table class="table">
            <caption> Обороты по статьям <br> (период/год) </caption>
            <thead class="bc_yellow">
            <tr>
               <th style="width: 50%"> Статья </th>
               <th style="width: 25%"> Сумма </th>
               <th style="width: 15%"> % </th>
               <th style="width: 10%"> * </th>
            </tr>
            </thead>
            <tbody>
               <template v-for="(l, idx) in rd.moveOnCt" :key="idx">
                  <tr>
                     <td rowspan="2">
                        <span v-if="!l.isOut" class="errorlist">[+]</span>
                        <a :href="'#ctdet_' + l.ctId"> {{ l.ct }} </a>
                     </td>
                     <td class="nc"> {{ fs(l.Psum) }} </td>
                     <td class="nc"> {{ fs(l.Ppr) }} </td>
                     <td class="nc"> {{ fs(l.Pqnty) }} </td>
                  </tr>
                  <tr class="bc_yellow_50">
                     <td class="nc"> {{ fs(l.Ysum) }} </td>
                     <td class="nc"> {{ fs(l.Ypr) }} </td>
                     <td class="nc"> {{ fs(l.Yqnty)}} </td>
                  </tr>
               </template>
               <tr>
                  <th rowspan="2"> Итого  </th>
                  <th> {{ fs(rd.moveOnCt_.Psum) }} </th>
                  <th> {{ fs(rd.moveOnCt_.Ppr) }} </th>
                  <th> {{ fs(rd.moveOnCt_.Pqnty) }} </th>
               </tr>
               <tr class="bc_yellow_50">
                  <th> {{ fs(rd.moveOnCt_.Ysum) }} </th>
                  <th> {{ fs(rd.moveOnCt_.Ypr) }} </th>
                  <th> {{ fs(rd.moveOnCt_.Yqnty) }} </th>
               </tr>
            </tbody>
         </table>
      </div>

<!--      Обороты по агентам          -->
      <div>
         <table class="table">
            <caption> Обороты по агентам <br> (период/год) </caption>
            <thead class="bc_orange">
            <tr>
               <th style="width: 50%"> Статья </th>
               <th style="width: 25%"> Сумма </th>
               <th style="width: 15%"> % </th>
               <th style="width: 10%"> * </th>
            </tr>
            </thead>
            <tbody>
               <template v-for="(l, idx) in rd.moveOnAg" :key="idx">
               <template v-if="l.hdr">
                  <tr class="bc_orange">
                     <th colspan="4"> {{ l.ag }} </th>
                  </tr>
               </template>
               <template v-else>
                  <tr>
                     <td rowspan="2">
                        <span v-if="l.ag == null">---</span>
                        <span v-else> <a :href="'#agdet_' + l.agId">{{ l.ag }}</a></span>
                     </td>
                     <td class="nc"> {{ fs(l.Psum) }} </td>
                     <td class="nc"> {{ fs(l.Ppr) }} </td>
                     <td class="nc"> {{ fs(l.Pqnty) }} </td>
                  </tr>
                  <tr class="bc_orange_50">
                     <td class="nc"> {{ fs(l.Ysum) }} </td>
                     <td class="nc"> {{ fs(l.Ypr) }} </td>
                     <td class="nc"> {{ fs(l.Yqnty) }} </td>
                  </tr>
               </template>
               </template>
               <tr class="bc_orange"><th colspan="4"> И Т О Г О </th></tr>
               <tr>
                  <th rowspan="2"> </th>
                  <th> {{ fs(rd.moveOnAgFrom_.Psum) }} </th>
                  <th> {{ fs(rd.moveOnAgFrom_.Ppr) }} </th>
                  <th> {{ fs(rd.moveOnAgFrom_.Pqnty) }} </th>
               </tr>
               <tr class="bc_orange_50">
                  <th> {{ fs(rd.moveOnAgFrom_.Ysum) }} </th>
                  <th> {{ fs(rd.moveOnAgFrom_.Ypr) }} </th>
                  <th> {{ fs(rd.moveOnAgFrom_.Yqnty) }} </th>
               </tr>
            </tbody>
         </table>
      </div>


<!--      Обороты по месяцам          -->
      <div>
         <table class="table">
            <caption> Обороты по месяцам </caption>
            <thead class="bc_purple">
            <tr>
               <th style="width: 50%"> Месяц </th>
               <th style="width: 30%"> Сумма </th>
               <th style="width: 20%"> % </th>
            </tr>
            </thead>
            <tbody>
               <template v-for="(l, idx) in rd.months" :key="idx">
                  <tr>
                     <td > {{ fdMY(l.month) }} </td>
                     <td class="nc"> {{ fs(l.summ) }} </td>
                     <td class="nc"> {{ fs(l.pr) }} </td>
                  </tr>
               </template>
               <tr>
                  <th> {{ rd.months_.month }} </th>
                  <th> {{ fs(rd.months_.summ) }} </th>
                  <th>  </th>
               </tr>
            </tbody>
         </table>
      </div>

<!--      Детализация по статьям      -->
      <div>
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
      </div>

<!--      Детализация по агентам      -->
      <div>
         <table class="table">
            <caption> Детализация по агентам </caption>
            <thead class="bc_green">
            <tr>
               <th style="width: 30%"> Дата </th>
               <th style="width: 40%"> Операция </th>
               <th style="width: 30%"> Сумма </th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(l, idx) in rd.detag" :key="idx">
               <template v-if="l.hdr">
                  <tr class="bc_green">
                     <th colspan="4"> {{ l.ag }} </th>
                  </tr>
               </template>
               <template v-else>
                  <template v-if="l.grp">
                     <tr class="bc_green">
                        <th :id="'agdet_' + l.agId" colspan="2"> {{ l.ag }} </th>
                        <th class="nc"> {{ fs(l.summ) }} </th>
                     </tr>
                  </template>
                  <template v-else>
                     <tr>
                        <td>
                           <router-link :to="'/finoper/' + l.pk">{{ fd(l.moment) }}</router-link>
                           <span class="font-monospace text-info" :style="{'color': l.userColor}">  @{{ l.user }} </span>
                        </td>
                        <td> <strong> {{ l.ct }} </strong> <br> {{ l.notes }} </td>
                        <td class="nc"> {{ fs(l.summ) }} </td>
                     </tr>
                  </template>
               </template>
            </template>
            </tbody>
         </table>
      </div>

<!--      Нижняя панель инструментов -->
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
import {clog, isMobile} from "@/components/tools/vue-utils";
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
         // Дата начала
         begin: null,
         // Дата конца
         end: null,
         // Месяц
         month: null,
         // Год
         year: null,
         // Статья
         costTypeId: null,
         // Агент откуда
         agentFromId: null,
         // Агент куда
         agentToId: null,
      }
   },

   computed: {
      mobile() {
         return isMobile();
      },
      // Ошибка - пустой ввод пол Начало
      errEmptyBegin() {
         return isNaN(Date.parse(this.begin))
      },
      // Ошибка - пустой ввод пол Конец
      errEmptyEnd() {
         return isNaN(Date.parse(this.end))
      },
   },

   watch: {
      // При выборе месяца - меняем начало и конец периода
      month(newVal) {
         if (newVal == null)
            return
         const y = this.month.getFullYear(), m = this.month.getMonth();
         const firstDay = new Date(y, m, 1);
         const lastDay = new Date(y, m + 1, 0);
         this.begin = firstDay;
         this.end =lastDay;
         this.year = null;
      },
      // При выборе года
      year(newVal) {
         if (newVal == null)
            return
         const y = this.year.getFullYear();
         const firstDay = new Date(y, 0, 1);
         const lastDay = new Date(y, 12, 0);
         this.begin = firstDay;
         this.end =lastDay;
         this.month = null;
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

      // Форматировать дату - месяц/год
      fdMY(ts) {
         return moment(ts).format("MMMM YYYY");
      },

      // Отобразить отчет
      async fetchReportData() {
         // Запрос данных
         const reportQ = gql(`
            #graphql
            query ($projectId: Int!, $beginDate: Int, $endDate: Int,
                   $costTypeId: Int, $agentFromId: Int, $agentToId: Int) {
               report002(projectId: $projectId, beginDate: $beginDate, endDate: $endDate,
                         costTypeId: $costTypeId, agentFromId: $agentFromId, agentToId: $agentToId),
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
               projectId:     this.projectId,
               beginDate:     this.begin           == null ? -1 : moment(this.begin).unix(),
               endDate:       this.end             == null ? -1 : moment(this.end).unix(),
               costTypeId:    this.costTypeId      == null ? -1 : this.costTypeId,
               agentFromId:   this.agentFromId     == null ? -1 : this.agentFromId,
               agentToId:     this.agentToId       == null ? -1 : this.agentToId,
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Выгрузка данных
            this.rd = JSON.parse(response.data.report002);
            this.project = response.data.project;
            document.title = `Отч 2: ${this.rd.proj}`;
            // clog(this.rd, this.project);
            this.reportReady = true;
         });
      },

      // Построить отчет
      buildReport() {
         this.fetchReportData();
      }
   },
}
</script>

<style lang="scss" scoped>

.errEmpty {
   color: red;
}

.TwoColumns {
   column-count: 2;
   column-fill: auto;
   column-span: none;
   column-gap: 2rem;
}

.FieldsHeader {
   max-width: 40rem;
   margin-left: auto;
   margin-right: auto;
   margin-bottom: 1rem;
}

.sizes {
   .p-inputtext {
      display: block;
      margin-bottom: .5rem;

      &:last-child {
         margin-bottom: 0;
      }
   }
}

.field * {
   width: 100%;
}

label {
   color: var(--primary-500);
}

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