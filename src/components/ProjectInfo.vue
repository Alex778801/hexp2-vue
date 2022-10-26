<template>

<!-- Верхняя плашка -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь    -->
         <i class="fa fa-file-code text-primary text-3xl"/>
         <span class="text-primary ml-2">Заметки (info) проекта '
            <router-link :to="'/project/' + projectId" class="text-primary font-bold my-1">
               {{project.path}}{{project.name}}</router-link>'
         </span>
      </template>
   </Toolbar>

<!-- Редактор  -->
   <editor-content :editor="editor" class="my-1 mx-3"/>

<!-- Нижняя панель инструментов -->
   <Toolbar class="m-1 p-2">
      <template #start>
         <!--  Флаг изменений        -->
         <i class="fa fa-pen text-primary text-xl ml-2" v-if="dataChanged"/>
      </template>
      <template #end>
         <!--  Кнопки действий формы      -->
         <Button label="Сохран" icon="fa fa-save" class="mr-2 p-button-success" :disabled="project.readOnly" @click="save()"/>
         <Button label="Отмена" icon="fa fa-ban" class="p-button-danger" @click="cancel()"/>
      </template>
   </Toolbar>

</template>

<script>
/* eslint-disable */

import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";
import {replaceNulls} from "@/components/tools/vue-utils";
import {authUtils} from "@/components/tools/auth-utils";
import {useEditor, EditorContent, Editor} from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

export default {
   name: "ProjectInfo",

   components: {
      EditorContent,
   },

   data() {
      return {
         // Редактор
         editor: null,
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
      // Загрузка данных
      this.fetchData();
      // Инит редактора
      this.editor = new Editor({
         content: '<p>I’m running Tiptap with Vue.js. 🎉</p>',
         extensions: [
            StarterKit,
         ],
      })
   },

   beforeUnmount() {
      this.editor.destroy();
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
            this.project = replaceNulls(response.data.project);
            // Костыль - нужно разобраться, какой компонент вызывает изменение данных при загрузке
            setTimeout(() => {
               this.dataChanged = false
            }, 10);
         }).catch((error) => authUtils.err(error));
      },
   },

   // Кнопка Сохранить
   async save() {
      // -- Мутация - запись изменений
      const updateM = gql(`
               #graphql
               mutation ($id: Int!, $ts: Int!, $costTypeId: Int, $agentFromId: Int, $agentToId: Int,
                         $amount: Int!, $notes: String, $user: String) {
                  updateFinoper (id: $id, ts: $ts, costTypeId: $costTypeId, agentFromId: $agentFromId, agentToId: $agentToId,
                                 amount: $amount, notes: $notes, user: $user) {
                     ok, result
                  }
               }
         `);
      await apolloClient.mutate({
         mutation: updateM,
         variables: {
            id:          Number(this.oper.id),
            ts:          Math.floor((new Date(this.ts)).getTime() / 1000),
            costTypeId:  this.oper.costType.id,
            agentFromId: this.oper.agentFrom.id,
            agentToId:   this.oper.agentTo.id,
            amount:      Number(this.oper.amount),
            notes:       this.oper.notes,
            user:        this.oper.user,
         },
         fetchPolicy: "no-cache"
      }).then((response) => {
         this.$toast.add({
            severity: 'success',
            summary: 'Финансовая операция',
            detail: 'Успешно сохранена',
            life: 2000
         });
      }).catch((error) => {
         this.$toast.add({severity: 'error', summary: `Модуль AUTH`, detail: String(error)});
         authUtils.err(error);
      })
      this.$router.go(-1);
   },

   // Кнопка Отмена
   cancel() {
      this.$router.go(-1);
   },
}
</script>

<style scoped>

</style>