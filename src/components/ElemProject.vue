<template>

<!-- eslint-disable -->

<div>

<!-- Верхняя плашка -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
<!-- Путь    -->
         <i class="fa fa-file-code text-primary text-3xl"/>
         <span class="text-primary ml-2"> [{{project.id}}] {{project.path}}{{project.name}}</span>
      </template>
   </Toolbar>


<!-- Поля  -->
   <Fieldset legend="Поля"  class="mt-2">
<!--  Имя -->
      <div class="field">
         <label for="name" class="text-primary"> Имя </label>
         <InputText id="name" type="username" aria-describedby="name-help" v-model="project.name"
                    :disabled="project.readOnly" />
      </div>
<!--  Группа статей    -->
      <div class="field">
         <label for="prefCostTypeGroup" class="text-primary"> Группа статей </label> <br>
         <TreeSelect id="prefCostTypeGroup" placeholder="статьи..."
                     v-model="selPrefCostTypeGroup"
                     :options="prefCostTypeGroupTree"
                     :disabled="project.readOnly">
         </TreeSelect>
      </div>
<!--  Группа агенов    -->
      <div class="field">
         <label for="prefAgentGroup" class="text-primary"> Группа агентов </label> <br>
         <TreeSelect id="prefAgentGroup" placeholder="агенты..."
                     v-model="selPrefAgentGroup"
                     :options="prefAgentGroupTree"
                     :disabled="project.readOnly">
         </TreeSelect>
      </div>
<!--  Интервал журнала    -->
      <div class="field" style="max-width: 20em;">
         <label for="prefFinOperLogIntv" class="text-primary"> Интервал журнала </label> <br>
         <Dropdown id="prefFinOperLogIntv" v-model="project.prefFinOperLogIntv" :options="logIntervalList" optionLabel="label" optionValue="id" placeholder="интервал..."
                   :disabled="project.readOnly"/>
<!--  Параметр интервала журнала    -->
      </div>
      <div class="field" style="max-width: 20em;">
         <label for="prefFinOperLogIntvN" class="text-primary"> Параметр интеравала журнала </label>
         <InputNumber inputId="prefFinOperLogIntvN" v-model="project.prefFinOperLogIntvN" showButtons :min="1" :max="1000"
                      :disabled="project.readOnly"/>
      </div>
   </Fieldset>


<!-- Списки контроля доступа  -->
   <Fieldset legend="Контроль доступа" class="mt-2 m-1">
<!--  Владелец    -->
      <div class="field">
         <label for="owner" class="text-primary"> Владелец </label>
         <Dropdown id="owner" v-model="project.owner" :options="aclListOwner" optionValue="id" optionLabel="label" :filter="true" placeholder="список учетных записей..."
                   :disabled="project.readOnly"/>
      </div>
<!--  Чтение READ    -->
      <div class="field">
         <label for="acl_read" class="text-primary"> Чтение фин операций</label>
         <MultiSelect id="acl_read" v-model="acl_read" :options="aclList" optionValue="id" optionLabel="label" :filter="true" placeholder="список учетных записей..."
                      :disabled="project.readOnly"/>
      </div>
<!--  Изменение MOD   -->
      <div class="field">
         <label for="acl_o_mod" class="text-primary"> Модификация фин операций</label>
         <MultiSelect id="acl_o_mod" v-model="acl_mod" :options="aclList" optionValue="id" optionLabel="label" :filter="true" placeholder="список учетных записей..."
                      :disabled="project.readOnly"/>
      </div>
