import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import {Component, Prop, UI} from "../app/ui";
import {Filters} from "../platform/filters/Filters";
import {MarketService} from "../services/marketService";
import {Share} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-rating color="#A1A6B6" size="10" v-model="share.rating" dense full-icon="fiber_manual_record"
                  empty-icon="panorama_fish_eye" @input="putRate" :title="hint"></v-rating>
    `
})
export class StockRate extends UI {

    @Inject
    private marketService: MarketService;
    @Prop({required: true})
    private share: Share;

    private async putRate(): Promise<void> {
        await this.marketService.putRate(this.share.rating, this.share.ticker);
        this.$snotify.info("Ваш голос учтен");
    }

    private get hint(): string {
        const count = new Decimal(this.share.ratingCount).toDP(0).toNumber();
        return `На основе ${count} ${Filters.declension(count, "голоса", "голосов", "голосов")} пользователей`;
    }
}