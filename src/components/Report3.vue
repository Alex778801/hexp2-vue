<template>

   <div class="prn1col">

   <!--  Настройки отчета        style="display:none"           -->
      <div class="Setup">
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
                  <th class="bc_green">
                     <i class="OutlineFont" :class="{'fa fa-plus': !ctReportAllCheck, 'fa fa-minus': ctReportAllCheck}"
                        @click="ctReportAllCheck=!ctReportAllCheck"/>
                  </th>
                  <th class="bc_green">Статья</th>
                  <th class="bc_green">Референс</th>
                  <th class="bc_green">Отчет</th>
               </tr>
               <template v-for="(ct, idx) in rd.costType" :key="idx">
                  <!-- группа - статья -->
                  <tr class="Group">
                     <td class="ColorBox" :style="{'background-color': getCostType(ct.ctId).color}">
                            <i class="OutlineFont" :class="{'fa fa-plus': !ct.expanded, 'fa fa-minus': ct.expanded}"
                               v-show="ct.canExpand" @click="ct.expanded=!ct.expanded"/>
                     </td>
                     <td class="Name"><router-link :to="'/costtype/' + ct.ctId">{{ ct.ct.name }}</router-link></td>
                     <td class="TotalsB">{{ fs(ct.sumB) }}<br><span class="Cnt">( {{ ct.cntB }} )</span></td>
                     <td class="TotalsA">{{ fs(ct.sumA) }}<br><span class="Cnt">( {{ ct.cntA }} )</span></td>
                  </tr>
                  <!-- элемент - фин операция -->
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
               <!-- подвал - общий итог -->
               <tr>
                  <th colspan="2">И Т О Г О :</th>
                  <th> {{ fs(rd.costType.reduce( (sum, i) => sum + i.sumB, 0 )) }}</th>
                  <th> {{ fs(rd.costType.reduce( (sum, i) => sum + i.sumA, 0 )) }}</th>
               </tr>
               <!--  -->
            </table>
         </div>

   <!--  График по статьям    -->
         <div class="GraphMonth">
            <h3> Суммы по статьям </h3>
            <Chart type="pie" :data="ctGraphData" :options="ctGraphOptions" />
         </div>

