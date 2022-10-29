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
      <div class="Body" v-for="item in group.group">
         <div class="Drag fa fa-hand-pointer text-center"></div>
         <InputText class="Notes" v-model="item.notes" ></InputText>
         <InputNumber class="Amount" inputStyle="font-size: 0.9rem; width: 6rem; text-align: end" v-model="item.amount" :maxFractionDigits="0"></InputNumber>
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
         <Button icon="fa fa-plus" @click="newBudgetLine()"/>
         <!--  Кнопки действий формы      -->
         <Button label="Сохран" icon="fa fa-save" class="mx-2 p-button-success" :disabled="project.readOnly" @click="save()"/>
         <Button label="Отмена" icon="fa fa-ban" class="p-button-danger" @click="cancel()"/>
      </template>
   </Toolbar>

</template>

<script>
/* eslint-disable */

import gql from "graphql-tag";
import {apolloClient} from "@/apollo-config";
import {clog, replaceNulls} from "@/components/tools/vue-utils";
import {authUtils} from "@/components/tools/auth-utils";

const fp = require('lodash/fp');

export default {
   name: "Budget",

   data() {
      return {
         // ИД проекта
         projectId: Number(this.$route.params.id),
         // Проект
         project: {},
         // Бюджет
         budget: {},
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

      // Обновить данные
      async fetchData() {
         // Запрос данных
         const infoQ = gql(`
            #graphql
            query ($id: Int!) {
              project(id: $id) {
                id
                name
                path
                readOnly
              },
              budget(projectId: $id) {
                id,
                costType { id, name, ord, out, color, }
                order,
                amount,
                notes,
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
            // Сгруппируем по статьям и рассчитаем суммы
            this.budget = _(replaceNulls(response.data.budget))
                .groupBy( 'costType.id' )
                .map( (group, amount) => ({
                   group: group,
                   amount: _.sumBy(group, 'amount'),
                }))
                .value()
            clog(this.budget)
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
                  mutation ($id: Int!, $projinfo: String!) {
                     updateProjectInfo (id: $id, projinfo: $projinfo) {
                        ok, result
                     }
                  }
            `);
         await apolloClient.mutate({
            mutation: updateM,
            variables: {
               id: Number(this.projectId),
               projinfo: this.project.info,
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
         this.$router.go(-1);
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
      margin-top: 0.5rem;
      height: 3rem;
      display: grid;
      grid-template-columns: 1fr 8fr 7rem;
      background-color: var(--surface-300);
      font-weight: bolder;

      .Name, .Amount {
         text-align: center;
         line-height: 3rem;
      }
   }

   .Body {
      margin-top: 0.5rem;
      display: grid;
      grid-template-columns: 2rem auto 6rem;

      .Drag {
         background-color: var(--surface-400);
         color: var(--surface-200);
         border-radius: 0.4rem;
         margin-right: 0.2rem;
         line-height: 2rem;
      }

      .Notes {
         margin-right: 0.2rem;
         text-align: end;
         font-size: 0.9rem;
      }

      &:last-child {
         padding-bottom: 1rem;
      }
   }

}







</style>