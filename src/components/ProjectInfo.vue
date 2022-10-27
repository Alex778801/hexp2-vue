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
      <QuillEditor ref="editor" theme="snow"
                   content-type="html"
                   :toolbar="toolbarOptions"
                   v-model:content="project.info"
      />
   </div>

<!--   :options="editorOption"-->

<!-- Нижняя панель инструментов -->
   <Toolbar class="m-1 p-2">
      <template #start>
         <!--  Флаг изменений        -->
         <i class="fa fa-pen text-primary text-xl ml-2" v-if="dataChanged"/>
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
import {clog, replaceNulls} from "@/components/tools/vue-utils";
import {authUtils} from "@/components/tools/auth-utils";
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';
import ImageUploader from 'quill-image-uploader';

export default {
   name: "ProjectInfo",

   components: {
      QuillEditor
   },

   data() {
      return {
         // Редактор
         toolbarOptions: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
            // ['blockquote', 'code-block'],

            [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
            [{'header': [1, 2, 3, 4, 5, 6, false]}],

            // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{'list': 'ordered'}, {'list': 'bullet'}],

            [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
            [{'align': []}],

            [{'font': []}],
            [{'color': []}, {'background': []}],          // dropdown with defaults from theme

            ['link', 'image'],

            ['clean']                                         // remove formatting button
         ],

         editorOption: {
            // some quill options
            modules: {
               toolbar: {
                  container: [["bold", "image"]],
                  handlers: {
                     image: function() {
                        clog('halt')
                        document.getElementById('file').click()
                     }
                  }
               },
            }
         },

         // ИД проекта
         projectId: Number(this.$route.params.id),
         // Проект
         project: {'info': ''},
         // Данные изменены пользователем
         dataChanged: false,
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
            this.project = replaceNulls(response.data.project);
            this.$refs.editor.pasteHTML(this.project.info);
            // Костыль - нужно разобраться, какой компонент вызывает изменение данных при загрузке
            setTimeout(() => {
               this.dataChanged = false
            }, 10);
         }).catch((error) => authUtils.err(error));
      },

      // Кнопка Сохранить
      async save() {
         clog(this.$refs.editor.content)
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
               projinfo: this.$refs.editor.content,
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



/* Basic editor styles */
.ProseMirror {
   > * + * {
      margin-top: 0.75em;
   }

   ul,
   ol {
      padding: 0 1rem;
   }

   h1,
   h2,
   h3,
   h4,
   h5,
   h6 {
      line-height: 1.1;
   }

   code {
      background-color: rgba(#616161, 0.1);
      color: #616161;
   }

   pre {
      background: #0D0D0D;
      color: #FFF;
      font-family: 'JetBrainsMono', monospace;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;

      code {
         color: inherit;
         padding: 0;
         background: none;
         font-size: 0.8rem;
      }
   }

   img {
      max-width: 100%;
      height: auto;
   }

   blockquote {
      padding-left: 1rem;
      border-left: 2px solid rgba(#0D0D0D, 0.1);
   }

   hr {
      border: none;
      border-top: 2px solid rgba(#0D0D0D, 0.1);
      margin: 2rem 0;
   }
}

</style>