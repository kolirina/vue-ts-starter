import {UI} from "../../app/UI";
import Component from "vue-class-component";
import * as Chartist from "chartist";

@Component({
    // language=Vue
    template: `
        <v-container grid-list-md text-xs-center>
            <v-layout row wrap>
                <v-flex xs12>
                    <div v-show="chart" class="ct-chart" style="width: 100%; height: 500px" id="chart"></div>
                    <v-progress-circular v-if="!chart" :size="70" :width="7" indeterminate color="purple"></v-progress-circular>
                </v-flex>
            </v-layout>
        </v-container>
    `
})
export class PieChart extends UI {

    private chart: any = null;

    private mounted(): void {
        setTimeout(() => {
            this.chart = new Chartist.Line('.ct-chart', {
                labels: [1, 2, 3, 4, 5, 6, 7, 8],
                series: [
                    [5, 9, 7, 8, 5, 3, 5, 4]
                ]
            }, {
                low: 0,
                showArea: true
            });
        }, 6000);
    }
}