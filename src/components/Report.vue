<template>

   {{reportId}} / {{ projectId}}

   <iframe>

   </iframe>

</template>

<script>
/* eslint-disable */

export default {
   name: "Report",

   data() {
      return {
         // ИД отчета
         reportId: Number(this.$route.params.id),
         // ИД проекта
         projectId: Number(this.$route.params.projId),
      }
   },

   mounted() {

   },

   methods() {

   }
}
</script>

<style scoped>

</style>