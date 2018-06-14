import Vuex from 'vuex';
import Vue from "vue";
import {MainStore} from "./mainStore";
import {StoreType} from "./storeType";
import createPersistedState from 'vuex-persistedstate';

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
