<template>
   <CatList
      :startPid =                 "query.parentId"
      :startEditMode =            "query.editMode"
      model =                     "agent"
      modelQ =                    "query { agents { id, pid, grp, ord, name, } }"
      urlEditGroup =              ""
      urlEditElement =            "/agent"
      urlEnterElement =           ""
   />
</template>

<script>

import CatList from '@/components/CatList.vue'

export default {
   name: 'CatAgents',

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

