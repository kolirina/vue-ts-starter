import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import {MainStore} from "./mainStore";
import {StoreType} from "./storeType";

Vue.use(Vuex);

export class VuexConfiguration {

    private static store = new Vuex.Store({
        plugins: [createPersistedState()],
        modules: {
            [StoreType.MAIN]: new MainStore()
        }
    });

    static getStore(): any {
        return VuexConfiguration.store;
    }
}
