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
            <Dropdown :options="oper.ctList" optionLabel="name" optionValue="id" placeholder="статья..."
                      v-model="oper.costType.id"  :disabled="oper.readOnly"/>
         </span>
      </div>
<!--  Агент откуда -->
      <div class="field">
         <label for="agentFrom" class="text-primary"> Агент Откуда </label>
         <Dropdown :options="oper.agList" optionLabel="name" optionValue="id" placeholder="агент..."
                   v-model="oper.agentFrom.id"  :disabled="oper.readOnly"/>
      </div>
<!--  Агент куда -->
      <div class="field">
         <label for="agentTo" class="text-primary"> Агент куда </label>
         <Dropdown :options="oper.agList" optionLabel="name" optionValue="id" placeholder="агент..."
                   v-model="oper.agentTo.id"  :disabled="oper.readOnly"/>
      </div>
<!--  Сумма -->
      <div class="field w-full" >
         <label for="amount" class="text-primary"> Сумма </label>
         <span style="min-height: 1rem; display: inline-flex; align-items: center;">
            <InputNumber id="finoper_amount" v-model="oper.amount"
                         :class="{'IncomeSum': !getCostTypeOut(), 'OutcomeSum': getCostTypeOut()}"/>
            <Button icon="fa fa-trash" class="ml-2 w-3rem text-xl" @click="oper.amount=null"/>
         </span>
      </div>
<!--  Примечание -->
      <div class="field">
         <label for="notes" class="text-primary"> Примечание </label>
         <Textarea v-model="oper.notes" :autoResize="true" rows="5" cols="30"/>
      </div>

   </div>





<!-- Списки контроля доступа  -->
   <Fieldset legend="Контроль доступа" class="mt-2 m-1">
<!--  Владелец    -->
      <div class="field">
         <label for="owner" class="text-primary"> Владелец </label>
         <Dropdown id="owner" v-model="oper.user" :options="aclListUser" optionValue="id" optionLabel="label" :filter="true" placeholder="список учетных записей..."
                   :disabled="oper.readOnly"/>
      </div>
   </Fieldset>

<!-- Нижняя панель инструментов -->
   <Toolbar class="m-1 p-2">
      <template #start>
<!--  Флаг изменений        -->
         <i class="fa fa-pen text-primary text-xl ml-2" v-if="dataChanged"/>
      </template>
      <template #end>
<!--  Кнопки действий       -->
         <Button label="Сохранить" icon="fa fa-save" class="mr-2 p-button-success" :disabled="oper.readOnly" @click="save()"/>
         <Button label="Отмена" icon="fa fa-ban" class="mr-2 p-button-danger" @click="cancel()"/>
      </template>
   </Toolbar>

</div>

</template>


<script>
/* eslint-disable */

import {apolloClient} from "@/apollo-config";
import {authUtils} from "@/components/tools/auth-utils";
import gql from "graphql-tag";
import {clog, replaceNulls} from "@/components/tools/vue-utils";

export default {
   name: "FinOper",

   data() {
      return {
         operId: Number(this.$route.params.id),
         oper: {'costType': {}, 'agentFrom': {}, 'agentTo': {}},
         ts: null,
         aclListUser: null,
         // --
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
      // --
   },

   mounted() {
      // Запрос данных
      const operQ = gql(`
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
              aclList,
              readOnly,
              ctList { id, name, out, color },
              agList { id, name },
           },
         }
      `);
      apolloClient.query({
         query: operQ,
         variables: {id: this.operId},
         fetchPolicy: "no-cache"} ).then( (response) => {
            // Заменим null на {}
            this.oper = replaceNulls(response.data.finoper);
            // document.title =this.oper.notes;
            // -- owner
            this.aclListUser = JSON.parse(this.oper.aclList).slice(2);
            this.ts = new Date(this.oper.ts * 1000);
            // Костыль - нужно разобраться, какой компонент вызывает изменение данных при загрузке
            setTimeout(() => { this.dataChanged = false }, 10);
      }).catch( (error) => authUtils.err(error) );
      // --
   },

   methods: {
      // Получиьт цвет выбранной Статьи
      getCostTypeColor() {
         return this.oper.ctList?.find( i => i.id === this.oper.costType.id).color;
      },

      // Получить цвет суммы
      getCostTypeOut() {
         return this.oper.ctList?.find( i => i.id === this.oper.costType.id).out;
      },

      // Кнопка Сохранить
      async save() {
         // -- Мутация - запись изменений
         const updateM = gql(`
               mutation ($id: Int!, $name: String!, $owner: String!) {
                  updateAgent (id: $id, name: $name, owner: $owner) {
                     ok, result
                  }
               }
         `);
         await apolloClient.mutate({
            mutation: updateM,
            variables: {
               id: this.agent.id,
               name: this.agent.name,
               isOutcome: this.agent.isOutcome,
               color: `#${this.agent.color}`,
               owner: this.agent.owner,
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            this.$toast.add({
               severity: 'success',
               summary: `Агент '${this.agent.name}'`,
               detail: 'Успешно сохранен',
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

<style>

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

</style>