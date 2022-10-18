<template>

<!-- Текущая группа справочника-->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь    -->
         <Button icon="fa fa-arrow-alt-circle-up" style="padding: 0.3rem 0;" :class="{'glowBtn': glowDirBtn}" @click="levelUp"></Button><span class="text-primary font-bold ml-2">{{ frmCurPath() }}</span>
      </template>
      <template #end>
         <!-- Кнопка На уровень вверх    -->
   <!--      <Button icon="fa fa-arrow-alt-circle-up" :disabled="!canLevelUp" @click="levelUp"/>-->
      </template>
   </Toolbar>

<!-- Содержимое справочника -->
   <div class="mb-8" :class="{'columns2': use2columns}">
      <div
           v-for="item in fList" :key="item.id"
           :draggable="editMode"
           @dragstart="dragStart($event, item)"
           @dragend="dragEnd($event, item)"
           @drop="dragDrop($event, item)"
           @dragover.prevent
           @dragenter.prevent
      >
         <div style="height: 4rem; display: flex; align-items: center; break-inside: avoid-column">
   <!--           Чек    -->
            <Checkbox class="ml-3" v-if="editMode" v-model="checkedItems" :value="item" @click="checkboxMobileFix(item, checkedItems)" />
   <!--           Редактирование    -->
            <i class="fa fa-pen text-primary ml-3" style="font-size: 1.4rem;" v-if="editMode" @click="itemEdit(item)"></i>
   <!--           Иконка и имя    -->
            <span @click="itemEnter(item)" @contextmenu="itemMenuContextClick(item)" aria-haspopup="true">
               <i class="fa ml-3 mr-2" :class="item.grp ? 'fa-folder text-4xl text-primary-700' : 'fa-file text-3xl text-primary-300'" :style="{ 'color': itemColor(item) }"></i>
               <span class="text-color text-center" style="vertical-align: 20%"> {{ item.name }} </span>
            </span>
   <!--           Кнопка меню    -->
            <i class="fa fa-grip-lines text-primary mr-3" style="font-size: 1.5rem; margin-left: auto" v-if="editMode"
               @click="itemMenuToggle(item)" aria-haspopup="true" aria-controls="itemMenu"></i>
         </div>
      </div>
   </div>

<!-- Нижняя панель инструментов-->
   <div class="bottom-toolbar footer1">
      <Toolbar class="mx-1 p-2 gap-2 justify-content-evenly">
         <template #start>
            <div class="p-inputgroup mr-2">
               <!--        Кнопка Иерархия            -->
               <Button icon="fa fa-folder-tree" @click="hierarchyMode = !hierarchyMode" :class="{EnBtn: hierarchyMode}"/>
               <!--        Кнопка Редактирование      -->
               <Button icon="fa fa-pencil" class="butWide1" @click="editMode = !editMode" :class="{EnBtn: editMode}"/>
            </div>
            <div class="p-inputgroup mr-2">
               <!--        Кнопка Новая группа        -->
               <Button icon="fa fa-folder-plus" @click="newGroup()" :disabled="!hierarchyMode"/>
               <!--        Кнопка Новый элемент       -->
               <Button icon="fa fa-file-plus" class="butWide11" @click="newElem()" :disabled="!hierarchyMode"/>
               <!--        Кнопка Удалить             -->
               <Button icon="fa fa-trash" @click="deleteItems()" :disabled="!canDeleteItems"/>
            </div>
            <div class="p-inputgroup">
               <!--        Кнопка Вырезать            -->
               <Button icon="fas fa-cut" :disabled="!canUseClipboard" @click="clipboardPut('cut')"/>
               <!--        Кнопка Скопировать         -->
               <Button icon="fas fa-copy" :disabled="!canUseClipboard" @click="clipboardPut('copy')"/>
               <!--        Кнопка Вставить            -->
               <Button icon="fas fa-paste" :disabled="!canPasteClipboard" @click="clipboardPaste()"
                       v-tooltip.top="{value: tooltipClipboard, escape: true, class: 'tooltipClipboard'}">
                  <i id="pasteBtn" class="fa fa-paste" :class="{EnBtn: canPasteClipboard}"></i>
               </button>
            </div>
         </template>
         <template #end>
            <div class="p-inputgroup">
               <!--        Быстрый фильтр             -->
               <InputText placeholder="быстрый фильтр" style="width: 12em" v-model="qFilter"/>
               <!--        Кнопка Сброс быстрого      -->
               <Button icon="fa fa-times" @click="qFilter=''"/>
            </div>
            <div class="p-inputgroup ml-2">
               <!--        Кнопка Обновить            -->
               <Button icon="fa fa-sync" :class="{'glowBtn': glowRefreshBtn}" @click="fetchList()"/>
               <!--        Кнопка На уровень вверх    -->
               <Button icon="fa fa-arrow-alt-circle-up" class="butWide2" :disabled="!canLevelUp" @click="levelUp"/>
            </div>
         </template>
      </Toolbar>
   </div>

