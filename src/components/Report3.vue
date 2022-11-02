<template>

<!--  Настройки отчета                   -->
   <div class="Setup" style="display:none">
<!--  Период А    -->
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
<!--  Период В    -->
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
<!--  Фильтры    -->
      <Fieldset style="align-self: flex-start">
         <template #legend> Фильтры </template>
         <div class="Field">
            <label>Статьи</label>
            <MultiSelect v-model="fCostTypes" :options="costTypes" optionLabel="name" filter/>
         </div>
         <div class="Field">
            <label>Агенты</label>
            <MultiSelect v-model="fAgents" :options="agents" optionLabel="name" filter/>
         </div>
         <div class="Field">
            <Button label="Применить" icon="pi pi-check" @click="buildReport()"/>
         </div>
      </Fieldset>
<!--  --  -->
   </div>

<!-- Отчет                               -->
   <div v-if="reportReady">
      <div class="CostTypeReport">
         <div v-for="(ct, idx) in rd.costTypes" :key="idx" >
            <div class="Group" style="background-color: #6ba1e8">
               <div class="CheckBox"><Checkbox v-if="ct.canExpand" v-model="ct.expanded" :binary="true" /></div>
               <div class="ColorBox" :style="{'background-color': getCostType(ct.ctId).color}">!</div>
               <div class="Name"><router-link :to="'/costtype/' + ct.ctId">{{ ct.ct.name }}</router-link></div>
               <div class="TotalsA">{{ fs(ct.sumA) }} ({{ ct.cntA }})</div>
               <div class="TotalsB">{{ fs(ct.sumB) }} ({{ ct.cntB }})</div>
            </div>
            <div class="Element" v-for="(fo, idx) in ct.finOpers" :key="idx" :hidden="!ct.expanded">
               <div class="Ts">{{ fd(fo.ts) }}</div>
               <div class="Agents">
                  <router-link :to="'/agent/' + fo.agFromId">{{getAgent(fo.agFromId)?.name}}</router-link> →
                  <router-link :to="'/agent/' + fo.agToId">{{getAgent(fo.agToId)?.name}}</router-link>
               </div>
               <div class="Notes">{{ fo.notes }}</div>
               <div class="Amount">{{ fs(fo.amount) }}</div>
            </div>
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
   name: "Report3",

   data() {
      return {
         // Период А
         beginA: null, endA: null, monthA: null, yearA: null,
         // Период B
         beginB: null, endB: null, monthB: null, yearB: null,
         // Фильтры
         fCostTypes: [],
         fAgents: [],
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
         rd: [],
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
      let y = now.getFullYear(), m = now.getMonth() - 2;
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

      buildCostTypeReport() {
         // -----------------------------------------
         // Отчетный период
         const beginTsA = moment(this.beginA).unix();
         const endTsA = moment(this.endA).unix();
         const dataA = _(this.finOpers)
             .filter( i => i.ts >= beginTsA && i.ts <= endTsA)
             .groupBy('ctId')
             .map( ( i, id ) => {
                const _id = Number(id);
                const sortFinOpers = _(i).sortBy('ts').value();
                return {
                   ctId: _id,
                   finOpers: sortFinOpers,
                   sum: _.sumBy(i, 'amount'),
                   cnt: _.countBy(i, '').undefined,
                }
             })
             .value();
         // -----------------------------------------
         // Референсный период
         const beginTsB = moment(this.beginB).unix();
         const endTsB = moment(this.endB).unix();
         const dataB = _(this.finOpers)
             .filter( i => i.ts >= beginTsB && i.ts <= endTsB)
             .groupBy('ctId')
             .map( ( i, id ) => {
                const _id = Number(id);
                return {
                   ctId: _id,
                   finOpers: [],
                   sum: _.sumBy(i, 'amount'),
                   cnt: _.countBy(i, '').undefined,
                }
             })
             .value();
         // -----------------------------------------
         // Объединение периодов
         const dataAB = [];
         _(this.costTypes)
             .sortBy( ['pid', 'ord'] )
             .value()
             .forEach( ct => {
                const a = dataA.find( i => i.ctId === ct.id );
                const b = dataB.find( i => i.ctId === ct.id );
                if ( a !== undefined ) {
                   dataAB.push({
                      ctId: ct.id,
                      ct: ct,
                      finOpers: a.finOpers,
                      sumA: a.sum,
                      cntA: a.cnt,
                      sumB: b !== undefined ? b.sum : 0,
                      cntB: b !== undefined ? b.cnt : 0,
                      canExpand: true,
                      expanded: true,
                   });
                } else if (b !== undefined) {
                   dataAB.push({
                      ctId: ct.id,
                      ct: ct,
                      finOpers: [],
                      sumA: 0,
                      cntA: 0,
                      sumB: b.sum,
                      cntB: b.cnt,
                      canExpand: false,
                      expanded: false,
                   });
                }
             });
         // --
         // clog(dataA, dataB, '***', dataAB);
         return dataAB;
      },

      // Отобразить отчет
      async fetchReportData() {
         // Запрос данных
         const reportQ = gql(`
            #graphql
            query ($projectId: Int!, $tsBegin: Int!, $tsEnd: Int!) {
               project(id: $projectId) {
                  id, name, path,
                  ctList { id, pid, name, ord, out, color, },
                  agList { id, pid, name, ord, },
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
            }
         `);
         await apolloClient.query({
            query: reportQ,
            variables: {
               projectId: this.projectId,
               tsBegin: 0,
               tsEnd: 2147483647,
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Выгрузка данных
            this.project = response.data.project;
            this.costTypes = response.data.project.ctList;
            this.costTypes.forEach( i => this.fCostTypes.push(i) );
            this.agents = response.data.project.agList;
            this.agents.forEach( i => this.fAgents.push(i) );
            this.finOpers = response.data.finopers;
            document.title = `Отч 3: ${this.project.name}`;
            // clog(this.project, this.costTypes, this.agents, this.finOpers);
            this.rd.costTypes = this.buildCostTypeReport()
            clog(this.rd.costTypes);
            this.reportReady = true;
         });
      },
   }
}
</script>

<style lang="scss" scoped>

.Setup {
   width: auto;
   display: flex;
   flex-flow: row wrap;
   justify-content: center;
   margin: 1rem 1rem;

   .p-fieldset {
      width: fit-content;
      margin: 0.7rem 0.7rem;
      padding-top: 0;
   }

   .Field {
      width: 15.2rem;

      label {
         color: var(--primary-500);
         display: inline-block;
         width: 7rem;
         margin: 0.7rem 0 0.3rem 0.3rem;
      }

      .p-calendar, .p-multiselect {
         width: 15rem;
      }

      .p-button {
         display: block;
         width: 10rem;
         margin: 1.8rem auto 0 auto;
      }


   }
}


</style>