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
        <div class="portfolio-rows-filter">
            <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="416" :nudge-bottom="40" bottom>
                <v-btn slot="activator" round class="portfolio-rows-filter__button">
                    Фильтры
                    <span class="portfolio-rows-filter__button__icon"></span>
                </v-btn>

                <v-card class="portfolio-rows-filter__settings" style="box-shadow: none !important;">
                    <slot></slot>
                </v-card>
            </v-menu>
            <v-text-field v-model="searchQuery" @click:clear="onClear" prepend-icon="search" :label="searchLabel" clearable single-line hide-details></v-text-field>
        </div>
    `
})
export class TableFilterBase extends UI {

    @Prop({required: false, type: String, default: "Поиск"})
    private searchLabel: string;
    @Prop({required: false, type: Number, default: 0})
    private minLength: number;
    private searchQuery: string = null;
    private menu = false;

    @Watch("searchQuery")
    private async onSearch(): Promise<void> {
        if (!this.searchQuery || this.searchQuery.length <= this.minLength) {
            this.$emit("search", "");
            return;
        }
        this.$emit("search", this.searchQuery);
    }

    private onClear(): void {
        this.$emit("search", "");
    }
}