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

   <div v-if="editor">
      <button @click="editor.chain().focus().toggleBold().run()" :disabled="!editor.can().chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
         bold
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :disabled="!editor.can().chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
         italic
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :disabled="!editor.can().chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
         strike
      </button>
      <button @click="editor.chain().focus().toggleCode().run()" :disabled="!editor.can().chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }">
         code
      </button>
      <button @click="editor.chain().focus().unsetAllMarks().run()">
         clear marks
      </button>
      <button @click="editor.chain().focus().clearNodes().run()">
         clear nodes
      </button>
      <button @click="editor.chain().focus().setParagraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
         paragraph
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
         h1
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
         h2
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
         h3
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 4 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }">
         h4
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 5 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }">
         h5
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 6 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }">
         h6
      </button>
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
         bullet list
      </button>
      <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
         ordered list
      </button>
      <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'is-active': editor.isActive('codeBlock') }">
         code block
      </button>
      <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">
         blockquote
      </button>
      <button @click="editor.chain().focus().setHorizontalRule().run()">
         horizontal rule
      </button>
      <button @click="editor.chain().focus().setHardBreak().run()">
         hard break
      </button>
      <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()">
         undo
      </button>
      <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()">
         redo
      </button>
   </div>

   <editor-content :editor="editor" v-model="project.info" class="my-1 mx-3"/>

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
            // Обновление реадктора
            if (newVal.info !== oldVal.info)
               this.editor.commands.setContent(newVal.info, false)
         },
         deep: true,
      },
      // --
   },

   mounted() {
      // Загрузка данных
      this.fetchData();
      // Инит редактора
      this.editor = new Editor({
         extensions: [
            StarterKit,
         ],
         content: this.project.info,
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
            // this.content = this.project.info;
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