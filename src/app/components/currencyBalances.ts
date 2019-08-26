/**
 * Компонент для inplace-редактирования.
 */
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <v-layout column>
            <div class="maxW275 margT24">
                <ii-number-field @keydown.enter="confirmEmit" :decimals="2" :suffix="'RUB'" label="Текущий остаток"
                                 v-model="currencyRub" persistent-hint autofocus :hint="hint" @change="currencyRubChange">
                </ii-number-field>
            </div>
            <div class="maxW275 margT24">
                <ii-number-field @keydown.enter="confirmEmit" :decimals="2" :suffix="'USD'" label="Текущий остаток"
                                 v-model="currencyUsd" persistent-hint autofocus :hint="hint" @change="currencyUsdChange">
                </ii-number-field>
            </div>
            <div class="maxW275 margT24">
                <ii-number-field @keydown.enter="confirmEmit" :decimals="2" :suffix="'EUR'" label="Текущий остаток"
                                 v-model="currencyEur" persistent-hint autofocus :hint="hint" @change="currencyEurChange">
                </ii-number-field>
            </div>
        </v-layout>
    `
})
export class CurrencyBalances extends UI {

    private currencyRub: string = "";
    private currencyUsd: string = "";
    private currencyEur: string = "";

    @Prop()
    private currency: any = null;
    @Prop()
    private hint: string = "";

    mounted(): void {
        this.currencyRub = this.currency.currencyRub;
        this.currencyUsd = this.currency.currencyUsd;
        this.currencyEur = this.currency.currencyEur;
    }

    private currencyRubChange(): void {
        this.$emit("currencyRubChange", this.currencyRub);
    }

    private currencyUsdChange(): void {
        this.$emit("currencyRubChange", this.currencyUsd);
    }

    private currencyEurChange(): void {
        this.$emit("currencyRubChange", this.currencyEur);
    }

    private confirmEmit(): void {
        this.$emit("confirm");
    }
}