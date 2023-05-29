<template>

<!-- eslint-disable -->

<div class="MainContainer">

<!-- Верхняя плашка -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
<!-- Путь    -->
         <i class="fa fa-file-code text-primary text-3xl"/>
         <span class="text-primary ml-2">Операция из '
            <router-link :to="'/project/' + oper.project?.id" class="text-primary font-bold my-1">
               {{oper.project?.path}}{{oper.project?.name}}</router-link>'
         </span>
      </template>
   </Toolbar>

<!-- Поля  -->
   <div class="Fields m-2">
<!--  Дата -->
      <div class="Field">
         <label class="text-primary"> Дата </label>
         <Calendar autocomplete="off" dateFormat="dd MM yy (D)" showTime showIcon
                    v-model="ts"  :disabled="oper.readOnly"/>
      </div>
<!--  Статья -->
      <div class="Field">
         <label class="text-primary OutlineFont pr-2" style="border-radius: 0.3rem" :style="{'background-color': getCostTypeColor()}"> Статья </label>
         <Dropdown :options="oper.ctList" optionLabel="name" optionValue="id" placeholder="статья..." showClear filter :scroll-height="isMobile ? '35em' : '60em'"
                      v-model="oper.costType.id"  :disabled="oper.readOnly"/>
      </div>
<!--  Агент откуда -->
      <div class="Field">
         <label for="agentFrom" class="text-primary"> Агент Откуда </label>
         <Dropdown :options="oper.agList" optionLabel="name" optionValue="id" placeholder="агент..." showClear filter :scroll-height="isMobile ? '35em' : '60em'"
                   v-model="oper.agentFrom.id"  :disabled="oper.readOnly"/>
      </div>
<!--  Агент куда -->
      <div class="Field">
         <label for="agentTo" class="text-primary"> Агент куда </label>
         <Dropdown :options="oper.agList" optionLabel="name" optionValue="id" placeholder="агент..." showClear filter :scroll-height="isMobile ? '35em' : '60em'"
                   v-model="oper.agentTo.id"  :disabled="oper.readOnly"/>
      </div>
<!--  Сумма -->
      <div class="Field w-full" >
         <label for="amount" class="text-primary"> Сумма </label>
         <span style="min-height: 1rem; display: inline-flex; align-items: center;">
            <InputNumber id="finoper_amount" v-model="oper.amount" :inputProps="{'pattern': '[0-9]*', 'inputmode': 'numeric'}"
                         :class="{'IncomeSum': !getCostTypeOut(), 'OutcomeSum': getCostTypeOut()}"/>
            <Button icon="fa fa-trash" class="ml-2 w-3rem text-xl" @click="oper.amount=null"/>
            <Button icon="fa fa-calculator" class="ml-2 w-3rem text-xl" @click="calcMathExpr()"/>
         </span>
      </div>
<!--  Примечание -->
      <div class="Field" style="margin-top: -2.1rem; margin-bottom: 0">
         <label for="notes" class="text-primary" style="text-align: left"> Примечание </label>
<!--         autoResize-->
         <Textarea v-model="oper.notes" rows="4" style="grid-column: 1 / 3"/>
      </div>
      <!--  Владелец    -->
      <div class="Field">
         <label for="owner" class="text-primary"> Владелец </label>
         <Dropdown id="owner" v-model="oper.user" :options="aclListUser" optionValue="id" optionLabel="label"
                   :filter="true" placeholder="список учетных записей..." :disabled="oper.readOnly"/>
      </div>
   </div>

<!-- Нижняя панель инструментов -->
   <Toolbar class="m-1 p-2">
      <template #start>
         <!--  Флаг изменений        -->
         <i class="fa fa-pen text-primary text-xl ml-2" v-if="dataChanged"/>
      </template>
      <template #end>
         <!-- Конпка новое ФОТО        -->
         <FileUpload class="mr-2" uploadIcon="pi pi-image" mode="basic" chooseLabel="+" accept="image/*, image/heic"
                     customUpload @uploader="newPhoto" auto multiple/>
         <!--  Кнопки действий формы      -->
         <Button label="Сохр" icon="fa fa-save" class="mr-2 p-button-success" :disabled="oper.readOnly" @click="save()"/>
         <Button label="Закр" icon="fa fa-ban" class="p-button-danger" @click="cancel()"/>
      </template>
   </Toolbar>

