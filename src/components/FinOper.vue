<template>

<!-- eslint-disable -->

<div>

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
   <div legend="Поля"  class="m-2">
<!--  Дата -->
      <div class="field">
         <label for="ts" class="text-primary"> Дата </label>
         <Calendar inputId="ts" autocomplete="off" dateFormat="dd MM yy (D)" :showTime="true" :showIcon="true"
                    v-model="ts"  :disabled="oper.readOnly"/>
      </div>
<!--  Статья -->
      <div class="field">
         <label for="costType" class="text-primary"> Статья </label>
         <span style="min-height: 1rem; display: inline-flex; align-items: center;">
            <div class="w-6rem text-center mr-2 h-2rem" :style="{'background-color': getCostTypeColor()}"> &nbsp </div>
            <Dropdown :options="oper.ctList" optionLabel="name" optionValue="id" placeholder="статья..." :showClear="true"
                      v-model="oper.costType.id"  :disabled="oper.readOnly"/>
         </span>
      </div>
<!--  Агент откуда -->
      <div class="field">
         <label for="agentFrom" class="text-primary"> Агент Откуда </label>
         <Dropdown :options="oper.agList" optionLabel="name" optionValue="id" placeholder="агент..." :showClear="true"
                   v-model="oper.agentFrom.id"  :disabled="oper.readOnly"/>
      </div>
<!--  Агент куда -->
      <div class="field">
         <label for="agentTo" class="text-primary"> Агент куда </label>
         <Dropdown :options="oper.agList" optionLabel="name" optionValue="id" placeholder="агент..." :showClear="true"
                   v-model="oper.agentTo.id"  :disabled="oper.readOnly"/>
      </div>
<!--  Сумма -->
      <div class="field w-full" >
         <label for="amount" class="text-primary"> Сумма </label>
         <span style="min-height: 1rem; display: inline-flex; align-items: center;">
            <InputNumber id="finoper_amount" v-model="oper.amount" :showClear="true"
                         :class="{'IncomeSum': !getCostTypeOut(), 'OutcomeSum': getCostTypeOut()}"/>
            <Button icon="fa fa-trash" class="ml-2 w-3rem text-xl" @click="oper.amount=null"/>
         </span>
      </div>
<!--  Примечание -->
      <div class="field">
         <label for="notes" class="text-primary"> Примечание </label>
         <Textarea v-model="oper.notes" :autoResize="true" rows="5" cols="30"/>
      </div>
      <!--  Владелец    -->
      <div class="field">
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
         <FileUpload class="mr-2" uploadIcon="pi pi-image" mode="basic" name="demo[]" chooseLabel="+" accept="image/*"
                     :customUpload="true" @uploader="newPhoto" :auto="true"/>
         <!--  Кнопки действий формы      -->
         <Button label="Сохран" icon="fa fa-save" class="mr-2 p-button-success" :disabled="oper.readOnly" @click="save()"/>
         <Button label="Отмена" icon="fa fa-ban" class="p-button-danger" @click="cancel()"/>
      </template>
   </Toolbar>

<!-- ФОТО карусель -->
   <Carousel :value="oper.photoList" :numVisible="1" :numScroll="1">
      <template #item="slotProps">
         <div class="photo-item">
            <div class="photo-content">
               <!-- ФОТО панель инструментов -->
               <div>
               <Toolbar class="mt-2 py-2 px-0">
                  <template #start>
                     <!-- Кнопка УДАЛИТЬ фото        -->
                     <ConfirmPopup></ConfirmPopup>
                     <Button icon="fa fa-trash" class="p-button-danger p-button-outlined ml-2 butWide1" @click="deletePhoto($event, slotProps.data.id)"/>
                  </template>
                  <template #end>
                     <!-- Кнопка вращение фото влево            -->
                     <Button icon="fa fa-undo-alt" class="p-button-outlined butWide1 mr-2" @click="actionPhoto(slotProps.data.id, 2)"/>
                     <!-- Кнопка вращение Фото вправо           -->
                     <Button icon="fa fa-redo-alt" class="p-button-outlined butWide1 mr-2" @click="actionPhoto(slotProps.data.id, 3)"/>
                  </template>
               </Toolbar>
               <!-- Изображение               -->
               </div>
               <div class="m-1">
                  <img class="w-full" :src="mediaRoot + slotProps.data.image"/>
               </div>
            </div>
         </div>
      </template>
   </Carousel>

</div>

</template>


<script>
/* eslint-disable */

import {apolloClient} from "@/apollo-config";
import {authUtils} from "@/components/tools/auth-utils";
import gql from "graphql-tag";
import {clog, replaceNulls} from "@/components/tools/vue-utils";

import axios from 'axios'
import {__finOperPhotoDir__} from "@/setup";
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'

export default {
   name: "FinOper",

   data() {
      return {
         // Корневая папка на бекенд сервере с фото фин операций
         mediaRoot: __finOperPhotoDir__,
         // ИД операции
         operId: Number(this.$route.params.id),
         // Фин операция
         oper: {'costType': {}, 'agentFrom': {}, 'agentTo': {}, 'owner': {}, 'photoList': []},
         // Временное хранение МОМЕНТА
         ts: null,
         // Список доступа ACL
         aclListUser: null,
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
            this.oper = replaceNulls(response.data.finoper);
            this.oper.amount = Number(this.oper.amount);
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
         const file = event.files[0]
         const payload = new FormData();
         payload.append('token', localStorage.getItem('token'));
         payload.append('ownerId', this.oper.owner.id);
         payload.append('file', file);
         payload.append('operId', this.operId);
         await axios.post(`${__backendAddr__}/uploadFinOperPhoto/`, payload).then((response) => {
            this.fetchData();
         }).catch((error) => console.log(error))
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
            this.$toast.add({severity: 'error', summary: `Модуль AUTH`, detail: String(error)});
            authUtils.err(error);
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
      }
   },

}
</script>


<style>

.p-fieldset-legend {
   font-size: 0.9rem !important;
   padding: 0.5rem !important;
}

#finoper_amount {
   width: 14rem;
}

#finoper_amount input {
   width: 14rem;
   font-weight: bold;
   text-align: center;
   font-size: 2rem;
}

.IncomeSum input {
   color: var(--incomeColor)
}

.OutcomeSum input {
   color: var(--outcomeColor)
}

.p-carousel-container .p-link {
   display: none !important;
}

</style>


<style lang="scss" scoped>

.sizes {
   .p-inputtext {
      display: block;
      margin-bottom: .5rem;

      &:last-child {
         margin-bottom: 0;
      }
   }
}

.field .p-inputtext, {
   display: block;
}

.field * {
   width: 100%;
   max-width: 50rem;
}

</style>