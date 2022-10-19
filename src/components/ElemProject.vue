<template>

<div>
<!-- Верхняя плашка -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь    -->
         <span class="fa fa-file-code text-primary text-3xl"/>
         <span class="text-primary ml-2"> [{{project.id}}] {{project.path}}{{project.name}}</span>
      </template>
      <template #end>
      </template>
   </Toolbar>

<!-- Поля  -->
   <Fieldset legend="Поля"  class="mt-3">
      <div class="field">
         <label for="name" class="text-primary"> Имя </label>
         <InputText id="name" type="username" aria-describedby="name-help" size="50" :model-value="project.name"/>
      </div>
      <div class="field">
         <label for="prefCostTypeGroup" class="text-primary"> Группа статей </label> <br>
         <TreeSelect id="prefCostTypeGroup" placeholder="статья..."
                     v-model="selPrefCostTypeGroup"
                     :options="prefCostTypeGroupTree" >

         </TreeSelect>
      </div>
   </Fieldset>

   <Fieldset legend="Контроль доступа" class="mt-3">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
         Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
         Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
         cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
   </Fieldset>

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
      }
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
                  acl,
                  prefCostTypeGroupTree,
               }
            }
      `);
      apolloClient.query({
         query: itemQ,
         variables: {id: this.projectId},
         fetchPolicy: "no-cache"} ).then( (response) => {
            this.project = response.data.project;
            this.prefCostTypeGroupTree = JSON.parse(this.project.prefCostTypeGroupTree);
            const id = this.project.prefCostTypeGroup.id;
            const key = this.prefCostTypeGroupTree.find( i => i.data === id).key;
            this.selPrefCostTypeGroup = {}
            this.selPrefCostTypeGroup[key] = true;
      }).catch( (error) => authUtils.err(error) );
      // --
   }
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

</style>