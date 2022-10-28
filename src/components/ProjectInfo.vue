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
   <div class="m-1">
      <ckeditor :editor="editor" v-model="project.info" :config="editorConfig" @ready="onReady"
                :disabled="project.readOnly" ></ckeditor>
   </div>

<!-- Нижняя панель инструментов -->
   <Toolbar class="m-1 p-2">
      <template #start>
         <!--  Флаг изменений        -->
         <i class="fa fa-pen text-primary text-xl ml-2" v-if="dataChanged && bugDataLoaded"/>
      </template>
      <template #end>
         <!--  Кнопки действий формы      -->
         <Button label="Сохранить" icon="fa fa-save" class="mr-2 p-button-success" :disabled="project.readOnly" @click="save()"/>
         <Button label="Отмена" icon="fa fa-ban" class="p-button-danger" @click="cancel()"/>
      </template>
   </Toolbar>

</template>

<script>
/* eslint-disable */

import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";
import {clog, isMobile, replaceNulls} from "@/components/tools/vue-utils";
import {authUtils} from "@/components/tools/auth-utils";

import CKEditor from '@ckeditor/ckeditor5-vue';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import '@ckeditor/ckeditor5-build-decoupled-document/build/translations/ru';
import {MyCustomUploadAdapterPlugin} from "@/components/tools/CKEuploadAdapter";


export default {
   name: "ProjectInfo",

   components: {
      ckeditor: CKEditor.component
   },

   data() {
      return {
         // Редактор
         editor: DecoupledEditor,
         mobileButtons: [
             'bold', 'underline', 'fontBackgroundColor', '|',
             'insertTable', 'uploadImage', '|',
             'bulletedList', 'numberedList', 'todoList', '|',
             '|', 'undo', 'redo'],
         editorConfig: {
            language: 'ru',
            toolbar: { shouldNotGroupWhenFull: true },
            extraPlugins: [ MyCustomUploadAdapterPlugin ],
         },
         // ИД проекта
         projectId: Number(this.$route.params.id),
         // Проект
         project: {'info': ''},
         // Данные изменены пользователем
         dataChanged: false,
         bugDataLoaded: false,
      }
   },

   watch: {
      // Признак внесения изменений в данные
      project: {
         handler(newVal, oldVal) {
            this.dataChanged = true;
         },
         deep: true,
      },
      // --
   },

   created() {
      // Выбираем наборк кнопок реадктора - полный или мобильная версия
      if (isMobile())
         this.editorConfig.toolbar.items = this.mobileButtons;
   },

   mounted() {
      // Загрузка данных
      this.fetchData();
   },

   methods: {



      // Настраиваем панели редактора
      onReady( editor )  {
         editor.ui.getEditableElement().parentElement.insertBefore(
             editor.ui.view.toolbar.element,
             editor.ui.getEditableElement()
         );
      },

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
               summary: `Заметки проекта '${this.project.name}'`,
               detail: 'Успешно сохранены',
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

<style lang="scss" scoped>



</style>