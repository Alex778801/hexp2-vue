/* eslint-disable */

import {createRouter, createMemoryHistory, createWebHistory } from 'vue-router';

import CatProjects      from './components/CatProjects.vue';
// import CatAgents        from './components/CatAgents.vue';
// import CatCostTypes     from './components/CatCostTypes.vue';
// import LogFinOpers      from './components/LogFinOpers.vue';
import Settings from "@/components/Settings";

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/cat-projects',    component: CatProjects, alias: '/' },
        // { path: '/cat-costtypes',   component: CatCostTypes },
        // { path: '/cat-agents',      component: CatProjects },
        // { path: '/log-finopers',    component: LogFinOpers },
        { path: '/settings',        component: Settings },
    ]
})