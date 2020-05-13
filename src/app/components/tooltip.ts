/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

/**
 * Компонент для отображения ссылки на просмотр информации по акции
 */
import {Component, Prop, UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <v-tooltip content-class="custom-tooltip-wrap" max-width="563px" bottom>
            <sup class="custom-tooltip" slot="activator">
                <v-icon>{{ icon }}</v-icon>
            </sup>
            <span>
                <slot></slot>
            </span>
        </v-tooltip>
    `
})
export class Tooltip extends UI {

    @Prop({type: String, required: false, default: "fas fa-info-circle"})
    private icon: string;
}
