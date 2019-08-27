import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {OverviewService} from "../services/overviewService";
import {MoneyResiduals, PortfolioService} from "../services/portfolioService";
import {BigMoney} from "../types/bigMoney";

@Component({
    // language=Vue
    template: `
        <div>
            <v-layout column>
                <div class="maxW275 margT24">
                    <ii-number-field @keydown.enter="specifyResidues" :decimals="2" :suffix="'RUB'" label="Текущий остаток в RUB"
                                     v-model="currencyRub" persistent-hint :hint="rubHint" :rules="rulesMoney" name="currency_rub" v-validate="'required'">
                    </ii-number-field>
                </div>
                <div class="maxW275 margT24">
                    <ii-number-field @keydown.enter="specifyResidues" :decimals="2" :suffix="'USD'" label="Текущий остаток в USD"
                                     v-model="currencyUsd" persistent-hint :hint="usdHint" :rules="rulesMoney" name="currency_usd" v-validate="'required'">
                    </ii-number-field>
                </div>
                <div class="maxW275 margT24">
                    <ii-number-field @keydown.enter="specifyResidues" :decimals="2" :suffix="'EUR'" label="Текущий остаток в EUR"
                                     v-model="currencyEur" persistent-hint :hint="eurHint" :rules="rulesMoney" name="currency_eur" v-validate="'required'">
                    </ii-number-field>
                </div>
                <div class="maxW275 margT24 btn-section">
                    <v-btn color="primary" class="big_btn" @click.native="specifyResidues()">
                        Добавить
                    </v-btn>
                </div>
            </v-layout>
        </div>
    `
})
export class CurrencyBalances extends UI {
    @Inject
    private overviewService: OverviewService;
    @Inject
    private portfolioService: PortfolioService;

    @Prop({required: true})
    private portfolioId: number;

    private rulesMoney = [(val: string): boolean | string => !!val || "Укажите сумму"];
    private currencyRub: string = "";
    private currencyUsd: string = "";
    private currencyEur: string = "";
    private rubHint: string = "";
    private usdHint: string = "";
    private eurHint: string = "";

    async created(): Promise<void> {
        await this.loadSetCashBalances();
    }

    private async loadSetCashBalances(): Promise<void> {
        const currency: MoneyResiduals = await this.portfolioService.getMoneyResiduals(this.portfolioId);
        this.currencyRub = new BigMoney(currency.RUB).amount.toString();
        this.currencyUsd = new BigMoney(currency.USD).amount.toString();
        this.currencyEur = new BigMoney(currency.EUR).amount.toString();
        this.rubHint = `Ваш текущий остаток на сервисе ${currency.RUB}`;
        this.usdHint = `Ваш текущий остаток на сервисе ${currency.USD}`;
        this.eurHint = `Ваш текущий остаток на сервисе ${currency.EUR}`;
    }

    private async specifyResidues(): Promise<void> {
        const result = await this.$validator.validateAll();
        if (!result) {
            return;
        }
        await this.overviewService.saveOrUpdateCurrentMoney(this.portfolioId, [
            {currentMoney: this.currencyRub, currency: "RUB"},
            {currentMoney: this.currencyUsd, currency: "USD"},
            {currentMoney: this.currencyEur, currency: "EUR"}
        ]);
        await this.loadSetCashBalances();
        this.$emit("specifyResidues");
        this.$snotify.info("Остатки денежных средств успешно внесены");
    }
}