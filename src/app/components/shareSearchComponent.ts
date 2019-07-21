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
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {Prop, UI} from "../app/ui";
import {MarketService} from "../services/marketService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Bond, Share} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-autocomplete :items="filteredSharesMutated" v-model="share" @change="onShareSelect" @click:clear="onSearchClear"
                        :label="placeholder"
                        :loading="shareSearch" no-data-text="Ничего не найдено" clearable :required="required" :rules="rules"
                        dense :hide-no-data="true" :no-filter="true" :search-input.sync="searchQuery" :autofocus="autofocus">
            <template #selection="data">
                {{ shareLabelSelected(data.item) }}
            </template>
            <template #item="data">
                {{ shareLabelListItem(data.item) }}
            </template>
        </v-autocomplete>

    `
})
export class ShareSearchComponent extends UI {

    @Prop({required: false})
    private assetType: AssetType;

    @Prop({required: false})
    private filteredShares: Share[];

    @Prop({required: false, type: String, default: "Введите тикер или название компании"})
    private placeholder: string;

    @Prop({required: false, type: Boolean, default: false})
    private autofocus: boolean;

    @Prop({required: false, type: Boolean, default: false})
    private required: boolean;
    @Prop({required: false, type: Array, default: (): any[] => []})
    private rules: any[];

    private filteredSharesMutated: Share[] = [];
    private assetTypeMutated: AssetType;

    @Inject
    private marketService: MarketService;

    /** Текущий объект таймера */
    private currentTimer: number = null;
    private searchQuery: string = null;

    private share: Share = null;
    private shareSearch = false;
    private notFoundLabel = "Ничего не найдено";

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
        if (!this.searchQuery || this.searchQuery.length < 1) {
            this.shareSearch = false;
            return;
        }
        this.shareSearch = true;
        const delay = new Promise((resolve, reject): void => {
            this.currentTimer = setTimeout(async (): Promise<void> => {
                try {
                    if (this.assetType === AssetType.STOCK) {
                        this.filteredSharesMutated = await this.marketService.searchStocks(this.searchQuery);
                    } else if (this.assetType === AssetType.BOND) {
                        this.filteredSharesMutated = await this.marketService.searchBonds(this.searchQuery);
                    } else {
                        this.filteredSharesMutated = await this.marketService.searchShares(this.searchQuery);
                    }
                    this.shareSearch = false;
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });

        try {
            delay.then(() => {
                clearTimeout(this.currentTimer);
                this.shareSearch = false;
            });
        } catch (error) {
            clearTimeout(this.currentTimer);
            this.shareSearch = false;
            throw error;
        }
    }

    private shareLabelSelected(share: Share): string {
        return `${share.ticker} (${share.shortname})`;
    }

    private shareLabelListItem(share: Share): string {
        if ((share as any) === this.notFoundLabel) {
            return this.notFoundLabel;
        }
        if (this.assetTypeMutated === AssetType.STOCK) {
            const price = new BigMoney(share.price);
            return `${share.ticker} (${share.shortname}), ${price.amount.toString()} ${price.currency}`;
        } else if (this.assetTypeMutated === AssetType.BOND) {
            return `${share.ticker} (${share.shortname}), ${(share as Bond).prevprice}%`;
        }
        return `${share.ticker} (${share.shortname})`;
    }

    private onSearchClear(): void {
        this.filteredSharesMutated = [];
        this.$emit("clear");
    }

    private async onShareSelect(share: Share): Promise<void> {
        this.share = share;
        this.$emit("change", this.share);
    }
}
