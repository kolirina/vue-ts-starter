import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {UI} from "../app/ui";
import {Filters} from "../platform/filters/Filters";
import {DividendDashboard} from "../services/dividendService";
import {DashboardBrick} from "../types/types";

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
                <v-flex xl6 lg6 md6 sm12 xs12>
                    <dashboard-brick-component :block="blocks[0]"></dashboard-brick-component>
                </v-flex>
                <v-flex xl6 lg6 md6 sm12 xs12 :align-content-start="true">
                    <dashboard-brick-component :block="blocks[1]"></dashboard-brick-component>
                </v-flex>
            </v-layout>
        </v-container>
    `,
    components: {DashboardBrickComponent}
})
export class DividendDashboardComponent extends UI {

    @Prop({required: true})
    private data: DividendDashboard;

    private blocks: DashboardBrick[] = [];

    created(): void {
        this.fillBricks(this.data);
    }

    @Watch("data")
    private onBlockChange(newValue: DividendDashboard): void {
        this.fillBricks(newValue);
    }

    private fillBricks(newValue: DividendDashboard): void {
        this.blocks[0] = {
            name: "Всего получено дивидендов",
            mainValue: Filters.formatMoneyAmount(newValue.dividendsTotal, true),
            secondValue: Filters.formatMoneyAmount(newValue.dividendsTotalInAlternativeCurrency, true),
            color: "blue",
            icon: "fas fa-briefcase"
        };
        this.blocks[1] = {
            name: "Дивидендная доходность",
            mainValue: newValue.avgProfit,
            secondValue: newValue.lastYearYield,
            secondValueDesc: "Прибыль за последний год",
            color: "orange",
            icon: "fas fa-money-bill-alt"
        };
    }
}
