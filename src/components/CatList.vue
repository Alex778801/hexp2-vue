<template>

<!-- Текущая группа справочника-->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь    -->
         <Button icon="fa fa-arrow-alt-circle-up" style="padding: 0.3rem 0;" :class="{'glowBtn': glowDirBtn}" @click="levelUp"></Button>
         <div v-if="hierarchyMode">
            <span class="text-primary font-bold ml-2 cursor-pointer select-none">
               <span @dblclick="levelRoot()"> ⌘ </span>
               <span v-for="item in getPathList()" :key="item.id" @dblclick="itemEnter(item)"> {{ item.name }} / </span>
            </span>
         </div>
         <div v-else>
            <span class="text-primary font-bold ml-2"> Иерархия отключена! </span>
         </div>
      </template>
      <template #end>
         <!-- Кнопка На уровень вверх    -->
   <!--      <Button icon="fa fa-arrow-alt-circle-up" :disabled="!canLevelUp" @click="levelUp"/>-->
      </template>
   </Toolbar>

<!-- Содержимое справочника -->
   <div style="padding-bottom: 9rem;" :class="{'columns2': use2columns}">
      <div
           v-for="item in fList" :key="item.id"
      >
         <div style="height: 4rem; display: flex; align-items: center; break-inside: avoid-column; user-select: none;"
              v-touch:longtap="itemMenuContextLongTap(item)"
              v-touch:swipe.right="itemMenuContextLongTap(item)"
         >
<!--        Слой для драга    -->
            <div class="w-10 h-full" style="height: 4rem; display: flex; align-items: center;"
                :draggable="editMode && hierarchyMode"
                @dragstart="dragStart($event, item)"
                @dragend="dragEnd($event, item)"
                @dragover="dragOver($event, item)"
                @drop="dragDrop($event, item)"
                @dragover.prevent
                @dragenter.prevent
            >
               <!--  Чек  -->
               <Checkbox class="ml-3" v-if="editMode" v-model="checkedItems" :value="item"/>
               <!--  Редактирование  -->
               <i class="fa fa-pen text-primary ml-3" style="font-size: 1.4rem;" v-if="editMode" @dblclick="itemEdit(item)"></i>
               <!--  Иконка и имя  -->
               <span @dblclick="itemEnter(item)" @contextmenu="itemMenuContextClick(item)" aria-haspopup="true">
                  <i class="fa ml-3 mr-2" :class="item.grp ? 'fa-folder text-4xl text-primary-700' : 'fa-file text-3xl text-primary-300'" :style="{ 'color': itemColor(item) }"></i>
                  <span class="text-color text-center" style="vertical-align: 20%"> {{ item.name }} </span>
               </span>
            </div>
            <!--  Кнопка меню  -->
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
                  <i id="pasteBtn" class="fa fa-paste" :class="{EnBtn: dataInClipboard}"></i>
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
   <!-- Клик на 3 полосках в режиме редактирования  -->
   <Menu id="itemMenu" ref="itemMenu" :model="itemMenuContent" popup style="white-space: nowrap; width: auto; max-width: 30rem !important;"/>
   <!-- Тап или правая клавиша мыши на названии  -->
   <ContextMenu ref="itemMenuContext" :model="itemMenuContent" style="white-space: nowrap; width: auto; max-width: 30rem !important;"/>

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
} from './tools/vue-utils';
import {apolloClient} from "@/apollo-config";
import {authUtils} from "@/components/tools/auth-utils";
import {settingsUtils} from "@/components/tools/settings-utils";
import moment from "moment";

