<template>

   <Dialog class="p-dialog" :modal="true" v-model:visible="active" style="width: 25em">
      <template #header>
         <span class="text-primary" > {{ title }} </span>
      </template>

      <div class="p-fluid grid formgrid">
         <div class="field labelF pb-3">
            <label for="beginF">Дата начала</label>
            <Calendar inputId="beginF" v-model="begin" dateFormat="dd MM yy (D)" :showIcon="true"/>
            <small v-if="errEmptyBegin" id="inputText-help" class="p-error"> Пустое значение не допустимо </small>
         </div>
         <div class="field labelF pb-3">
            <label for="endF">Дата конца</label>
            <Calendar inputId="endF" v-model="end" dateFormat="dd MM yy (D)" :showIcon="true"/>
            <small v-if="errEmptyEnd" id="inputText-help" class="p-error"> Пустое значение не допустимо </small>
         </div>
         <div class="field labelF pb-2">
            <label for="monthF">Месяц/год</label>
            <Calendar inputId="monthF" v-model="month" view="month" dateFormat="MM yy" :showIcon="true"/>
         </div>
      </div>

      <template #footer>
         <Button label="Отмена" icon="pi pi-times" class="p-button-text p-button-sm" @click="cancel()"/>
         <Button label="ОК" icon="pi pi-check" class="p-button-sm" @click="ok()"/>
      </template>
   </Dialog>

</template>


<script>

/* eslint-disable */

export default {
   name: 'DateIntervalDlg',

   data() {
      return {
         // Видимость диалога
         active: false,
         // Заголовк
         title: '',
         // Разрешить пустой ввод
         allowEmpty: false,
         // Колбек обработки введенных данных
         dataCallback: function () {},
         // Дата начала
         begin: null,
         // Дата конца
         end: null,
         // Месяц
         month: null,
      }
   },

   computed: {
      // Ошибка - пустой ввод пол Начало
      errEmptyBegin() {
         return isNaN(Date.parse(this.begin))
      },
      // Ошибка - пустой ввод пол Конец
      errEmptyEnd() {
         return isNaN(Date.parse(this.end))
      },
   },

   watch: {
      // При выборе месяца - меняем начало и конец периода
      month() {
         const y = this.month.getFullYear(), m = this.month.getMonth();
         const firstDay = new Date(y, m, 1);
         const lastDay = new Date(y, m + 1, 0);
         this.begin = firstDay;
         this.end =lastDay;
     }
   },

   methods: {
      // Показать диалог
      show(begin, end, title='Выберите период', allowEmpty=false, dataCallback) {
         this.begin = begin;
         this.end = end;
         this.title = title;
         this.allowEmpty = allowEmpty;
         this.dataCallback = dataCallback;
         this.active = true;
      },
      // Кнопка ОК
      ok() {
         if (this.errEmptyBegin || this.errEmptyEnd) {
            return;
         }
         this.active = false;
         this.dataCallback(this.begin, this.end);
      },
      // Кнопка Отмена
      cancel() {
         this.active = false;
      }
   }

}
</script>

<style scoped>

.labelF {
   color: #67a2f1
}

</style>