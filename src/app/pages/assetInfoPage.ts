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

import {namespace} from "vuex-class";
import {Component, UI, Watch} from "../app/ui";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {EventType} from "../types/eventType";
import {Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {BaseShareInfoPage} from "./shareInfo/baseShareInfoPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <base-share-info-page :ticker="ticker" :asset-type="AssetType.ASSET" :portfolio-avg-price="portfolioAvgPrice"></base-share-info-page>
    `,
    components: {BaseShareInfoPage}
})
export class AssetInfoPage extends UI {

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Код ценной бумаги */
    private ticker: string = null;
    /** Типы активов */
    private AssetType = AssetType;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.ticker = this.$route.params.ticker;
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio(this.portfolio.id));
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    /**
     * Следит за изменение тикера в url.
     * Не вызывается при первоначальной загрузке
     */
    @Watch("$route.params.ticker")
    private onRouterChange(): void {
        this.ticker = this.$route.params.ticker;
    }

    private get portfolioAvgPrice(): number {
        const assetRow = this.portfolio.overview.assetPortfolio.rows.find(row => String(row.share.id) === this.ticker);
        return assetRow ? new BigMoney(assetRow.avgBuy).amount.toNumber() : null;
    }

}
