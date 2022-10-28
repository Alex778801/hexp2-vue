<template>

<!-- Верхняя плашка -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь    -->
         <i class="fa fa-file-code text-primary text-3xl"/>
         <span class="text-primary ml-2">Заметки (info) проекта '
            <router-link :to="'/project/' + projectId" class="text-primary font-bold my-1">
               {{project?.path}}{{project?.name}}</router-link>'
         </span>
      </template>
   </Toolbar>

<!-- Содержимое бюджета-->


<!-- Нижняя панель инструментов -->
   <Toolbar class="m-1 p-2">
      <template #start>
         <!--  Флаг изменений        -->
         <i class="fa fa-pen text-primary text-xl ml-2" v-if="dataChanged && bugDataLoaded"/>
      </template>
      <template #end>
         <!--  Кнопки действий формы      -->
         <Button label="Сохранить" icon="fa fa-save" class="mr-2 p-button-success" :disabled="project?.readOnly" @click="save()"/>
         <Button label="Отмена" icon="fa fa-ban" class="p-button-danger" @click="cancel()"/>
      </template>
   </Toolbar>

</template>

<script>
/* eslint-disable */

import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";
import {clog, replaceNulls} from "@/components/tools/vue-utils";
import {authUtils} from "@/components/tools/auth-utils";

export default {
   name: "Budget",

   data() {
      return {
         // ИД проекта
         projectId: Number(this.$route.params.id),
         // Бюджет
         budget: {},
         // Данные изменены пользователем
         dataChanged: false,
         bugDataLoaded: false,
      }
   },

   watch: {
      // Признак внесения изменений в данные
      budget: {
         handler(newVal, oldVal) {
            this.dataChanged = true;
         },
         deep: true,
      },
      // --
   },

   mounted() {
      // Загрузка данных
      this.fetchData();
   },

   methods: {
      // Обновить данные
      async fetchData() {
         // Запрос данных
         const infoQ = gql(`
            #graphql
            query ($id: Int!) { project(id: $id) { id, name, path, info, readOnly } }
         `);
         await apolloClient.query({
            query: infoQ,
            variables: {id: this.projectId},
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Заменим null на {}
            this.budget = replaceNulls(response.data.budget);
            // Костыль - нужно разобраться, какой компонент вызывает изменение данных при загрузке
            setTimeout(() => {
               this.dataChanged = false;
               this.bugDataLoaded = true;
            }, 1000);
         }).catch((error) => authUtils.err(error));
      },

      // Кнопка Сохранить
      async save() {
         // -- Мутация - запись изменений
         const updateM = gql(`
                  #graphql
                  mutation ($id: Int!, $projinfo: String!) {
                     updateProjectInfo (id: $id, projinfo: $projinfo) {
                        ok, result
                     }
                  }
            `);
         await apolloClient.mutate({
            mutation: updateM,
            variables: {
               id: Number(this.projectId),
               projinfo: this.project.info,
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            this.$toast.add({
               severity: 'success',
               summary: `Бюджет проекта '${this.project.name}'`,
               detail: 'Успешно сохранен',
               life: 2000
            });
         }).catch((error) => {
            this.$toast.add({severity: 'error', summary: `Модуль AUTH`, detail: String(error)});
            authUtils.err(error);
         });
         this.$router.go(-1);
      },

      // Кнопка Отмена
      cancel() {
         this.$router.go(-1);
      },
   }
}

</script>

<style scoped>

</style>