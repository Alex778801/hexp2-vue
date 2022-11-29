<template>

   <Dialog class="p-dialog" :modal="true" v-model:visible="active" style="width: 30em">
      <template #header>
         <span class="text-primary">{{ title }}</span>
      </template>

      <Dropdown v-model="result" :options="options" optionLabel="name" optionValue="id" :placeholder="placeholder" class="w-full"
                :scroll-height="isMobile ? '35em' : '60em'"/>
      <small v-if="errEmpty" id="inputText-help" class="p-error"> Пустое значение не допустимо </small>

      <template #footer>
         <Button label="Отмена" icon="pi pi-times" class="p-button-text p-button-sm" @click="cancel()"/>
         <Button label="ОК" icon="pi pi-check" class="p-button-sm" @click="ok()"/>
      </template>
   </Dialog>

</template>


<script>

import {isMobile} from "@/components/tools/vue-utils";

export default {
   name: 'InputSelectDlg',

   data() {
      return {
         // Видимость диалога
         active: false,
         // Заголовок диалога
         title: '',
         // Подсказка
         placeholder: '',
         // Список опций выбора
         options: [],
         // Результат выбора
         result: null,
         // Разрешить пустой ввод
         allowEmpty: false,
         // Колбек обработки введенных данных
         dataCallback: function () {},
      }
   },

   computed: {
      // Ошибка - пустой ввод
      errEmpty() {
         return this.result === null;
      },
      // Мобильник или десктоп
      isMobile() {
         return isMobile();
      },
   },

   methods: {
      // Показать диалог
      show(title, placeholder, options, allowEmpty = false, dataCallback) {
         this.title = title;
         this.placeholder = placeholder;
         this.options = options;
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
         this.dataCallback(this.result);
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