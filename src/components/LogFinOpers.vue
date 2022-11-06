<template>

<!-- Заголовок -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь, имя проекта   -->
<!--         <span class="text-primary font-bold my-1">{{project.path}}{{project.name}}</span>-->
         <router-link :to="'/project/' + projectId" class="text-primary font-bold my-1">{{project.path}}{{project.name}}</router-link>
      </template>
      <template #end>
         <!-- Сводка по фильтру   -->
         <div v-show="qFilter.length > 0" v-html="qFilterTips"></div>
      </template>
   </Toolbar>

<!-- Содержимое -->
   <div style="padding-bottom: 9rem;" class="mx-1">
      <div class="item"
           v-for="item in list" :key="item.id"
           v-show="qFilterFunc(item)"
      >
<!--     Мобильная версия    -->
         <div v-if="isMobile" class="MobileItemContainer M_OperBody"
              @dblclick="$router.push({ path: `/finoper/${item.id}`})">
               <div class="ColorBox" :style="{'background-color': item.costType?.color}"></div>
               <div class="Amount" :class="{'SumIncomeColor': !item.costType?.out}">{{ frmSum(item.amount) }}</div>
               <div class="Ts">{{ frmTs(item.ts) }}<span class="User" :style="{'color': item.ucol}">@{{item.user}}</span></div>
               <div class="Notes">{{ item.notes }}</div>
               <div class="Photo">
                  <i class="fas fa-camera" v-if="item.pq>0"></i>
               </div>
               <div class="Menu" @click="itemContextMenuToggle(item)">
                  <i class="fas fa-ellipsis-h-alt"></i>
               </div>
               <div class="CostType" :class="{'SumIncome': !item.costType?.out}">{{ item.costType?.name }}</div>
               <div class="AgentFrom">{{ item.agentFrom?.name }}</div>
               <div class="AgentTo">{{ item.agentTo?.name }}</div>
         </div>

<!--     Десктопная версия    -->
         <div v-else class="DesktopItemContainer"
              @dblclick="$router.push({ path: `/finoper/${item.id}`})"
              @contextmenu="itemContextMenuToggle(item)" aria-haspopup="true">
            <div class="ColorBox" :style="{'background-color': item.costType?.color}">
               <i class="fas fa-camera Photo" v-if="item.pq>0"/>
            </div>
            <div class="Amount " :class="{'SumIncomeColor': !item.costType?.out}">{{ frmSum(item.amount) }}</div>
            <div class="Ts">{{ frmTs2(item.ts) }}</div>
            <div class="CostType " :class="{'Income': !item.costType?.out}">{{ item.costType?.name }}</div>
            <div class="AgentFrom">{{ item.agentFrom?.name }}<br><span class="AgentTo">{{ item.agentTo?.name }}</span></div>
            <div class="User" :style="{'color': item.ucol}">{{ item.user }}</div>
            <div class="Notes">{{ item.notes }}</div>
         </div>
<!--     --    -->
      </div>
   </div>

<!-- Нижняя панель инструментов         -->
   <div class="bottom-toolbar footer1">
      <Toolbar class="mx-1 p-2 gap-2 justify-content-evenly">
         <template #start>
            <div class="p-inputgroup mr-2">
<!--           Кнопка Календарь                 -->
               <Button icon="fa fa-calendar-alt" @click="calendar()"/>
<!--           Кнопка Сортировка                -->
               <Button icon="fa fa-sort-amount-up" class="text-center text-sm w-8rem" aria-haspopup="true" aria-controls="sort_menu"
                       :label="sortModeCaptions[sortMode]" @click="sortMenuToggle"/>
               <Menu id="sortMenu" ref="sortMenu" :model="sortMenuContent" :popup="true" />
            </div>
            <div class="p-inputgroup mr-2">
<!--           Кнопка Инфо                      -->
               <Button icon="fa fa-info-circle" @click="$router.push({ path: `/project-info/${projectId}`})"/>
<!--           Кнопка Бюджет                    -->
               <Button icon="fa fa-usd-circle" @click="$router.push({ path: `/budget/${projectId}`})"/>
<!--           Кнопка Отчеты                    -->
               <Button icon="fa fa-chart-line" aria-haspopup="true" aria-controls="reportMenu" @click="reportMenuToggle"/>
               <Menu id="reportMenu" ref="reportMenu" :model="reportMenuContent" :popup="true" />
            </div>
            <div class="p-inputgroup mr-2">
<!--           Кнопка Новая операция            -->
               <Button icon="fa fa-file-plus" @click="newFinOperBtn()"/>
            </div>
         </template>
         <template #end>
            <div class="p-inputgroup">
