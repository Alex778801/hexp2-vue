<template>
   <div>
      <Menubar :model="items" class="m-1">
         <template #end>
            <div class="p-inputgroup">
               <InputText placeholder="Keyword"/>
               <Button icon="pi pi-search"/>
            </div>
         </template>
      </Menubar>
   </div>
</template>

<script>
export default {
   name: "MainMenu",

   data() {
      return {
         items: [
            { label: 'hExpenses',icon: 'fa fa-home', to: '/cat-projects1' },
            { label: 'Проекты', icon: 'fa fa-file-invoice', to: '/cat-agents' },
            { label: 'Статьи', icon: 'fa fa-coins', url: 'http://ya.ru' },
            { label: 'Агенты', icon: 'fa fa-user-tie' },
            { label: 'Настройки', icon: 'fa fa-cog' },
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
   text-shadow: 1px 1px 3px #fff, 1px 1px 6px var(--primary-color) !important;
}

</style>