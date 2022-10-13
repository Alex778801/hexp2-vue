<template>

<!-- Текущая группа справочника -->
   <div class="container-fluid sticky-top p-2" style="background-color: #daf7ff">
      <div class="btn-toolbar justify-content-between">
         <div class="btn-group align-items-center py-1">
<!--        Путь    -->
            <i class="fas fa-code ListBtnIcon pe-2" @click="levelUp"></i><span id="Path" style="color: #67a2f1; font-weight: bold">{{ frmCurPath() }}</span>
         </div>
         <div class="btn-group">
<!--        Кнопка На уровень вверх    -->
            <button type="button" class="btn btn-primary" :disabled="!canLevelUp" @click="levelUp"><i class="fas fa-arrow-alt-circle-up" style="color: white"></i></button>
         </div>
      </div>
   </div>

<!-- Содержимое справочника -->
   <div class="container-fluid" style="padding-bottom: 18em; min-height: 50em">
      <div class="item"
           v-for="item in fList" :key="item.id"
           :draggable="editMode"
           @dragstart="dragStart($event, item)"
           @dragend="dragEnd($event, item)"
           @drop="dragDrop($event, item)"
           @dragover.prevent
           @dragenter.prevent
      >
         <div class="List-Cont row p-3">
<!--        Чек, редакт, иконка, имя     -->
            <div class="List-Name col-11 px-0">
<!--           Чек    -->
               <input class="List-Check form-check-input me-2" type="checkbox" v-if="editMode" v-model="checkedItems" :value="item" @click="checkboxMobileFix(item, checkedItems)">
<!--           Редактирование    -->
               <i class="fas pe-2 fa-pen ListBtnIcon" style="scale: 70%;" v-if="editMode" @click="itemEdit(item)"></i>
<!--           Иконка и имя    -->
               <span @click="itemEnter(item)">
                  <i class="fas pe-2" :class="item.g ? 'fa-folder ListFolderIcon' : 'fa-file ListElementIcon'" :style="{ 'color': itemColor(item) }"></i> {{ item.name }}
               </span>
            </div>
<!--        Полоски и меню       -->
            <div class="List-Btns col-1 p-0 text-end" v-if="editMode">
               <i class="fas fa-grip-lines ListBtnIcon" data-bs-toggle="dropdown"></i>
               <ul class="dropdown-menu" style="background-color: #d2eef4">
                   <li> <button class="dropdown-item text-primary" type="button" @click="itemMenu_changeOrder(item, -1)"> <i class="fas fa-arrow-up"></i> Вверх </button> </li>
                   <li> <button class="dropdown-item text-primary" type="button" @click="itemMenu_changeOrder(item, 1)"> <i class="fas fa-arrow-down"></i> Вниз </button> </li>
                   <li> <button class="dropdown-item text-primary" type="button" @click="itemMenu_delete(item)"> <i class="fas fa-trash"></i> Удалить </button></li>
                   <li> <button class="dropdown-item text-primary" type="button" @click="itemMenuClipboardPut(item, 'copy')"> <i class="fas fa-copy"></i> Копировать </button></li>
                   <li> <button class="dropdown-item text-primary" type="button" @click="itemMenuClipboardPut(item, 'cut')"> <i class="fas fa-cut"></i> Вырезать </button></li>
               </ul>
            </div>
<!--        --                   -->
         </div>
      </div>
   </div>

<!-- Нижняя панель инструментов        -->
   <div class="container-fluid fixed-bottom p-2" style="max-width: 75em; background-color: #daf7ff;">
      <div class="btn-toolbar justify-content-between">
         <div class="btn-group py-1">
<!--        Кнопка Иерархия            -->
            <button type="button" class="btn btn-primary" @click="hierarchyMode = !hierarchyMode"><i class="fas fa-folder-tree" :class="{EnBtn: hierarchyMode}"></i></button>
<!--        Кнопка Редактирование      -->
            <button type="button" class="btn btn-primary" @click="editMode = !editMode"><i class="fas fa-pencil" :class="{EnBtn: editMode}"></i></button>
         </div>
         <div class="btn-group py-1">
<!--        Кнопка Новая группа        -->
            <button type="button" class="btn btn-primary" @click="newGroup()" :disabled="!hierarchyMode"><i class="fas fa-folder-plus"></i></button>
<!--        Кнопка Новый элемент       -->
            <button type="button" class="btn btn-primary" @click="newElem()" :disabled="!hierarchyMode"><i class="fas fa-file-plus"></i></button>
<!--        Кнопка Удалить             -->
            <button type="button" class="btn btn-primary" @click="deleteItems()" :disabled="!canDeleteItems"><i class="fas fa-trash"></i></button>
         </div>
         <div class="btn-group py-1">
