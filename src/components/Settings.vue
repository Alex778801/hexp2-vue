<template>

   <div class="flex justify-content-center flex-wrap">
<!--  Масштаб интерфейса    -->
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title> Масштаб интерфейса </template>
         <template #content>
               <h5>{{ Math.round(scaleInterface * 100) }} %</h5>
               <Slider v-model="scaleInterface" :step="0.025" :min="0.5" :max="1.5" />
               <p class="mt-3 text-sm">Отрегулируйте ползунком желаемый масштаб интерфейса.
               Настройка задается индивидуально для каждого устройства и браузера</p>
         </template>
      </Card>
<!--  Ширина экрана    -->
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title>  Ширина экрана </template>
         <template #content>
            <h5>{{ screenWidth }} em</h5>
            <Slider v-model="screenWidth" :step="5" :min="50" :max="201" />
            <p class="mt-3 text-sm">Отрегулируйте ползунком ширину рабочей области экрана. По умолчанию 100 em.
               Настройка задается индивидуально для каждого устройства и браузера</p>
         </template>
      </Card>
<!--  Тема оформления    -->
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title> Тема оформления </template>
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
<!--  Размер файла фото при отправке    -->
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title>  Размер файлов фотографий </template>
         <template #content>
            <h5>{{ photoFileSize }} кБ</h5>
            <Slider v-model="photoFileSize" :step="100" :min="500" :max="4000" />
            <p class="mt-3 text-sm">Отрегулируйте ползунком желаемый размер файлов фото6 посылаемых на сервер.
               По умолчанию 700 кБ. Настройка задается индивидуально для каждого устройства и браузера</p>
         </template>
      </Card>

   </div>

</template>

<script>
/* eslint-disable */

import { settingsUtils } from "./tools/settings-utils"
import {clog} from "@/components/tools/vue-utils";

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
         // Размер файлов фото
         photoFileSize: settingsUtils.loadPhotoFileSize(),
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
      // Размер файлов фото
      photoFileSize(newVal) {
         settingsUtils.savePhotoFileSize(newVal);
      }
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