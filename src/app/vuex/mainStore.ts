import {Container} from "typescript-ioc";
import {ActionContext, Module} from "vuex";
import {ActionType} from "./actionType";
import {GetterType} from "./getterType";
import {MutationType} from "./mutationType";
import {TestService} from "../services/testService";

/** Сервис работы с настройками */
const systemPropertiesService: TestService = Container.get(TestService);

/** Состояния хранилища */
export class StateHolder {
    /** Версия стора */
    version = "1.0";
    systemProperties: { [key: string]: string } = {};
}

const Getters = {
    [GetterType.SYSTEM_PROPERTIES](state: StateHolder): { [key: string]: string } {
        return state.systemProperties;
    }
};

/** Мутаторы хранилища */
const Mutations = {
    [MutationType.SET_SYSTEM_PROPERTIES](state: StateHolder, systemProperties: { [key: string]: string }): void {
        state.systemProperties = systemProperties;
    },
};

/** Действия хранилища */
const Actions = {
    /** Дейстие загрузки системных свойств */
    [ActionType.LOAD_SYSTEM_PROPERTIES](context: ActionContext<StateHolder, void>): Promise<void> {
        return new Promise<void>((resolve): void => {
            systemPropertiesService.getSystemProperties().then((systemProperties: { [key: string]: string }) => {
                context.commit(MutationType.SET_SYSTEM_PROPERTIES, systemProperties);
                resolve();
            });
        });
    },
};

/**
 * Главный модуль хранилища
 */
export class MainStore implements Module<StateHolder, void> {
    namespaced = true;
    state: StateHolder;
    mutations = Mutations;
    getters = Getters;
    actions = Actions;

    constructor() {
        this.state = new StateHolder();
    }
}