<!--        Кнопка Вырезать            -->
            <button type="button" class="btn btn-primary" :disabled="!canUseClipboard" @click="clipboardPut('cut')"><i id="cutBtn" class="fas fa-cut"></i></button>
<!--        Кнопка Скопировать         -->
            <button type="button" class="btn btn-primary" :disabled="!canUseClipboard" @click="clipboardPut('copy')"><i id="copyBtn" class="fas fa-copy"></i></button>
<!--        Кнопка Вставить            -->
            <button type="button" class="btn btn-primary" :disabled="!canPasteClipboard" @click="clipboardPaste()" v-tooltip.top="{value: tooltipClipboard, escape: true, class: 'tooltipClipboard'}">
               <i id="pasteBtn" class="fas fa-paste" :class="{EnBtn: canPasteClipboard}"></i></button>
         </div>
         <div class="input-group py-1">
<!--        Быстрый фильтр             -->
            <input type="text" class="form-control btn-outline-primary" size="20" placeholder="Быстрый фильтр" v-model="qFilter">
<!--        Кнопка Сброс быстрого      -->
            <button type="button" class="btn btn-primary" @click="qFilter=''"><i class="fas fa-times"></i></button>
         </div>
         <div class="btn-group py-1">
<!--        Кнопка Обновить            -->
            <button type="button" class="btn btn-primary "
                    :class="{glowBtn: glowRefreshBtn}"
                    @click="fetchList()"><i class="fas fa-sync"></i></button>
<!--        Кнопка На уровень вверх    -->
            <button type="button" class="btn btn-primary" :disabled="!canLevelUp" @click="levelUp"><i class="fas fa-arrow-alt-circle-up"></i></button>
         </div>
      </div>
   </div>

<!-- Диалог ввода строки -->
   <InputTextDlg child ref="inputTextDlg" />

<!-- Диалог подтверждения -->
   <ConfirmDlg child ref="confirmDlg" />

</template>

<script lang="module">

/* eslint-disable */

import gql from "graphql-tag";

const axios = require('axios').default;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";

import InputTextDlg  from "./tools/InputTextDlg.vue";
import ConfirmDlg    from "./tools/ConfirmDlg.vue";

import {
   clog,
   fErr,
   boolFromUrlParam,
   numFromUrlParam,
   findItemById,
   checkboxMobileFixMixin
} from './tools/vue-utils';
import {apolloClient} from "@/apollo-config";