<!--     Детализация графика по статьям    -->
         <div class="ReportTable">
            <table v-if="ctGraphDetailShow">
               <!-- группа - статья -->
               <tr class="Group">
                  <td class="ColorBox" :style="{'background-color': getCostType(ctGraphDetailHeader.ctId).color}">
                     <i class="OutlineFont" :class="{'fa fa-plus': !ctGraphDetailExpanded, 'fa fa-minus': ctGraphDetailExpanded}"
                        @click="ctGraphDetailExpanded=!ctGraphDetailExpanded"/>
                  </td>
                  <td class="Name"><router-link :to="'/costtype/' + ctGraphDetailHeader.ctId">{{ ctGraphDetailHeader.ct.name }}</router-link></td>
                  <td class="TotalsB">{{ fs(ctGraphDetailHeader.sumB) }}<br><span class="Cnt">( {{ ctGraphDetailHeader.cntB }} )</span></td>
                  <td class="TotalsA">{{ fs(ctGraphDetailHeader.sumA) }}<br><span class="Cnt">( {{ ctGraphDetailHeader.cntA }} )</span></td>
               </tr>
               <!-- элемент - фин операция -->
               <tr class="Element" v-for="(fo, idx) in ctGraphDetailList" :key="idx" :hidden="!ctGraphDetailExpanded">
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
            </table>
         </div>

   <!--  График по месяцам   -->
         <div class="GraphMonth">
            <h3> Суммы по месяцам </h3>
            <Chart type="bar" :data="monthGraphData" :options="monthGraphOptions" />
         </div>

   <!-- Отчет Контрагенты Откуда  -->
         <div class="ReportTable">
            <table>
               <caption> Отчет по контрагентам ОТКУДА </caption>
               <tr>
                  <th class="bc_yellow">
                     <i class="OutlineFont" :class="{'fa fa-plus': !agFromReportAllCheck, 'fa fa-minus': agFromReportAllCheck}"
                        @click="agFromReportAllCheck=!agFromReportAllCheck"/>
                  </th>
                  <th class="bc_yellow">Статья</th>
                  <th class="bc_yellow">Референс</th>
                  <th class="bc_yellow">Отчет</th>
               </tr>
               <template v-for="(agFrom, idx) in rd.agentFrom" :key="idx">
                  <tr class="Group">
                     <td class="ColorBox">
                        <i class="OutlineFont" :class="{'fa fa-plus': !agFrom.expanded, 'fa fa-minus': agFrom.expanded}"
                           v-show="agFrom.canExpand" @click="agFrom.expanded=!agFrom.expanded"/>
                     </td>
                     <td class="Name"><router-link :to="'/agent/' + agFrom.agFromId">{{ agFrom.agFrom.name }}</router-link></td>
                     <td class="TotalsB">{{ fs(agFrom.sumB) }}<br><span class="Cnt">( {{ agFrom.cntB }} )</span></td>
                     <td class="TotalsA">{{ fs(agFrom.sumA) }}<br><span class="Cnt">( {{ agFrom.cntA }} )</span></td>
                  </tr>
                  <tr class="Element" v-for="(fo, idx) in agFrom.finOpers" :key="idx" :hidden="!agFrom.expanded">
                     <td colspan="3" class="Ts">
                        <div class="TsAg">
                           <router-link :to="'/finoper/' + fo.id">{{ fd(fo.ts) }}
                              <span :style="{'color': fo.ucol}">@{{ fo.user}} </span>
                           </router-link>
                           <br>
                           <span class="Agent">
                              <router-link :to="'/costtype/' + fo.ctId"><strong>{{getCostType(fo.ctId)?.name}}</strong></router-link> :
   <!--                           <router-link :to="'/agent/' + fo.agFromId">{{getAgent(fo.agFromId)?.name}}</router-link> -->
                              → <router-link :to="'/agent/' + fo.agToId">{{getAgent(fo.agToId)?.name}}</router-link>
                           </span>
                        </div>
                        <div class="Notes">{{ fo.notes }}</div>
                     </td>
                     <td class="Amount">{{ fs(fo.amount) }}</td>
                  </tr>
               </template>
            </table>
         </div>

   <!-- Отчет Контрагенты Куда    -->
         <div class="ReportTable">
            <table>
               <caption> Отчет по контрагентам КУДА </caption>
               <tr>
                  <th class="bc_orange">
                     <i class="OutlineFont" :class="{'fa fa-plus': !agToReportAllCheck, 'fa fa-minus': agToReportAllCheck}"
                        @click="agToReportAllCheck=!agToReportAllCheck"/>
                  </th>
                  <th class="bc_orange">Статья</th>
                  <th class="bc_orange">Референс</th>
                  <th class="bc_orange">Отчет</th>
               </tr>
               <template v-for="(agTo, idx) in rd.agentTo" :key="idx">
                  <tr class="Group">
                     <td class="ColorBox">
                        <i class="OutlineFont" :class="{'fa fa-plus': !agTo.expanded, 'fa fa-minus': agTo.expanded}"
                           v-show="agTo.canExpand" @click="agTo.expanded=!agTo.expanded"/>
                     </td>
                     <td class="Name"><router-link :to="'/agent/' + agTo.agToId">{{ agTo.agTo.name }}</router-link></td>
                     <td class="TotalsB">{{ fs(agTo.sumB) }}<br><span class="Cnt">( {{ agTo.cntB }} )</span></td>
                     <td class="TotalsA">{{ fs(agTo.sumA) }}<br><span class="Cnt">( {{ agTo.cntA }} )</span></td>
                  </tr>
                  <tr class="Element" v-for="(fo, idx) in agTo.finOpers" :key="idx" :hidden="!agTo.expanded">
                     <td colspan="3" class="Ts">
                        <div class="TsAg">
                           <router-link :to="'/finoper/' + fo.id">{{ fd(fo.ts) }}
                              <span :style="{'color': fo.ucol}">@{{ fo.user}} </span>
                           </router-link>
                           <br>
                           <span class="Agent">
                              <router-link :to="'/costtype/' + fo.ctId"><strong>{{getCostType(fo.ctId)?.name}}</strong></router-link> :
                              <router-link :to="'/agent/' + fo.agFromId">{{getAgent(fo.agFromId)?.name}}</router-link> →
   <!--                           <router-link :to="'/agent/' + fo.agToId">{{getAgent(fo.agToId)?.name}}</router-link>-->
                           </span>
                        </div>
                        <div class="Notes">{{ fo.notes }}</div>
                     </td>
                     <td class="Amount">{{ fs(fo.amount) }}</td>
                  </tr>
               </template>
            </table>
         </div>

   <!-- --  -->
      </div>

   </div>

