<template>

<!-- eslint-disable -->

<!-- Верхняя плашка -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь    -->
         <i class="fa fa-file-code text-primary text-3xl"/>
         <span class="text-primary ml-2">Бюдет '<router-link :to="'/project/' + projectId" class="text-primary font-bold my-1">{{project?.path}}{{project?.name}}</router-link>'</span>
      </template>
   </Toolbar>

<!-- Содержимое бюджета-->
   <div class="Budget" v-for="group in budget" :set="costType = group.group[0].costType">
      <div class="Header">
         <div class="ColorBox" :style="{'background-color': costType.color}"></div>
         <div class="Name" :class="{'SumOutcomeColor': costType.out, 'SumIncomeColor': !costType.out}">{{ costType.name }}</div>
         <div class="Amount" :class="{'SumOutcomeColor': costType.out, 'SumIncomeColor': !costType.out}">{{ frmSum(group.amount) }}</div>
      </div>
      <div class="Body" v-for="item in group.group"
           :draggable="dragMode"
           @dragstart="dragStart($event, item)"
           @dragend="dragEnd($event, item)"
           @drop="dragDropMoveItem($event, item)"
           @dragover.prevent
           @dragenter.prevent
      >
         <InputText class="Notes" v-model="item.notes" @change="onChaneNotes(item)"
                    :disabled="dragMode" :readonly="project.readOnly">
         </InputText>
         <InputNumber class="Amount" inputStyle="font-size: 0.9rem; width: 6rem; text-align: end"
                      v-model="item.amount" @input="onChangeAmount($event, item)" :maxFractionDigits="0" :min="0"
                      :disabled="dragMode" :readonly="project.readOnly">
         </InputNumber>
      </div>
<!--  Корзина    -->
      <div class="Header bg-primary-100" v-if="dragMode"
           @drop="dragDropDeleteZone($event)"
           @dragover.prevent
           @dragenter.prevent
         >
         <div class="ColorBox"></div>
         <div class="Name text-primary-500 font-italic font-light"> перетащите сюда для удаления </div>
         <div class="Amount fa fa-trash text-primary-500"></div>
      </div>
   </div>

<!-- Нижняя панель инструментов -->
   <Toolbar class="m-1 p-2">
      <template #start>
         <!--  Флаг изменений        -->
         <i class="fa fa-pen text-primary text-xl ml-2" v-if="dataChanged && bugDataLoaded"/>
      </template>
      <template #end>
         <!-- Конпка новая строка бюджета        -->
         <Button icon="fa fa-arrows" class="mr-1" :class="{'EnBtn': dragMode}" @click="dragMode=!dragMode"/>
         <Button icon="fa fa-plus" @click="newBudgetLine()"/>
         <!--  Кнопки действий формы      -->
         <Button label="Сохр" icon="fa fa-save" class="mx-1 p-button-success" :disabled="project.readOnly" @click="save()"/>
         <Button label="Закр" icon="fa fa-ban" class="p-button-danger" @click="cancel()"/>
      </template>
   </Toolbar>

<!-- Диалог выбора статьи новой строки бюджета -->
   <InputSelectDlg ref="InputCostTypeDlg" />

</template>

<script>
/* eslint-disable */

import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";
import {clog, findItemById, replaceNulls, swap} from "@/components/tools/vue-utils";
import {authUtils} from "@/components/tools/auth-utils";
import InputSelectDlg from "@/components/tools/InputSelectDlg";

const fp = require('lodash/fp');

