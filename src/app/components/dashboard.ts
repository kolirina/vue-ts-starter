import Decimal from "decimal.js";
import {namespace} from "vuex-class";
import {Component, Prop, UI, Watch} from "../app/ui";
import {Filters} from "../platform/filters/Filters";
import {ClientInfo} from "../services/clientService";
import {BigMoney} from "../types/bigMoney";
import {DashboardBrick, DashboardData, Overview} from "../types/types";
import {DateUtils} from "../utils/dateUtils";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-card dark class="dashboard-card" v-tariff-expired-hint>
            <div class="dashboard-card-string">
                <span>{{ block.name }}</span>
                <v-tooltip content-class="custom-tooltip-wrap dashboard-tooltip" :max-width="450" bottom right>
                    <v-icon class="dashboard-info" slot="activator" small></v-icon>
                    <span v-html="block.tooltip"></span>
                </v-tooltip>
            </div>
            <div class="dashboard-card__info">
                <v-layout class="dashboard-value">
                    <span class="dashboard-currency dashboard-card-big-nums" :class="block.mainValueIcon ? '' : block.mainCurrency">
                        <template v-if="block.mainValueIcon">
                            <v-tooltip content-class="custom-tooltip-wrap dashboard-tooltip" class="ml-1" :max-width="450" bottom right>
                                <span slot="activator" :class="block.mainValueIcon"></span>
                                <span v-html="block.tooltip"></span>
                             </v-tooltip>
                        </template>
                        <template v-else>
                            {{ block.mainValue }}
                        </template>
                    </span>
                    <v-tooltip v-if="block.mainValueTooltip" content-class="custom-tooltip-wrap dashboard-tooltip" class="ml-1" :max-width="450" bottom right>
                        <sup slot="activator">
                            <v-icon slot="activator" style="font-size: 12px">far fa-question-circle</v-icon>
                        </sup>
                        <span v-html="block.mainValueTooltip"></span>
                    </v-tooltip>
                </v-layout>
                <v-layout row class="dashboard-card-small-nums">
                    <template v-if="block.isSummaryIncome">
                        <div class="dashboard-summary-income dashboard-currency" :class="block.isSummaryIncome.isUpward ? 'arrow-up' : 'arrow-down'">
                            <div class="dashboard-summary-income-icon">
                                <v-icon>{{ block.isSummaryIncome.isUpward ? 'arrow_upward' : 'arrow_downward' }}</v-icon>
                            </div>
                            <div v-if="block.secondValue" class="dashboard-summary-income-text dashboard-currency" :class="block.secondCurrency">
                                <span>{{ block.secondValue }} </span>
                            </div>
                            <v-tooltip v-if="block.secondTooltip" content-class="custom-tooltip-wrap dashboard-tooltip" class="ml-1" :max-width="450" bottom right>
                                <sup slot="activator">
                                    <v-icon slot="activator" style="font-size: 12px" :class="block.isSummaryIncome.isUpward ? 'arrow-up' : 'arrow-down'">far
                                        fa-question-circle
                                    </v-icon>
                                </sup>
                                <span v-html="block.secondTooltip"></span>
                            </v-tooltip>
                        </div>
                    </template>

                    <template v-else>
                        <span v-if="block.secondValue" class="dashboard-currency" :class="block.secondCurrency">{{ block.secondValue }} </span>
                        <span class="dashboard-second-value-desc">{{ block.secondValueDesc }} </span>
                        <v-tooltip v-if="block.secondTooltip" content-class="custom-tooltip-wrap dashboard-tooltip" class="ml-1" :max-width="450" bottom right>
                            <sup slot="activator">
                                <v-icon slot="activator" style="font-size: 12px">far fa-question-circle</v-icon>
                            </sup>
                            <span v-html="block.secondTooltip"></span>
                        </v-tooltip>
                    </template>
                </v-layout>
            </div>
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
        <v-container v-if="overview" px-0 py-0 grid-list-md text-xs-center fluid>
            <v-layout class="dashboard-wrap selectable" row wrap :class="{'menu-open': !sideBarOpened}">
                <v-flex class="dashboard-item" xl3 lg3 md6 sm6 xs12>
                    <dashboard-brick-component :block="blocks[0]"></dashboard-brick-component>
                </v-flex>
                <v-flex class="dashboard-item" xl3 lg3 md6 sm6 xs12 :align-content-start="true">
                    <dashboard-brick-component :block="blocks[1]"></dashboard-brick-component>
                </v-flex>
                <v-flex class="dashboard-item" xl3 lg3 md6 sm6 xs12>
                    <dashboard-brick-component :block="blocks[2]"></dashboard-brick-component>
                </v-flex>
                <v-flex class="dashboard-item" xl3 lg3 md6 sm6 xs12>
                    <dashboard-brick-component :block="blocks[3]"></dashboard-brick-component>
                    <v-menu transition="slide-y-transition" open-on-hover right bottom nudge-bottom="24px" close-delay="100" max-width="450"
                            content-class="custom-tooltip-wrap dashboard-tooltip" class="block">
                        <div slot="activator" class="intel-icon icon-stock"></div>
                        <span>
                            Котировки активов обновляются в рабочее время MOEX и NYSE с 15 минутной задержкой.
                            <a href="https://www.moex.com/s223" target="_blank">Расписание Московской биржи</a>,
                            биржи <span class="no-wrap">
                            в <a href="https://www.nyse.com/markets/hours-calendars" target="_blank">Нью-Йорке</a></span>.
                        </span>
                    </v-menu>
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
    /** Данные по портфелю */
    @Prop({required: true})
    private overview: Overview;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    /** Блоки для отображения дашборда */
    private blocks: DashboardBrick[] = [];
    /** Дата, начиная с которой для новых пользователей будет отображаться показатель Прибыль в процентах рассчитаная относительно текущей стоимости */
    private readonly NEW_USERS_DATE = DateUtils.parseDate("2020-04-01");

    private readonly YIELD_TOOLTIP = "Доходность в процентах годовых. Рассчитывается исходя из прибыли портфеля с даты первой сделки по текущий момент.<br/>" +
        "                             Например, если портфель за полгода существования принес 8%, то его годовая доходность будет 16%." +
        "                             Показатель полезен для сравнения доходности портфеля с банковскими депозитами и другими активами.<br/>" +
        "                             Расчет ведется на основе средневзвешенной стоимости портфеля с учетом денежных средств.<br/>";

    /**
     * Инициализация данных
     * @inheritDoc
     */
    created(): void {
        this.fillBricks(this.overview.dashboardData);
    }

    @Watch("overview")
    private onBlockChange(newValue: Overview): void {
        this.overview = newValue;
        this.fillBricks(newValue.dashboardData);
    }

    private fillBricks(newValue: DashboardData): void {
        const mainCurrency = this.viewCurrency.toLowerCase();
        const secondCurrency = new BigMoney(newValue.currentCostInAlternativeCurrency).currency.toLowerCase();

        this.blocks[0] = {
            name: "Стоимость",
            mainValue: Filters.formatMoneyAmount(newValue.currentCost, true),
            secondValue: Filters.formatMoneyAmount(newValue.currentCostInAlternativeCurrency, true),
            mainCurrency,
            secondCurrency: secondCurrency,
            tooltip: "Сумма текущей рыночной стоимости всех активов портфеля: акций, облигаций, денежных средств.<br/>" +
                "                                Текущая стоимость облигаций учитывает НКД, который Вы получите при продаже бумаги," +
                "                                или заплатите при откупе короткой позиции.<br/>" +
                "                                При этом стоимость акций, номинированных в валюте, пересчитывается по текущему курсу рубля.<br/>" +
                "                                Ниже указана суммарная стоимость портфеля, пересчитанная в долларах по текущему курсу."
        };
        this.blocks[1] = {
            name: "Прибыль",
            mainValue: Filters.formatMoneyAmount(newValue.profit, true),
            secondValue: this.percentProfitBySummary ? newValue.percentProfitBySummaryCost : newValue.percentProfit,
            isSummaryIncome: {
                isUpward: parseFloat(this.percentProfitBySummary ? newValue.percentProfitBySummaryCost : newValue.percentProfit) > 0
            },
            mainCurrency,
            secondCurrency: "percent",
            tooltip: "Прибыль, образованная активами портфеля за все его время." +
                "                                Она включает в себя: прибыль от совершенных ранее сделок (бумага куплена дешевле и продана дороже)," +
                "                                выплаченные дивиденды и купоны, курсовую прибыль (бумага куплена дешевле и подорожала, но еще не продана).<br/>" +
                "                                Сумму по сделкам с типом Расход и Доход.<br/>" +
                "                                Ввод и вывод денежных средств на прибыль портфеля не влияют. <br/>",
            mainValueTooltip: `Пользовательская прибыль: ${Filters.formatMoneyAmount(newValue.usersIncomes)}<br/>
                               Пользовательские убытки: ${Filters.formatMoneyAmount(newValue.usersLosses)}<br/>
                               В системе установлен курс валют с ММВБ`,
            secondTooltip:
                `Прибыль портфеля в отношении к его ${this.percentProfitBySummary ? "суммарной текущей стоимости" : "средневзвешенной стоимости вложений"} с учетом денег.<br/>
Прибыль портфеля посчитанная относительно ${this.percentProfitBySummary ? "средневзвешенной стоимости вложений" : "суммарной текущей стоимости"}: ` +
                ` <b>${this.percentProfitBySummary ? newValue.percentProfit : newValue.percentProfitBySummaryCost} %</b>`
        };
        const showSecondYield = !this.invalidYieldData[0];
        this.blocks[2] = {
            name: "Среднегодовая доходность",
            mainValue: newValue.yearYield,
            secondValue: showSecondYield ? newValue.yearYieldWithoutDividendsAndCoupons : null,
            mainCurrency: "percent",
            secondCurrency: "percent",
            tooltip: this.invalidYieldData[1],
            mainValueIcon: this.invalidYieldData[0],
            secondTooltip: showSecondYield ? "Доходность без учета дивидендов и выплат по облигациям" : null
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
                "                                Эта разница возникает за счет изменения биржевой цены входящих в портфель активов.",
            secondTooltip: "Изменение за день в процентах, посчитанное относительно стоимости портфеля за предыдущий день, без учета денежных средств"
        };
    }

    /**
     * Возвращает признак отображать ли Премиум тариф
     */
    private get percentProfitBySummary(): boolean {
        return DateUtils.parseDate(this.clientInfo.user.regDate).isAfter(this.NEW_USERS_DATE);
    }

    private get invalidYieldData(): [string, string] {
        const yearYield = new Decimal(this.overview.dashboardData.yearYield);
        const daysDiff = DateUtils.parseDate(DateUtils.currentDate()).diff(this.overview.firstTradeDate, "day");
        if (daysDiff <= 30 && yearYield.abs().comparedTo(new Decimal("50")) >= 0) {
            return ["broken-portfolio-icon", `Для расчета доходности необходим период не менее 30 дней. Текущее значение: ${this.overview.dashboardData.yearYield} %`];
        }
        return [null, this.YIELD_TOOLTIP];
    }
}
