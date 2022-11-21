/* eslint-disable */

import Vue, { createApp } from 'vue';
import App from "./App.vue";
import vueRouter from './router.js';
import { apolloProvider } from "@/apollo-config";

import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Tooltip from 'primevue/tooltip';
import Menubar from 'primevue/menubar';
import Password from 'primevue/password';
import Card from 'primevue/card';
import Slider from 'primevue/slider';
import Toolbar from 'primevue/toolbar';
import ScrollPanel from 'primevue/scrollpanel';
import Checkbox from 'primevue/checkbox';
import ContextMenu from 'primevue/contextmenu';
import Menu from 'primevue/menu';
import Toast from 'primevue/toast';
import RadioButton from 'primevue/radiobutton';
import Fieldset from 'primevue/fieldset';
import TreeSelect from 'primevue/treeselect';
import InputNumber from 'primevue/inputnumber';
import MultiSelect from 'primevue/multiselect';
import ColorPicker from 'primevue/colorpicker';
import Textarea from 'primevue/textarea';
import Carousel from 'primevue/carousel';
import FileUpload from 'primevue/fileupload';
import Image from 'primevue/image';
import ConfirmPopup from 'primevue/confirmpopup';
import Panel from 'primevue/panel';
import Chart from 'primevue/chart';
import InputSwitch from 'primevue/inputswitch';

import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

import '/node_modules/primeflex/primeflex.css'

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
library.add(faUserSecret);

createApp(App)
    .use(vueRouter)
    .use(apolloProvider)
    .use(PrimeVue, {
    locale: {
        startsWith: 'Начинается',
        contains: 'Содержит',
        notContains: 'НЕ содержит',
        endsWith: 'Заканчивается',
        equals: 'Равно',
        notEquals: 'НЕ равно',
        noFilter: 'Нет фильтра',
        lt: 'Меньше',
        lte: 'Меньше или равно',
        gt: 'Больше',
        gte: 'Больше или равно',
        dateIs: 'Дата равна',
        dateIsNot: 'Дата не равна',
        dateBefore: 'Дата до',
        dateAfter: 'Дата после',
        clear: 'Очистить',
        apply: 'Применить',
        matchAll: 'Соответсвует всем',
        matchAny: 'Соответсвтует любому',
        addRule: 'Добавить правило',
        removeRule: 'Удалить правило',
        accept: 'Да',
        reject: 'Нет',
        choose: 'Выбор',
        upload: 'Загрузка',
        cancel: 'Отмена',
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
        weak: 'Слабый',
        medium: 'Средний',
        strong: 'Сильный',
        passwordPrompt: 'Введите пароль',
        emptyFilterMessage: 'Результаты не найдены', // @deprecated Use 'emptySearchMessage' option instead.
        searchMessage: '{0} найдено результатов',
        selectionMessage: '{0} выбрано элементов',
        emptySelectionMessage: 'Элементы не выбраны',
        emptySearchMessage: 'Результаты не найдены',
        emptyMessage: 'Нет доступных параметров',
        aria: {
            trueLabel: 'Истина',
            falseLabel: 'Ложь',
            nullLabel: 'Не выбрано',
            star: '1 звезда',
            stars: '{star} звезд',
            selectAll: 'Выбрать все элементы',
            unselectAll: 'Сбросить все элементы',
            close: 'Закрыть',
            previous: 'Предыдущий',
            next: 'Следующий'
        }
    }
})
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .directive('tooltip', Tooltip)
    .component('font-awesome-icon', FontAwesomeIcon)
    .component('InputText', InputText)
    .component('Button', Button)
    .component('Dialog', Dialog)
    .component('ConfirmDialog', ConfirmDialog)
    .component('Calendar', Calendar)
    .component('Dropdown', Dropdown)
    .component('Menubar', Menubar)
    .component('Password', Password)
    .component('Card', Card)
    .component('Slider', Slider)
    .component('Toolbar', Toolbar)
    .component('ScrollPanel', ScrollPanel)
    .component('Checkbox', Checkbox)
    .component('ContextMenu', ContextMenu)
    .component('Menu', Menu)
    .component('Toast', Toast)
    .component('RadioButton', RadioButton)
    .component('Fieldset', Fieldset)
    .component('TreeSelect', TreeSelect)
    .component('InputNumber', InputNumber)
    .component('MultiSelect', MultiSelect)
    .component('ColorPicker', ColorPicker)
    .component('Textarea', Textarea)
    .component('Carousel', Carousel)
    .component('FileUpload', FileUpload)
    .component('Image', Image)
    .component('ConfirmPopup', ConfirmPopup)
    .component('Panel', Panel)
    .component('Chart', Chart)
    .component('InputSwitch', InputSwitch)
    .mount('#app');
