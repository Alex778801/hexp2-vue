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
            { label: 'Выход', icon: 'fa fa-power-off', class: 'ps-5' }
         ]
      }
   }
}

</script>

<style>

.router-link-active-exact .p-menuitem-text, .router-link-active-exact .p-menuitem-icon {
   color: #2091ea !important;
   text-shadow: 1px 1px 3px #fff, 1px 1px 6px #5cb8e6 !important;
}

</style>