<!--           Быстрый фильтр                   -->
               <InputText placeholder="быстрый фильтр" style="width: 12em" v-model="qFilter"/>
<!--           Кнопка Сброс быстрого фильтра    -->
               <Button icon="fa fa-times" @click="qFilter=''"/>
            </div>
            <div class="p-inputgroup ml-2">
<!--           Кнопка Обновить                  -->
               <Button icon="fa fa-sync" :class="{'glowBtn': glowRefreshBtn}" @click="fetchList()"/>
<!--           Кнопка Закрыть                  -->
               <Button icon="fa fa-window-close" :class="{'glowBtn': glowRefreshBtn}" @click="this.$router.go(-1)"/>
            </div>
         </template>
      </Toolbar>
   </div>

<!-- Контекстное меню объекта каталога  -->
   <Menu id="itemContextMenu" ref="itemContextMenu" :model="itemContextMenuContent" :popup="true" />
   <ContextMenu ref="itemContextMenu" :model="itemContextMenuContent" />

<!-- Диалог ввода строки -->
   <InputTextDlg child ref="inputTextDlg" />

<!-- Диалог подтверждения -->
   <ConfirmDlg child ref="confirmDlg" />

<!-- Диалог выбора интервала дат  -->
   <DateIntervalDlg child ref="dateIntervalDlg" />

<!-- Диалог выбора проекта для переноса операции  -->
   <InputSelectTreeDlg ref="selectProjectDlg" />

</template>

<script>

/* eslint-disable */

import gql from "graphql-tag";
import moment from "moment"
import {apolloClient} from "@/apollo-config";
import InputTextDlg from "./tools/InputTextDlg.vue";
import ConfirmDlg from "./tools/ConfirmDlg.vue";
import DateIntervalDlg from "./tools/DateIntervalDlg.vue";
import InputSelectTreeDlg from "./tools/InputSelectTreeDlg.vue";
import {authUtils} from "./tools/auth-utils";
import {clog, isMobile,} from './tools/vue-utils';


