/* eslint-disable */

import {createRouter, createMemoryHistory, createWebHistory } from 'vue-router';

import CatProjects      from './components/CatProjects.vue';
import Settings from "@/components/Settings";
// import CatAgents        from './components/CatAgents.vue';
// import CatCostTypes     from './components/CatCostTypes.vue';
// import LogFinOpers      from './components/LogFinOpers.vue';

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/cat-projects',   component: CatProjects, alias: '/' },
        { path: '/cat-agents',     component: CatProjects },
        // { path: '/cat-costtypes',  component: CatCostTypes },
        // { path: '/log-finopers',   component: LogFinOpers },
        { path: '/settings',       component: Settings },
    ]
})