import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
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
        <base-share-info-page :ticker="ticker"></base-share-info-page>
    `,
    components: {BaseShareInfoPage}
})
export class ShareInfoPage extends UI {

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Код ценной бумаги */
    private ticker: string = null;

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
}
