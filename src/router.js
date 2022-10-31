/* eslint-disable */

import {createRouter, createWebHistory } from 'vue-router';

import CatProjects      from './components/CatProjects.vue';
import ElemProject      from './components/ElemProject.vue';
import CatCostTypes     from './components/CatCostTypes.vue';
import ElemCostType     from './components/ElemCostType.vue';
import CatAgents        from './components/CatAgents.vue';
import ElemAgent        from './components/ElemAgent.vue';
import LogFinOpers      from './components/LogFinOpers.vue';
import FinOper          from './components/FinOper.vue';
import Settings         from "@/components/Settings";
import ProjectInfo      from "@/components/ProjectInfo";
import Budget           from "@/components/Budget";
import Report           from "@/components/Report";

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/cat-projects',        component: CatProjects, meta: { title: 'Проекты'}, alias: '/' },
        { path: '/project/:id',         component: ElemProject, meta: { title: 'Проект'} },
        { path: '/project-info/:id',    component: ProjectInfo, meta: { title: 'Инфо проекта'} },
        { path: '/cat-costtypes',       component: CatCostTypes, meta: { title: 'Статьи'} },
        { path: '/costtype/:id',        component: ElemCostType, meta: { title: 'Статья'} },
        { path: '/cat-agents',          component: CatAgents, meta: { title: 'Агенты'} },
        { path: '/agent/:id',           component: ElemAgent, meta: { title: 'Агент'} },
        { path: '/log-finopers/:id',    component: LogFinOpers, meta: { title: 'Журнал операций'} },
        { path: '/finoper/:id',         component: FinOper, meta: { title: 'Фин операция'} },
        { path: '/budget/:id',          component: Budget, meta: { title: 'Бюджет'} },
        { path: '/settings',            component: Settings, meta: { title: 'Настройки'} },
        { path: '/report/1/:projId',    component: Report, meta: { title: 'Отчет 1'} },
    ]
})