export default {
   name: 'LogFinOpers',

   components: {
      InputSelectTreeDlg,
      InputTextDlg,
      ConfirmDlg,
      DateIntervalDlg,
   },

   props: {
   },

   data() {
      return {
         // Режимы сортировки
         sortModeCaptions: ["Дата", "Статья", "Аг откуд", "Аг куда", "Автор"],
         sortMenuContent: [
            { label: 'Дата',        command:() => { this.sortList(0) } },
            { label: 'Статья',      command:() => { this.sortList(1) } },
            { label: 'Аг Откуда',   command:() => { this.sortList(2) } },
            { label: 'Аг Куда',     command:() => { this.sortList(3) } },
            { label: 'Автор',       command:() => { this.sortList(4) } },
         ],
         // Отчеты
         reportMenuContent: [
            { label: 'Отчет 1 (бюджет)',     command:() => { this.$router.push({ path: `/report/1/${this.projectId}`}) } },
            { label: 'Отчет 2 (расходы)',    command:() => { this.$router.push({ path: `/report/2/${this.projectId}`}) } },
            { label: 'Отчет 3 (комплекс)',   command:() => { this.$router.push({ path: `/report/3/${this.projectId}`}) } },
         ],
         // Контекстное меню фин операции
         itemContextMenuContent: [
            { label: 'Переместить', icon: 'fa fa-arrow-right', command:() => { this.itemChangeProject() } },
            { label: 'Копировать', icon: 'fa fa-copy',         command:() => { this.itemCopy() } },
            { label: 'Удалить', icon: 'fa fa-trash',           command:() => { this.itemDelete() } },
         ],
         // Фин операция, на которой вызвано контекстное меню
         itemContextMenuFocus: {},
         // Период авто обновления
         autoFetchInterval: 60000,
         // Проект ИД
         projectId: Number(this.$route.params.id),
         // Проект
         project: {},
         // Журнал операций
         list: [],
         // Дата начала
         tsBegin: -1,
         // Дата конца
         tsEnd: -1,
         // Режим сортировки
         sortMode: 0,
         // Быстрый фильтр
         qFilter: '',
         // Мигание кнопки обновление при обновлении
         glowRefreshBtn: false,
      }
   },

   mounted() {
      // Локаль
      moment.locale("RU");
      // Получить журнал
      this.fetchList();
      // При изменении Видимости приложения
      document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
              this.fetchList();
          }
      }, false)
      // Авто обновление журнала по таймеру
      // setInterval(() => {
      //    this.glowRefreshBtn = true;
      //    this.fetchList();
      // }, this.autoFetchInterval);
   },

   computed: {
      // Агрегатные данные по выборке быстрого фильтра
      qFilterTips() {
         let sumIncome = 0;
         let sumOutcome = 0;
         let cntrIncome = 0;
         let cntrOutcome = 0;
         const fList = this.list.filter( item => this.qFilterFunc(item) )
         fList.forEach( item => {
            if (item.costType?.out) {
               sumOutcome += Number(item.amount);
               cntrOutcome += 1;
            } else {
               sumIncome += Number(item.amount);
               cntrIncome += 1;
            }
         });
         sumIncome = this.frmSum(sumIncome);
         sumOutcome = this.frmSum(sumOutcome);
         cntrIncome = this.frmSum(cntrIncome);
         cntrOutcome = this.frmSum(cntrOutcome);
         return `<strong><span class="SumIncomeColor"> ${sumIncome} (${cntrIncome})</span> &nbsp &nbsp <span class="SumOutcomeColor">${sumOutcome} (${cntrOutcome})</span></strong>`;
      },
      // Мобильный/декстопный браузер?
      isMobile() {
         return isMobile();
      }
   },

   watch: {
   },

   methods: {
      // Меню сортировки
      sortMenuToggle(event) {
         this.$refs.sortMenu.toggle(event);
      },

      // Меню отчетов
      reportMenuToggle(event) {
         this.$refs.reportMenu.toggle(event);
      },

      // Контекстное меню фин операции
      itemContextMenuToggle(item) {
         this.itemContextMenuFocus = item
         this.$refs.itemContextMenu.show(event);
      },

      // Форматирование суммы
      frmSum(sum) {
         return new Intl.NumberFormat('ru-RU').format(sum);
      },

      // Форматировать дату
      frmTs(ts) {
         return moment.unix(ts).format("DD MMM YY ddd HH:mm");
      },

      // Форматировать дату 2
      frmTs2(ts) {
         return moment.unix(ts).format("DD MMMM YYYY ddd HH:mm:ss");
      },

      // Быстрый фильтр
      qFilterFunc(item) {
         if (this.qFilter === "") return true;
         else {
            const reg = new RegExp(this.qFilter, "i");
            return (reg.test(item.notes)
                    || reg.test(item.agentFrom?.name)
                    || reg.test(item.agentTo?.name)
                    || reg.test(item.costType?.name)
                    );
         }
      },

      // Сортировать журнал
      sortList(mode = -1) {
         if (mode > -1) {
            this.sortMode = mode;
         }
         switch (this.sortMode) {
            // Дата
            case 0:
               this.list.sort( (a, b) => b.ts - a.ts );
               break;
            // Статья
            case 1:
               this.list.sort( (a, b) => {
                  if (a.costType?.ord === b.costType?.ord) return b.ts - a.ts;
                  else return a.costType?.ord - b.costType?.ord;
               });
               break;
            // Аг Откуда
            case 2:
               this.list.sort( (a, b) => {
                  if (a.agentFrom?.ord === b.agentFrom?.ord) return b.ts - a.ts;
                  else return a.agentFrom?.ord - b.agentFrom?.ord;
               });
               break;
            // Аг Куда
            case 3:
               this.list.sort( (a, b) => {
                  if (a.agentTo?.ord === b.agentTo?.ord) return b.ts - a.ts;
                  else return a.agentTo?.ord - b.agentTo?.ord;
               });
               break;
            // Владелец
            case 4:
               this.list.sort( (a, b) => {
                  if (a.user === b.user) return b.ts - a.ts;
                  else if (a.user > b.user) return 1;
                      else return -1;
               });
               break;
         }
      },

      // Выбрать временной интервал журнала
      calendar() {
         // Сформируем начальный временной интервал
         if (this.tsBegin === -1 || this.tsEnd === -1) {
            const start = this.list[0].ts;
            let min = start, max = start;
            this.list.forEach(i => {
               min = i.ts < min ? i.ts : min;
               max = i.ts > max ? i.ts : max;
            })
            this.tsBegin = min;
            this.tsEnd = max;
         }
         // Откроем диалог выбора временного интервала и выполним обновление журнала
         this.$refs.dateIntervalDlg.show(
            new Date(this.tsBegin * 1000),
            new Date(this.tsEnd * 1000),
            undefined,
            false,
            (begin, end) => {
               this.tsBegin = moment(begin).unix();
               this.tsEnd = moment(end).unix();
               this.fetchList();
            })
      },

      // Получить журнал
      async fetchList() {
         // clog('fetchList - finopes');
         // Запрос журнала
         const listQ = gql(`
            #graphql
            query ($projectId: Int!, $tsBegin: Int!, $tsEnd: Int!) {
               project(id: $projectId) {
                  id, name, path,
               },
               finopers(projectId: $projectId, tsBegin: $tsBegin, tsEnd: $tsEnd) {
                  id,
                  ts,
                  costType { id, name, ord, out, color },
                  agentFrom { id, name, ord },
                  agentTo { id, name, ord },
                  user,
                  ucol,
                  amount,
                  notes,
                  pq,
              }
            }
         `);
         await apolloClient.query({
               query: listQ,
               variables: {
                  projectId: this.projectId,
                  tsBegin: this.tsBegin,
                  tsEnd: this.tsEnd,
               },
               fetchPolicy: "no-cache"
            }).then((response) => {
            // Копируем данные из ответа
            this.project = response.data.project;
            this.list = [...response.data.finopers];
            document.title = `Журнал: ${this.project.name}`;
            // Сортировка
            this.sortList();
         }).catch((error) => {
            this.$toast.add({severity: 'error', summary: `Модуль AUTH`, detail: String(error)});
            authUtils.err(error)
         });
      },

      // Сформировать представление (имя) сфокусированной операции - для контекстного меню
      frmFocusedItemName(){
         const item = this.itemContextMenuFocus;
         return `${this.frmTs(item.ts)} [${item.costType?.name}] = ${this.frmSum(item.amount)}`;
      },

      // Переместить операцию в другой проект
      async itemChangeProject() {
         // -------------------------------------------------------
         // Запрос дерева проектов
         const treeQ = gql(`
            #graphql
            query {
                projectsTree
            }
         `);
         await apolloClient.query({
            query: treeQ,
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Подготовка списка выбора
            const options = JSON.parse(response.data.projectsTree);
            // -------------------------------------------------------
            // Диалог выбора проекта
            this.$refs.selectProjectDlg.show(
                'Выберите целевой проект для переноса:',
                'список проектов...',
                options,
                false,
                false,
                async projectId => {
                   // Проверим валидность целевого проекта
                   if (projectId === this.projectId) {
                      this.$toast.add({
                         severity: 'error',
                         summary: `Перемещение НЕ выполнено`,
                         detail: 'Проект для переноса и текущий проект должны различаться!',
                         life: 0
                      });
                      return;
                   }
                   // -------------------------------------------------------
                   // Мутация на перенос фин операции в другой порект
                   const moveM = gql(`
                   #graphql
                   mutation ($id: Int!, $projectId: Int!) {
                      moveFinoper(id: $id, projectId: $projectId) {
                        ok, result
                      }
                   }
                   `);
                   await apolloClient.mutate({
                      mutation: moveM,
                      variables: {
                         id: Number(this.itemContextMenuFocus.id),
                         projectId: projectId,
                      },
                      fetchPolicy: "no-cache"
                   }).then((response) => {
                      // Результат переноса
                      this.$toast.add({
                         severity: 'success',
                         summary: `Операция '${this.frmFocusedItemName()}'`,
                         detail: 'Успешно перемещен',
                         life: 2000
                      });
                      this.fetchList();
                   }).catch((error) => {
                      this.$toast.add({severity: 'error', summary: `Модуль AUTH`, detail: String(error)});
                      authUtils.err(error);
                   })
                });
            // --
         }).catch((error) => console.log(error))
      },

      // Копировать операцию
      async itemCopy() {
         // Мутация на копироване (клонирование) фин операции
         const copyM = gql(`
                   #graphql
                   mutation ($id: Int!) {
                      copyFinoper(id: $id) {
                        ok, result
                      }
                   }
                   `);
         await apolloClient.mutate({
            mutation: copyM,
            variables: {
               id: Number(this.itemContextMenuFocus.id),
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            this.$toast.add({
               severity: 'success',
               summary: `Операция '${this.frmFocusedItemName()}'`,
               detail: 'Успешно скопирована (имя начинается со слова КОПИЯ)',
               life: 2000
            });
            this.fetchList();
         }).catch((error) => {
            this.$toast.add({severity: 'error', summary: `Модуль AUTH`, detail: String(error)});
            authUtils.err(error);
         })
      },

      // Удалить операцию
      itemDelete() {
         this.$refs.confirmDlg.show(
             'Удалить фин операцию?',
             this.frmFocusedItemName(),
             async () => {
                // Мутация на удаление фин операции
                const delM = gql(`
                   #graphql
                   mutation ($id: Int!) {
                      deleteFinoper(id: $id) {
                        ok, result
                      }
                   }
                   `);
                await apolloClient.mutate({
                   mutation: delM,
                   variables: {
                      id: Number(this.itemContextMenuFocus.id),
                   },
                   fetchPolicy: "no-cache"
                }).then((response) => {
                   this.$toast.add({
                      severity: 'success',
                      summary: `Операция '${this.frmFocusedItemName()}'`,
                      detail: 'Успешно удалена',
                      life: 2000
                   });
                   this.fetchList();
                }).catch((error) => {
                   this.$toast.add({severity: 'error', summary: `Модуль AUTH`, detail: String(error)});
                   authUtils.err(error);
                })
                // --
             })
      },

      // Новая операция
      async newFinOperBtn() {
         const copyM = gql(`
            #graphql
            mutation ($projectId: Int!) {
               createFinoper (projectId: $projectId) {
                  ok, result, newOperId
               }
            }
         `);
         await apolloClient.mutate({
            mutation: copyM,
            variables: {
               projectId: Number(this.projectId),
            },
            fetchPolicy: "no-cache"
         }).then((response) => {
            // Переход в созданную фин операцию
            const newOperId = response.data.createFinoper.newOperId;
            this.$router.push({ path: `/finoper/${newOperId}`})
         }).catch((error) => {
            this.$toast.add({severity: 'error', summary: `Модуль AUTH`, detail: String(error)});
            authUtils.err(error);
         })
      }
   }
}
</script>


