<template>

   111

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
         // return moment.unix(ts).format("DD MMM YY ddd HH:mm");
         return moment(ts).format("DD MMM YY ddd HH:mm");
      },

      // Форматировать дату 2
      fd2(ts) {
         return moment(ts).format("DD MMMM YYYY ddd HH:mm:ss");
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
            // document.title = `Отч 1: ${this.rd.proj}`;
            clog(this.project, this.finOpers, this.costTypes, this.agents);
            clog('---');

            this.rd = _(this.finOpers)
                .groupBy('ctId')
                .map( ( i, id ) => ({
                   ctId: id,
                   finOpers: i,
                   sum: _.sumBy(i, 'amount')
                }) )
                // .sortBy( i => {
                //    clog(i);
                   // const ct = this.getCostType(id);
                   // return [ ct.pid, ct.ord ];
                   // })
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