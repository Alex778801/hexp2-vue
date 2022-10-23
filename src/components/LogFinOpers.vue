<template>

<!-- Заголовок -->
   <Toolbar class="m-1 p-2 top-infobar">
      <template #start>
         <!-- Путь, имя проекта   -->
         <span class="text-primary font-bold ml-2">{{project.path}}{{project.name}}</span>
      </template>
      <template #end>
         <!-- Сводка по фильтру   -->
         <div class="" style="background-color: #edfbff; color: #70aaef" v-show="qFilter.length > 0" v-html="qFilterTips"></div>
      </template>
   </Toolbar>



<!-- Содержимое -->
   <div class="container-fluid" style="padding-bottom: 18em; min-height: 50em">
      <div class="item"
           v-for="item in list" :key="item.id"
           v-show="qFilterFunc(item)"
      >
<!--     Мобильная версия    -->
         <div v-if="isMobile" class="OperCont row align-items-center text-center border-bottom" @dblclick="openWin(`/finopers/oper/-1/${item.id}`)">
            <div class="M_OperBody col-12">
               <div class="M_CBox" :style="{'background-color': item.color}"></div>
               <div class="M_Sum" :class="{'SumIncome': !item.out}"> {{ frmSum(item.sum) }} </div>
               <div class="M_Date"> {{ frmTs(item.ts) }} <span class="M_User" :style="{'color': item.ucol}">@{{item.user}}</span></div>
               <div class="M_Notes"> {{ item.notes }} </div>
               <div class="M_Photo">
                  <i class="fas fa-camera" :hidden="item.pq===0"></i>
               </div>
               <div class="M_ActMenu">
                   <i class="fas fa-ellipsis-h-alt" data-bs-toggle="dropdown"></i>
                   <ul class="dropdown-menu" style="background-color: #d2eef4">
                       <li><button class="dropdown-item text-primary" type="button" @click="moveItem(item)"> <i class="fas fa-arrow-right"></i> Переместить</button></li>
                       <li><button class="dropdown-item text-primary" type="button" @click="copyItem(item)"> <i class="fas fa-copy"></i> Копировать</button></li>
                       <li><button class="dropdown-item text-primary" type="button" @click="deleteItem(item)"> <i class="fas fa-trash"></i> Удалить</button></li>
                   </ul>
               </div>
               <div class="M_CostType" :class="{'SumIncome': !item.out}"> {{ item.ct }} </div>
               <div class="M_Agent"><div class="M_Agent_Child"> {{ item.agF }} <br><span class="M_AgentTo"> {{ item.agT }} </span></div></div>
            </div>
         </div>
<!--     Десктопная версия    -->
         <div v-else class="OperCont row align-items-center text-center border-bottom" @dblclick="openWin(`/finopers/oper/-1/${item.id}`)">
            <div class="D_CBox col-1" :style="{'background-color': item.color}">
               <i class="D_Photo fas fa-camera" :hidden="item.pq===0"></i>
            </div>
            <div class="D_Sum col-1" :class="{'SumIncome': !item.out}"> {{ frmSum(item.sum) }} </div>
            <div class="D_Date col-2"> {{ frmTs2(item.ts) }} </div>
            <div class="D_CostType col-2" :class="{'SumIncome': !item.out}"> {{ item.ct }} </div>
            <div class="D_Agent col-2"> {{ item.agF }} <br><span class="D_AgentTo"> {{ item.agT }}</span></div>
            <div class="D_User col-1" :style="{'color': item.ucol}"> {{ item.user }} <br>
                <button class="btn btn-outline-info dropdown-toggle" type="button"
                        data-bs-toggle="dropdown" style="font-size: 0.5em">...</button>
                <ul class="dropdown-menu" style="background-color: #d2eef4">
                    <li><button class="dropdown-item text-primary" type="button" @click="moveItem(item)"> <i class="fas fa-arrow-right"></i> Переместить</button></li>
                    <li><button class="dropdown-item text-primary" type="button" @click="copyItem(item)"> <i class="fas fa-copy"></i> Копировать</button></li>
                    <li><button class="dropdown-item text-primary" type="button" @click="deleteItem(item)"> <i class="fas fa-trash"></i> Удалить</button></li>
                </ul>
            </div>
            <div class="D_Notes col-3"> {{ item.notes }} </div>
         </div>
<!--     --    -->
      </div>
   </div>



<!-- Нижняя панель инструментов                 -->
   <div class="bottom-toolbar footer1">
      <Toolbar class="mx-1 p-2 gap-2 justify-content-evenly">
         <template #start>
            <div class="p-inputgroup mr-2">
