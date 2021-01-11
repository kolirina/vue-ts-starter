/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

import {Inject} from "typescript-ioc";
import {VueRouter} from "vue-router/types/router";
import {Component, UI} from "../../app/ui";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {SplitEvent} from "../../services/eventService";
import {OverviewService} from "../../services/overviewService";
import {TradeService} from "../../services/tradeService";
import {EventType} from "../../types/eventType";
import {Portfolio} from "../../types/types";
import {StateHolder} from "../../vuex/mainStore";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" ref="dialog" max-width="700px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title>
                    <span class="fs16 bold">{{ dialogTitle }}</span>
                </v-card-title>

                <v-card-text v-if="data">
                    <v-container grid-list-md class="paddT0 paddB0">
                        <v-layout wrap>
                            <!-- Тикер бумаги -->
                            <v-flex xs12 sm6>
                                <v-text-field :value="data.event.share.shortname" label="Бумага" readonly></v-text-field>
                            </v-flex>

                            <!-- Дата сделки -->
                            <v-flex xs12 sm6>
                                <v-text-field :value="data.event.date" label="Дата события" readonly></v-text-field>
                            </v-flex>

                            <!-- Описание события -->
                            <v-flex xs12>
                                {{ data.event.date | date }} {{ data.event.type === "Сплит" ? "был" : "была" }} {{ data.event.type === "Сплит" ? "произведен" : "произведена" }}
                                {{ data.event.type.toLowerCase() }} бумаги <b>{{ data.event.share.shortname }}</b> ({{ data.event.share.ticker }})
                                в отношении <b>{{ data.event.to | quantity }}:{{ data.event.from | quantity }}</b>,
                                то есть {{ data.event.to | declension("получилась", "получилось", "получилось") }} {{ data.event.to | quantity }}
                                {{ data.event.to | declension("бумага", "бумаги", "бумаг") }} из
                                {{ data.event.from | quantity }} {{ data.event.from | declension("бумаги", "бумаг", "бумаг") }}.<br/>
                                Цена бумаги соответствующим образом была изменена биржей в момент события.
                            </v-flex>

                            <!-- Описание события -->
                            <v-flex xs12>
                                В портфеле на дату события было <b>{{ data.event.fromShareCount | quantity }}</b>
                                {{ data.event.fromShareCount | declension("бумага", "бумаги", "бумаг") }},
                                после исполнения события в портфеле будет <b>{{ data.event.toSharesCount | quantity }}</b>
                                {{ data.event.toSharesCount | declension("бумага", "бумаги", "бумаг") }}.
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :loading="processState" :disabled="processState" color="primary" dark @click.native="addTrade">
                        Исполнить
                        <span slot="loader" class="custom-loader">
                        <v-icon light>fas fa-spinner fa-spin</v-icon>
                      </span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `,
    components: {CustomDialog}
})
export class ExecuteSplitEventDialog extends CustomDialog<ExecuteSplitEventDialogData, boolean> {

    @Inject
    private tradeService: TradeService;
    @Inject
    private overviewService: OverviewService;
    /** Состояние прогресса */
    private processState = false;

    @ShowProgress
    @DisableConcurrentExecution
    private async addTrade(): Promise<void> {
        this.processState = true;
        try {
            await this.tradeService.applySplitEvent({
                eventId: this.data.event.id,
                portfolioId: this.data.portfolio.id
            });
            // так как данные перезагружать не нужно если добавили в другой портфель
            const needResetCache = this.data.portfolio.id === this.data.store.currentPortfolio.portfolioParams.id ||
                this.data.store.currentPortfolio.portfolioParams.combinedIds?.includes(this.data.portfolio.id);
            // сбрасываем кэш выбранного портфеля чтобы при переключении он загрузкился с новой сделкой
            if (needResetCache) {
                this.overviewService.resetCacheForCombinedPortfolio({
                    ids: this.data.store.combinedPortfolioParams.combinedIds,
                    viewCurrency: this.data.store.combinedPortfolioParams.viewCurrency
                });
                this.overviewService.resetCacheForId(this.data.portfolio.id);
            }
            UI.emit(EventType.TRADE_CREATED);
            const msg = "Событие успешно исполнено";
            this.$snotify.info(msg);
            this.close();
        } finally {
            this.processState = false;
        }
    }

    private get dialogTitle(): string {
        return `Исполнение ${this.data.event.type === "Сплит" ? "сплита" : "консолидации"} по бумаге ${this.data.event.share.ticker}`;
    }
}

export type ExecuteSplitEventDialogData = {
    store: StateHolder,
    event: SplitEvent,
    router: VueRouter,
    portfolio: Portfolio
};
