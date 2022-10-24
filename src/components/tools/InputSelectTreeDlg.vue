<template>

   <Dialog class="p-dialog" :modal="true" v-model:visible="active" style="width: 30em">
      <template #header>
         <span class="text-primary">{{ title }}</span>
      </template>

      <div class="block">
         <TreeSelect id="select" :placeholder="placeholder" class="w-100 my-1" v-model="result" :options="options" />
         <small v-if="errEmpty" id="select-errEmpty" class="p-error"> Пустое значение не допустимо </small>
         <small v-if="errGroup" id="select-errGrp" class="p-error"> Нелья выбирать группу </small>
      </div>

      <template #footer>
         <Button label="Отмена" icon="pi pi-times" class="p-button-text p-button-sm" @click="cancel()"/>
         <Button label="ОК" icon="pi pi-check" class="p-button-sm" @click="ok()"/>
      </template>
   </Dialog>

</template>


<script>

import {findItemInTree} from "@/components/tools/vue-utils";

export default {
   name: 'InputSelectTreeDlg',

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
         // Разрешить выбор группы
         allowGroup: true,
         // Колбек обработки введенных данных
         dataCallback: function () {},
      }
   },

   computed: {
      // Ошибка - пустой ввод
      errEmpty() {
         return this.result === null;
      },
      // Ошибка - выбрана группа
      errGroup() {
         if (this.result !== null) {
            const key = Number(Object.keys(this.result)[0]);
            const item = findItemInTree(this.options, key)
            return !this.allowGroup && item.data.isGrp
         }
            return false
      }
   },

   methods: {
      // Показать диалог
      show(title, placeholder, options, allowEmpty = false, allowGroup = false, dataCallback) {
         this.title = title;
         this.placeholder = placeholder;
         this.options = options;
         this.allowEmpty = allowEmpty;
         this.allowGroup = allowGroup;
         this.dataCallback = dataCallback;
         this.active = true;
      },
      // Кнопка ОК
      ok() {
         if (this.errEmpty || this.errGroup) {
            return;
         }
         this.active = false;
         const itemId = Number(Object.keys(this.result)[0]);
         this.dataCallback(itemId);
      },
      // Кнопка Отмена
      cancel() {
         this.active = false;
      }
   }

}
</script>

<style lang="scss" scoped>

.p-treeselect {
   width: 100%;
}

</style>