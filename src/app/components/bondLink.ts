/**
 * Компонент для отображения ссылки на просмотр информации по облигации
 */
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <router-link :to="{name: 'bond-info', params: {isin: ticker}}" class="decorationNone">
            <slot>{{ ticker }}</slot>
        </router-link>
    `
})
export class BondLink extends UI {

    @Prop({type: String, required: true})
    private ticker: string;
}
