<template>
   <CatListComp
      :startPid =                 "query.parentId"
      :startEditMode =            "query.editMode"
      model =                     "project"
      modelQ =                    "query { projects { id, pid, grp, ord, name, } }"
      urlEditGroup =              ""
      urlEditElement =            "/project"
      urlEnterElement =           "/finoper"
   />
</template>

<script>

import CatListComp from '@/components/CatList.vue'

export default {
   name: 'CatProjects',

   components: {
      CatListComp
   },

   data() {
      return {
         query: this.$route.query,
      }
   }
}

</script>