<!--  Отчеты REPORT  -->
      <div class="field">
         <label for="acl_read" class="text-primary"> Построение отчетов фин операций </label>
         <MultiSelect id="acl_read" v-model="acl_report" :options="aclList" optionValue="id" optionLabel="label" :filter="true" placeholder="список учетных записей..."
                      :disabled="project.readOnly"/>
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
         <Button label="Сохранить" icon="fa fa-save" class="mr-2 p-button-success" :disabled="project.readOnly" @click="save()"/>
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
   name: "ElemProject",

   data() {
      return {
         projectId: Number(this.$route.params.id),
         project: {},
         prefCostTypeGroupTree: null,
         selPrefCostTypeGroup: null,
         prefAgentGroupTree: null,
         selPrefAgentGroup:null,
         logIntervalList: null,
         aclListOwner: null,
         aclList: null,
         acl_read: null,
         acl_mod: null,
         acl_report: null,
         // --
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
      selPrefCostTypeGroup()  { this.dataChanged = true; },
      selPrefAgentGroup()     { this.dataChanged = true; },
      acl_read()              { this.dataChanged = true; },
      acl_mod()               { this.dataChanged = true; },
      acl_report()            { this.dataChanged = true; },
      // --
   },

   mounted() {
      // Запрос данных
      const itemQ = gql(`
            query($id: Int!) {
               project(id: $id) {
                  id, name, path,
                  prefCostTypeGroup { id, name, out, color, },
                  prefCostTypeGroupTree,
                  prefAgentGroup { id, name, },
                  prefAgentGroupTree,
                  prefFinOperLogIntv,
                  prefFinOperLogIntvN,
                  logIntervalList,
                  owner, acl, aclList,
                  readOnly,
               }
            }
      `);
      apolloClient.query({
         query: itemQ,
         variables: {id: this.projectId},
         fetchPolicy: "no-cache"} ).then( (response) => {
            this.project = response.data.project;
            document.title =this.project.name;
            // -- prefCostTypeGroupTree
            this.prefCostTypeGroupTree = JSON.parse(this.project.prefCostTypeGroupTree);
            if (this.project.prefCostTypeGroup != null) {
               const id = this.project.prefCostTypeGroup.id;
               this.selPrefCostTypeGroup = {};
               this.selPrefCostTypeGroup[id] = true;
            } else {
               this.project.prefCostTypeGroup = {};
            }
            // -- prefAgentGroupTree
            this.prefAgentGroupTree = JSON.parse(this.project.prefAgentGroupTree);
            if (this.project.prefAgentGroup != null) {
               const id = this.project.prefAgentGroup.id;
               this.selPrefAgentGroup = {};
               this.selPrefAgentGroup[id] = true;
            } else {
               this.project.prefAgentGroup = {};
            }
            // -- logIntervalList
            this.logIntervalList = JSON.parse(this.project.logIntervalList);
            // -- owner
            this.aclListOwner = JSON.parse(this.project.aclList).slice(2);
            // -- aclList
            this.aclList = JSON.parse(this.project.aclList);
            this.acl_read = JSON.parse(this.project.acl).read;
            this.acl_mod= JSON.parse(this.project.acl).mod;
            this.acl_report= JSON.parse(this.project.acl).report;
            // Костыль - нужно разобраться, какой компонент вызывает изменение данных при загрузке
            setTimeout(() => { this.dataChanged = false }, 10);
      }).catch( (error) => authUtils.err(error) );
      // --
   },

   methods: {
      // Кнопка Сохранить
      async save() {
         // -- prefCostTypeGroupTree
         if (this.selPrefCostTypeGroup != null) {
            this.project.prefCostTypeGroup.id = Object.keys(this.selPrefCostTypeGroup)[0];
         } else {
            this.project.prefCostTypeGroup.id = -1;
         }
         // -- prefAgentGroupTree
         if (this.selPrefAgentGroup != null) {
            this.project.prefAgentGroup.id = Number(Object.keys(this.selPrefAgentGroup)[0]);
         } else {
            this.project.prefAgentGroup.id = -1;
         }
         // -- acl
         this.project.acl = JSON.stringify({
            'read': this.acl_read,
            'mod': this.acl_mod,
            'report': this.acl_report,
         });
         // -- Мутация - запись изменений
         const updateM = gql(`
               #graphql
               mutation ($id: Int!, $name: String!, $prefCostTypeGroup: Int!, $prefAgentGroup: Int!,
                         $prefFinOperLogIntv: Int!, $prefFinOperLogIntvN: Int!, $owner: String!, $acl: String!) {
                  updateProject (id: $id, name: $name, prefCostTypeGroup: $prefCostTypeGroup,
                                 prefAgentGroup: $prefAgentGroup, prefFinOperLogIntv: $prefFinOperLogIntv,
                                 prefFinOperLogIntvN: $prefFinOperLogIntvN, owner: $owner, acl: $acl) {
                     ok, result
                  }
               }
         `);
         await apolloClient.mutate({
            mutation: updateM,
            variables: {
               id: this.project.id,
               name: this.project.name,
               prefCostTypeGroup: Number(this.project.prefCostTypeGroup.id),
               prefAgentGroup: Number(this.project.prefAgentGroup.id),
               prefFinOperLogIntv: this.project.prefFinOperLogIntv,
               prefFinOperLogIntvN: this.project.prefFinOperLogIntvN,
               owner: this.project.owner,
               acl: this.project.acl,
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            this.$toast.add({
               severity: 'success',
               summary: `Проект '${this.project.name}'`,
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