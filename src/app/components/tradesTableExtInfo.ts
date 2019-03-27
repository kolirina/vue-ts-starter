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
        <table class="ext-info" @click.stop>
            <!-- Сделка по деньгам -->
            <tr v-if="tradeRow.asset === 'MONEY'">
                <td>
                    <div class="ext-info__grid">
                        <div>Тип</div>
                        <div>{{ tradeRow.ticker }}</div>
                        <div>Заметка</div>
                        <div>{{ tradeRow.note }}</div>
                        <div>Операция</div>
                        <div>{{ tradeRow.operationLabel }}</div>
                        <div>Дата</div>
                        <div>{{ getTradeDate(tradeRow) }}</div>
                        <div>Сумма</div>
                        <div>{{ tradeRow.signedTotal | amount(true) }} <span>{{ tradeRow.signedTotal | currencySymbol }}</span></div>
                    </div>
                </td>
            </tr>

            <!-- Сделка по Акции -->
            <tr v-if="tradeRow.asset === 'STOCK'">
                <td>
                    <div class="ext-info__grid">
                        <div>Тикер</div>
                        <span class="ext-info__ticker"><stock-link :ticker="tradeRow.ticker"></stock-link></span>
                        <div>Название</div>
                        <div>{{ tradeRow.companyName }}</div>
                        <div>Заметка</div>
                        <div>{{ tradeRow.note }}</div>
                    </div>
                </td>
                <td>
                    <div class="ext-info__grid">
                        <div>Операция</div>
                        <div>{{ tradeRow.operationLabel }}</div>
                        <div>Дата</div>
                        <div>{{ getTradeDate(tradeRow) }}</div>
                        <div>Количество</div>
                        <div>{{ tradeRow.quantity }} <span>шт.</span></div>
                        <div>Цена</div>
                        <div>{{ getPrice(tradeRow) }} <span>{{ currencyForPrice(tradeRow) }}</span></div>
                    </div>
                </td>
                <td>
                    <div class="ext-info__grid">
                        <div>Сумма</div>
                        <div>{{ tradeRow.signedTotal | amount(true) }} <span>{{ tradeRow.signedTotal | currencySymbol }}</span></div>
                        <div>Комиссия</div>
                        <div>{{ getFee(tradeRow) }} <span>{{ tradeRow.fee | currencySymbol }}</span></div>
                        <div>Сумма без комиссии</div>
                        <div>{{ tradeRow.totalWithoutFee | amount }} <span>{{ tradeRow.totalWithoutFee | currencySymbol }}</span></div>
                    </div>
                </td>
            </tr>

            <tr v-if="tradeRow.asset === 'BOND'">
                <td>
                    <div class="ext-info__grid">
                        <div>Тикер</div>
                        <span class="ext-info__ticker"><bond-link :ticker="tradeRow.ticker"></bond-link></span>
                        <div>Название</div>
                        <div>{{ tradeRow.companyName }}</div>
                        <div>Заметка</div>
                        <div>{{ tradeRow.note }}</div>
                    </div>
                </td>
                <td>
                    <div class="ext-info__grid">
                        <div>Операция</div>
                        <div>{{ tradeRow.operationLabel }}</div>
                        <div>Дата</div>
                        <div>{{ getTradeDate(tradeRow) }}</div>
                        <div>Количество</div>
                        <div>{{ tradeRow.quantity }} <span>шт.</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="ext-info__grid">
                        <div>Цена</div>
                        <div>{{ getPrice(tradeRow) }} <span>{{ currencyForPrice(tradeRow) }}</span></div>
                        <div>Номинал</div>
                        <div>{{ tradeRow.facevalue | amount }} <span>{{ tradeRow.facevalue | currencySymbol }}</span></div>
                        <div>НКД</div>
                        <div>{{ tradeRow.nkd | amount }} <span>{{ tradeRow.nkd | currencySymbol }}</span></div>
                    </div>
                </td>

            </tr>
            <tr v-if="tradeRow.asset === 'BOND'">
                <td>
                    <div class="ext-info__grid">
                        <div>Сумма</div>
                        <div> {{ tradeRow.signedTotal | amount(true) }} <span>{{ tradeRow.signedTotal | currencySymbol }}</span></div>
                        <div>Комиссия</div>
                        <div>{{ getFee(tradeRow) }} <span>{{ tradeRow.fee | currencySymbol }}</span></div>
                        <div>Сумма без комиссии</div>
                        <div>{{ tradeRow.totalWithoutFee | amount }} <span>{{ tradeRow.totalWithoutFee | currencySymbol }}</span></div>
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
