<template>

   <Dialog class="p-dialog" :modal="true" v-model:visible="active" style="width: 25em">
      <template #header>
         <span class="text-primary">{{ title }}</span>
      </template>

      <div class="field">
         <InputText id="inputText" v-model="data" aria-describedby="username2-help" class="w-full my-2" :class="{ 'p-invalid': errEmpty }" @keyup.enter="ok()"/>
         <small v-if="errEmpty" id="inputText-help" class="p-error"> Пустое значение не допустимо </small>
      </div>

      <template #footer>
         <Button label="Отмена" icon="pi pi-times" class="p-button-text p-button-sm" @click="cancel()"/>
         <Button label="ОК" icon="pi pi-check" class="p-button-sm" @click="ok()"/>
      </template>
   </Dialog>

</template>

<script lang="module">

export default {
   name: 'InputTextDlg',

   data() {
      return {
         // Видимость диалога
         active: false,
         // Заголовок диалога
         title: '',
         // Вводимые текстовые данные
         data: '',
         // Разрешить пустой ввод
         allowEmpty: false,
         // Колбек обработки введенных данных
         dataCallback: function () {},
      }
   },

   computed: {
      // Ошибка - пустой ввод
      errEmpty() {
         return !this.allowEmpty && this.data.trim() === '';
      },
   },

   methods: {
      // Показать диалог
      show(title, initData, allowEmpty = false, dataCallback) {
         this.title = title;
         this.data = initData;
         this.allowEmpty = allowEmpty;
         this.dataCallback = dataCallback;
         this.active = true;
      },
      // Кнопка ОК
      ok() {
         if (this.errEmpty) {
            return;
         }
         this.active = false;
         this.dataCallback(this.data);
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