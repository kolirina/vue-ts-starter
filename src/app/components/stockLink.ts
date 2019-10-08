/**
 * Компонент для отображения ссылки на просмотр информации по акции
 */
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <router-link :to="{name: 'share', params: {ticker: ticker}}" class="decorationNone">
            <slot>{{ ticker }}</slot>
        </router-link>
    `
})
export class StockLink extends UI {

    @Prop({type: String, required: true})
    private ticker: string;
}
