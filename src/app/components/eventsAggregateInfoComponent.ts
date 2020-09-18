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
import {EventsAggregateInfo} from "../services/eventService";

@Component({
    // language=Vue
    template: `
        <div v-if="eventsAggregateInfo" class="eventsAggregateInfo">
            <span class="item-block dividend_news">
                <span :class="['item-block__amount', viewCurrency]">Дивиденды {{ eventsAggregateInfo.totalDividendsAmount | number }} </span>
            </span>
            <span class="item-block coupon">
                <span :class="['item-block__amount', viewCurrency]">Купоны {{ eventsAggregateInfo.totalCouponsAmount | number }} </span>
            </span>
            <span class="item-block amortization">
                <span :class="['item-block__amount', viewCurrency]">Амортизация {{ eventsAggregateInfo.totalAmortizationsAmount | number }} </span>
            </span>
            <span class="item-block repayment">
                <span :class="['item-block__amount', viewCurrency]">Погашения {{ eventsAggregateInfo.totalRepaymentsAmount | number }} </span>
            </span>
            <span class="item-block total">
                <span :class="['item-block__amount', viewCurrency]">Всего выплат {{ eventsAggregateInfo.totalAmount | number }} </span>
            </span>
        </div>
    `
})
export class EventsAggregateInfoComponent extends UI {

    @Prop({type: Object, required: true})
    private eventsAggregateInfo: EventsAggregateInfo;
    /** Валюта просмотра информации */
    @Prop({required: true, type: String})
    private viewCurrency: string;
}
