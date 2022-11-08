<template>
   <Menubar :model="items" class="m-1 no-print" :class="{'bg-primary-50': String(dbLogoName).substring(0, 1) === '!'}">
      <template #end>
         <div class="p-inputgroup">
            <InputText placeholder="строка поиска" style="width: 12em" v-model="findStr" @keyup.enter="search()"/>
            <Button icon="fa fa-search" @click="search()"/>
         </div>
      </template>
   </Menubar>
</template>

<script>
/* eslint-disable */

import {authUtils} from "@/components/tools/auth-utils";
import {clog} from "@/components/tools/vue-utils";

export default {
   name: "MainMenu",

   props: ['dbLogoName'],

   data() {
      return {
         findStr: this.$route.params.findStr,
         items: [
            { label: '', icon: 'fa fa-home', disabled: true },
            { label: 'Проекты', icon: 'fa fa-file-invoice', to: '/cat-projects' },
            { label: 'Статьи', icon: 'fa fa-coins', to: '/cat-costtypes' },
            { label: 'Агенты', icon: 'fa fa-user-tie', to: '/cat-agents' },
            { label: 'Настройки', icon: 'fa fa-cog', class: 'pe-5', to: '/settings' },
            { label: `Выход (${authUtils.username})`,
               icon: 'fa fa-power-off',
               command: () => { authUtils.logout() } }
         ],
      }
   },

   watch: {
      // Изменение лого имени - обновляем вручную составной объект для реактивности
      dbLogoName: {
         handler(newVal, oldVal) {
            this.items[0].label = newVal;
         },
         immediate: true,
         deep: true
      }
   },

   methods: {
      search() {
         this.$router.push({ path: `/search/${this.findStr}`});
      }
   }
}

</script>

<style>

.router-link-active-exact .p-menuitem-text, .router-link-active-exact .p-menuitem-icon {
   color: var(--primary-color) !important;
   text-shadow: 1px 1px 3px var(--primary-color-text), 1px 1px 6px var(--primary-color) !important;
}

</style>