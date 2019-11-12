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
import {VueRouter} from "vue-router/types/router";
import {Component, UI} from "../../app/ui";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {AssetCategory, AssetModel, AssetService} from "../../services/assetService";
import {Client, ClientService} from "../../services/clientService";
import {BigMoney} from "../../types/bigMoney";
import {EventType} from "../../types/eventType";
import {Permission} from "../../types/permission";
import {CurrencyUnit, ErrorInfo} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {TextUtils} from "../../utils/textUtils";
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
                                <v-select v-if="!editMode" :items="assetCategories" v-model="asset.category" :return-object="true" label="Категория актива" item-text="description"
                                          dense hide-details :readonly="editMode"></v-select>
                                <v-text-field v-else :value="asset.category.description" label="Категория актива (Редактирование недоступно)" disabled></v-text-field>
                            </v-flex>

                            <!-- Тикер актива -->
                            <v-flex xs12 sm6>
                                <v-text-field label="Код актива (ticker/isin)" v-model.trim="asset.ticker" class="required"
                                              v-validate="'required|max:50'" :error-messages="errors.collect('ticker')" name="ticker"></v-text-field>
                                <div class="mt-1">
                                    <span v-if="preDefinedCode" class="fs12">
                                        <a @click="setPreDefinedCode" title="Указать в качестве кода">Указать '{{ preDefinedCode }}' в качестве кода</a>
                                    </span>
                                </div>
                            </v-flex>

                            <!-- Название актива -->
                            <v-flex xs12>
                                <v-text-field label="Название актива" v-model.trim="asset.name" :counter="120" class="required" autofocus
                                              v-validate="'required|max:160'" :error-messages="errors.collect('name')" name="name"></v-text-field>
                            </v-flex>

                            <!-- Выбор типа определения цены -->
                            <v-flex xs12 sm12 class="mb-3">
                                <v-switch v-model="autoPrice" class="margT0" hide-details>
                                    <template #label>
                                        <span>Текущая цена: {{ priceTypeLabel }}</span>
                                        <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" bottom>
                                            <sup class="custom-tooltip" slot="activator">
                                                <v-icon>fas fa-info-circle</v-icon>
                                            </sup>
                                            <span>
                                                Включите для настройки автоматического поиска цены актива
                                            </span>
                                        </v-tooltip>
                                    </template>
                                </v-switch>
                            </v-flex>

                            <template v-if="!autoPrice">
                                <!-- Цена -->
                                <v-flex xs12 sm6>
                                    <ii-number-field label="Цена актива" v-model="asset.price" class="required" name="price" v-validate="'required|min_value:0.000001'"
                                                     :error-messages="errors.collect('price')">
                                    </ii-number-field>
                                </v-flex>

                                <!-- Влюта -->
                                <v-flex xs12 sm6>
                                    <template v-if="!editMode && foreignCurrencyAllowed">
                                        <v-select :items="currencyList" v-model="asset.currency" label="Валюта актива"></v-select>
                                    </template>
                                    <template v-if="!editMode && !foreignCurrencyAllowed">
                                        <v-text-field :value="asset.currency" label="Валюта актива (Редактирование недоступно)" disabled></v-text-field>
                                        <div class="fs12-opacity mt-1">
                                            <span>
                                                Добавление валютных активов доступно только на тарифном плане
                                                <a @click="goToTariffs" title="Подключить">Профессионал</a>
                                            </span>
                                        </div>
                                    </template>
                                    <v-text-field v-if="editMode" :value="asset.currency" label="Валюта актива (Редактирование недоступно)" disabled></v-text-field>
                                </v-flex>
                            </template>

                            <template v-else>
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
                                    <div v-if="asset.source && asset.regex" class="mt-1">
                                        <a @click="checkSource" title="Проверить" class="fs12">Проверить</a>
                                        <span v-if="foundValue" class="fs12-opacity">Найденное значение:</span>
                                        <b v-if="foundValue" class="fs12">{{ foundValue }}</b>
                                        <span v-if="foundValue" class="fs12">
                                            <a @click="setToPrice" title="Указать в качестве цены">Указать в качестве цены</a>
                                        </span>
                                    </div>
                                </v-flex>
                            </template>

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
export class AssetEditDialog extends CustomDialog<AssetEditDialogData, AssetEditDialogResult> {

    @Inject
    private assetService: AssetService;
    @Inject
    private clientService: ClientService;
    /** Типы возможных активов */
    private assetCategories = AssetCategory.values();
    /** Список валют */
    private currencyList: string[] = [];
    /** Актив */
    private asset: AssetModel = null;
    /** Индикатор состояния */
    private processState = false;
    /** Индикатор состояния */
    private foundValue: string = null;
    /** Начальная цена редактируемого актива */
    private initialPrice: string = null;
    /** Тип определения цены - Вручную */
    private autoPrice = false;
    /** Информация о клиенте */
    private clientInfo: Client = null;

    /**
     * Производит инициализацию данных диалога.
     * Для пользователей тарифа Стандарт доступна только валюта Рубль при создании актива
     */
    async mounted(): Promise<void> {
        this.clientInfo = await this.clientService.getClientInfo();
        this.currencyList = CurrencyUnit.values().map(c => c.code).filter(code => this.foreignCurrencyAllowed || code === "RUB");
        await this.setDialogParams();
    }

    private async setDialogParams(): Promise<void> {
        if (!this.data.asset) {
            this.asset = {
                category: AssetCategory.OTHER,
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
            this.asset = {...this.data.asset};
            this.asset.price = new BigMoney(this.asset.price).amount.toString();
        }
        this.initialPrice = this.asset.price;
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
            this.close({asset: this.asset, needUpdate: this.initialPrice !== this.asset.price});
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

    private async checkSource(): Promise<void> {
        const result = await this.assetService.checkSource({source: this.asset.source, regex: this.asset.regex});
        this.foundValue = result ? result : "Ничего не найдено";
    }

    private setToPrice(): void {
        this.asset.price = this.foundValue;
    }

    private setPreDefinedCode(): void {
        this.asset.ticker = this.preDefinedCode;
    }

    private goToTariffs(): void {
        if (this.data.router.currentRoute.path !== "/settings/tariffs") {
            this.data.router.push("/settings/tariffs");
        }
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

    private get preDefinedCode(): string {
        return this.asset && this.asset.name ? TextUtils.transliterate(this.asset.name).toUpperCase().replace(new RegExp("[-|_|\\s]*", "g"), "").substring(0, 5) : "";
    }

    private get foreignCurrencyAllowed(): boolean {
        return this.clientInfo.tariff.hasPermission(Permission.FOREIGN_SHARES);
    }

    private get dialogTitle(): string {
        return `${this.editMode ? "Редактирование" : "Добавление"} актива`;
    }

    private get priceTypeLabel(): string {
        return `${this.autoPrice ? "Получение с web-страницы" : "Указывается вручную"}`;
    }
}

export interface AssetEditDialogResult {
    asset: AssetModel;
    needUpdate: boolean;
}

export interface AssetEditDialogData {
    asset: AssetModel;
    router: VueRouter;
}