<!--           Кнопка Календарь                 -->
               <Button icon="fa fa-calendar-alt" @click="calendar()"/>
<!--           Кнопка Сортировка                -->
               <Button icon="fa fa-sort-amount-up" class="text-center w-9rem" aria-haspopup="true" aria-controls="sort_menu"
                       :label="sortMenuContent[sortMode].label" @click="sortMenuToggle"/>
               <Menu id="sortMenu" ref="sortMenu" :model="sortMenuContent" :popup="true" />
            </div>
            <div class="p-inputgroup mr-2">
<!--           Кнопка Инфо                      -->
               <Button icon="fa fa-info-circle" @click="infoBtn()"/>
<!--           Кнопка Бюджет                    -->
               <Button icon="fa fa-usd-circle" @click="budgetBtn()"/>
<!--           Кнопка Отчеты                    -->
               <Button icon="fa fa-chart-line" aria-haspopup="true" aria-controls="reportMenu" @click="reportMenuToggle"/>
               <Menu id="reportMenu" ref="reportMenu" :model="reportMenuContent" :popup="true" />
            </div>
         </template>
         <template #end>
            <div class="p-inputgroup">
<!--           Быстрый фильтр                   -->
               <InputText placeholder="быстрый фильтр" style="width: 12em" v-model="qFilter"/>
<!--           Кнопка Сброс быстрого abkmnhf    -->
               <Button icon="fa fa-times" @click="qFilter=''"/>
            </div>
            <div class="p-inputgroup ml-2">
<!--           Кнопка Обновить                  -->
               <Button icon="fa fa-sync" :class="{'glowBtn': glowRefreshBtn}" @click="fetchList()"/>
            </div>
            <div class="p-inputgroup ml-2">
<!--           Кнопка Новая операция            -->
               <Button icon="fa fa-file-plus" class="butWide2" @click="newFinOperBtn()"/>
            </div>
         </template>
      </Toolbar>
   </div>

<!-- Диалог ввода строки -->
   <InputTextDlg child ref="inputTextDlg" />

<!-- Диалог подтверждения -->
   <ConfirmDlg child ref="confirmDlg" />

<!-- Диалог выбора интервала дат  -->
   <DateIntervalDlg child ref="dateIntervalDlg" />

<!-- Диалог выбора проекта для переноса операции  -->
   <InputSelectDlg ref="selectProjectDlg" />

</template>

<script>

/* eslint-disable */

import gql from "graphql-tag";

const axios = require('axios');
// axios.defaults.xsrfCookieName = 'csrftoken';
// axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";


import moment           from "moment"
import { apolloClient } from "@/apollo-config";
import InputTextDlg     from "./tools/InputTextDlg.vue";
import ConfirmDlg       from "./tools/ConfirmDlg.vue";
import DateIntervalDlg  from "./tools/DateIntervalDlg.vue";
import InputSelectDlg   from "./tools/InputSelectDlg.vue";
import { authUtils }    from "./tools/auth-utils";
import {clog, fErr, isMobile, ns,} from './tools/vue-utils';

