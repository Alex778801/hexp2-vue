<template>
   <CatListComp
      :startPid =                 "get.parentId"
      :startEditMode =            "get.editMode"
      model =                     "projects"
      modelQ =                    "query { projects { id, pid, g, o, name, } }"
      urlEnterElement =           "/finopers/log-v"
      urlEditGroup =              ""
      urlEditElement =            "/projects/element"
      urlCreateNewGroup =         "/projects/new-group"
      urlCreateNewElement =       "/projects/new-element"
      urlRenameGroup =            "/projects/rename-group"
      urlClone =                  "/projects/clone"
      urlDelete =                 "/projects/delete"
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

