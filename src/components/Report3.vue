<template>

<!--  Настройки отчета        style="display:none"           -->
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
<!--  Отчет по Статьям    -->
      <div class="ReportTable">
         <table>
            <caption> Отчет по статьям </caption>
            <tr>
               <th class="bc_green">#</th>
               <th class="bc_green">Статья</th>
               <th class="bc_green">Референс</th>
               <th class="bc_green">Отчет</th>
            </tr>
            <template v-for="(ct, idx) in rd.costType" :key="idx">
               <tr class="Group">
                  <td class="ColorBox" :style="{'background-color': getCostType(ct.ctId).color}">
                     <Checkbox v-if="ct.canExpand" v-model="ct.expanded" :binary="true" />
                  </td>
                  <td class="Name"><router-link :to="'/costtype/' + ct.ctId">{{ ct.ct.name }}</router-link></td>
                  <td class="TotalsB">{{ fs(ct.sumB) }}<br><span class="Cnt">( {{ ct.cntB }} )</span></td>
                  <td class="TotalsA">{{ fs(ct.sumA) }}<br><span class="Cnt">( {{ ct.cntA }} )</span></td>
               </tr>
               <tr class="Element" v-for="(fo, idx) in ct.finOpers" :key="idx" :hidden="!ct.expanded">
                  <td colspan="3" class="Ts">
                     <div class="TsAg">
                        <router-link :to="'/finoper/' + fo.id">{{ fd(fo.ts) }}
                           <span :style="{'color': fo.ucol}">@{{ fo.user}} </span>
                        </router-link>
                        <br>
                        <span class="Agent">
                           <router-link :to="'/agent/' + fo.agFromId">{{getAgent(fo.agFromId)?.name}}</router-link> →
                           <router-link :to="'/agent/' + fo.agToId">{{getAgent(fo.agToId)?.name}}</router-link>
                        </span>
                     </div>
                     <div class="Notes">{{ fo.notes }}</div>
                  </td>
                  <td class="Amount">{{ fs(fo.amount) }}</td>
               </tr>
            </template>
         </table>
      </div>
<!-- Отчет Контрагенты Откуда  -->


<!-- Отчет Контрагенты Куда  -->


