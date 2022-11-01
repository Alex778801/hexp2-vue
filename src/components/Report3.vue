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
            // document.title = `Отч 1: ${this.rd.proj}`;
            clog(this.rd);
            this.reportReady = true;
         });
      },
   }
}
</script>

<style lang="scss" scoped>



</style>