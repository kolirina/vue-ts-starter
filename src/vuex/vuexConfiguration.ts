import Vuex, {StoreOptions} from 'vuex';
import Vue from "vue";
import {MainStore} from "./mainStore";
import {StoreType} from "./storeType";

Vue.use(Vuex);

export class VuexConfiguration {

    private static store = new Vuex.Store({
        modules: {
            [StoreType.MAIN]: new MainStore()
        }
    });

    static getStore(): any {
        return VuexConfiguration.store;
    }
}
