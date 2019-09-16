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

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {TradeRow} from "../types/types";
import {TradeUtils} from "../utils/tradeUtils";

@Component({
    // language=Vue
    template: `
        <table class="ext-info selectable" @click.stop>
            <!-- Сделка по деньгам -->
            <tr v-if="tradeRow.asset === 'MONEY'">
                <td>
                    <div class="ext-info__item ">
                        Тип {{ tradeRow.ticker }}<br>
                        Операция {{ tradeRow.operationLabel }}<br>
                        Заметка {{ tradeRow.note }}<br>
                    </div>
                </td>
                <td>
                    <div class="ext-info__item ">
                        Дата {{ getTradeDate(tradeRow) }}<br>
                        Сумма {{ tradeRow.signedTotal | amount(true) }} <span>{{ tradeRow.signedTotal | currencySymbol }}</span>
                    </div>
                </td>
            </tr>

            <!-- Сделка по Акции -->
            <tr v-if="tradeRow.asset === 'STOCK'">
                <td>
                    <div class="ext-info__item">
                        Тикер <span class="ext-info__ticker"><stock-link :ticker="tradeRow.ticker"></stock-link></span><br>
                        Название {{ tradeRow.companyName }}<br>
                        Заметка {{ tradeRow.note }}
                    </div>
                </td>
                <td>
                    <div class="ext-info__item">
                        Операция {{ tradeRow.operationLabel }}<br>
                        Дата {{ getTradeDate(tradeRow) }}<br>
                        Количество {{ tradeRow.quantity }} <span>шт.</span><br>
                        Цена {{ getPrice(tradeRow) }} <span>{{ currencyForPrice(tradeRow) }}</span><br>
                    </div>
                </td>
                <td>
                    <div class="ext-info__item">
                        Сумма {{ tradeRow.signedTotal | amount(true) }} <span>{{ tradeRow.signedTotal | currencySymbol }}</span><br>
                        Комиссия {{ getFee(tradeRow) }} <span>{{ tradeRow.fee | currencySymbol }}</span><br>
                        Сумма без комиссии {{ tradeRow.totalWithoutFee | amount(true) }} <span>{{ tradeRow.totalWithoutFee | currencySymbol }}</span>
                    </div>
                </td>
            </tr>

            <tr v-if="tradeRow.asset === 'BOND'">
                <td>
                    <div class="ext-info__item">
                        Тикер <span class="ext-info__ticker"><bond-link :ticker="tradeRow.ticker"></bond-link></span><br>
                        Название {{ tradeRow.companyName }}<br>
                        Заметка {{ tradeRow.note }}
                    </div>
                </td>
                <td>
                    <div class="ext-info__item">
                        Операция {{ tradeRow.operationLabel }}<br>
                        Дата {{ getTradeDate(tradeRow) }}<br>
                        Количество {{ tradeRow.quantity }} <span>шт.</span>
                    </div>
                </td>
                <td>
                    <div class="ext-info__item">
                        Цена {{ getPrice(tradeRow) }} <span>{{ currencyForPrice(tradeRow) }}</span><br>
                        Номинал
                        <template v-if="tradeRow.facevalue">
                            {{ tradeRow.facevalue | amount(false, null, false) }} <span>{{ tradeRow.facevalue | currencySymbol }}</span><br>
                        </template>
                        <template v-else>-<br></template>
                        НКД
                        <template v-if="tradeRow.nkd">
                            {{ tradeRow.nkd | amount(false, null, false) }} <span>{{ tradeRow.nkd | currencySymbol }}</span>
                        </template>
                        <template v-else>-<br></template>
                    </div>
                </td>

            </tr>
            <tr v-if="tradeRow.asset === 'BOND'">
                <td>
                    <div class="ext-info__item">
                        Сумма {{ tradeRow.signedTotal | amount(true) }} <span>{{ tradeRow.signedTotal | currencySymbol }}</span><br>
                        Комиссия {{ getFee(tradeRow) }} <span>{{ tradeRow.fee | currencySymbol }}</span><br>
                        Сумма без комиссии {{ tradeRow.totalWithoutFee | amount(true) }} <span>{{ tradeRow.totalWithoutFee | currencySymbol }}</span>
                    </div>
                </td>
            </tr>
        </table>
    `
})
export class TradesTableExtInfo extends UI {

    /** Сущность сделки */
    @Prop({required: true})
    private tradeRow: TradeRow;
    /** Признак доступности профессионального режима */
    @Prop({required: false, type: Boolean, default: false})
    private portfolioProMode: boolean;

    private getTradeDate(trade: TradeRow): string {
        const date = TradeUtils.getDateString(trade.date);
        const time = TradeUtils.getTimeString(trade.date);
        return this.portfolioProMode && !!time ? `${date} ${time}` : date;
    }

    private getPrice(trade: TradeRow): string {
        return TradeUtils.getPrice(trade);
    }

    private getFee(trade: TradeRow): string {
        return TradeUtils.getFee(trade);
    }

    private percentPrice(trade: TradeRow): boolean {
        return TradeUtils.percentPrice(trade);
    }

    private moneyPrice(trade: TradeRow): boolean {
        return TradeUtils.moneyPrice(trade);
    }

    private currencyForPrice(trade: TradeRow): string {
        return this.moneyPrice(trade) ? TradeUtils.currencySymbolByAmount(trade.moneyPrice).toLowerCase() : this.percentPrice(trade) ? "%" : "";
    }
}
