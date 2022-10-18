<template>
   <CatListComp
      :startPid =                 "get.parentId"
      :startEditMode =            "get.editMode"
      model =                     "projects"
      modelQ =                    "query { projects { id, pid, grp, ord, name, } }"
      urlEditGroup =              ""
      urlEditElement =            "/projects/element"
      urlEnterElement =           "/finopers/"


      urlClone =                  "/projects/clone"
      urlChangeOrder =            "/projects/change-order"
      urlChangeParent =           "/projects/change-parent"
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

