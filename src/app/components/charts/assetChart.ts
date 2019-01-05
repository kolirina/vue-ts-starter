import {Decimal} from "decimal.js";
import {DataPoint} from "highcharts";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {BigMoney} from "../../types/bigMoney";
import {Portfolio} from "../../types/types";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <pie-chart :data="chartData" :balloon-title="portfolio.portfolioParams.name"></pie-chart>
    `
})
export class AssetChart extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    private chartData: DataPoint[] = [];

    created(): void {
        this.chartData = this.doPieChartData();
    }

    @Watch("portfolio")
    private onPortfolioChange(): void {
        this.chartData = this.doPieChartData();
    }

    private assetDesc(type: string): string {
        switch (type) {
            case "STOCK":
                return "Акции";
            case "BOND":
                return "Облигации";
            case "RUBLES":
                return "Рубли";
            case "DOLLARS":
                return "Доллары";
            case "EURO":
                return "Евро";
            case "ETF":
                return "ETF";
        }
        throw new Error("Неизвестный тип актива: " + type);
    }

    private doPieChartData(): DataPoint[] {
        const data: DataPoint[] = [];
        this.portfolio.overview.assetRows.filter(value => new BigMoney(value.currCost).amount.toString() !== "0").forEach(row => {
            data.push({
                name: this.assetDesc(row.type),
                y: new Decimal(new BigMoney(row.currCost).amount.abs().toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        return data;
    }
}
