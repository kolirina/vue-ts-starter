/**
 * Реестр стандартных UI-компонтентов, фильтров и директив
 */
import dayjs from "dayjs";
import "dayjs/locale/ru";
import VeeValidate, {Validator} from "vee-validate";
import Vue from "vue";
import {ContentLoader} from "vue-content-loader";
import Vuetify from "vuetify";
import {ClickOutsideDirective} from "../platform/directives/clickOutsideDirective";
import {EnterDirective} from "../platform/directives/enterDirective";
import {Filters} from "../platform/filters/Filters";
import {RU} from "../platform/locale/ru";
import {ruLocale} from "../platform/locale/veeValidateMessages";
import {UI} from "./ui";

export class UIRegistry {

    /**
     * Инициализация реестра компонентов, фильтров и директив
     */
    static init(): void {
        Vue.use(Vuetify, {
            lang: {
                locales: {"ru": RU},
                current: "ru"
            }
        });
        UI.use(VeeValidate);

        // компоненты
        // UI.component("dashboard", Dashboard);

        // фильтры
        UI.filter("date", Filters.formatDate);
        UI.filter("declension", Filters.declension);

        // директивы
        UI.directive(ClickOutsideDirective.NAME, new ClickOutsideDirective());
        UI.directive(EnterDirective.NAME, new EnterDirective());

        // устанавливаем формат даты по умолчанию
        Validator.dictionary.setDateFormat("ru", "DD.MM.YYYY");
        // устанавливаем локализованные сообщения
        Validator.localize("ru", ruLocale);
        dayjs.locale("ru");
    }
}
