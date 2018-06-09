import Component from "vue-class-component";
import {UI} from "../app/UI";
import {Prop, Watch} from "vue-property-decorator";
import {DashboardBlock, DashboardBrick} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-card dark :color="block.color">
            <v-card-title primary-title>
                <div>{{ block.name }}</div>
            </v-card-title>
            <v-container fluid>
                <v-layout row>
                    <v-flex class="headline" :align-content-start="true">
                        <v-icon>{{ block.icon }}</v-icon>
                        <span>{{ block.mainValue }}</span>
                    </v-flex>
                </v-layout>
                <v-layout row>
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
    private data: DashboardBlock;

    private blocks: DashboardBrick[] = [];

    @Watch('data')
    private onBlockChange(newValue: DashboardBlock): void {
        this.blocks = newValue.bricks;
    }

    private created(): void {
        this.blocks = this.data.bricks;
    }
}