</template>

<script>
/* eslint-disable */

import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";
import {clog, DateFromTsOrNull, numFromUrlParam} from "@/components/tools/vue-utils";
import moment from "moment/moment";

export default {
   name: "Report3",

   data() {
      return {
         // Период А
         beginA: DateFromTsOrNull(numFromUrlParam(this.$route.query.beginA)),
         endA: DateFromTsOrNull(numFromUrlParam(this.$route.query.endA)),
         monthA: null,
         yearA: null,
         // Период B
         beginB: DateFromTsOrNull(numFromUrlParam(this.$route.query.beginB)),
         endB: DateFromTsOrNull(numFromUrlParam(this.$route.query.endB)),
         monthB: null,
         yearB: null,
         // Фильтры
         fCostTypes: [],
         fAgents: [],
         // Вкл/выкл детализаий отчета
         ctReportAllCheck: null,
         agFromReportAllCheck: null,
         agToReportAllCheck: null,
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
         // Данные графика по статьям
         ctGraphData: {
            labels: [],
            datasets: [
               {
                  data: [],
                  backgroundColor: ["#42A5F5","#66BB6A","#FFA726"],
                  hoverBackgroundColor: ["#64B5F6","#81C784","#FFB74D"]
               }
            ]
         },
         ctGraphOptions: {
            legend: {
               labels: {
                  color: '#495057'
               }
            },
            'onClick': this.onCtGraphClick,
         },
         ctGraphDetailShow: false,
         ctGraphDetailExpanded: true,
         ctGraphDetailHeader: {},
         ctGraphDetailList: [],
         // Данные графика по месяцам
         monthGraphData: {
            labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            datasets: [
               {
                  label: 'Референсный период',
                  backgroundColor: '#42A5F5',
                  data: [],
               },
            ]
         },
         monthGraphOptions: {
            plugins: {
               legend: {
                  labels: {
                     color: '#495057'
                  }
               }
            },
            scales: {
               x: {
                  ticks: {
                     color: '#495057'
                  },
                  grid: {
                     color: '#ebedef'
                  }
               },
               y: {
                  ticks: {
                     color: '#495057'
                  },
                  grid: {
                     color: '#ebedef'
                  }
               }
            }
         },
         // Отчет готов
         reportReady: false,
      }
   },

   watch: {
      // При выборе месяца A
      monthA(newVal) {
         if (newVal == null)
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
      },

      // При изменении даты начала и конца периода А и B
      // beginA(newVal) { this.updateGetParams() },
      // endA(newVal)   { this.updateGetParams() },
      // beginB(newVal) { this.updateGetParams() },
      // endB(newVal)   { this.updateGetParams() },

      // Вкл/выкл детализаий отчета
      ctReportAllCheck(newVal) {
         this.rd.costType.forEach( i => { if (i.canExpand) i.expanded = newVal } );
      },

      agFromReportAllCheck(newVal) {
         this.rd.agentFrom.forEach( i => { if (i.canExpand) i.expanded = newVal } );
      },

      agToReportAllCheck(newVal) {
         this.rd.agentTo.forEach( i => { if (i.canExpand) i.expanded = newVal } );
      },
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

   created() {
      // Локаль
      moment.locale("RU");
      // Опорные даты
      const now = new Date();
      let y = now.getFullYear(), m = now.getMonth();
      // Настройка периодов - Отчетный
      if (this.beginA == null) {
         this.beginA = new Date(y, m, 1);
         this.monthA = this.beginA;
      }
      if (this.endA == null)
         this.endA = new Date(y, m + 1, 0);
      // Настройка периодов - Референсный
      if (this.beginB == null) {
         this.beginB = new Date(y, 0, 1);
         this.yearB = this.beginB;
      }
      if (this.endB == null)
         this.endB = new Date(y, 12, 0);
      // Получить данные отчета
      this.fetchReportData();
   },

   methods: {
      // Обновить get параметры страницы
      updateGetParams() {
         this.$router.replace({query: {
            'beginA': moment(this.beginA).unix(),
            'endA': moment(this.endA).unix(),
            'beginB': moment(this.beginB).unix(),
            'endB': moment(this.endB).unix(),
         }});
      },

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

      // Построить график по Статьям
      buildCtGraph() {
         // -----------------------------------------
         // Отчетный период
         const beginTsA = moment(this.beginA).unix();
         const endTsA = moment(this.endA).unix();
         const dataA = _(this.finOpers)
             .filter( i => i.ts >= beginTsA && i.ts <= endTsA && this.checkFilter(i) )
             .groupBy('ctId')
             .map( ( i, id ) => {
                const _id = Number(id);
                return {
                   ctId: _id,
                   sum: _.sumBy(i, 'amount'),
                   cnt: _.countBy(i, '').undefined,
                }
             })
             .sortBy('sum')
             .value();
         // Выгрузим данные в график
         // clog(dataA);
         this.ctGraphData.datasets[0].data = dataA.map( i => i.sum );
         this.ctGraphData.datasets[0].ctIds = dataA.map( i => i.ctId );
         this.ctGraphData.datasets[0].backgroundColor = dataA.map( i => this.getCostType(i.ctId).color );
         this.ctGraphData.datasets[0].hoverBackgroundColor = dataA.map( i => this.getCostType(i.ctId).color );
         this.ctGraphData.labels = dataA.map( i => this.getCostType(i.ctId).name );
      },

      // Детализация при клике сегмента круга на графике детализации по статьям
      onCtGraphClick(evt, item) {
         const idx = item[0].index;
         const ctId = this.ctGraphData.datasets[0].ctIds[idx];
         const ct = this.rd.costType.find( i => i.ctId === ctId );
         this.ctGraphDetailHeader = ct;
         this.ctGraphDetailList = ct.finOpers;
         this.ctGraphDetailShow = true;
         // clog(evt, idx, ctId, this.ctGraphDetailList);
      },

      // Построить график по Месяцам
      buildMonthGraph() {
         // -----------------------------------------
         // Референсный период
         const beginTsB = moment(this.beginB).unix();
         const endTsB = moment(this.endB).unix();
         const dataB = _(this.finOpers)
             .filter( i => i.ts >= beginTsB && i.ts <= endTsB && this.checkFilter(i))
             .groupBy( i => [ new Date(i.ts * 1000).getMonth() ])
             .map( ( i, id ) => {
                const _id = Number(id);
                return {
                   month: _id + 1,
                   sum: _.sumBy(i, 'amount'),
                   cnt: _.countBy(i, '').undefined,
                }
             })
             .value();
         // Выгрузим данные в график
         // clog(dataB);
         this.monthGraphData.datasets[0].data = dataB.map( i => i.sum );
      },

      // Построить отчет по Агенты ОТКУДА
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

      // Построить отчет по Агенты КУДА
      buildAgentToReport() {
         // -----------------------------------------
         // Отчетный период
         const beginTsA = moment(this.beginA).unix();
         const endTsA = moment(this.endA).unix();
         const dataA = _(this.finOpers)
             .filter( i => i.ts >= beginTsA && i.ts <= endTsA && this.checkFilter(i) )
             .groupBy('agToId')
             .map( ( i, id ) => {
                const _id = Number(id);
                const sortFinOpers = _(i).sortBy('ts').value();
                return {
                   agToId: _id,
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
             .groupBy('agToId')
             .map( ( i, id ) => {
                const _id = Number(id);
                return {
                   agToId: _id,
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
             .forEach( agTo => {
                const a = dataA.find( i => i.agToId === agTo.id );
                const b = dataB.find( i => i.agToId === agTo.id );
                if ( a !== undefined ) {
                   dataAB.push({
                      agToId: agTo.id,
                      agTo: agTo,
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
                      agToId: agTo.id,
                      agTo: agTo,
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
         this.updateGetParams();
         // this.reportReady = false;
         // clog(this.project, this.costTypes, this.agents, this.finOpers);
         // Построение элементов отчета
         this.rd.costType = this.buildCostTypeReport();
         this.buildCtGraph();
         this.buildMonthGraph();
         this.rd.agentFrom = this.buildAgentFromReport();
         this.rd.agentTo = this.buildAgentToReport();
         // --
         // clog(this.rd.costType, this.rd.agentFrom, this.rd.agentTo);
         this.ctGraphDetailShow = false;
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

.OutlineFont {
   -webkit-text-stroke: 1px white;
}

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

.GraphMonth {
   max-width: 60rem;
   margin: 0.5rem auto;
   padding: 0.5rem;
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