<!-- Фото галерея -->
   <div v-for="(photo, idx) in oper.photoList" :key="idx" class="m-1 mb-2">
      <img class="w-full" :src="mediaRoot + '/' + photo.image"/>
      <div class="ImageToolbar" >
         <ConfirmPopup></ConfirmPopup>
         <Button icon="fa fa-trash" class="p-button-danger ml-2 mr-2" @click="deletePhoto($event, photo.id)"/>
         <Button icon="fa fa-undo-alt" class="mr-2" @click="actionPhoto(photo.id, 2)"/>
         <Button icon="fa fa-redo-alt" class="mr-2" @click="actionPhoto(photo.id, 3)"/>
      </div>
   </div>
</div>

   <!-- Диалог ввода строки -->
   <InputMathDlg child ref="inputMathDlg"/>

</template>


<script>
/* eslint-disable */

import { create, all } from 'mathjs'
const config = { }
const math = create(all, config)

import {apolloClient} from "@/apollo-config";
import {authUtils} from "@/components/tools/auth-utils";
import gql from "graphql-tag";
import {isMobile, replaceNullsWithEmptyObjs} from "@/components/tools/vue-utils";
import axios from 'axios'
import {compress, compressAccurately} from 'image-conversion';
import {__backendAddr__, __backendMediaDir__, __backendUploads__} from "@/setup";
import * as imageConversion from "image-conversion";
import {settingsUtils} from "@/components/tools/settings-utils";
import InputMathDlg from "@/components/tools/InputMathDlg";
import ConfirmDlg from "@/components/tools/ConfirmDlg";
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'

