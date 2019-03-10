import {DataPoint} from "highcharts";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {Portfolio} from "../../types/types";
import {ChartUtils} from "../../utils/chartUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <pie-chart :data="chartData" :balloon-title="portfolio.portfolioParams.name" :view-currency="portfolio.portfolioParams.viewCurrency"></pie-chart>
    `
})
export class SectorsChart extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    private chartData: DataPoint[] = [];

    created(): void {
        this.chartData = ChartUtils.doSectorsChartData(this.portfolio.overview).data;
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        this.chartData = ChartUtils.doSectorsChartData(this.portfolio.overview).data;
    }

}
