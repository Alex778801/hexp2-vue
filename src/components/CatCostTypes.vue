<template>
   <CatList
      :startPid =                 "query.parentId"
      :startEditMode =            "query.editMode"
      model =                     "costType"
      modelQ =                    "query { costTypes { id, pid, grp, ord, name, out, color, } }"
      urlEditGroup =              ""
      urlEditElement =            "/costtype"
      urlEnterElement =           ""
   />
</template>

<script>

import CatList from '@/components/CatList.vue'

export default {
   name: 'CatCostTypes',

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

