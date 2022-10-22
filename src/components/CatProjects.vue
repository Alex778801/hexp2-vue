<template>
   <CatList
      :startPid =                 "query.parentId"
      :startEditMode =            "query.editMode"
      model =                     "project"
      modelQ =                    "query { projects { id, pid, grp, ord, name, } }"
      urlEditGroup =              ""
      urlEditElement =            "/project"
      urlEnterElement =           "/log-finopers"
   />
</template>

<script>

import CatList from '@/components/CatList.vue'

export default {
   name: 'CatProjects',

   components: {
      CatList
   },

   data() {
      return {
         query: this.$route.query,
      }
   }
}

</script>

