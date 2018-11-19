import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {UI} from "../app/ui";
import {Filters} from "../platform/filters/Filters";
import {DashboardBrick, DashboardData} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-card dark :color="block.color">
            <v-card-title primary-title>
                <div>{{ block.name }}</div>
            </v-card-title>
            <v-container fluid>
                <v-layout row>
                    <div class="headline">
                        <v-icon>{{ block.icon }}</v-icon>
                        <span><b>{{ block.mainValue }}</b></span>
                    </div>
                </v-layout>
                <v-layout row>
                    <div>
                        <span><b>{{ block.secondValue }}</b> </span>
                        <span>{{ block.secondValueDesc }}</span>
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
        <v-container v-if="data" grid-list-md text-xs-center fluid>
            <v-layout row wrap>
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

    @Prop({required: true})
    private data: DashboardData;

    private blocks: DashboardBrick[] = [];

    created(): void {
        this.fillBricks(this.data);
    }

    @Watch("data")
    private onBlockChange(newValue: DashboardData): void {
        this.fillBricks(newValue);
    }

    private fillBricks(newValue: DashboardData): void {
        this.blocks[0] = {
            name: "Суммарная стоимость",
            mainValue: Filters.formatMoneyAmount(newValue.currentCost, true),
            secondValue: Filters.formatMoneyAmount(newValue.currentCostInAlternativeCurrency, true),
            color: "blue",
            icon: "fas fa-briefcase"
        };
        this.blocks[1] = {
            name: "Суммарная прибыль",
            mainValue: Filters.formatMoneyAmount(newValue.profit, true),
            secondValue: newValue.percentProfit,
            secondValueDesc: "без дивидендов и купонов",
            color: "orange",
            icon: "fas fa-money-bill-alt"
        };
        this.blocks[2] = {
            name: "Среднегодовая доходность",
            mainValue: newValue.yearYield,
            secondValue: newValue.yearYieldWithoutDividendsAndCoupons,
            color: "green",
            icon: "fas fa-chart-bar"
        };
        this.blocks[3] = {
            name: "Изменение за день",
            mainValue: Filters.formatMoneyAmount(newValue.dailyChanges, true),
            secondValue: Filters.formatNumber(newValue.dailyChangesPercent),
            color: "red",
            icon: "fas fa-hand-holding-usd"
        };
    }
}