<!-- --  -->
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

   computed: {
      // Выбраны все элементы фильтра по Статьям
      fCostTypesAllSelected() {
         return this.costTypes.length === this.fCostTypes.length;
      },
      // Выбраны все элементы фильтра по Агентам
      fAgentsAllSelected() {
         return this.agents.length === this.fAgents.length;
      },
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

      // Получить статью по ИД
      getCostType(id) {
         return this.costTypes.find( i => i.id === id);
      },

      // Получить агента по ИД
      getAgent(id) {
         return this.agents.find( i => i.id === id);
      },

      // Проверить - статья выбрана в фильтре
      fCostTypeSelected(id) {
         return this.fCostTypes.some( i => i.id === id );
      },

      // Проверить - агент выбран в фильтре
      fAgentSelected(id) {
         return this.fAgents.some( i => i.id === id );
      },

      // Проверить фин операцию на соответствие фильтру
      checkFilter(i) {
         const ct = this.fCostTypesAllSelected || this.fCostTypeSelected(i.ctId);
         const ag = this.fAgentsAllSelected || (this.fAgentSelected(i.agFromId) || this.fAgentSelected(i.agToId));
         return ct && ag;
      },

      // Построить отчет по Статьям
      buildCostTypeReport() {
         // -----------------------------------------
         // Отчетный период
         const beginTsA = moment(this.beginA).unix();
         const endTsA = moment(this.endA).unix();
         const dataA = _(this.finOpers)
             .filter( i => i.ts >= beginTsA && i.ts <= endTsA && this.checkFilter(i) )
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
             .filter( i => i.ts >= beginTsB && i.ts <= endTsB && this.checkFilter(i))
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
                      expanded: false,
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

      // Построить отчет по Статьям
      buildAgentFromReport() {
         // -----------------------------------------
         // Отчетный период
         const beginTsA = moment(this.beginA).unix();
         const endTsA = moment(this.endA).unix();
         const dataA = _(this.finOpers)
             .filter( i => i.ts >= beginTsA && i.ts <= endTsA && this.checkFilter(i) )
             .groupBy('agFromId')
             .map( ( i, id ) => {
                const _id = Number(id);
                const sortFinOpers = _(i).sortBy('ts').value();
                return {
                   agFromId: _id,
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
             .filter( i => i.ts >= beginTsB && i.ts <= endTsB && this.checkFilter(i))
             .groupBy('agFromId')
             .map( ( i, id ) => {
                const _id = Number(id);
                return {
                   agFromId: _id,
                   finOpers: [],
                   sum: _.sumBy(i, 'amount'),
                   cnt: _.countBy(i, '').undefined,
                }
             })
             .value();
         // -----------------------------------------
         // Объединение периодов
         const dataAB = [];
         _(this.agents)
             .sortBy( ['pid', 'ord'] )
             .value()
             .forEach( agFrom => {
                const a = dataA.find( i => i.agFromId === agFrom.id );
                const b = dataB.find( i => i.agFromId === agFrom.id );
                if ( a !== undefined ) {
                   dataAB.push({
                      agFromId: agFrom.id,
                      agFrom: agFrom,
                      finOpers: a.finOpers,
                      sumA: a.sum,
                      cntA: a.cnt,
                      sumB: b !== undefined ? b.sum : 0,
                      cntB: b !== undefined ? b.cnt : 0,
                      canExpand: true,
                      expanded: false,
                   });
                } else if (b !== undefined) {
                   dataAB.push({
                      agFromId: agFrom.id,
                      agFrom: agFrom,
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

      // Построить отчет
      buildReport() {
         // this.reportReady = false;
         clog(this.project, this.costTypes, this.agents, this.finOpers);
         // Построение элементов отчета
         this.rd.costType = this.buildCostTypeReport()
         this.rd.agentFrom = this.buildAgentFromReport()
         // --
         clog(this.rd.costTypes, this.rd.agentsFrom);
         this.reportReady = true;
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
            this.buildReport();
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

.ReportTable {
   max-width: 60rem;
   margin: 0.5rem auto;
   padding: 0.5rem;

   table {
      width: 100%;
   }

   caption {
      font-size: 1.4rem;
      margin: 1rem;
   }

   a {
      color: var(--primary-color);
      text-decoration: none;
   }

   table, th, td {
      border: 1px solid var(--surface-600);
      border-collapse: collapse;
   }

   th, td {
      height: 3rem;
      padding: 0.5rem;
      color: var(--text-color)
   }

   th {
      height: 4rem;
   }

   th, .Group {
      background-color: var(--surface-100);
   }

   .ColorBox {
      text-align: center;
      width: 3rem;
   }

   :deep(.p-checkbox), :deep(.p-checkbox-box), :deep(.p-checkbox-box), :deep(.p-highlight) {
      background-color: var(--surface-500) !important;
      border-color: var(--surface-500) !important;
      border-radius: 0.3rem;
   }

   .TotalsA, .TotalsB, .Amount {
      width: 6rem;
      text-align: center;
   }

   .TsAg, .Notes {
      display: inline-block;
      vertical-align: top;
   }

   .Agent a {
      font-style: italic;
      color: var(--primary-300);
   }

   .Notes {
      padding-left: 1rem;
   }

   .Cnt {
      color: var(--text-color-secondary);
   }
}

// Цвета фона

.bc_green {
   background-color: #b4cf90 !important;
}

.bc_yellow {
   background-color: #f7e59c !important;
}

.bc_yellow_50 {
   background-color: #fff7d9 !important;
}

.bc_orange {
   background-color: #eccaad !important;
}

.bc_orange_50 {
   background-color: #fff1e6 !important;
}

.bc_purple {
   background-color: #dab5fc !important;
}

.bc_brown {
   background-color: #aba1a1 !important;
}

.bc_blue {
   background-color: #c4d6eb !important;
}

</style>