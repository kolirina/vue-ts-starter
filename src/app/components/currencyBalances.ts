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
            <v-layout v-if="residuals" column>
                <div class="maxW275 w100pc margT24">
                    <ii-number-field @keydown.enter="specifyResidues" :decimals="2" :suffix="'RUB'" label="Текущий остаток в RUB"
                                     v-model="currencyRub" persistent-hint :hint="getHint('RUB')" :rules="rulesMoney" name="currency_rub" v-validate="'required'">
                    </ii-number-field>
                </div>
                <div class="maxW275 w100pc margT24">
                    <ii-number-field @keydown.enter="specifyResidues" :decimals="2" :suffix="'USD'" label="Текущий остаток в USD"
                                     v-model="currencyUsd" persistent-hint :hint="getHint('USD')" :rules="rulesMoney" name="currency_usd" v-validate="'required'">
                    </ii-number-field>
                </div>
                <div class="maxW275 w100pc margT24">
                    <ii-number-field @keydown.enter="specifyResidues" :decimals="2" :suffix="'EUR'" label="Текущий остаток в EUR"
                                     v-model="currencyEur" persistent-hint :hint="getHint('EUR')" :rules="rulesMoney" name="currency_eur" v-validate="'required'">
                    </ii-number-field>
                </div>
                <div class="maxW275 margT24 btn-section">
                    <v-btn color="primary" class="big_btn" @click.native="specifyResidues()">
                        Указать
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
    private residuals: MoneyResiduals = null;

    async created(): Promise<void> {
        await this.loadSetCashBalances();
    }

    private async loadSetCashBalances(): Promise<void> {
        this.residuals = await this.portfolioService.getMoneyResiduals(this.portfolioId);
        this.currencyRub = this.numberСonversion(this.residuals.RUB);
        this.currencyUsd = this.numberСonversion(this.residuals.USD);
        this.currencyEur = this.numberСonversion(this.residuals.EUR);
    }

    private numberСonversion(value: string): string {
        const amountOfCurrency = new BigMoney(value).amount;
        if (amountOfCurrency && Number(amountOfCurrency) > 0) {
            return amountOfCurrency.toString();
        }
        return "0";
    }

    private getHint(currency: string): string {
        if ((this.residuals as any)[currency]) {
            return `Ваш текущий остаток на сервисе ${(this.residuals as any)[currency]}`;
        } else {
            return `В вашем портфеле не указаны остатки в валюте ${currency}`;
        }
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