export default {
   name: 'CatListComp',

   components: {
      InputTextDlg,
      ConfirmDlg,
   },

   mixins: [checkboxMobileFixMixin],

   props: {
      // Наименование справочника
      model: String,
      // Строка запроса для получения справочника
      modelQ: String,
      // URL операций
      urlEnterElement: String,
      urlEditGroup: String,
      urlEditElement: String,
      urlCreateNewGroup: String,
      urlCreateNewElement: String,
      urlRenameGroup: String,
      urlClone: String,
      urlDelete: String,
      urlChangeOrder: String,
      urlChangeParent: String,
      // Какую группу открыть по умолчанию - URL параметр
      startPid: String,
      // Режим редактирования по умолчанию - URL параметр
      startEditMode: String,
   },

   data() {
      return {
         // Период авто обновления справочника
         autoFetchInterval: 60000,
         // Справочник
         list: [],
         // Текущий родитель
         curPid: -1,
         // Отображать по иерархии (группы-подгруппы)
         hierarchyMode: true,
         // Вкл режим редактирования
         editMode: false,
         // Быстрый фильтр по наименованию
         qFilter: '',
         // Отмеченные объекты
         checkedItems: [],
         // Буфер обмена
         clipboard: [],
         clipMode: '',
         // Мигание кнопки обновление при обновлении каталога
         glowRefreshBtn: false,
      }
   },

   mounted() {
      // Какую группу открыть по умолчанию (код родителя)
      this.curPid = numFromUrlParam(this.startPid);
      // Режим редактирования по умолчанию
      this.editMode = boolFromUrlParam(this.startEditMode);
      // Получить справочник
      this.fetchList();
      // При изменении Видимости приложения
      document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
              this.fetchList();
          }
      }, false)
      // Авто обновление справочника по таймеру
      setInterval(() => {
         this.glowRefreshBtn = true;
         this.fetchList();
      }, this.autoFetchInterval);
   },

   computed: {
      // Можно перейти на уровень выше
      canLevelUp() {
         return this.hierarchyMode && this.curPid !== -1;
      },
      // Можно удалять объекты
      canDeleteItems() {
         return this.editMode && this.checkedItems.length > 0;
      },
      // Можно исп операции буфера обмена
      canUseClipboard() {
         return this.hierarchyMode && this.editMode;
      },
      // Можно делать вставку из буфера обмена
      canPasteClipboard() {
         return  this.hierarchyMode && this.editMode && this.clipboard.length > 0;
      },
      // Подсказка буфера обмена
      tooltipClipboard() {
         if (this.clipboard.length > 0) {
            let str =  `<strong> ${this.clipMode === 'copy' ? 'Скопировано' : 'Вырезано'}: </strong><br>`;
            return str + this.clipboard.reduce( (sum, i) => i.name + '<br>' + sum  ,'' );
         } else {
            return 'Буфер обмена пуст!';
         }
      },
      // Отфильтрованный список для отображения
      fList() {
         return this.list.filter( i => ((i.pid === this.curPid)||(!this.hierarchyMode))&&this.qFilterFunc(i.name) );
      }
   },

   watch: {
      // При изменении режима редактирования - обновляем историю браузера
      editMode() {
         this.updateHistory();
      }
   },

   methods: {

      // Сформировать путь текущей группы
      frmCurPath() {
         if (this.hierarchyMode) {
            let tmpPid = this.curPid;
            let path = '';
            let item = findItemById(tmpPid, this.list);
            while (item !== undefined) {
               path = item.name + '/' + path;
               item = findItemById(item.pid, this.list);
            }
            return path;
         }
         else return "--- Иерархия выключена ---"
      },

      // Цвет элемента
      itemColor(item) {
         if (!item.g && item.color != undefined) {
            return item.color;
         } else {
            return 'auto';
         }
      },

      // Быстрый фильтр по названию
      qFilterFunc(val) {
         if (this.qFilter === "") return true;
         else {
            const reg = new RegExp(this.qFilter, "i");
            return reg.test(val);
         }
      },

      // Получить справочник
      async fetchList() {
         // Запрос справочника
         const listQ = gql(this.modelQ);
         await apolloClient.query({query: listQ} ).then( (response) => {
            // Копируем данные из ответа
            this.list = [...response.data[this.model]];
            // Сортировка
            this.list.sort((a, b) => {
                   if (a.pid === b.pid) {
                      if (a.g === b.g) return a.o - b.o;
                      else return b.g - a.g;
                   } else return a.pid - b.pid;
                }
            )
            // Отключим мигание кнопки обнолвения
            setTimeout( ()=> { this.glowRefreshBtn = false }, Math.round(this.autoFetchInterval/2) )
         }).catch( (error) => fErr(error) );
      },

      // Обновить историю браузера
      updateHistory() {
          let curPureUrl = window.location.href.split('?')[0];
          window.history.replaceState(null, null, `${curPureUrl}?parentId=${this.curPid}${this.editMode ? '&editMode' : ''}`);
      },

      // Перейти на уровень вверх
      levelUp() {
         if (this.canLevelUp) {
            this.curPid = findItemById(this.curPid, this.list).pid;
            this.updateHistory();
         }
      },

      // Вход в группу/элемент справочника
      itemEnter(item) {
         if (item.g && this.hierarchyMode) {
            // Войти в группу
            this.curPid = item.id;
            this.updateHistory();
         }
         else {
            // Войти в элемент
            if (this.urlEnterElement !== '')
               // @ts-ignore:
               openWindow(`${this.urlEnterElement}/${item.id}`);
         }
      },

      // Редактирование группы/элемента справочника
      itemEdit(item) {
         if (item.g) {
            // Редактировать группу
            if (this.urlEditGroup !== '')
               // @ts-ignore:
               openWindow(`${this.urlEditGroup}/${item.id}`);
            else {
               this.$refs.inputTextDlg.show(
                   'Введите имя группы',
                   item.name,
                   (data) => {
                      // Отправка запроса на переименование группы
                      const payload = new FormData();
                      payload.append('id', item.id);
                      payload.append('newname', data);
                      axios.post(this.urlRenameGroup, payload
                      ).then( (response) => {
                         this.fetchList();
                      }).catch( (error) => console.log(error) )
                      // --
                   }
               )
            }
         } else {
            // Редактировать элемент
            if (this.urlEditElement !== '') {
            //  !!!!!!
            }
         }
      },

      // Новая группа
      newGroup() {
         if (this.hierarchyMode) {
            this.$refs.inputTextDlg.show(
                'Введите имя новой группы',
                'Новая группа',
                (data) => {
                   // Отправка запроса на создание новой группы
                   const payload = new FormData();
                   payload.append('name', data);
                   payload.append('parentid', this.curPid);
                   axios.post(this.urlCreateNewGroup, payload
                   ).then( (response) => {
                      this.fetchList();
                   }).catch( (error) => console.log(error) )
                   // --
                })
         }
      },

      // Новый элемент
      newElem() {
         if (this.hierarchyMode) {
            this.$refs.inputTextDlg.show(
                'Введите имя нового элемента',
                'Новый элемент',
                (data) => {
                   // Отправка запроса на создание новой группы
                   const payload = new FormData();
                   payload.append('name', data);
                   payload.append('parentid', this.curPid);
                   axios.post(this.urlCreateNewElement, payload
                   ).then( (response) => {
                      this.fetchList();
                   }).catch( (error) => console.log(error) )
                   // --
                })
         }
      },

      // Удалить объекты
      deleteItems() {
         if (this.canDeleteItems) {
            // Сообщение с перечнем удаляемых объектов
            const msg = this.checkedItems.reduce( (sum, i) => {
               let icon = i.g ? "fa-folder ListFolderIcon" : "fa-file ListElementIcon";
               return sum + `<i class="fas ${icon}"></i> ` + i.name + '<br>'
            }, '');
            this.$refs.confirmDlg.show(
                'Удалить эти объекты?',
                msg,
                () => {
                   // Отправка запроса на удаление объектов
                   const payload = new FormData();
                   const ids = JSON.stringify(this.checkedItems.map( i => i.id ))
                   payload.append('ids', ids);
                   axios.post(this.urlDelete, payload
                   ).then( (response) => {
                      this.fetchList();
                   }).catch( (error) => console.log(error) )
                   // --
                })
         }
      },

      // Вырезать или скопировать в буфер обмена
      clipboardPut(mode) {
         if (this.canUseClipboard) {
            this.clipMode = mode;
            this.clipboard = this.checkedItems.map(a => a);
            this.checkedItems = [];
         }
      },

      // Вставить буфер обмена
      clipboardPaste() {
         if (this.canPasteClipboard) {
            const addr = this.clipMode === 'copy' ? this.urlClone : this.urlChangeParent;
            // Отправка запроса на клонирование/перенос
            const payload = new FormData();
            const ids = JSON.stringify(this.clipboard.map( i => i.id ))
            payload.append('ids', ids);
            payload.append('newparentid', this.curPid);
            axios.post(addr, payload
            ).then( (response) => {
               this.clipboard = [];
               this.fetchList();
            }).catch( (error) => console.log(error) )
            // --
         }
      },

      // Начало перетаскивания
      dragStart(event, item) {
         event.dataTransfer.dropEffect = 'move';
         event.dataTransfer.effectAllowed = 'move';
         event.dataTransfer.setData('itemId', item.id);
         event.target.classList.add('draggedItem');
      },

      // Конец Перетаскивания
      dragEnd(event, item) {
         event.target.classList.remove('draggedItem');
      },

      // На что перетащили
      dragDrop(event, targetItem) {
         const sourceItemId = event.dataTransfer.getData('itemId');
         const sourceItem = findItemById(sourceItemId, this.list);
         event.target.classList.remove('draggedItem');
         // Отправка запроса на изменение порядка объекта
         const payload = new FormData();
         payload.append('id', sourceItem.id);
         payload.append('from', sourceItem.o);
         payload.append('to', targetItem.o);
         axios.post(this.urlChangeOrder, payload
         ).then( (response) => {
            this.fetchList();
         }).catch( (error) => console.log(error) )
      },

      // Меню объекта - перемещение вверх/вниз
      itemMenu_changeOrder(item, delta) {
         // Отправка запроса на изменение порядка объекта
         const payload = new FormData();
         payload.append('id', item.id);
         payload.append('from', item.o);
         payload.append('to', item.o + delta);
         axios.post(this.urlChangeOrder, payload
         ).then( (response) => {
            this.fetchList();
         }).catch( (error) => console.log(error) )
      },

      // Меню объекта - удалить
      itemMenu_delete(item) {
         this.$refs.confirmDlg.show(
             'Удалить объект?',
             item.name,
             () => {
                // Отправка запроса на удаление объектов
                const payload = new FormData();
                const tmp = []; tmp.push(item);
                const ids = JSON.stringify(tmp.map( i => i.id ))
                payload.append('ids', ids);
                axios.post(this.urlDelete, payload
                ).then( (response) => {
                   this.fetchList();
                }).catch( (error) => console.log(error) )
                // --
             })
      },

      // Меню объекта - копировать/вырезать
      itemMenuClipboardPut(item, mode) {
         this.clipboard = [];
         this.clipboard.push(item);
         this.clipMode = mode;
      }
   }
}
</script>


<style scoped>

   .draggedItem {
      background-color: #d2eef4;
   }

   .tooltipClipboard {
      background-color: navajowhite !important;
   }

   @keyframes glowing {
      0% { background-color: #2ba805; box-shadow: 0 0 5px #2ba805; }
      50% { background-color: #49e819; box-shadow: 0 0 20px #49e819; }
      100% { background-color: #2ba805; box-shadow: 0 0 5px #2ba805; }
   }
   .glowBtn {
      animation: glowing 1300ms 1;
   }

</style>