<template>
   <CatListComp
      :startPid =                 "get.parentId"
      :startEditMode =            "get.editMode"
      model =                     "agent"
      modelQ =                    "query { agents { id, pid, grp, ord, name, } }"
      urlEditGroup =              ""
      urlEditElement =            "/agent"
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