<!-- Контекстное меню объекта каталога  -->
   <Menu id="itemMenu" ref="itemMenu" :model="itemMenuContent" :popup="true" />
   <ContextMenu ref="itemMenuContext" :model="itemMenuContent" />

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
   checkboxMobileFixMixin,
} from './tools/vue-utils';
import {apolloClient} from "@/apollo-config";
import {authUtils} from "@/components/tools/auth-utils";
import {settingsUtils} from "@/components/tools/settings-utils";

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
         // Пункты контекстного меню объекта каталога
         itemMenuContent: [
            { label: 'Вверх', icon: 'fa fa-arrow-up' },
            { label: 'Вниз', icon: 'fa fa-arrow-down' },
            { label: 'Удалить', icon: 'fa fa-trash' },
            { label: 'Копировать', icon: 'fa fa-copy' },
            { label: 'Вырезать', icon: 'fas fa-cut' },
         ],
         // Объект каталога, на котором вызвано контекстное меню
         menuFocusedItem: {},
         // Период авто обновления справочника
         autoFetchInterval: 60000,
         // Использовать 2 колонки списка справочника
         use2columns: settingsUtils.loadCatUse2col(),
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
         //
         glowDirBtn: false,
      }
   },

   mounted() {
      // Какую группу открыть по умолчанию (код родителя)
      this.curPid = numFromUrlParam(this.startPid);
      // Режим редактирования по умолчанию
      this.editMode = boolFromUrlParam(this.startEditMode);
      // Получить справочник
      this.fetchList();
      // Авто обновление справочника по таймеру
      // setInterval(() => {
      //    clog('auto refresh');
      //    // Автообновление только, если страница активна в браузере
      //    if (document.hidden)
      //       return;
      //    this.fetchList();
      //    // Мигание кнопки обновления
      //    this.glowRefreshBtn = true;
      //    setTimeout( ()=> { this.glowRefreshBtn = false }, 300 )
      // }, this.autoFetchInterval);
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
      // Контекстное меню 1
      itemMenuToggle(item) {
         this.menuFocusedItem = item
         this.$refs.itemMenu.toggle(event);
      },

      // Контекстное меню 2
      itemMenuContextClick(item) {
         if (this.editMode) {
            this.menuFocusedItem = item
            this.$refs.itemMenuContext.show(event);
         }
      },

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
         if (!item.grp && item.color != undefined) {
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
      fetchList() {
         clog('fetchList');
         // Запрос справочника
         const listQ = gql(this.modelQ);
         apolloClient.query({query: listQ, fetchPolicy: "no-cache"} ).then( (response) => {
         // this.$apollo.query({query: listQ} ).then( (response) => {
            // Копируем данные из ответа
            this.list = [...response.data[this.model]];
            // Сортировка
            this.list.sort((a, b) => {
                   if (a.pid === b.pid) {
                      if (a.grp === b.grp) return a.ord - b.ord;
                      else return b.grp - a.grp;
                   } else return a.pid - b.pid;
                }
            )
         }).catch( (error) => authUtils.err(error) );
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
            // Мигание
            this.glowDirBtn = true;
            setTimeout(() => {this.glowDirBtn = false}, 300);
         }
      },

      // Вход в группу/элемент справочника
      itemEnter(item) {
         if (item.grp && this.hierarchyMode) {
            // Войти в группу
            this.curPid = item.id;
            this.updateHistory();
            // Мигание
            this.glowDirBtn = true;
            setTimeout(() => {this.glowDirBtn = false}, 300);
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
         if (item.grp) {
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
               let icon = i.grp ? "fa-folder text-primary-700" : "fa-file text-primary-300";
               return sum + `<i class="p-1 text-xl fa ${icon}"></i> ` + i.name + '<br>'
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
         payload.append('from', sourceItem.ord);
         payload.append('to', targetItem.ord);
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
         payload.append('from', item.ord);
         payload.append('to', item.ord + delta);
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

   .columns2 {
      column-count: 2;
      column-fill: auto;
      column-rule: 0.15rem dotted var(--primary-100);
      column-span: none;
   }

   @keyframes glowing {
      0% { background-color: var(--primary-600); box-shadow: 0 0 5px var(--primary-600); }
      50% { background-color: var(--primary-100); box-shadow: 0 0 20px var(--primary-100); }
      100% { background-color: var(--primary-600); box-shadow: 0 0 5px var(--primary-600); }
   }
   .glowBtn {
      animation: glowing 200ms 1;
   }

</style>