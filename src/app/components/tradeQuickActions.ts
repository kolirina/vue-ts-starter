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
import {Component, UI} from "../app/ui";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";

@Component({
    // language=Vue
    template: `
        <v-layout wrap class="mt-2 mb-2">
            <v-flex @click="setQuickAction(AssetType.MONEY, Operation.INCOME, IIS_INCOME_NOTE)" class="add-trade-dialog__action-item">
                <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" top>
                    <span slot="activator">Добавить налоговый вычет</span>
                    <span>
                            Если Вы хотите учесть полученный налоговый вычет по ИИС.
                        </span>
                </v-tooltip>
            </v-flex>
            <v-flex @click="setQuickAction(AssetType.MONEY, Operation.LOSS)" class="add-trade-dialog__action-item">
                <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" top>
                    <span slot="activator">Добавить расход</span>
                    <span>
                            Добавить произвольный расход.<br/>
                            Это может быть ежемесячная комиссия брокера или депозитария,
                            другие расходы по портфелю, которые вы хотите учесть в прибыли портфеля
                        </span>
                </v-tooltip>
            </v-flex>
            <v-flex @click="setQuickAction(AssetType.MONEY, Operation.INCOME)" class="add-trade-dialog__action-item">
                <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" top>
                    <span slot="activator">Добавить доход</span>
                    <span>
                            Добавить произвольный доход.<br/>
                            Это может быть вычет, возврат НДФЛ, другая сумма,
                            которую вы хотите учесть в прибыли портфеля
                        </span>
                </v-tooltip>
            </v-flex>
            <v-flex>
                <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" top>
                    <a slot="activator" @click="closeQuickActionsPanel">
                        <v-icon class="add-trade-dialog__close-actions-icon">far fa-times-circle</v-icon>
                    </a>
                    <span>Закрыть и больше не показывать</span>
                </v-tooltip>
            </v-flex>
        </v-layout>
    `
})
export class TradeQuickActions extends UI {

    /** Заметка для вычета по ИИС */
    private readonly IIS_INCOME_NOTE = "Налоговый вычет по ИИС";
    /** Тип актива */
    private AssetType = AssetType;
    /** Операции */
    private Operation = Operation;

    private setQuickAction(assetType: AssetType, operation: Operation, note: string = ""): void {
        this.$emit("change", {assetType, operation, note} as TradeQuickAction);
    }

    private closeQuickActionsPanel(): void {
        this.$emit("close");
    }
}

export interface TradeQuickAction {
    assetType: AssetType;
    operation: Operation;
    note: string;
}
