<template>

   <!-- Верхняя плашка -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь    -->
         <span class="fa fa-file-code text-primary text-2xl"/><span class="text-primary font-bold ml-2">{{ project.path }}</span>
      </template>
      <template #end>
      </template>
   </Toolbar>



</template>


<script>
/* eslint-disable */

import {apolloClient} from "@/apollo-config";
import {authUtils} from "@/components/tools/auth-utils";
import gql from "graphql-tag";

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

         clog(response)
      }).catch( (error) => authUtils.err(error) );
      // --
   }
}
</script>


<style scoped>

</style>