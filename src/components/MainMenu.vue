<template>
   <div>
      <Menubar :model="items" class="m-1">
         <template #end>
            <div class="p-inputgroup">
               <InputText placeholder="строка поиска" style="width: 12em"/>
               <Button icon="pi pi-search"/>
            </div>
         </template>
      </Menubar>
   </div>
</template>

<script>
/* eslint-disable */

export default {
   name: "MainMenu",

   data() {
      return {
         items: [
            { label: 'hExpenses',icon: 'fa fa-home', to: '/cat-projects1', disabled: true },
            { label: 'Проекты', icon: 'fa fa-file-invoice', to: '/cat-agents' },
            { label: 'Статьи', icon: 'fa fa-coins', url: 'http://ya.ru' },
            { label: 'Агенты', icon: 'fa fa-user-tie' },
            { label: 'Настройки', icon: 'fa fa-cog', to: '/settings' },
            { label: `Выход (${this.$root.$refs.auth.username})`,
               icon: 'fa fa-power-off',
               class: 'ps-5',
               command: () => { this.$root.$refs.auth.logout() } }
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