export default {
   name: 'LogFinOpers',

   components: {
      InputSelectDlg,
      InputTextDlg,
      ConfirmDlg,
      DateIntervalDlg,
   },

   props: {
   },

   data() {
      return {
         // Режимы сортировки
         sortModeCaptions: ["Дата", "Статья", "Аг Откуда", "Аг Куда", "Автор"],
         sortMenuContent: [
            { label: 'Дата', command:() =>      { this.sortList(0) } },
            { label: 'Статья', command:() =>    { this.sortList(1) } },
            { label: 'Аг Откуда', command:() => { this.sortList(2) } },
            { label: 'Аг Куда', command:() =>   { this.sortList(3) } },
            { label: 'Автор', command:() =>     { this.sortList(4) } },
         ],
         // Отчеты
         reportMenuContent: [
            { label: 'Отчет 1 (бюджет)', command:() =>      { this.report(1) } },
            { label: 'Отчет 2 (расходы)', command:() =>      { this.report(2) } },
            { label: 'Отчет 3 (комплекс)', command:() =>      { this.report(3) } },
         ],
         // Период авто обновления
         autoFetchInterval: 60000,
         // Проект ИД
         projectId: Number(this.$route.params.id),
         // Проект
         project: {},
         // Журнал операций
         list: [],
         // Дата начала
         tsBegin: "*",
         // Дата конца
         tsEnd: "*",
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
            if (item.out) {
               sumOutcome += item.sum;
               cntrOutcome += 1;
            } else {
               sumIncome += item.sum;
               cntrIncome += 1;
            }
         });
         sumIncome = this.frmSum(sumIncome);
         sumOutcome = this.frmSum(sumOutcome);
         cntrIncome = this.frmSum(cntrIncome);
         cntrOutcome = this.frmSum(cntrOutcome);
         return `<strong><span class="SumIncome"> ${sumIncome} (${cntrIncome})</span> &nbsp &nbsp <span class="SumOutcome">${sumOutcome} (${cntrOutcome})</span></strong>`;
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
            return (reg.test(ns(item.notes))
                    || reg.test(ns(item.agentFrom))
                    || reg.test(ns(item.agentTo.name))
                    || reg.test(ns(item.costType.name))
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
                  if (a.costType.ord === b.costType.ord ) return b.ts - a.ts;
                  else return a.costType.ord - b.costType.ord;
               });
               break;
            // Аг Откуда
            case 2:
               this.list.sort( (a, b) => {
                  if (a.agentFrom.ord === b.agentFrom.ord ) return b.ts - a.ts;
                  else return a.agentFrom.ord - b.agentFrom.ord;
               });
               break;
            // Аг Куда
            case 3:
               this.list.sort( (a, b) => {
                  if (a.agentTo.ord === b.agentTo.ord ) return b.ts - a.ts;
                  else return a.agentTo.ord - b.agentTo.ord;
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
         if (this.tsBegin === '*' || this.tsEnd === '*') {
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
            (begin, end) => {
               this.tsBegin = moment(begin).unix();
               this.tsEnd = moment(end).unix();
               // clog(this.tsBegin, this.tsEnd);
               this.fetchList();
            })
      },

      // Получить справочник
      async fetchList() {
         clog('fetchList - finopes');
         // Запрос журнала
         const listQ = gql(`
            query ($projectId: Int!) {
               project(id: $projectId) {
                  id, name, path,
               },
               finopers(projectId: $projectId) {
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
                  projectId: this.projectId
               },
               fetchPolicy: "no-cache"
            }).then((response) => {
            // Копируем данные из ответа
            this.project = response.data.project;
            this.list = [...response.data.finopers];
            // Сортировка
            this.sortList();
         }).catch((error) => authUtils.err(error));
      },

      // Открыть внешнюю ссылку
      openWin(link) {
         // @ts-ignore
         openWindow(link);
      },

      // Закрыть журнал
      closeWin() {
         // @ts-ignore
         closeWindow();
      },

      // Переместить операцию в другой проект
      moveItem(item) {
         axios.get("/projects/gettree")
            .then( (response) => {
               // Подготовка списка выбора
               const options = [{}];
               response.data.forEach( proj => {
                  if (proj.id === this.projectId)
                     return;
                  options.push({'id': proj.id, 'name': proj.name});
               });
               // Диалог выбора проекта
               this.$refs.selectProjectDlg.show(
                  'Выберите целевой проект для переноса:',
                  'список проектов...',
                   options,
                  result => {
                     // Запрос к серверу на перенос проекта
                     axios.get(`/finopers/moveoper/${item.id}/${result}`
                     ).then( (response) => {
                        clog(response);
                        this.fetchList();
                     }).catch( (error) => console.log(error) )
               });
               // --
         }).catch( (error) => console.log(error) )
      },

      // Копировать операцию
      copyItem(item) {
          axios.get(`/finopers/copyoper/${item.id}`
          ).then( (response) => {
             this.fetchList();
          }).catch( (error) => console.log(error) )
      },

      // Удалить операцию
      deleteItem(item) {
         this.$refs.confirmDlg.show(
             'Удалить фин операцию?',
             `${this.frmTs(item.ts)} [${item.ct}] = ${this.frmSum(item.sum)}`,
             () => {
                // Отправка запроса на удаление
                axios.get(`/finopers/deloper/${item.id}`
                ).then( (response) => {
                   this.fetchList();
                }).catch( (error) => console.log(error) )
                // --
             })
      },

   }
}
</script>


<style scoped>

   @keyframes glowing {
      0% { background-color: #2ba805; box-shadow: 0 0 5px #2ba805; }
      50% { background-color: #49e819; box-shadow: 0 0 20px #49e819; }
      100% { background-color: #2ba805; box-shadow: 0 0 5px #2ba805; }
   }
   .glowBtn {
      animation: glowing 1300ms 1;
   }

</style>