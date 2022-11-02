<template>

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