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

import {Inject} from "typescript-ioc";
import {Field} from "vee-validate";
import {Component, UI} from "../../app/ui";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {AssetCategory, AssetModel, AssetService} from "../../services/assetService";
import {EventType} from "../../types/eventType";
import {CurrencyUnit, ErrorInfo} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {TradeUtils} from "../../utils/tradeUtils";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" ref="dialog" persistent max-width="700px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="paddB0">
                    <span class="fs16 bold">{{ dialogTitle }}</span>
                </v-card-title>

                <v-card-text v-if="asset" class="paddT0 paddB0">
                    <v-container grid-list-md class="paddT0 paddB0">
                        <v-layout wrap>
                            <!-- Категория актива -->
                            <v-flex xs12 sm6>
                                <v-select :items="assetCategories" v-model="asset.category" :return-object="true" label="Категория актива" item-text="description"
                                          dense hide-details :readonly="editMode"></v-select>
                            </v-flex>

                            <!-- Тикер бумаги -->
                            <v-flex xs12 sm6>
                                <v-text-field label="Код бумаги (ticker/isin)" v-model.trim="asset.ticker" class="required"
                                              v-validate="'required|max:50'" :error-messages="errors.collect('ticker')" name="ticker"></v-text-field>
                            </v-flex>

                            <!-- Название бумаги -->
                            <v-flex xs12>
                                <v-text-field label="Название бумаги" v-model.trim="asset.name" :counter="120" class="required"
                                              v-validate="'required|max:160'" :error-messages="errors.collect('name')" name="name"></v-text-field>
                            </v-flex>

                            <!-- Цена -->
                            <v-flex xs12 sm6>
                                <ii-number-field label="Цена бумаги" v-model="asset.price" class="required" name="price" v-validate="'required|min_value:0.000001'"
                                                 :error-messages="errors.collect('price')" persistent-hint hint="Текущая цена бумаги, если не знаете, поставте 0">
                                </ii-number-field>
                            </v-flex>

                            <!-- Влюта -->
                            <v-flex xs12 sm6>
                                <v-select :items="currencyList" v-model="asset.currency" label="Валюта актива" :readonly="editMode"></v-select>
                            </v-flex>

                            <!-- Источник -->
                            <v-flex xs12>
                                <v-text-field label="Источник" v-model.trim="asset.source" :counter="1024"
                                              v-validate="'max:1024'" :error-messages="errors.collect('source')" name="source"
                                              persistent-hint hint="url по которому можно найти цену по активу"></v-text-field>
                            </v-flex>

                            <!-- Регулярное выражение -->
                            <v-flex xs12>
                                <v-text-field label="Регулярное выражение" v-model.trim="asset.regex" :counter="1024"
                                              v-validate="'max:1024'" :error-messages="errors.collect('regex')" name="regex"
                                              persistent-hint hint="Регулярное выражение для парсинга цены актива"></v-text-field>
                            </v-flex>

                            <!-- Заметка -->
                            <v-flex xs12>
                                <v-text-field label="Заметка" v-model.trim="asset.note" :counter="4096"
                                              v-validate="'max:4096'" :error-messages="errors.collect('note')" name="note"></v-text-field>
                            </v-flex>

                            <!-- Тэги todo assets тэги -->
                            <!--                            <v-flex xs12>-->
                            <!--                                <v-combobox v-model="tags" :items="predefinedTags" label="Тэги" -->
                            <!-- chips clearable prepend-icon="filter_list" solo multiple-->
                            <!--                                            :error-messages="errors.collect('tags')" name="tags">-->
                            <!--                                    <template v-slot:selection="data">-->
                            <!--                                        <v-chip :selected="data.selected" close @input="remove(data.item)">-->
                            <!--                                            <strong>{{ data.item }}</strong>-->
                            <!--                                        </v-chip>-->
                            <!--                                    </template>-->
                            <!--                                </v-combobox>-->
                            <!--                            </v-flex>-->
                        </v-layout>
                        <small class="fs12-opacity">* обозначает обязательные поля</small>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :loading="processState" :disabled="!isValid || processState" color="primary" dark @click.native="addTrade">
                        {{ editMode ? "Сохранить" : "Добавить" }}
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
export class AssetEditDialog extends CustomDialog<AssetModel, boolean> {

    @Inject
    private assetService: AssetService;

    /** Типы возможных активов */
    private assetCategories = AssetCategory.values();
    /** Список валют */
    private currencyList = CurrencyUnit.values().map(c => c.code);
    /** Актив */
    private asset: AssetModel = null;
    /** Индикатор состояния */
    private processState = false;

    async mounted(): Promise<void> {
        await this.setDialogParams();
    }

    private async setDialogParams(): Promise<void> {
        if (!this.data) {
            this.asset = {
                category: AssetCategory.STOCK,
                currency: "RUB",
                ticker: "",
                name: "",
                source: "",
                regex: "",
                price: "",
                note: "",
                tags: ""
            };
        } else {
            this.asset = {...this.data};
        }
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async addTrade(): Promise<void> {
        this.$validator.errors.clear();
        const result = await this.$validator.validateAll();
        if (!result) {
            return;
        }

        this.processState = true;
        try {
            if (this.editMode) {
                await this.editAsset();
                UI.emit(EventType.ASSET_UPDATED);
            } else {
                await this.saveAsset();
                UI.emit(EventType.ASSET_CREATED);
            }
            const msg = `Актив успешно ${this.editMode ? "отредактирован" : "добавлен"}`;
            this.$snotify.info(msg);
            this.close();
        } catch (e) {
            this.handleError(e);
        } finally {
            this.processState = false;
        }
    }

    private async saveAsset(): Promise<void> {
        await this.assetService.saveAsset(this.asset);
    }

    private async editAsset(): Promise<void> {
        await this.assetService.editAsset(this.asset);
    }

    private handleError(error: ErrorInfo): void {
        // если 403 ошибки при добавлении сделок, диалог уже отобразили, больше ошибок показывать не нужно
        if (!CommonUtils.exists(error.fields)) {
            if ((error as any).code !== "403") {
                throw error;
            }
            return;
        }
        const validatorFields = this.$validator.fields.items.map((f: Field) => f.name);
        for (const errorInfo of error.fields) {
            if (validatorFields.includes(errorInfo.name)) {
                this.$validator.errors.add({field: errorInfo.name, msg: errorInfo.errorMessage});
            }
        }
        if (this.$validator.errors.count() === 0) {
            const globalMessage = TradeUtils.getGlobalMessage(error);
            this.$snotify.error(globalMessage);
        }
    }

    private get isValid(): boolean {
        return this.asset && !!this.asset.ticker && !!this.asset.name && !!this.asset.price;
    }

    private get editMode(): boolean {
        return this.asset && !!this.asset.id;
    }

    private get dialogTitle(): string {
        return `${this.editMode ? "Редактирование" : "Добавление"} актива`;
    }
}
