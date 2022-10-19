<template>

<!-- Верхняя плашка -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь    -->
         <span class="fa fa-file-code text-primary text-2xl"/>
         <span class="text-primary ml-2"> [{{project.id}}] {{project.path}}{{project.name}}</span>
      </template>
      <template #end>
      </template>
   </Toolbar>

<!-- Поля  -->
   <Fieldset legend="Поля"  class="mt-1">
      <div class="field">
         <label for="username1">Username</label>
         <InputText id="username1" type="username" aria-describedby="username1-help" />
         <small id="username1-help">Enter your username to reset your password.</small>
      </div>
   </Fieldset>

   <Fieldset legend="Контроль доступа" class="mt-1">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
         Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
         Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
         cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
   </Fieldset>


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
         projectId: this.$route.params.id,
         project: {},
      }
   },

   mounted() {
      // Запрос данных
      const itemQ = gql(`
         {
            project(id: 314) {
               id, name, path,
               prefAgentGroup { id, name, },
               prefCostTypeGroup { id, name, out, color, },
               prefFinOperLogIntv,
               prefFinOperLogIntvN,
               acl,
            }
         }
      `);
      apolloClient.query({query: itemQ, fetchPolicy: "no-cache"} ).then( (response) => {
         this.project = response.data.project
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

.field * {
   display: block;
}

</style>