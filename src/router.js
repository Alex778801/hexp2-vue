/* eslint-disable */

import {createRouter, createWebHistory } from 'vue-router';

import CatProjects      from './components/CatProjects.vue';
import CatAgents        from './components/CatAgents.vue';
import CatCostTypes     from './components/CatCostTypes.vue';
import ElemProject      from './components/ElemProject.vue';
// import LogFinOpers      from './components/LogFinOpers.vue';
import Settings from "@/components/Settings";

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/cat-projects',    component: CatProjects, meta: { title: 'Проекты'}, alias: '/' },
        { path: '/project/:id',     component: ElemProject, meta: { title: 'Проект'} },
        { path: '/cat-costtypes',   component: CatCostTypes, meta: { title: 'Статьи'} },
        // { path: '/costtype/:id',    component: ElemCostType, meta: { title: 'Статья'} },
        { path: '/cat-agents',      component: CatAgents, meta: { title: 'Агенты'} },
        // { path: '/log-finopers/',   component: LogFinOpers, meta: { title: 'Журнал операций'} },
        // { path: '/finoper/',        component: FinOper, meta: { title: 'Операция'} },
        { path: '/settings',        component: Settings, meta: { title: 'Настройки'} },
    ]
})