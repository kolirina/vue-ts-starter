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
import {VueRouter} from "vue-router/types/router";
import {BtnReturn, CustomDialog} from "../../../platform/dialogs/customDialog";
import {DealImportError, ShareAliasItem} from "../../../services/importService";
import {Share, TableHeader} from "../../../types/types";
import {ConfirmDialog} from "../confirmDialog";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" ref="dialog" max-width="600px" content-class="import-errors-dialog-scroll" persistent>
            <v-card class="dialog-wrap import-dialog-wrapper">
                <v-layout column justify-space-between class="min-height-wrapper">
                    <div>
                        <v-icon class="closeDialog" @click.native="close">close</v-icon>
                        <v-card-title class="import-dialog-wrapper__title">
                            <span class="import-dialog-wrapper__title-text">Результаты импорта</span>
                        </v-card-title>
                        <v-card-text class="import-dialog-wrapper__description selectable">
                            <div class="import-dialog-wrapper__description-text import-default-text">
                                При импортировании отчета возникли ошибки, отчет не был импортирован полностью. Чтобы завершить формирование пожалуйста внесите остатки вручную.
                            </div>
                            <video-link class="margB20 fs13">
                                <template #foreword>
                                    <span>Также для понимания причин возникновения ошибок, ознакомьтесь с </span>
                                </template>
                                <a>видео-инструкцией</a>
                            </video-link>
                            <div class="import-dialog-wrapper__description-text import-default-text">
                                Успешно {{ data.validatedTradesCount | declension("добавлена", "добавлено", "добавлено") }}
                                <span class="amount-deals">{{ data.validatedTradesCount }}</span>
                                {{ data.validatedTradesCount | declension("сделка", "сделки", "сделок") }}
                                <template v-if="data.duplicateTradeErrorCount">
                                    , <span class="amount-deals">{{ data.duplicateTradeErrorCount }}</span>
                                    {{ data.duplicateTradeErrorCount | declension("сделка", "сделки", "сделок") }}
                                    из отчета уже были загружены ранее.
                                </template>
                                <template v-if="data.repoTradeErrorsCount">
                                    , <span class="amount-deals">{{ data.repoTradeErrorsCount }}</span>
                                    {{ data.repoTradeErrorsCount | declension("сделка", "сделки", "сделок") }}
                                    из отчета имеют тип РЕПО и не были загружены, (если вы производили их самостоятельно, добавьте их вручную).
                                    <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" bottom>
                                        <sup class="custom-tooltip" slot="activator">
                                            <v-icon>fas fa-info-circle</v-icon>
                                        </sup>
                                        <span>
                                            РЕПО сделки могут быть совершены вашим брокером, если вы давали согласие на займы своих бумаг.
                                            Брокер может занимать и отдавать бумаги в течение дня, при этом в отчете такие сделки
                                            будут отображаться, например, как РЕПО часть 1 и РЕПО часть 2, и по своей сути,
                                            такие операции не должны влиять на расчет доходности вашего портфеля и попадать в список сделок,
                                            потому что вы их не совершали.
                                            <br/>
                                            <br/>
                                            Если сделки РЕПО совершали вы самостоятельно, и хотите их учесть,
                                            рекомендуем внести их через диалог добавления сделки.
                                        </span>
                                    </v-tooltip>
                                </template>
                            </div>
                        </v-card-text>
                        <v-card-text class="import-dialog-wrapper__description selectable">
                            <div class="import-dialog-wrapper__description-text import-default-text">
                                Мы не смогли распознать следующие бумаги из отчета, пожалуйста укажите соответствие каждого названия к бумаге на сервисе,
                                и тогда ваш отчет будет импортирован полностью.
                                <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" bottom>
                                    <sup class="custom-tooltip" slot="activator">
                                        <v-icon>fas fa-info-circle</v-icon>
                                    </sup>
                                    <span>
                                        Такие ситуации возникают когда брокер использует нестандартные названия для ценных бумаг в своих отчетах,
                                        или не указывает уникальный идентификатор бумаги, по которому ее можно распознать.<br/>
                                        Просто соотнесите название бумаги из отчета с ценной бумагой на сервисе.<br/>
                                        Для этого в строке напротив нужного названия найдите нужную бумаги и выберите ее.<br/>
                                        Например:<br/>
                                        "ПАО Газпром-ао" -&gt; GAZP
                                    </span>
                                </v-tooltip>
                            </div>
                        </v-card-text>
                        <v-card-text class="import-dialog-wrapper__content import-dialog-wrapper__error-table selectable">
                            <v-data-table v-if="otherErrors.length" :headers="headers" :items="otherErrors" class="data-table" hide-actions must-sort>
                                <template #items="props">
                                    <tr class="selectable">
                                        <td class="text-xs-center"><span v-if="props.item.dealDate">{{ props.item.dealDate | date }}</span></td>
                                        <td class="text-xs-left">{{ props.item.dealTicker }}</td>
                                        <td class="text-xs-left error-message">{{ props.item.message }}</td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </v-card-text>
                        <v-card-text v-if="shareAliases.length" class="selectable">
                            <div v-for="aliasItem in shareAliases" :key="aliasItem.alias">
                                <v-layout align-center justify-start wrap row fill-height class="mt-2 mb-2">
                                    <!-- Алиас бумаги -->
                                    <v-flex xs12 sm4>
                                        <span class="fs12" :title="aliasItem.alias">{{ aliasItem.alias }}</span>
                                    </v-flex>

                                    <!-- Выбранная бумага -->
                                    <v-flex xs12 sm8>
                                        <share-search @change="onShareSelect($event, aliasItem)" @clear="onShareClear(aliasItem)" autofocus ellipsis></share-search>
                                    </v-flex>
                                </v-layout>
                            </div>
                        </v-card-text>
                    </div>
                    <v-card-actions class="import-dialog-wrapper__actions">
                        <v-spacer></v-spacer>
                        <v-btn v-if="shareAliases.length" color="big_btn primary" @click.native="closeDialog" dark>
                            Указать названия
                        </v-btn>
                        <v-btn v-else color="big_btn primary" @click.native="goToBalances" dark>
                            Указать текущие остатки
                        </v-btn>
                    </v-card-actions>
                </v-layout>
            </v-card>
        </v-dialog>
    `
})
export class ImportErrorsDialog extends CustomDialog<ImportErrorsDialogData, ShareAliasItem[]> {

    /** Заголовки таблицы с ошибками */
    private headers: TableHeader[] = [
        {text: "Дата", align: "center", value: "dealDate", sortable: false},
        {text: "Тикер", align: "left", value: "dealTicker", sortable: false},
        {text: "Ошибка", align: "center", value: "message", sortable: false}
    ];

    private shareAliases: ShareAliasItem[] = [];

    private otherErrors: DealImportError[] = [];

    mounted(): void {
        this.shareAliases = this.data.errors.filter(error => error.shareNotFound).map(error => {
            return {
                alias: error.dealTicker,
                share: null
            } as ShareAliasItem;
        });
        this.otherErrors = this.data.errors.filter(error => !error.shareNotFound);
    }

    private goToBalances(): void {
        this.data.router.push({name: "balances"});
        this.close();
    }

    private onShareSelect(share: Share, aliasItem: ShareAliasItem): void {
        aliasItem.share = share;
    }

    private onShareClear(aliasItem: ShareAliasItem): void {
        aliasItem.share = null;
    }

    private async closeDialog(): Promise<void> {
        const filled = this.shareAliases.filter(shareAlias => !!shareAlias.share);
        const allFilled = filled.length === this.shareAliases.length;
        if (!allFilled) {
            const answer = await new ConfirmDialog().show("Вы не указали соответствия для всех нераспознанных бумаг." +
                "Если продолжить, будут импортированы только сделки по тем бумагам, которые вы указали.");
            if (answer !== BtnReturn.YES) {
                return;
            }
        }
        this.close(filled);
    }
}

export type ImportErrorsDialogData = {
    errors: DealImportError[],
    validatedTradesCount: number,
    duplicateTradeErrorCount: number,
    repoTradeErrorsCount: number,
    router: VueRouter
};