export default {
   name: "Budget",
   components: {InputSelectDlg},
   data() {
      return {
         // ИД проекта
         projectId: Number(this.$route.params.id),
         // Проект
         project: {},
         // Бюджет
         budget: {},
         // Плоский бюджет
         budgetFlat: null,
         // Спикок ИД удаленных позиций бюджета
         deleted: [],
         // Режим перетаскивания
         dragMode: false,
         // Данные изменены пользователем
         dataChanged: false,
         bugDataLoaded: false,
      }
   },

   watch: {
      // Признак внесения изменений в данные
      budget: {
         handler(newVal, oldVal) {
            this.dataChanged = true;
         },
         deep: true,
      },
      // --
   },

   mounted() {
      // Загрузка данных
      this.fetchData();
   },

   methods: {

      // Форматирование суммы
      frmSum(sum) {
         return new Intl.NumberFormat('ru-RU').format(sum);
      },

      // Изменение описания
      onChaneNotes(item){
         const fi = this.budgetFlat.find( i => i.id === item.id);
         fi.notes = item.notes;
         this.applyBudgetFlat();
      },

      // Изменение суммы
      onChangeAmount(event, item) {
         const fi = this.budgetFlat.find( i => i.id === item.id);
         fi.amount = event.value;
         this.applyBudgetFlat();
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

      // На что перетащили - удаление
      dragDropDeleteZone(event) {
         event.target.classList.remove('draggedItem');
         const sourceItemId = Number(event.dataTransfer.getData('itemId'));
         const fromPos = this.budgetFlat.findIndex( i => i.id === sourceItemId );
         const fromItem = this.budgetFlat[fromPos];
         const fromCtId = fromItem.costType.id;
         const fromOrder = fromItem.order;
         // Удаляем
         this.budgetFlat.splice(fromPos, 1);
         this.budgetFlat
             .filter( i => i.costType.id === fromCtId && i.order >= fromOrder )
             .forEach( i => i.order -= 1);
         this.deleted.push(sourceItemId);
         // Применим бюджет из плоской копии
         this.applyBudgetFlat();
      },

      // На что перетащили - перемещение
      dragDropMoveItem(event, targetItem) {
         event.target.classList.remove('draggedItem');
         const sourceItemId = event.dataTransfer.getData('itemId');
         // сам на себя - отмена
         if (sourceItemId === targetItem.id)
            return;
         // --
         const fromPos = this.budgetFlat.findIndex( i => i.id === sourceItemId );
         const toPos = this.budgetFlat.findIndex( i => i.id === targetItem.id );
         const fromItem = this.budgetFlat[fromPos];
         const toItem = this.budgetFlat[toPos];
         if (fromItem.costType.id === toItem.costType.id) {
         // Перемещаем внутри одной статьи
            const ctId = fromItem.costType.id;
            const fromOrder = fromItem.order;
            const toOrder = toItem.order;
            if (fromItem.order > toItem.order ) {
               this.budgetFlat
                   .filter( i => i.costType.id === ctId && i.order >= toOrder && i.order < fromOrder )
                   .forEach( i => i.order += 1);
            } else {
               this.budgetFlat
                   .filter( i => i.costType.id === ctId && i.order <= toOrder && i.order > fromOrder )
                   .forEach( i => i.order -= 1);
            }
            fromItem.order = toOrder;
         } else {
         // Перемещаем между разными статьями
            const fromCtId = fromItem.costType.id;
            const toCtId = toItem.costType.id;
            const fromOrder = fromItem.order;
            const toOrder = toItem.order;
            // добавим в новую статью
            this.budgetFlat
                .filter( i => i.costType.id === toCtId && i.order >= toOrder )
                .forEach( i => i.order += 1);
            fromItem.costType.id = toCtId;
            fromItem.order = toOrder;
            fromItem.costType.name  = toItem.costType.name
            fromItem.costType.order = toItem.costType.order
            fromItem.costType.our   = toItem.costType.out
            fromItem.costType.color = toItem.costType.color
            // удалим из старой
            this.budgetFlat
                .filter( i => i.costType.id === fromCtId && i.order >= fromOrder )
                .forEach( i => i.order -= 1);
         }
         // Применим бюджет из плоской копии
         this.applyBudgetFlat();
      },

      // Новая строка бюджета
      newBudgetLine() {
         this.$refs.InputCostTypeDlg.show(
             "Выберите статью", "Статья", this.project.ctList, false,
             (costTypeId) => {
                const maxOrder = _(this.budgetFlat)
                    .filter( i => i.costType.id === costTypeId)
                    ?.maxBy( i => i.order)
                    ?.order || -1;
                const costType = this.project.ctList.find( i => i.id === costTypeId );
                this.budgetFlat.push( { id: -1, costType: costType, order: maxOrder + 1, amount: 0, notes: ''} );
                // Применим бюджет из плоской копии
                this.applyBudgetFlat();
             }
         )
      },

      // Применить (и пересчитать агрегатные данные) бюджет из плоской копии
      applyBudgetFlat() {
         // Сортируем по порядковым номерам
         this.budgetFlat = _(this.budgetFlat)
             .sortBy( i => [i.costType.order, i.order] )
             .value();
         // Группируем по статьям и рассчитаем суммы
         this.budget = _(replaceNulls(this.budgetFlat))
             .groupBy( 'costType.id' )
             .map( (group, amount) => ({
                group: group,
                amount: _.sumBy(group, 'amount'),
             }))
             .value();
      },

      // Обновить данные
      async fetchData() {
         // Запрос данных
         const infoQ = gql(`
            #graphql
            query ($id: Int!) {
              project(id: $id) {
                id, name, path readOnly, ctList { id, name, ord, out, color }
              },
              budget(projectId: $id) {
                id, costType { id, name, ord, out, color},
                order, amount, notes,
              }
            }
         `);
         await apolloClient.query({
            query: infoQ,
            variables: {id: this.projectId},
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Заменим null на {}
            this.project = replaceNulls(response.data.project);
            document.title = `Бюджет: ${this.project.name}`;
            // Копия бюджета без группировок
            this.budgetFlat = response.data.budget;
            // Применим бюджет из плоской копии
            this.applyBudgetFlat();
            // Костыль - нужно разобраться, какой компонент вызывает изменение данных при загрузке
            setTimeout(() => {
               this.dataChanged = false;
               this.bugDataLoaded = true;
            }, 1000);
         }).catch((error) => authUtils.err(error));
      },

      // Кнопка Сохранить
      async save() {
         // -- Мутация - запись изменений
         const updateM = gql(`
                  #graphql
                  mutation ($projectId: Int!, $budgetPack: String!, $deletedPack: String!) {
                     updateBudget (projectId: $projectId, budgetPack: $budgetPack, deletedPack: $deletedPack) {
                        ok, result
                     }
                  }
            `);
         await apolloClient.mutate({
            mutation: updateM,
            variables: {
               projectId: Number(this.projectId),
               budgetPack: JSON.stringify(this.budgetFlat),
               deletedPack: JSON.stringify(this.deleted),
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            this.$toast.add({
               severity: 'success',
               summary: `Бюджет проекта '${this.project.name}'`,
               detail: 'Успешно сохранен',
               life: 2000
            });
         }).catch((error) => {
            this.$toast.add({severity: 'error', summary: `Модуль AUTH`, detail: String(error)});
            authUtils.err(error);
         });
         // this.$router.go(-1);
      },

      // Кнопка Отмена
      cancel() {
         this.$router.go(-1);
      },
   }
}

</script>

<style lang="scss" scoped>

.Budget {
   margin: 0.3rem 0.3rem;
   margin-right: 0.5rem;

   .Header {
      height: 3rem;
      display: grid;
      grid-template-columns: 1fr 8fr 8rem;
      background-color: var(--surface-300);
      font-weight: bolder;

      .Name, .Amount {
         text-align: center;
         line-height: 3rem;
      }
   }

   .Body {
      margin: 0.25rem 0;
      display: grid;
      grid-template-columns: auto 6rem;

      .Notes {
         margin-right: 0.2rem;
         text-align: end;
         font-size: 0.9rem;
      }
   }

   .draggedItem {
      -webkit-text-fill-color: var(--primary-500);
      border: solid 0.25rem var(--primary-500);
      border-radius: 0.5rem;
   }

}







</style>