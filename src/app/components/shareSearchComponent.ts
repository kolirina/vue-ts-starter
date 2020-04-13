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
import {Component, Prop, UI, Watch} from "../app/ui";
import {Filters} from "../platform/filters/Filters";
import {AssetCategory} from "../services/assetService";
import {MarketService} from "../services/marketService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Currency} from "../types/currency";
import {Asset, Bond, Share, ShareType} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-autocomplete ref="shareSearch" :items="filteredSharesMutated" v-model="share" @change="onShareSelect" @click:clear="onSearchClear"
                        :label="placeholder"
                        :loading="shareSearch" no-data-text="Ничего не найдено" clearable :required="required" :rules="rules"
                        dense :hide-no-data="hideNoDataLabel" :no-filter="true" :search-input.sync="searchQuery" :autofocus="autofocus">
            <template #selection="data">
                <span :class="{ellipsis: ellipsis, 'mw218': ellipsis}" :title="shareLabelSelected(data.item)">{{ shareLabelSelected(data.item) }}</span>
            </template>
            <template #item="data">
                <span v-html="shareLabelListItem(data.item)" :title="shareLabelSelected(data.item)"></span>
            </template>
            <template slot="no-data">
                <v-list-tile>
                    <v-list-tile-title>
                        <span v-if="allowRequest">Бумага не найдена. <a @click="requestNewShare">Отправить запрос</a> на добавление</span>
                        <span v-else>{{ notFoundLabel }}</span>
                    </v-list-tile-title>
                </v-list-tile>
            </template>
        </v-autocomplete>
    `
})
export class ShareSearchComponent extends UI {

    $refs: {
        shareSearch: any;
    };

    @Inject
    private marketService: MarketService;

    @Prop({required: false})
    private assetType: AssetType;

    @Prop({required: false})
    private filteredShares: Share[];

    @Prop({required: false, type: String, default: "Введите тикер или название компании"})
    private placeholder: string;

    @Prop({required: false, type: Boolean, default: false})
    private autofocus: boolean;

    /** Признак разрешения создания нового актива через поиск. Используется только в диалоге добавления сделок */
    @Prop({required: false, type: Boolean, default: false})
    private createAssetAllowed: boolean;

    @Prop({required: false, type: Boolean, default: false})
    private required: boolean;
    @Prop({required: false, type: Array, default: (): any[] => []})
    private rules: any[];
    @Prop({required: false, type: Boolean, default: false})
    private ellipsis: boolean;
    @Prop({required: false, type: Boolean, default: false})
    private allowRequest: boolean;
    @Prop({required: false, type: Boolean, default: false})
    private ignoreAssetType: boolean;
    /** Отфильтрованные данные */
    private filteredSharesMutated: Share[] = [];
    /** Тип актива бумаги */
    private assetTypeMutated: AssetType = null;
    /** Текущий объект таймера */
    private currentTimer: number = null;
    /** Поисковый запрос */
    private searchQuery: string = null;
    /** Выбранная бумага */
    private share: Share = null;
    /** Прогресс поиска */
    private shareSearch = false;
    /** Метка для опеределения что бумага не найдена */
    private notFoundLabel = "Ничего не найдено";
    /** Признак скрытия пункта если ничего не найдено */
    private hideNoDataLabel = true;
    /** Новый актив */
    private NEW_CUSTOM_ASSET: Asset = {
        id: null,
        shortname: "",
        price: null,
        lotsize: "",
        decimals: "",
        currency: Currency.RUB,
        isin: "",
        change: "",
        boardName: "",
        name: "",
        ticker: "",
        shareType: ShareType.ASSET,
        rating: "0",
        ratingCount: "0",
        category: AssetCategory.OTHER.code,
        sector: null
    };

    created(): void {
        this.assetTypeMutated = this.assetType;
    }

    @Watch("filteredShares")
    private async onFilteredSharesChange(filteredShares: Share[]): Promise<void> {
        this.filteredSharesMutated = filteredShares ? [...filteredShares] : [];
        if (this.filteredSharesMutated.length) {
            this.share = this.filteredSharesMutated[0];
        }
    }

    @Watch("assetType")
    private async onAssetTypeChange(assetType: AssetType): Promise<void> {
        this.assetTypeMutated = assetType;
    }

    @Watch("searchQuery")
    private async onSearch(): Promise<void> {
        clearTimeout(this.currentTimer);
        this.shareSearch = true;
        const trimmedQuery = this.searchQuery?.trim();
        if (!trimmedQuery || trimmedQuery.length < 1) {
            this.shareSearch = false;
            this.hideNoDataLabel = true;
            return;
        }
        await this.setTimeout(1000);
        try {
            if (this.ignoreAssetType) {
                this.filteredSharesMutated = await this.marketService.searchShares(trimmedQuery);
            } else {
                if (this.assetType === AssetType.STOCK) {
                    this.filteredSharesMutated = await this.marketService.searchStocks(trimmedQuery);
                } else if (this.assetType === AssetType.BOND) {
                    this.filteredSharesMutated = await this.marketService.searchBonds(trimmedQuery);
                } else if (this.assetType === AssetType.ASSET) {
                    this.filteredSharesMutated = await this.marketService.searchAssets(trimmedQuery);
                } else {
                    this.filteredSharesMutated = await this.marketService.searchShares(trimmedQuery);
                }
            }
            // не нашли кастомный актив, предлагаем добавить его
            if (this.assetType === AssetType.ASSET && this.filteredSharesMutated.length === 0 && this.createAssetAllowed) {
                const newAsset = {...this.NEW_CUSTOM_ASSET};
                newAsset.shortname = trimmedQuery;
                this.filteredSharesMutated.push(newAsset);
            }
            this.hideNoDataLabel = this.filteredSharesMutated.length > 0;
            this.shareSearch = false;
        } finally {
            clearTimeout(this.currentTimer);
            this.shareSearch = false;
        }
    }

    /**
     * Возвращает `setTimeout`, обернутый в промис
     * @param timeout таймаут в миллисекундах
     */
    private async setTimeout(timeout: number): Promise<void> {
        return new Promise((resolve): void => {
            this.currentTimer = setTimeout(async () => {
                resolve();
            }, timeout);
        });
    }

    private shareLabelSelected(share: Share): string {
        return share.shareType === ShareType.STOCK ? `${share.ticker} (${share.shortname})` : share.shortname;
    }

    private shareLabelListItem(share: Share): string {
        if ((share as any) === this.notFoundLabel) {
            return this.notFoundLabel;
        }
        const shareType = AssetType.valueByName(share.shareType);
        if ([AssetType.STOCK, AssetType.ASSET].includes(shareType)) {
            if (share.price !== null) {
                const price = new BigMoney(share.price);
                let assetDescription = shareType.description;
                if (shareType === AssetType.ASSET) {
                    assetDescription = AssetCategory.valueByName((share as Asset).category).description;
                }
                return `${share.ticker} (${share.shortname}), <b>${Filters.formatNumber(price.amount.toString())}</b> ${price.currencySymbol} (${assetDescription})`;
            }
            return `Создать актив "${share.shortname}"`;
        } else if (shareType === AssetType.BOND) {
            return `${share.ticker} (${share.shortname}), <b>${(share as Bond).prevprice}</b> % (${AssetType.valueByName(share.shareType).description})`;
        }

        return `${share.ticker} (${share.shortname})`;
    }

    private onSearchClear(): void {
        this.filteredSharesMutated = [];
        this.$emit("clear");
    }

    private onShareSelect(share: Share): void {
        this.share = share;
        this.$emit("change", this.share);
    }

    private requestNewShare(): void {
        this.$refs.shareSearch.blur();
        this.$emit("requestNewShare", this.searchQuery.trim());
    }
}