<style lang="scss" scoped>

.DesktopItemContainer {
   width: 100%;
   display: grid;
   grid-template-columns: 1fr 2fr 3fr 4fr 4fr 2fr 7fr;
   border-bottom: 0.1rem solid var(--surface-300);
   min-height: 4.25rem;
   align-items: center;

   * {
      padding: 0.4rem 0.4rem;
   }

   .ColorBox {
      height: 100%;
      text-align: center;
   }

   .Photo {
      margin-top: 0.8rem;
      color: var(--text-color);
      text-shadow: -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff, 1px 1px 0 #ffffff;
   }

   .Amount {
      text-align: end;
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--outcomeColor);
   }

   .Ts {
      text-align: center;
      font-size: 1rem;
      color: var(--surface-500);
   }

   .CostType {
      text-align: start;
      font-size: 1rem;
      font-weight: bold;
      color: var(--text-color);
   }

   .AgentFrom {
      text-align: start;
      font-size: 1rem;
      font-weight: bolder;
      color: var(--surface-600);
   }

   .AgentTo {
      font-weight: normal;
   }

   .User {
      text-align: center;
      font-size: 0.9rem;
   }

   .Notes {
      text-align: start;
      font-size: 0.95rem;
      color: var(--surface-700);;
      line-height: 1.1rem;
      max-height: 3.3em;
      overflow: hidden;
      text-overflow: ellipsis;
   }
}

