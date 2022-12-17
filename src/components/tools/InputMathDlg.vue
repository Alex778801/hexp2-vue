<template>

   <Dialog class="p-dialog" :modal="true" v-model:visible="active" style="width: 25em">
      <template #header>
         <span class="text-primary">{{ title }}</span>
      </template>

      <input type="text" inputmode="none" style="width: 20rem" ref="inputField" class="p-inputtext w-full my-2"
             v-model="data"
             @focus="onFocus"
      />

      <OverlayPanel ref="screenKeyboard">
         <div id="screenKeyboard">
            <Button @click="btnClk('7')" label="7"/>
            <Button @click="btnClk('8')" label="8"/>
            <Button @click="btnClk('9')" label="9"/>
            <Button @click="btnClk('*')" label="×"/>
            <Button @click="btnClk('(')" label="("/>
            <Button @click="btnClk('4')" label="4"/>
            <Button @click="btnClk('5')" label="5"/>
            <Button @click="btnClk('6')" label="6"/>
            <Button @click="btnClk('+')" label="+"/>
            <Button @click="btnClk(')')" label=")"/>
            <Button @click="btnClk('1')" label="1"/>
            <Button @click="btnClk('2')" label="2"/>
            <Button @click="btnClk('3')" label="3"/>
            <Button @click="btnClk('/')" label="÷"/>
            <Button @click="backSpace()" label="⌫" class="p-button-danger"/>
            <Button @click="btnClk('0')" label="0"/>
            <Button @click="btnClk('000')" label="000"/>
            <Button @click="btnClk('.')" label="."/>
            <Button @click="btnClk('-')" label="−"/>
            <Button @click="clear()" label="clr" class="p-button-danger"/>
            <Button @click="curMove(0)" label="⇱" class="p-button-info"/>
            <Button @click="curMove(-1)" label="←" class="p-button-info"/>
            <Button @click="curMove(1)" label="→" class="p-button-info"/>
            <Button @click="curMove('end')" label="⇲" class="p-button-info"/>
            <Button @click="ok()" label="OK" class="p-button-success"/>
         </div>
      </OverlayPanel>

      <template #footer>
         <Button label="Отмена" icon="pi pi-times" class="p-button-text p-button-sm" @click="cancel()"/>
         <Button label="ОК" icon="pi pi-check" class="p-button-sm" @click="ok()"/>
      </template>
   </Dialog>

</template>

<script>
/* eslint-disable */

import {clog} from "@/components/tools/vue-utils";

export default {
   name: "InputMathDlg",

   data() {
      return {
         // Видимость диалога
         active: false,
         // Заголовок диалога
         title: '',
         // Вводимые данные
         data: '',
         // Разрешить пустой ввод
         allowEmpty: false,
         // Колбек обработки введенных данных
         dataCallback: function () {},
         // Позиция крусора в поле ввода
         cp: 0,
      }
   },

   computed: {
      // Ошибка - пустой ввод
      errEmpty() {
         return !this.allowEmpty && this.data.trim() === '';
      },
   },

   methods: {
      // Фокус на поле ввода
      onFocus(event) {
         this.$refs.screenKeyboard.show(event);
      },

      // Обновить позицию курсора
      updateCursorPos() {
         this.$refs.inputField.setSelectionRange(this.cp, this.cp);
         this.$refs.inputField.focus();
         // Баг браузера - иначе не отображает позицию курсора
         setTimeout( () => {
            this.$refs.inputField.setSelectionRange(this.cp, this.cp);
            this.$refs.inputField.focus();
         }, 0);
      },

      // Нажатие кнопки экранной клавиатуры
      btnClk(char) {
         this.cp = this.$refs.inputField.selectionStart;
         this.data =  this.data.substring(0, this.cp) + char + this.data.substring(this.cp);
         this.cp++;
         this.updateCursorPos();
      },

      curMove(delta) {
         this.cp = this.$refs.inputField.selectionStart;
         if (delta === 0)
            this.cp = 0
         else if (delta === 'end')
            this.cp = 9999;
         else
            this.cp += delta;
         this.updateCursorPos();
      },

      // Удалить символ
      backSpace() {
         this.cp = this.$refs.inputField.selectionStart;
         this.data = this.data.substring(0, this.cp - 1) + this.data.substring(this.cp);
         this.cp--;
         this.updateCursorPos();
      },

      // Очистка поля ввода
      clear() {
         this.data = '';
         this.cp = 0;
         this.updateCursorPos();
      },

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

<style lang="scss" scoped>

#screenKeyboard {
   touch-action: manipulation;
   display: grid;
   gap: 0.5rem;
   grid-template-columns: 3.5rem 3.5rem 3.5rem 3.5rem 3.5rem;
   Button {
      padding-left: 0 !important;
      padding-right: 0 !important;
      height: 2.5rem;
      text-align: center;
   }
}

</style>