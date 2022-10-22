/* eslint-disable */

import {createRouter, createWebHistory } from 'vue-router';

import CatProjects      from './components/CatProjects.vue';
import ElemProject      from './components/ElemProject.vue';
import CatCostTypes     from './components/CatCostTypes.vue';
import ElemCostType     from './components/ElemCostType.vue';
import CatAgents        from './components/CatAgents.vue';
import ElemAgent        from './components/ElemAgent.vue';
import LogFinOpers      from './components/LogFinOpers.vue';
// import ElemFinOper          from './components/ElemFinOper.vue';
import Settings from "@/components/Settings";

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/cat-projects',        component: CatProjects, meta: { title: 'Проекты'}, alias: '/' },
        { path: '/project/:id',         component: ElemProject, meta: { title: 'Проект'} },
        { path: '/cat-costtypes',       component: CatCostTypes, meta: { title: 'Статьи'} },
        { path: '/costtype/:id',        component: ElemCostType, meta: { title: 'Статья'} },
        { path: '/cat-agents',          component: CatAgents, meta: { title: 'Агенты'} },
        { path: '/agent/:id',           component: ElemAgent, meta: { title: 'Агент'} },
        { path: '/log-finopers/:id',    component: LogFinOpers, meta: { title: 'Журнал операций'} },
        // { path: '/finoper/:id',         component: ElemFinOper, meta: { title: 'Операция'} },
        { path: '/settings',            component: Settings, meta: { title: 'Настройки'} },
    ]
})