.MobileItemContainer {
   position: relative;
   height: 5.2rem;
   border-bottom: 0.1rem solid var(--surface-300);

   .ColorBox {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 1rem;
      height: 100%;
   }

   .Amount {
      text-align: start;
      font-size: 1.3rem;
      font-weight: bold;
      color: #8a2128;
      position: absolute;
      left: 1.4rem;
      top: 0.3rem;
   }

   .Ts {
      text-align: start;
      font-size: 0.95rem;
      color: var(--surface-500);
      position: absolute;
      left: 2rem;
      top: 2.2rem;
   }

   .User {}

   .Notes {
      text-align: start;
      font-size: 0.85rem;
      font-style: italic;
      color: var(--surface-700);
      position: absolute;
      left: 3.2rem;
      top: 3.7rem;
      line-height: 1.1rem;
      width: 85%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
   }

   .Photo {
      text-align: start;
      font-size: 1rem;
      color: lightgray;
      text-shadow: -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff, 1px 1px 0 #ffffff;
      position: absolute;
      left: 0.6rem;
      top: 3.2rem;
   }

   .Menu {
      text-align: center;
      font-size: 1.1rem;
      font-weight: bold;
      color: var(--primary-100);
      position: absolute;
      left: 50%;
      top: 0;
   }

   .CostType {
      text-align: end;
      font-size: 1rem;
      font-weight: bold;
      color: black;
      position: absolute;
      right: 1rem;
      top: 0.3rem;
   }

   .AgentFrom {
      text-align: end;
      font-size: 0.9rem;
      line-height: 110%;
      font-weight: bold;
      color: var(--surface-500);
      position: absolute;
      right: 1rem;
      top: 2rem;
      height: 2rem;
      display: table;
   }

   .AgentTo {
      text-align: end;
      font-size: 0.9rem;
      line-height: 110%;
      color: var(--surface-500);
      position: absolute;
      right: 1rem;
      top: 3.1rem;
      height: 2rem;
      display: table;
   }
}

</style>