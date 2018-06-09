/**
 * Реестр стандартных UI-компонтентов, фильтров и директив
 */
import {UI} from "./UI";
import Vuetify from 'vuetify';
import Vue from "vue";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {Dashboard} from "../components/dashboard";

export class UIRegistry {

    /**
     * Инициализация реестра компонентов, фильтров и директив
     */
    static init(): boolean {

        Vue.use(Vuetify);
        // компоненты
        UI.component("dashboard", Dashboard);
        UI.component("add-trade-dialog", AddTradeDialog);

        return true;
    }
}