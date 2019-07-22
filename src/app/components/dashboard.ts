import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {UI} from "../app/ui";
import {Filters} from "../platform/filters/Filters";
import {BigMoney} from "../types/bigMoney";
import {DashboardBrick, DashboardData} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-card dark class="dashboard-card" :class="{ 'dashboard-border': !block.hasNotBorderLeft }">
            <v-card-title primary-title class="pb-2 dashboard-card-string">
                <span>{{ block.name }}</span>
                <v-tooltip content-class="custom-tooltip-wrap dashboard-tooltip" :max-width="450" bottom right>
                    <v-icon class="dashboard-info" slot="activator" small></v-icon>
                    <span v-html="block.tooltip"></span>
                </v-tooltip>
            </v-card-title>
            <v-container fluid pl-3 pt-0>
                <v-layout row class="mx-0 py-2 ">
                    <span class="dashboard-currency dashboard-card-big-nums" :class="block.mainCurrency">{{ block.mainValue }} </span>
                </v-layout>
                <v-layout row class="mx-0 dashboard-card-small-nums">
                    <div>
                        <template v-if="block.isSummaryIncome">
                            <div class="dashboard-summary-income dashboard-currency" :class="block.isSummaryIncome.isUpward ? 'arrow-up' : 'arrow-down'">
                                <div class="dashboard-summary-income-icon">
                                    <v-icon>{{ block.isSummaryIncome.isUpward ? 'arrow_upward' : 'arrow_downward' }}</v-icon>
                                </div>
                                <div class="dashboard-summary-income-text dashboard-currency" :class="block.secondCurrency">
                                    <span>{{ block.secondValue }}</span>
                                </div>
                            </div>
                        </template>

                        <template v-else>
                            <span class="dashboard-currency" :class="block.secondCurrency">{{ block.secondValue }} </span>
                            <span class="dashboard-second-value-desc">{{ block.secondValueDesc }} </span>
                            <v-tooltip v-if="block.secondTooltip" content-class="custom-tooltip-wrap dashboard-tooltip" :max-width="450" bottom right>
                                <sup slot="activator">
                                    <v-icon slot="activator" style="font-size: 12px">far fa-question-circle</v-icon>
                                </sup>
                                <span>{{ block.secondTooltip }}</span>
                            </v-tooltip>
                        </template>
                    </div>
                </v-layout>
            </v-container>
        </v-card>
    `
})
export class DashboardBrickComponent extends UI {

    @Prop({required: true})
    private block: DashboardBrick;
}

@Component({
    // language=Vue
    template: `
        <v-container v-if="data" px-0 grid-list-md text-xs-center fluid :class="{'fixed-dashboard': fixedDashboard}" v-scroll="setDashboardPosition">
            <v-layout class="dashboard-wrap px-4 selectable" row wrap :class="{'menu-open': !sideBarOpened}">
                <v-flex xl3 lg3 md6 sm12 xs12>
                    <dashboard-brick-component :block="blocks[0]"></dashboard-brick-component>
                </v-flex>
                <v-flex xl3 lg3 md6 sm12 xs12 :align-content-start="true">
                    <dashboard-brick-component :block="blocks[1]"></dashboard-brick-component>
                </v-flex>
                <v-flex xl3 lg3 md6 sm12 xs12>
                    <dashboard-brick-component :block="blocks[2]"></dashboard-brick-component>
                </v-flex>
                <v-flex xl3 lg3 md6 sm12 xs12>
                    <dashboard-brick-component :block="blocks[3]"></dashboard-brick-component>
                </v-flex>
            </v-layout>
        </v-container>
    `,
    components: {DashboardBrickComponent}
})
export class Dashboard extends UI {

    /** Валюта информации в дашборде */
    @Prop({required: true, type: String})
    private viewCurrency: string;
    /** Признак открытой боковой панели */
    @Prop({required: true, type: Boolean, default: true})
    private sideBarOpened: boolean;
    /** Данные по дашборду */
    @Prop({required: true})
    private data: DashboardData;
    /** Блоки для отображения дашборда */
    private blocks: DashboardBrick[] = [];
    /** Признак зафиксированного дашборда */
    private fixedDashboard = false;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    created(): void {
        this.fillBricks(this.data);
    }

    @Watch("data")
    private onBlockChange(newValue: DashboardData): void {
        this.fillBricks(newValue);
    }

    private fillBricks(newValue: DashboardData): void {
        const mainCurrency = this.viewCurrency.toLowerCase();
        const secondCurrency = new BigMoney(newValue.currentCostInAlternativeCurrency).currency.toLowerCase();

        this.blocks[0] = {
            name: "Суммарная стоимость",
            mainValue: Filters.formatMoneyAmount(newValue.currentCost, true),
            secondValue: Filters.formatMoneyAmount(newValue.currentCostInAlternativeCurrency, true),
            hasNotBorderLeft: true,
            mainCurrency,
            secondCurrency: secondCurrency,
            tooltip: "Сумма текущей рыночной стоимости всех активов портфеля: акций, облигаций, денежных средств.<br/>" +
                "                                Текущая стоимость облигаций учитывает НКД, который Вы получите при продаже бумаги," +
                "                                или заплатите при откупе короткой позиции.<br/>" +
                "                                При этом стоимость акций, номинированных в валюте, пересчитывается по текущему курсу рубля.<br/>" +
                "                                Ниже указана суммарная стоимость портфеля, пересчитанная в долларах по текущему курсу."
        };
        this.blocks[1] = {
            name: "Суммарная прибыль",
            mainValue: Filters.formatMoneyAmount(newValue.profit, true),
            secondValue: newValue.percentProfit,
            isSummaryIncome: {
                isUpward: parseFloat(newValue.percentProfit) > 0
            },
            mainCurrency,
            secondCurrency: "percent",
            tooltip: "Прибыль, образованная активами портфеля за все его время." +
                "                                Она включает в себя: прибыль от совершенных ранее сделок (бумага куплена дешевле и продана дороже)," +
                "                                выплаченные дивиденды и купоны, курсовую прибыль (бумага куплена дешевле и подорожала, но еще не продана).<br/>" +
                "                                Ввод и вывод денежных средств на прибыль портфеля не влияют. <br/>" +
                "                                Ниже указана прибыль портфеля в отношении к его средневзвешенной стоимости вложений с учетом денег."
        };
        this.blocks[2] = {
            name: "Среднегодовая доходность",
            mainValue: newValue.yearYield,
            secondValue: newValue.yearYieldWithoutDividendsAndCoupons,
            mainCurrency: "percent",
            secondCurrency: "percent",
            tooltip: "Доходность в процентах годовых. Рассчитывается исходя из прибыли портфеля с даты первой сделки по текущий момент.<br/>" +
                "                                Например, если портфель за полгода существования принес 8%, то его годовая доходность будет 16%." +
                "                                Показатель полезен для сравнения доходности портфеля с банковскими депозитами и другими активами.<br/>" +
                "                                Расчет ведется на основе средневзвешенной стоимости портфеля с учетом денежных средств.",
            secondTooltip: "Доходность без учета дивидендов и выплат по облигациям"
        };
        this.blocks[3] = {
            name: "Изменение за день",
            mainValue: Filters.formatMoneyAmount(newValue.dailyChanges, true),
            secondValue: Filters.formatNumber(newValue.dailyChangesPercent),
            isSummaryIncome: {
                isUpward: parseFloat(Filters.formatNumber(newValue.dailyChangesPercent)) > 0
            },
            mainCurrency,
            secondCurrency: "percent",
            tooltip: "Показывает на сколько изменилась курсовая суммарная стоимость портфеля за последний торговый день." +
                "                                Эта разница возникает за счет изменения биржевой цены входящих в портфель активов."
        };
    }

    private setDashboardPosition(e: any): void {
        const fixed = e.target.scrollingElement.scrollHeight - e.target.scrollingElement.clientHeight > 155 && e.target.scrollingElement.scrollTop > 50;
        if (fixed && !this.fixedDashboard) {
            this.fixedDashboard = true;
        }
        if (e.target.scrollingElement.scrollTop === 0) {
            this.fixedDashboard = false;
        }
    }
}
