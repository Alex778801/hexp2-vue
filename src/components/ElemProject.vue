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
         <InputText id="name" type="username" aria-describedby="name-help" v-model="project.name"/>
      </div>
<!--  Группа статей    -->
      <div class="field">
         <label for="prefCostTypeGroup" class="text-primary"> Группа статей </label> <br>
         <TreeSelect id="prefCostTypeGroup" placeholder="статьи..."
                     v-model="selPrefCostTypeGroup"
                     :options="prefCostTypeGroupTree" >
         </TreeSelect>
      </div>
<!--  Группа агенов    -->
      <div class="field">
         <label for="prefAgentGroup" class="text-primary"> Группа агентов </label> <br>
         <TreeSelect id="prefAgentGroup" placeholder="агенты..."
                     v-model="selPrefAgentGroup"
                     :options="prefAgentGroupTree" >
         </TreeSelect>
      </div>
<!--  Интервал журнала    -->
      <div class="field" style="max-width: 20em;">
         <label for="prefFinOperLogIntv" class="text-primary"> Интервал журнала </label> <br>
         <Dropdown id="prefFinOperLogIntv" v-model="project.prefFinOperLogIntv" :options="logIntervalList" optionLabel="label" optionValue="id" placeholder="интервал..." />
<!--  Параметр интервала журнала    -->
      </div>
      <div class="field" style="max-width: 20em;">
         <label for="prefFinOperLogIntvN" class="text-primary"> Параметр интеравала журнала </label>
         <InputNumber inputId="prefFinOperLogIntvN" v-model="project.prefFinOperLogIntvN" showButtons :min="1" :max="1000"/>
      </div>
   </Fieldset>


<!-- Списки контроля доступа  -->
   <Fieldset legend="Контроль доступа" class="mt-2 m-1">
<!--  Владелец    -->
      <div class="field">
         <label for="owner" class="text-primary"> Владелец </label>
         <InputText id="owner" type="text" aria-describedby="name-help" v-model="project.owner" :disabled="project.owner !== 'admin'"/>
      </div>
<!--  Чтение READ    -->
      <div class="field">
         <label for="acl_read" class="text-primary"> Чтение </label>
         <MultiSelect id="acl_read" v-model="acl_read" :options="aclList" optionValue="id" optionLabel="label" :filter="true" placeholder="список учетных записей..." />
      </div>
<!--  Чтение O_MOD   -->
      <div class="field">
         <label for="acl_o_mod" class="text-primary"> Модификация владельцем </label>
         <MultiSelect id="acl_o_mod" v-model="acl_o_mod" :options="aclList" optionValue="id" optionLabel="label" :filter="true" placeholder="список учетных записей..." />
      </div>
<!--  Чтение A_MOD   -->
      <div class="field">
         <label for="acl_read" class="text-primary"> Модификация НЕ владельцем </label>
         <MultiSelect id="acl_a_mod" v-model="acl_a_mod" :options="aclList" optionValue="id" optionLabel="label" :filter="true" placeholder="список учетных записей..." />
      </div>
<!--  Чтение REPORT  -->
      <div class="field">
         <label for="acl_read" class="text-primary"> Построение отчетов </label>
         <MultiSelect id="acl_read" v-model="acl_report" :options="aclList" optionValue="id" optionLabel="label" :filter="true" placeholder="список учетных записей..." />
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
         <Button label="Сохранить" icon="fa fa-save" class="mr-2 p-button-success" @click="save()"/>
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
         aclList: null,
         acl_read: null,
         acl_a_mod: null,
         acl_o_mod: null,
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
      acl_a_mod()             { this.dataChanged = true; },
      acl_o_mod()             { this.dataChanged = true; },
      acl_report()            { this.dataChanged = true; },
      // --
   },

   mounted() {
      // Запрос данных
      const itemQ = gql(`
            query($id: Int!) {
               project(id: $id) {
                  id, name, path,
                  prefAgentGroup { id, name, },
                  prefCostTypeGroup { id, name, out, color, },
                  prefFinOperLogIntv,
                  prefFinOperLogIntvN,
                  owner,
                  acl,
                  prefCostTypeGroupTree,
                  prefAgentGroupTree,
                  logIntervalList,
                  aclList,
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
               let id = this.project.prefCostTypeGroup.id;
               let key = this.prefCostTypeGroupTree.find(i => i.data === id).key;
               this.selPrefCostTypeGroup = {};
               this.selPrefCostTypeGroup[key] = true;
            } else {
               this.project.prefCostTypeGroup = {};
            }
            // -- prefAgentGroupTree
            this.prefAgentGroupTree = JSON.parse(this.project.prefAgentGroupTree);
            if (this.project.prefAgentGroup != null) {
               id = this.project.prefAgentGroup.id;
               key = this.prefAgentGroupTree.find(i => i.data === id).key;
               this.selPrefAgentGroup = {};
               this.selPrefAgentGroup[key] = true;
            } else {
               this.project.prefAgentGroup = {};
            }
            // -- logIntervalList
            this.logIntervalList = JSON.parse(this.project.logIntervalList);
            // -- aclList
            this.aclList = JSON.parse(this.project.aclList);
            this.acl_read = JSON.parse(this.project.acl).read;
            this.acl_o_mod= JSON.parse(this.project.acl).o_mod;
            this.acl_a_mod = JSON.parse(this.project.acl).a_mod;
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
         let firstKey = Object.keys(this.selPrefCostTypeGroup)[0];
         let id = this.prefCostTypeGroupTree.find(i => i.key === firstKey).data;
         this.project.prefCostTypeGroup.id = id;
         // -- prefAgentGroupTree
         firstKey = Object.keys(this.selPrefAgentGroup)[0];
         id = this.prefAgentGroupTree.find(i => i.key === firstKey).data;
         this.project.prefAgentGroup.id = id;
         // -- acl
         this.project.acl = JSON.stringify({
            'read': this.acl_read,
            'acl_o_mod': this.acl_o_mod,
            'acl_a_mod': this.acl_a_mod,
            'acl_report': this.acl_report,
         });

         // -- Мутация - запись изменений
         const updateM = gql(`
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
               prefCostTypeGroup: this.project.prefCostTypeGroup.id,
               prefAgentGroup: this.project.prefAgentGroup.id,
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