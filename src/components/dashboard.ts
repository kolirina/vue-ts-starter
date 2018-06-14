import Component from 'vue-class-component';
import {UI} from '../app/UI';
import {Prop, Watch} from 'vue-property-decorator';
import {DashboardBrick, DashboardData} from '../types/types';

@Component({
    // language=Vue
    template: `
        <v-card dark :color="block.color">
            <v-card-title primary-title>
                <div>{{ block.name }}</div>
            </v-card-title>
            <v-container fluid>
                <v-layout row>
                    <v-flex class="headline">
                        <v-icon>{{ block.icon }}</v-icon>
                        <span>{{ block.mainValue }}</span>
                    </v-flex>
                </v-layout>
                <v-layout row :align-start="true" :align-content-start="true">
                    <v-flex>
                        <span>{{ block.secondValue }}</span>
                        <span>{{ block.secondValueDesc }}</span>
                    </v-flex>
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
                <v-flex xs3>
                    <dashboard-brick-component :block="blocks[0]"></dashboard-brick-component>
                </v-flex>
                <v-flex xs3 :align-content-start="true">
                    <dashboard-brick-component :block="blocks[1]"></dashboard-brick-component>
                </v-flex>
                <v-flex xs3>
                    <dashboard-brick-component :block="blocks[2]"></dashboard-brick-component>
                </v-flex>
                <v-flex xs3>
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

    @Watch('data')
    private onBlockChange(newValue: DashboardData): void {
        this.fillBricks(newValue);
    }

    private created(): void {
        this.fillBricks(this.data);
        console.log('DASHBOARD: ', this.blocks);
    }

    private fillBricks(newValue: DashboardData): void {
        this.blocks[0] = {
            name: 'Суммарная стоимость',
            mainValue: newValue.currentCost,
            secondValue: newValue.currentCostInAlternativeCurrency,
            color: 'blue',
            icon: 'fas fa-briefcase'
        };
        this.blocks[1] = {
            name: 'Суммарная прибыль',
            mainValue: newValue.profit,
            secondValue: newValue.profitWithoutDividendsAndCoupons,
            secondValueDesc: 'без дивидендов и купонов',
            color: 'orange',
            icon: 'fas fa-money-bill-alt'
        };
        this.blocks[2] = {
            name: 'Среднегодовая доходность',
            mainValue: newValue.yearYield,
            secondValue: newValue.yearYieldWithoutDividendsAndCoupons,
            color: 'green',
            icon: 'fas fa-chart-bar'
        };
        this.blocks[3] = {
            name: 'Изменение за день',
            mainValue: newValue.dailyChanges,
            secondValue: newValue.dailyChangesPercent,
            color: 'red',
            icon: 'fas fa-hand-holding-usd'
        };
    }
}
