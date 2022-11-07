<template>

   <div class="flex justify-content-center flex-wrap">
<!--  Масштаб интерфейса    -->
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title> Масштаб интерфейса </template>
         <template #content>
               <h5>{{ Math.round(scaleInterface * 100) }} %</h5>
               <Slider v-model="scaleInterface" step="0.025" min="0.5" max="1.5"/>
               <p class="mt-3 text-sm">Отрегулируйте ползунком желаемый масштаб интерфейса.
               Настройка задается индивидуально для каждого устройства и браузера</p>
         </template>
      </Card>
<!--  Ширина экрана    -->
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title>  Ширина экрана </template>
         <template #content>
            <h5>{{ screenWidth }} em</h5>
            <Slider v-model="screenWidth" step="5" min="50" max="201"/>
            <p class="mt-3 text-sm">Отрегулируйте ползунком ширину рабочей области экрана.
               Настройка задается индивидуально для каждого устройства и браузера</p>
         </template>
      </Card>
<!--  Тема оформления    -->
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title> Тема офорлмения </template>
         <template #content>
            <Dropdown class="w-12" v-model="themeIdx" :options="themes" optionLabel="name" optionValue="idx" placeholder="выберите тему" />
            <p class="mt-3 text-sm"> Внимание! Темы по разному адаптированны
               к дектопам, планшетам и смартфонам. Возможны нюансы на разных ОС и браузерах.
               Настройка задается индивидуально для каждого устройства и браузера</p>
            <Button label="Сохранить" icon="fa fa-save" class="p-button-sm" style="float: right;"  @click="saveTheme()"/>
         </template>
      </Card>
<!--  Использовать 2 колонки в справочниках  -->
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title>  Компоновка справочников </template>
         <template #content>

            <div class="field-radiobutton">
               <RadioButton inputId="catUse1col" name="catUse2col" value="false" v-model="catUse2col" />
               <label for="catUse1col">Одна колонка</label>
            </div>
            <div class="field-radiobutton">
               <RadioButton inputId="catUse2col" name="catUse2col" value="true" v-model="catUse2col" />
               <label for="catUse2col">Две колонки</label>
            </div>

            <p class="mt-3 text-sm">Задайте колво колонок при отображении списка справочника.
               Настройка задается индивидуально для каждого устройства и браузера</p>
         </template>
      </Card>


   </div>

</template>

<script>
/* eslint-disable */

import { settingsUtils } from "./tools/settings-utils"

export default {
   name: "Settings",

   data() {
      return {
         // Масштаб интерфейса
         scaleInterface: settingsUtils.loadScaleInterface(),
         // Ширина экрана
         screenWidth: settingsUtils.loadScreenWidth(),
         // Тема офорлмения
         themes: settingsUtils.themes,
         themeIdx: settingsUtils.loadTheme().idx,
         // 2 колонки в списке справочника
         catUse2col: settingsUtils.loadCatUse2col() ? 'true' : 'false',
      }
   },

   watch: {
      // Масштаб интерфейса
      scaleInterface(newVal) {
         settingsUtils.applyScaleInterface(newVal);
         settingsUtils.saveScaleInterface(newVal);
      },
      // Ширина экрана
      screenWidth(newVal) {
        settingsUtils.applyScreenWidth(newVal);
        settingsUtils.saveScreenWidth(newVal);
      },
      // Тема оформления
      themeIdx(newVal) {
         settingsUtils.applyTheme(newVal);
      },
      // Колонок справочников
      catUse2col(newVal) {
         settingsUtils.saveCatUse2col(newVal);
      },
   },

   methods: {
      // Тема оформления
      saveTheme() {
         settingsUtils.saveTheme(this.themeIdx);
         this.$toast.add({severity:'success', summary: 'Настройки', detail:'Успешное сохранены', life: 3000});
      }
   }
}
</script>

<style scoped>

</style>