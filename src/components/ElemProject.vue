<template>

   <!-- Верхняя плашка -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь    -->
         <FontAwesomeIcon icon="fa fa-file-code"/><span class="text-primary font-bold ml-2">{{ project.path }}</span>
      </template>
      <template #end>
      </template>
   </Toolbar>

</template>


<script>
/* eslint-disable */

export default {
   name: "ElemProject",

   data() {
      return {
         projectId: this.$route.params.id,
         project: {},
      }
   },

   mounted() {

   }
}
</script>


<style scoped>

</style>