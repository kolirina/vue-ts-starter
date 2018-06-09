import Vue from "vue";
import {RouterConfiguration} from "./router/routerConfiguration";
import {Application} from "./application";
import {AppFrame} from "./app/appFrame";
import {VuexConfiguration} from "./vuex/vuexConfiguration";

const initialized = Application.start();
const router = RouterConfiguration.getRouter();
const store = VuexConfiguration.getStore();

let v = new Vue({
    router,
    store,
    el: "#app",
    // language=Vue
    template: `
        <app-frame></app-frame>
    `,
    components: {AppFrame}
});

