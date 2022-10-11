<template>

   <Dialog class="p-dialog" :modal="true" v-model:visible="active" style="width: 25em">
      <template #header>
         <span class="text-primary">{{ title }}</span>
      </template>

      <div class="field" v-html="message"/>

      <template #footer>
         <Button label="Отмена" icon="pi pi-times" class="p-button-text p-button-sm" @click="cancel()"/>
         <Button label="ОК" icon="pi pi-check" class="p-button-sm" @click="ok()"/>
      </template>
   </Dialog>

</template>


<script lang="module">

export default {
   name: 'ConfirmDlg',

   data() {
      return {
         // Видимость диалога
         active: false,
         // Заголовок диалога
         title: '',
         // Сообщение
         message: '',
         // Колбек подтверждения - ОК
         okCallback: function () {},
      }
   },

   methods: {
      // Показать диалог
      show(title, message, okCallback) {
         this.title = title;
         this.message = message;
         this.okCallback = okCallback;
         this.active = true;
      },
      // Кнопка ОК
      ok() {
         this.active = false;
         this.okCallback();
      },
      // Кнопка Отмена
      cancel() {
         this.active = false;
      }
   }

}
</script>

<style scoped>

</style>