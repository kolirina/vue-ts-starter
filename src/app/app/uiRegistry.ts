/**
 * Реестр стандартных UI-компонтентов, фильтров и директив
 */
import dayjs from "dayjs";
import "dayjs/locale/ru";
import Vue from "vue";
import Vuetify from "vuetify";
import {RU} from "../platform/locale/ru";

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
        dayjs.locale("ru");
    }
}