export default {
   name: 'CatList',

   components: {
      InputTextDlg,
      ConfirmDlg,
   },

   props: {
      // Наименование справочника
      model: String,
      // Строка запроса для получения справочника
      modelQ: String,
      // URL операций
      urlEditGroup: String,
      urlEditElement: String,
      urlEnterElement: String,
      // Какую группу открыть по умолчанию - URL параметр
      startPid: String,
      // Режим редактирования по умолчанию - URL параметр
      startEditMode: String,
   },

   data() {
      return {
         // Идет процесс получения данных
         fetchInProgress: false,
         // Пункты контекстного меню объекта каталога
         itemMenuContent: [
            { label: '', icon: 'fa fa-pen', command:() => { this.itemMenu_editItem() } },
            { separator: true },
            { label: 'Вверх', icon: 'fa fa-arrow-up',    command:() => { this.itemMenu_changeOrder(-1) } },
            { label: 'Вниз', icon: 'fa fa-arrow-down',   command:() => { this.itemMenu_changeOrder(1) } },
            { label: 'Удалить', icon: 'fa fa-trash',     command:() => { this.itemMenu_delete() } },
            { label: 'Копировать', icon: 'fa fa-copy',   command:() => { this.itemMenu_clipboardPut('copy')  } },
            { label: 'Вырезать', icon: 'fas fa-cut',     command:() => { this.itemMenu_clipboardPut('cut') } },
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
         // Мигание кнопки директории - на уровень вверх
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
         // return  this.hierarchyMode && this.editMode && this.clipboard.length > 0;
         return  this.hierarchyMode && this.clipboard.length > 0;
      },
      // Буфер обмена содержит данные
      dataInClipboard() {
         return this.clipboard.length > 0;
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
      },
   },

   methods: {
      // Подготовка контекстного меню
      procMenuFocusedItem(item) {
         this.menuFocusedItem = item;
         this.itemMenuContent[0].label = item.name;
         if (!this.hierarchyMode) {
            // Вверх
            this.itemMenuContent[2].disabled = true;
            // Вниз
            this.itemMenuContent[3].disabled = true;
         } else {
            // Вверх
            this.itemMenuContent[2].disabled = item.ord === 0;
            // Вниз
            const maxOrd = _(this.list)
                .filter({'pid': this.curPid, 'grp': item.grp})
                .maxBy('ord').ord;
            this.itemMenuContent[3].disabled = item.ord === maxOrd;
         }
      },

      // Контекстное меню - клик на 3 полосках в режиме редактирования
      itemMenuToggle(item) {
         this.procMenuFocusedItem(item)
         this.$refs.itemMenu.toggle(event);
      },

      // Контекстное меню - правая клавиша мыши на названии
      itemMenuContextClick(item) {
         this.procMenuFocusedItem(item)
         this.$refs.itemMenuContext.show(event);
      },

      // Контекстное меню - долгий тап
      itemMenuContextLongTap(item) {
         return (direction, mouseEvent) => {
            this.procMenuFocusedItem(item)
            this.$refs.itemMenuContext.show(event);
         }
      },

      // Сформировать путь к текущей папке
      getPathList() {
         let path = [];
         if (this.hierarchyMode) {
            let tmpPid = this.curPid;
            let item = findItemById(tmpPid, this.list);
            while (item !== undefined) {
               path.push(item);
               item = findItemById(item.pid, this.list);
            }
            path.reverse();
         }
         return path;
      },

      // Цвет элемента
      itemColor(item) {
         if (!item.grp && item.color !== undefined) {
            return item.color + " !important";
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
         // Если уже запущена функция получения данных - выходим
         if (this.fetchInProgress)
            return;
         this.fetchInProgress = true;
         // Запрос справочника
         const listQ = gql(this.modelQ);
         await apolloClient.query({query: listQ, fetchPolicy: "no-cache"}).then((response) => {
            // Копируем данные из ответа
            this.list = [...response.data[this.model+'s']];
            // Сортировка
            this.list.sort((a, b) => {
                   if (a.pid === b.pid) {
                      if (a.grp === b.grp) return a.ord - b.ord;
                      else return b.grp - a.grp;
                   } else return a.pid - b.pid;
                }
            )
            // clog(this.list);
         }).catch((error) => {
            authUtils.err(error);
         }).finally( () => {
            this.fetchInProgress = false;
         });
      },

      // Обновить историю браузера
      updateHistory() {
         // let curPureUrl = window.location.href.split('?')[0];
         // window.history.replaceState(null, null, `${curPureUrl}?parentId=${this.curPid}${this.editMode ? '&editMode' : ''}`);
         // --
         // обновим get параметры
         this.$router.push({query: {'parentId': this.curPid, 'editMode': this.editMode}});
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

      // Перейти в корень
      levelRoot() {
         if (this.hierarchyMode) {
            this.curPid = -1;
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
               this.$router.push({ path: `${this.urlEnterElement}/${item.id}` })
         }
      },

      // Редактирование группы/элемента справочника
      itemEdit(item) {
         if (item.grp) {
            // Редактировать группу
            if (this.urlEditGroup !== '')
               // @ts-ignore:
               // openWindow(`${this.urlEditGroup}/${item.id}`);
               this.$router.push({ path: `${this.urlEditGroup}/${item.id}` })
            else {
               this.$refs.inputTextDlg.show(
                   `[${item.id}] Введите имя группы`,
                   item.name,
                   false,
                   async (data) => {
                      // Отправка запроса на переименование группы
                      const mut = gql(`
                         mutation ($model: String!, $id: Int!, $name: String!) {
                            renameCatObject(model: $model, id: $id, name: $name) {
                               ok, result
                            }
                         }
                      `);
                      await apolloClient.mutate({
                         mutation: mut,
                         variables: {model: this.model, id: item.id, name: data},
                         fetchPolicy: "no-cache"
                      }).then((response) => {
                         this.$toast.add({
                            severity: 'success',
                            summary: `Группа '${data}'`,
                            detail: 'Успешно переименована',
                            life: 2000
                         });
                         this.fetchList();
                      }).catch((error) => {
                         authUtils.err(error);
                      })
                      // --
                   }
               )
            }
         } else {
            // Редактировать элемент
            if (this.urlEditElement !== '') {
               this.$router.push({ path: `${this.urlEditElement}/${item.id}` })
            }
         }
      },

      // Новая группа
      newGroup() {
         if (this.hierarchyMode) {
            this.$refs.inputTextDlg.show(
                'Введите имя новой группы',
                'Новая группа',
                false,
                async (data) => {
                   // Отправка запроса на создание новой группы
                   const mut = gql(`
                         mutation ($model: String!, $pid: Int!, $isGrp: Boolean!, $name: String!) {
                            createCatObject(model: $model, pid: $pid, isGrp: $isGrp, name: $name) {
                               ok, result
                            }
                         }
                      `);
                   await apolloClient.mutate({
                      mutation: mut,
                      variables: {model: this.model, pid: this.curPid, isGrp: true, name: data},
                      fetchPolicy: "no-cache"
                   }).then((response) => {
                      this.$toast.add({
                         severity: 'success',
                         summary: `Группа '${data}'`,
                         detail: 'Успешно создана',
                         life: 2000
                      });
                      this.fetchList();
                   }).catch((error) => {
                      authUtils.err(error);
                   })
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
                false,
                async (data) => {
                   // Отправка запроса на создание новой группы
                   const mut = gql(`
                         mutation ($model: String!, $pid: Int!, $isGrp: Boolean!, $name: String!) {
                            createCatObject(model: $model, pid: $pid, isGrp: $isGrp, name: $name) {
                               ok, result
                            }
                         }
                      `);
                   await apolloClient.mutate({
                      mutation: mut,
                      variables: {model: this.model, pid: this.curPid, isGrp: false, name: data},
                      fetchPolicy: "no-cache"
                   }).then((response) => {
                      this.$toast.add({
                         severity: 'success',
                         summary: `Элемент '${data}'`,
                         detail: 'Успешно создан',
                         life: 2000
                      });
                      this.fetchList();
                   }).catch((error) => {
                      authUtils.err(error);
                   })
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
                async () => {
                   // Отправка запроса на удаление объектов
                   const ids = JSON.stringify(this.checkedItems.map(i => i.id))
                   const mut = gql(`
                         mutation ($model: String!, $ids: String!) {
                            deleteCatObjects(model: $model, ids: $ids) {
                               ok, result
                            }
                         }
                      `);
                   await apolloClient.mutate({
                      mutation: mut,
                      variables: {model: this.model, ids: ids},
                      fetchPolicy: "no-cache"
                   }).then((response) => {
                      this.$toast.add({
                         severity: 'success',
                         summary: `${this.checkedItems.length} объекта(ов)`,
                         detail: 'успешно удалены',
                         life: 2000
                      });
                      this.checkedItems = [];
                      this.fetchList();
                   }).catch((error) => {
                      authUtils.err(error);
                   })
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
      async clipboardPaste() {
         if (this.canPasteClipboard) {
            const action = this.clipMode === 'copy' ? 'copyCatObjects' : 'changeParentCatObjects';
            const actionText = this.clipMode === 'copy' ? 'скопирован(ы)' : 'перемещен(ы)';
            // Отправка запроса на клонирование/перенос
            const ids = JSON.stringify(this.clipboard.map(i => i.id))
            const mut = gql(`
                         mutation ($model: String!, $pid: Int!, $ids: String!) {
                            ${action}(model: $model, pid: $pid, ids: $ids) {
                               ok, result
                            }
                         }
                      `);
            await apolloClient.mutate({
               mutation: mut,
               variables: {model: this.model, pid: this.curPid, ids: ids},
               fetchPolicy: "no-cache"
            }).then((response) => {
               this.$toast.add({
                  severity: 'success',
                  summary: `${this.clipboard.length} объекта(ов)`,
                  detail: `успешно ${actionText}`,
                  life: 2000
               });
               this.clipboard = [];
               this.fetchList();
            }).catch((error) => {
               authUtils.err(error);
            })
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

      // Над чем перетаскиваем
      dragOver(event, targetItem) {
         const sourceItemId = event.dataTransfer.getData('itemId');
         const sourceItem = findItemById(sourceItemId, this.list);
         // clog(sourceItem, targetItem);
      },

      // На что перетащили
      async dragDrop(event, targetItem) {
         const sourceItemId = event.dataTransfer.getData('itemId');
         const sourceItem = findItemById(sourceItemId, this.list);
         event.target.classList.remove('draggedItem');
         // Нелья перетаскивать на самого себя
         if (sourceItem.id === targetItem.id)
            return;
         // Нелья перетаксивать элемент на группу и наборот
         if (sourceItem.grp !== targetItem.grp)
            return;
         // Отправка запроса на изменение порядка объекта
         const mut = gql(`
                         mutation ($model: String!, $id: Int!, $order: Int!) {
                            changeOrderCatObject(model: $model, id: $id, order: $order) {
                               ok, result
                            }
                         }
                      `);
         await apolloClient.mutate({
            mutation: mut,
            variables: {model: this.model, id: sourceItem.id, order: targetItem.ord},
            fetchPolicy: "no-cache"
         }).then((response) => {
            this.$toast.add({
               severity: 'success',
               summary: `Элемент '${sourceItem.name}'`,
               detail: 'Успешно перемещен',
               life: 2000
            });
            this.fetchList();
         }).catch((error) => {
            authUtils.err(error);
         })
         // --
      },

      // Меню объекта - перемещение вверх/вниз
      async itemMenu_changeOrder(delta) {
         // Отправка запроса на изменение порядка объекта
         const mut = gql(`
                         mutation ($model: String!, $id: Int!, $order: Int!) {
                            changeOrderCatObject(model: $model, id: $id, order: $order) {
                               ok, result
                            }
                         }
                      `);
         await apolloClient.mutate({
            mutation: mut,
            variables: {model: this.model, id: this.menuFocusedItem.id, order: this.menuFocusedItem.ord + delta},
            fetchPolicy: "no-cache"
         }).then((response) => {
            this.$toast.add({
               severity: 'success',
               summary: `Элемент '${this.menuFocusedItem.name}'`,
               detail: 'Успешно перемещен',
               life: 2000
            });
            this.fetchList();
         }).catch((error) => {
            authUtils.err(error);
         })
         // --
      },

      // Меню объекта - удалить
      itemMenu_delete() {
         this.$refs.confirmDlg.show(
             'Удалить объект?',
             this.menuFocusedItem.name,
             async () => {
                // Отправка запроса на удаление объектов
                const tmp = [];
                tmp.push(this.menuFocusedItem);
                const ids = JSON.stringify(tmp.map(i => i.id))
                const mut = gql(`
                         mutation ($model: String!, $ids: String!) {
                            deleteCatObjects(model: $model, ids: $ids) {
                               ok, result
                            }
                         }
                      `);
                await apolloClient.mutate({
                   mutation: mut,
                   variables: {model: this.model, ids: ids},
                   fetchPolicy: "no-cache"
                }).then((response) => {
                   this.$toast.add({
                      severity: 'success',
                      summary: `${this.menuFocusedItem.name}`,
                      detail: 'успешно удален',
                      life: 2000
                   });
                   this.fetchList();
                }).catch((error) => {
                   authUtils.err(error);
                })
                // --
             })
      },

      // Меню объекта - копировать/вырезать
      itemMenu_clipboardPut(mode) {
         this.clipboard = [];
         this.clipboard.push(this.menuFocusedItem);
         this.clipMode = mode;
      },

      // Меню объекта - редактировать
      itemMenu_editItem() {
         this.itemEdit(this.menuFocusedItem);
      },
   }
}
</script>

<style scoped>

   .draggedItem {
      /*background-color: #d2eef4;*/
      background-color: var(--primary-50);
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

   a.glink:link, a.glink:visited, a.glink:hover, a.glink:active {
      color: red !important;
   }

</style>