export default {
   name: "FinOper",

   components: {
      InputMathDlg,
   },

   data() {
      return {
         // Корневая папка на бекенд сервере с фото фин операций
         mediaRoot: __backendMediaDir__,
         // ИД операции
         operId: Number(this.$route.params.id),
         // Фин операция
         oper: {'costType': {}, 'agentFrom': {}, 'agentTo': {}, 'owner': {}, 'photoList': []},
         // Временное хранение МОМЕНТА
         ts: null,
         // Список доступа ACL
         aclListUser: null,
         // Текущее фото
         curPhotoIdx: 0,
         // Данные изменены пользователем
         dataChanged: false,
      }
   },

   watch: {
      // Признак внесения изменений в данные
      oper: {
         handler() {
            this.dataChanged = true;
         },
         deep: true,
      },
      ts() { this.dataChanged = true },
      // --
   },

   computed: {
      isMobile() {
         return isMobile();
      }
   },

   mounted() {
      this.fetchData();
   },

   methods: {
      // Получиьт цвет выбранной Статьи
      getCostTypeColor() {
         return this.oper.ctList?.find( i => i.id === this.oper.costType.id)?.color;
      },

      // Получить цвет суммы
      getCostTypeOut() {
         return this.oper.ctList?.find( i => i.id === this.oper.costType.id)?.out;
      },

      // Обновить данные фин операции
      async fetchData() {
         // Запрос данных
         const operQ = gql(`
         #graphql
         query ($id: Int!) {
            finoper (id: $id) {
              project {id, name,},
              id,
              ts, tsjs,
              costType { id, name, color, out, },
              agentFrom { id, name, },
              agentTo { id, name, },
              amount,
              notes,
              pq,
              user,
              owner {id, username},
              aclList,
              readOnly,
              ctList { id, name, out, color, },
              agList { id, name, },
              photoList { id, image, }
           },
         }
      `);
         await apolloClient.query({
            query: operQ,
            variables: {id: this.operId},
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Заменим null на {}
            this.oper = replaceNullsWithEmptyObjs(response.data.finoper);
            this.oper.amount = Number(this.oper.amount);
            document.title = `Фин опер: ${this.oper.project.name}`;
            // -- owner
            this.aclListUser = JSON.parse(this.oper.aclList).slice(2);
            this.ts = new Date(this.oper.ts * 1000);
            // Костыль - нужно разобраться, какой компонент вызывает изменение данных при загрузке
            setTimeout(() => {
               this.dataChanged = false
            }, 10);
         }).catch((error) => authUtils.err(error));
      },

      // Добавить новое фото
      async newPhoto(event) {
         // Если есть изменения в данных - сохраним их
            if (this.dataChanged)
               await this.save();
         // --
         // const file = event.files[0];
         for (const file of event.files) {
            const photoFileSize = settingsUtils.loadPhotoFileSize();
            imageConversion.compressAccurately(file, photoFileSize).then(async res => {
               // console.log(res);
               const payload = new FormData();
               payload.append('token', localStorage.getItem('token'));
               payload.append('file', res);
               payload.append('operId', this.operId);
               await axios.post(`${__backendAddr__}${__backendUploads__}/uploadFinOperPhoto/`, payload).then((response) => {
                  this.fetchData();
               }).catch((error) => console.log(error))
            })
         }
      },

      // Удалить фото - подтверждение
      deletePhoto(event, id) {
         this.$confirm.require({
            target: event.currentTarget,
            acceptClass: 'p-button-danger',
            message: 'Удалить фото?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => { this.actionPhoto(id, 1) },
            reject: () => { }
         });
      },

      // Операция с фото: 1 - удалить, 2 вращать вправо, 3 вращать влео
      async actionPhoto(photoId, action) {
         // Если есть изменения в данных - сохраним их
         if (this.dataChanged)
            await this.save();
         // -- Мутация - операция с фото
         const photoM = gql(`
               #graphql
               mutation ($id: Int!, $action: Int!) {
                  photoAction (id: $id, action: $action) {
                     ok, result
                  }
               }
         `);
         await apolloClient.mutate({
            mutation: photoM,
            variables: {
               id: Number(photoId),
               action: action,
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            this.fetchData();
         }).catch((error) => {
            authUtils.err(error);
         })
      },

      // Рассчитать сумму операции по математическому выражению
      calcMathExpr() {
         // Найдем мат выражение в тексте примечания
         let expr = this.oper.amount !== 0 ? this.oper.amount : '';
         const begin = this.oper.notes.indexOf('#!');
         const end = this.oper.notes.indexOf('!#', begin);
         if (begin !== -1 && end !== -1 ) {
            expr = this.oper.notes.slice(begin + 2, end).trim();
         }
         this.$refs.inputMathDlg.show(
             expr,
             async (data) => {
                // --
                try {
                   const res = Math.round(math.evaluate(data));
                   if (res < 0)
                      throw 'Отрицательный результат вычислений';
                   this.oper.amount = res;
                   // Сохраним выражение в теле примечания
                   const begin = this.oper.notes.indexOf('#!');
                   const end = this.oper.notes.indexOf('!#', begin);
                   if (begin !== -1 && end !== -1) {
                      this.oper.notes = this.oper.notes.slice(0, begin) + this.oper.notes.slice(end + 2);
                   }
                   this.oper.notes = (this.oper.notes.trim() + '\n#! ' + data.replaceAll(' ', '') + ' !#').trim();
                } catch (err) {
                   this.$toast.add({severity: 'error', summary: `Ошибка`, detail: 'Недопустимое математическое выражение', life: 3000});
                }
                // --
             })
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
            this.dataChanged = false;
            this.$toast.add({
               severity: 'success',
               summary: 'Финансовая операция',
               detail: 'Успешно сохранена',
               life: 2000
            });
         }).catch((error) => {
            authUtils.err(error);
         })
         // this.$router.go(-1);
      },

      // Кнопка Отмена
      cancel() {
         this.$router.go(-1);
      }
   },

}
</script>


<style lang="scss" scoped>

.MainContainer {
   max-width: 70rem;
   margin: 0 auto;
}

.Fields {
   .Field {
      display: grid;
      grid-template-columns: 6rem auto;
      gap: 0.4rem;
      align-items: stretch;
      margin: 0.5rem 0;
      //max-width: 50rem;

      label {
         padding-top: 0.6rem;
         text-align: right;
      }

      #finoper_amount :deep(input) {
         width: 12rem;
         font-weight: bold;
         text-align: center;
         font-size: 2rem;
      }

      .IncomeSum :deep(input) {
         color: var(--incomeColor)
      }

      .OutcomeSum :deep(input) {
         color: var(--outcomeColor)
      }
   }
}

.OutlineFont {
   -webkit-text-stroke: 0.025rem white;
}

.ImageToolbar {
   position: relative;
   top: -1.5rem;
   right: 0.1rem;
   text-align: right;
   height: 0.8rem;
   opacity: 70%;
}

</style>