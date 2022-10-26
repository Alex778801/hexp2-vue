<template>

   {{ project }}

</template>

<script>
/* eslint-disable */

import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";
import {replaceNulls} from "@/components/tools/vue-utils";
import {authUtils} from "@/components/tools/auth-utils";

export default {
   name: "ProjectInfo",

   data() {
      return {
         // ИД проекта
         projectId: Number(this.$route.params.id),
         // Проект
         project: {},
         // Данные изменены пользователем
         dataChanged: false,
      }
   },

   watch: {
      // Признак внесения изменений в данные
      project: {
         handler() {
            this.dataChanged = true;
         },
         deep: true,
      },
      ts() { this.dataChanged = true },
      // --
   },

   mounted() {
      this.fetchData();
   },

   methods: {
      // Обновить данные
      async fetchData() {
         // Запрос данных
         const infoQ = gql(`
            #graphql
            query ($id: Int!) { project(id: $id) { id, name, path, info, } }
         `);
         await apolloClient.query({
            query: infoQ,
            variables: {id: this.projectId},
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Заменим null на {}
            this.project = replaceNulls(response.data.project);
            // Костыль - нужно разобраться, какой компонент вызывает изменение данных при загрузке
            setTimeout(() => {
               this.dataChanged = false
            }, 10);
         }).catch((error) => authUtils.err(error));
      },
   }
}
</script>

<style scoped>

</style>