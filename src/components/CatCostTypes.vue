<template>
   <CatListComp
      :startPid =                 "get.parentId"
      :startEditMode =            "get.editMode"
      model =                     "costtypes"
      modelQ =                    "query { costtypes { id, pid, grp, ord, name, out, color, } }"
      urlEditGroup =              ""
      urlEditElement =            "/costtype/"
      urlEnterElement =           ""
   />
</template>

<script>

import CatListComp from '@/components/CatList.vue'

export default {
   name: 'CatCostTypes',

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

