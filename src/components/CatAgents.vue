<template>
   <CatListComp
      :startPid =                 "get.parentId"
      :startEditMode =            "get.editMode"
      model =                     "agents"
      modelQ =                    "query { agents { id, pid, grp, ord, name, } }"
      urlEditGroup =              ""
      urlEditElement =            "/agents/"
      urlEnterElement =           ""
   />
</template>

<script>

import CatListComp from '@/components/CatList.vue'

export default {
   name: 'CatAgents',

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

