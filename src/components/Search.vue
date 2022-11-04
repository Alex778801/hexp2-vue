<template>

   <div v-if="!searchStrOk" class="m-2 p-1">
      <h3>Введите более двух символов для поиска!</h3>
   </div>

   <div v-if="reportReady" id="ReportBody" class="m-2 p-1">

      <h3>Строка поиска: <span class="hl">{{ findStr }}</span></h3>

      <h2> Операции </h2>
      <div class="SearchLine" v-for="(fo, idx) in rd.operL" :key="idx" >
         <div class="SearchRes" v-html="'<strong>' + (idx + 1) + '.</strong> ' + fo.notes"></div>
         <div><router-link :to="'/project/' + fo.projId">{{ fo.proj }}</router-link></div>
         <div><router-link :to="'/finoper/' + fo.operId">{{ fd(fo.moment) }}</router-link></div>
         <div><strong>{{ fo.ct }}</strong>: {{fo.agF}} → {{fo.agT}}</div>
         <div>{{ fs(fo.amount)}}</div>
      </div>

      <h2> Проекты </h2>
         <div class="SearchLine" v-for="(proj, idx) in rd.projL" :key="idx">
            <div class="SearchRes" v-html="'<strong>' + (idx + 1) + '.</strong> ' + proj.info"></div>
            <div><router-link :to="'/project/' + proj.id">{{ proj.name }}</router-link></div>
            <div><router-link :to="'/project-info/' + proj.id">Инфо: {{ proj.name }}</router-link></div>
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
   name: "Search",

   data() {
      return {
         // Строка поиска
         findStr: this.$route.params.findStr,
         // Данные отчета
         rd: null,
         // Отчет готов
         reportReady: false,
      }
   },

   watch: {

   },

   computed: {
      // Строка поиска корректна
      searchStrOk() {
         return this.findStr.trim().length >= 2;
      },
   },

   mounted() {
      // Локаль
      moment.locale("RU");
      // Поиск
      this.fetchSearchData();
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

      // Отобразить отчет
      async fetchSearchData() {
         if (!this.searchStrOk)
            return;
         // Запрос данных
         const searchQ = gql(`
            #graphql
            query ($findStr: String!) {
               search001(findStr: $findStr)
            }
         `);
         await apolloClient.query({
            query: searchQ,
            variables: {
               findStr: this.findStr.trim(),
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Выгрузка данных
            this.rd = JSON.parse(response.data.search001);
            // clog(this.rd);
            this.reportReady = true;
         });
      },
   }
}
</script>

<style lang="scss" scoped>

.OutlineFont {
   //-webkit-text-fill-color: transparent;
   -webkit-text-stroke: 1px white;
}

#ReportBody {

}

.hl {
   font-weight: bold;
   color: red !important;

}

:deep(.SearchRes span) {
   @extend .hl;
}

.SearchLine {
   display: flex;
   flex-wrap: wrap;
   gap: 0.5rem;
   padding: 0.8rem 0;
   border-bottom: var(--surface-300) 0.1rem solid;

   div {
   }

   :nth-child(1) {
      width: 24rem;
   }

   :nth-child(2) {
      width: 12rem;
   }

   :nth-child(3) {
      width: 12rem;
   }

   :nth-child(4) {
      width: 24rem;
      color: var(--text-color-secondary);
   }

   :nth-child(5) {
      width: 6rem;
      font-weight: bolder;
   }

   a {
      color: var(--primary-color);
      text-decoration: none;
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