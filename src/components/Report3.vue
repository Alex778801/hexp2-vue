<template>

<!--  Настройки отчета                   -->
   <div class="Setup">
      <Fieldset>
         <template #legend> Отчетный период </template>
         <div class="Field">
            <label>Дата начала</label>
            <Calendar v-model="beginA" dateFormat="dd MM yy (D)" showIcon/>
         </div>
         <div class="Field">
            <label>Дата конца</label>
            <Calendar v-model="endA" dateFormat="dd MM yy (D)" showIcon/>
         </div>
         <div class="Field">
            <label>Месяц/год</label>
            <Calendar v-model="monthA" view="month" dateFormat="MM yy" showIcon/>
         </div>
         <div class="Field">
            <label>Год</label>
            <Calendar v-model="yearA" view="year" dateFormat="yy" showIcon/>
         </div>
      </Fieldset>
      <Fieldset>
         <template #legend> Референсный период </template>
         <div class="Field">
            <label>Дата начала</label>
            <Calendar v-model="beginB" dateFormat="dd MM yy (D)" showIcon/>
         </div>
         <div class="Field">
            <label>Дата конца</label>
            <Calendar v-model="endB" dateFormat="dd MM yy (D)" showIcon/>
         </div>
         <div class="Field">
            <label>Месяц/год</label>
            <Calendar v-model="monthB" view="month" dateFormat="MM yy" showIcon/>
         </div>
         <div class="Field">
            <label>Год</label>
            <Calendar v-model="yearB" view="year" dateFormat="yy" showIcon/>
         </div>
      </Fieldset>
   </div>


<!-- Отчет                               -->
   <div v-if="reportReady">
      <div v-for="(ct, idx) in rd" :key="idx" >
         <div style="background-color: #6ba1e8">
            {{ ct.ct.name }} {{ fs(ct.sum) }} {{ ct.cnt }}
            <Checkbox v-model="ct.expanded" :binary="true" />
         </div>
         <div v-for="(fo, idx) in ct.finOpers" :key="idx" :hidden="!ct.expanded">
            {{ fd(fo.ts) }} {{ fo.notes }} {{ fs(fo.amount) }}
         </div>
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
         // Период А
         beginA: null, endA: null, monthA: null, yearA: null,
         // Период B
         beginB: null, endB: null, monthB: null, yearB: null,
         // ИД проекта
         projectId: Number(this.$route.params.projId),
         // Проект
         project: null,
         // Операции проекта
         finOpers: null,
         // Статьи
         costTypes: null,
         // Агенты
         agents: null,
         // Данные отчета
         rd: {},
         // Отчет готов
         reportReady: false,
      }
   },

   watch: {
      // При выборе месяца A
      monthA(newVal) {
         if (newVal != null)
            return;
         const y = this.monthA.getFullYear(), m = this.monthA.getMonth();
         this.beginA = new Date(y, m, 1);
         this.endA = new Date(y, m + 1, 0);
         this.yearA = null;
      },
      // При выборе года A
      yearA(newVal) {
         if (newVal == null)
            return;
         const y = this.yearA.getFullYear();
         this.beginA =  new Date(y, 0, 1);
         this.endA = new Date(y, 12, 0);
         this.monthA = null;
      },
      // При выборе месяца B
      monthB(newVal) {
         if (newVal == null)
            return;
         const y = this.monthB.getFullYear(), m = this.monthB.getMonth();
         this.beginB = new Date(y, m, 1);
         this.endB = new Date(y, m + 1, 0);
         this.yearB = null;
      },
      // При выборе года B
      yearB(newVal) {
         if (newVal == null)
            return;
         const y = this.yearB.getFullYear();
         this.beginB = new Date(y, 0, 1);
         this.endB = new Date(y, 12, 0);
         this.monthB = null;
      }
   },

   mounted() {
      // Локаль
      moment.locale("RU");
      // Настройка периодов - Отчетный
      const now = new Date();
      let y = now.getFullYear(), m = now.getMonth();
      this.beginA = new Date(y, m, 1);
      this.endA = new Date(y, m + 1, 0);
      this.monthA = now;
      // Настройка периодов - Референсный
      this.beginB = new Date(y, 0, 1);
      this.endB = new Date(y, 12, 0);
      this.yearB = now;
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
         return moment.unix(ts).format("DD MMM YY ddd HH:mm");
         // return moment(ts).format("DD MMM YY ddd HH:mm");
      },

      getCostType(id) {
         return this.costTypes.find( i => i.id === id);
      },

      getAgent(id) {
         return this.agents.find( i => i.id === id);
      },

      // Отобразить отчет
      async fetchReportData() {
         // Запрос данных
         const reportQ = gql(`
            #graphql
            query ($projectId: Int!, $tsBegin: Int!, $tsEnd: Int!) {
               project(id: $projectId) {
                  id, name, path,
               },
               finopers(projectId: $projectId, tsBegin: $tsBegin, tsEnd: $tsEnd) {
                  id,
                  ts,
                  ctId,
                  agFromId,
                  agToId,
                  user,
                  ucol,
                  amount,
                  notes,
              },
              costTypes {
                id, pid, name, ord, out, color,
              },
              agents {
                id, pid, name, ord,
              }
            }
         `);
         await apolloClient.query({
            query: reportQ,
            variables: {
               projectId: this.projectId,
               tsBegin: -1,
               tsEnd: -1,
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Выгрузка данных
            this.project = response.data.project;
            this.finOpers = response.data.finopers;
            this.costTypes = response.data.costTypes;
            this.agents = response.data.agents;
            document.title = `Отч 3: ${this.project.name}`;

            clog(this.project, this.finOpers, this.costTypes, this.agents);
            clog('---');

            this.rd = _(this.finOpers)
                .groupBy('ctId')
                .map( ( i, id ) => {
                   const _id = Number(id);
                   const ct = this.getCostType(_id);
                   const sortFinOpers = _(i).sortBy('ts').value();
                   return {
                      ctId: _id,
                      ctPid: ct.pid,
                      ctOrd: ct.ord,
                      ct: ct,
                      finOpers: sortFinOpers,
                      sum: _.sumBy(i, 'amount'),
                      cnt: _.countBy(i, '').undefined,
                      expanded: true,
                   }
                })
                .sortBy( ['ctPid', 'ctOrd'] )
                .value();

            clog(this.rd);

            //
            this.reportReady = true;
         });
      },
   }
}
</script>

<style lang="scss" scoped>



</style>