import Vue from "vue";
import Component from "vue-class-component";
import {Emit, Model, Prop, Watch} from "vue-property-decorator";
import {State, Getter, Action, Mutation, namespace} from 'vuex-class';

Component.registerHooks([
    "beforeRouteEnter",
    "beforeRouteLeave",
    "beforeRouteUpdate"
]);

export {Component, Emit, Model, Prop, Watch};
export {Action, Getter, Mutation, namespace, State};

export class UI extends Vue {

    /**
     * Глобальная шина событий
     */
    private static eventBus = new Vue();

    /**
     * Подписывает компонент на глобальное событие
     * @param event    событие
     * @param callback обработчик события
     */
    static on(event: string | string[], callback: (...args: any[]) => any) {
        UI.eventBus.$on(event, callback);
    }

    /**
     * Отписывает компонент от глобального события
     * @param event    событие
     * @param callback обработчик события
     */
    static off(event?: string | string[], callback?: (...args: any[]) => any) {
        UI.eventBus.$off(event, callback);
    }

    /**
     * Уведомляет о наступлении глобального события
     * @param event событие
     * @param args  данные
     */
    static emit(event: string, ...args: any[]) {
        UI.eventBus.$emit(event, ...args);
    }
}