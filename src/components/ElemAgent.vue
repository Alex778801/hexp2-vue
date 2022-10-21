<template>

<!-- eslint-disable -->

<div>

<!-- Верхняя плашка -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
<!-- Путь    -->
         <i class="fa fa-file-code text-primary text-3xl"/>
         <span class="text-primary ml-2"> [{{agent.id}}] {{agent.path}}{{agent.name}}</span>
      </template>
   </Toolbar>


<!-- Поля  -->
   <Fieldset legend="Поля"  class="mt-2">
<!--  Имя -->
      <div class="field">
         <label for="name" class="text-primary"> Имя </label>
         <InputText id="name" type="username" aria-describedby="name-help" v-model="agent.name"
                    :disabled="agent.readOnly" />
      </div>
   </Fieldset>


<!-- Списки контроля доступа  -->
   <Fieldset legend="Контроль доступа" class="mt-2 m-1">
<!--  Владелец    -->
      <div class="field">
         <label for="owner" class="text-primary"> Владелец </label>
         <Dropdown id="owner" v-model="agent.owner" :options="aclListOwner" optionValue="id" optionLabel="label" :filter="true" placeholder="список учетных записей..."
                   :disabled="agent.readOnly"/>
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
         <Button label="Сохранить" icon="fa fa-save" class="mr-2 p-button-success" :disabled="agent.readOnly" @click="save()"/>
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
import {clog} from "@/components/tools/vue-utils";

export default {
   name: "ElemAgent",

   data() {
      return {
         agentId: Number(this.$route.params.id),
         agent: {},
         aclListOwner: null,
         // --
         dataChanged: false,
      }
   },

   watch: {
      // Признак внесения изменений в данные
      agent: {
         handler() {
            this.dataChanged = true;
         },
         deep: true,
      },
      // --
   },

   mounted() {
      // Запрос данных
      const itemQ = gql(`
            query($id: Int!) {
               agent(id: $id) {
                  id, name, path, owner, acl, aclList, readOnly,
               }
            }
      `);
      apolloClient.query({
         query: itemQ,
         variables: {id: this.agentId},
         fetchPolicy: "no-cache"} ).then( (response) => {
            this.agent = response.data.agent;
            document.title =this.agent.name;
            // -- owner
            this.aclListOwner = JSON.parse(this.agent.aclList).slice(2);
            // Костыль - нужно разобраться, какой компонент вызывает изменение данных при загрузке
            setTimeout(() => { this.dataChanged = false }, 10);
      }).catch( (error) => authUtils.err(error) );
      // --
   },

   methods: {
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
         // this.$router.go(-1);
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