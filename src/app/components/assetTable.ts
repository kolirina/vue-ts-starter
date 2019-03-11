import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {PortfolioAssetType} from "../types/portfolioAssetType";
import {AssetRow, Portfolio, TableHeader} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="assets" hide-actions>
            <template #items="props">
                <tr class="selectable">
                    <td>{{ props.item.type | assetDesc }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.currCost | amount(true) }}</td>
                    <td :class="[( amount(props.item.profit) >= 0 ) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell', 'text-xs-right']">
                        {{ props.item.profit | amount(true) }}
                    </td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.percCurrShare | number }}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" flat icon dark>
                                <span class="menuDots"></span>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile v-if="!isMoneyTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.BUY)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-plus</v-icon>
                                        Купить
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="!isMoneyTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.SELL)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-minus</v-icon>
                                        Продать
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isMoneyTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.DEPOSIT)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-plus</v-icon>
                                        Внести
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isMoneyTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.WITHDRAW)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-minus</v-icon>
                                        Вывести
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isStockTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.DIVIDEND)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                        Дивиденд
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isBondTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.COUPON)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                        Купон
                                    </v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class AssetTable extends UI {

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;

    private headers: TableHeader[] = [
        {text: "Актив", sortable: false, value: "name"},
        {text: "Текущая стоимость", align: "center", value: "currCost"},
        {text: "Прибыль", align: "center", value: "profit"},
        {text: "Текущая доля", align: "center", value: "percCurrShare"},
        {text: "Действия", align: "center", value: "name", sortable: false, width: "25"}
    ];

    @Prop({default: [], required: true})
    private assets: AssetRow[];

    private operation = Operation;

    private async openTradeDialog(assetRow: AssetRow, operation: Operation): Promise<void> {
        const assetType = PortfolioAssetType.valueByName(assetRow.type);
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            operation,
            moneyCurrency: assetType.currency ? assetType.currency.code : null,
            assetType: assetType.assetType
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private amount(value: string): number {
        if (!value) {
            return 0.00;
        }
        const amount = new BigMoney(value);
        return amount.amount.toNumber();
    }

    private isBondTrade(item: AssetRow): boolean {
        return PortfolioAssetType.valueByName(item.type).assetType === AssetType.BOND;
    }

    private isStockTrade(item: AssetRow): boolean {
        return PortfolioAssetType.valueByName(item.type).assetType === AssetType.STOCK;
    }

    private isMoneyTrade(item: AssetRow): boolean {
        return PortfolioAssetType.valueByName(item.type).assetType === AssetType.MONEY;
    }
}
