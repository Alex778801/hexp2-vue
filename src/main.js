/* eslint-disable */

import { createApp } from 'vue';
import App from "./App.vue";
import vueRouter from './router.js';
import { apolloProvider } from "@/apollo-config";

import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Tooltip from 'primevue/tooltip';
import Menubar from 'primevue/menubar';
import Password from 'primevue/password';

import 'primevue/resources/primevue.min.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primeicons/primeicons.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
library.add(faUserSecret);

createApp(App)
    .use(vueRouter)
    .use(apolloProvider)
    .use(PrimeVue, {
    locale: {
        startsWith: 'Starts with',
        contains: 'Contains',
        notContains: 'Not contains',
        endsWith: 'Ends with',
        equals: 'Equals',
        notEquals: 'Not equals',
        noFilter: 'No Filter',
        lt: 'Less than',
        lte: 'Less than or equal to',
        gt: 'Greater than',
        gte: 'Greater than or equal to',
        dateIs: 'Date is',
        dateIsNot: 'Date is not',
        dateBefore: 'Date is before',
        dateAfter: 'Date is after',
        clear: 'Clear',
        apply: 'Apply',
        matchAll: 'Match All',
        matchAny: 'Match Any',
        addRule: 'Add Rule',
        removeRule: 'Remove Rule',
        accept: 'Yes',
        reject: 'No',
        choose: 'Choose',
        upload: 'Upload',
        cancel: 'Cancel',
        dayNames: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
        dayNamesShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
        monthNamesShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн","Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        chooseYear: 'Выберите год',
        chooseMonth: 'Выберите месяц',
        chooseDate: 'Выберите дату',
        prevDecade: 'Предыдущая декада',
        nextDecade: 'Следующая декада',
        prevYear: 'Предыдущий год',
        nextYear: 'Следующий год',
        prevMonth: 'Предыдущий месяц',
        nextMonth: 'Следующий месяц',
        prevHour: 'Предыдущий час',
        nextHour: 'Следующий час',
        prevMinute: 'Предыдущая минута',
        nextMinute: 'Следующая минута',
        prevSecond: 'Предыдущая секунда',
        nextSecond: 'Следующая секунда',
        am: 'am',
        pm: 'pm',
        today: 'Сегодня',
        weekHeader: 'Нед',
        firstDayOfWeek: 1,
        dateFormat: 'dd/mm/yy',
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
        passwordPrompt: 'Enter a password',
        emptyFilterMessage: 'No results found', // @deprecated Use 'emptySearchMessage' option instead.
        searchMessage: '{0} results are available',
        selectionMessage: '{0} items selected',
        emptySelectionMessage: 'No selected item',
        emptySearchMessage: 'No results found',
        emptyMessage: 'No available options',
        aria: {
            trueLabel: 'True',
            falseLabel: 'False',
            nullLabel: 'Not Selected',
            star: '1 star',
            stars: '{star} stars',
            selectAll: 'All items selected',
            unselectAll: 'All items unselected',
            close: 'Close',
            previous: 'Previous',
            next: 'Next'
        }
    }
})
    .use(ConfirmationService)
    .use(DialogService)
    .directive('tooltip', Tooltip)
    .component('InputText', InputText)
    .component('Button', Button)
    .component('Dialog', Dialog)
    .component('ConfirmDialog', ConfirmDialog)
    .component('Calendar', Calendar)
    .component('Dropdown', Dropdown)
    .component('Menubar', Menubar)
    .component('Password', Password)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app');

