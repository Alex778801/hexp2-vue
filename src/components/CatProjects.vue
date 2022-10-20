<template>
   <CatListComp
      :startPid =                 "get.parentId"
      :startEditMode =            "get.editMode"
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
         get: this.$route.query,
      }
   }
}

</script>

