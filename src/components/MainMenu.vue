<template>
   <Menubar :model="items" class="m-1">

      <template #end>
         <div class="p-inputgroup">
            <InputText placeholder="строка поиска" style="width: 12em" v-model="findStr"/>
            <Button icon="fa fa-search" @click="$router.push({ path: `/search/${findStr}`})"/>
         </div>
      </template>
   </Menubar>
</template>

<script>
/* eslint-disable */

import {authUtils} from "@/components/tools/auth-utils";

export default {
   name: "MainMenu",

   data() {
      return {
         findStr: '',
         items: [
            { label: 'hExpenses',icon: 'fa fa-home', disabled: true },
            { label: 'Проекты', icon: 'fa fa-file-invoice', to: '/cat-projects' },
            { label: 'Статьи', icon: 'fa fa-coins', to: '/cat-costtypes' },
            { label: 'Агенты', icon: 'fa fa-user-tie', to: '/cat-agents' },
            { label: 'Настройки', icon: 'fa fa-cog', class: 'pe-5', to: '/settings' },
            { label: `Выход (${authUtils.username})`,
               icon: 'fa fa-power-off',
               command: () => { authUtils.logout() } }
         ]
      }
   },

}

</script>

<style>

.router-link-active-exact .p-menuitem-text, .router-link-active-exact .p-menuitem-icon {
   color: var(--primary-color) !important;
   text-shadow: 1px 1px 3px var(--primary-color-text), 1px 1px 6px var(--primary-color) !important;
}

</style>