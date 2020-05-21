import {Component, Prop, UI} from "../../app/ui";
import {DealsImportProvider} from "../../services/importService";
import {PortfolioParams} from "../../services/portfolioService";
import {AlfaCapitalInstruction} from "./import_instructions/alfaCapitalInstruction";
import {AlfadirectInstruction} from "./import_instructions/alfadirectInstruction";
import {BcsCyprusInstruction} from "./import_instructions/bcsCyprusInstruction";
import {BcsInstruction} from "./import_instructions/bcsInstruction";
import {FinamInstruction} from "./import_instructions/finamInstruction";
import {FreedomFinanceInstruction} from "./import_instructions/freedomFinanceInstruction";
import {IntelinvestInstruction} from "./import_instructions/intelinvestInstruction";
import {InteractiveBrokersInstruction} from "./import_instructions/InteractiveBrokersInstruction";
import {ItInvestInstruction} from "./import_instructions/itInvestInstruction";
import {OtkrytieInstruction} from "./import_instructions/otkrytieInstruction";
import {PsbInstruction} from "./import_instructions/psbInstruction";
import {QuikInstruction} from "./import_instructions/quikInstruction";
import {SberbankInstruction} from "./import_instructions/sberbankInstruction";
import {TinkoffInstruction} from "./import_instructions/tinkoffInstruction";
import {UralsibInstruction} from "./import_instructions/uralsibInstruction";
import {VtbInstruction} from "./import_instructions/vtbInstruction";
import {ZerichInstruction} from "./import_instructions/zerichInstruction";

@Component({
    // language=Vue
    template: `
        <div class="import-instructions">
            <!-- ALFADIRECT -->
            <div v-if="provider === providers.ALFADIRECT">
                <AlfadirectInstruction></AlfadirectInstruction>
            </div>

            <!-- ITINVEST -->
            <div v-if="provider === providers.ITINVEST">
                <ItInvestInstruction></ItInvestInstruction>
            </div>

            <!-- ОТКРЫТИЕ -->
            <div v-if="provider === providers.OTKRYTIE">
                <OtkrytieInstruction></OtkrytieInstruction>
            </div>

            <!-- ZERICH -->
            <div v-if="provider === providers.ZERICH">
                <ZerichInstruction></ZerichInstruction>
            </div>

            <!-- PSBANK -->
            <div v-if="provider === providers.PSBANK">
                <PsbInstruction></PsbInstruction>
            </div>

            <!-- BCS -->
            <div v-if="provider === providers.BCS">
                <BcsInstruction></BcsInstruction>
            </div>

            <!-- BCS CYPRUS-->
            <div v-if="provider === providers.BCS_CYPRUS">
                <BcsCyprusInstruction></BcsCyprusInstruction>
            </div>

            <!-- FINAM -->
            <div v-if="provider === providers.FINAM">
                <FinamInstruction :portfolio-params="portfolioParams" @changePortfolioParams="changePortfolioParams">
                </FinamInstruction>
            </div>

            <!-- FREEDOM_FINANCE -->
            <div v-if="provider === providers.FREEDOM_FINANCE">
                <FreedomFinanceInstruction></FreedomFinanceInstruction>
            </div>

            <!-- KITFINANCE -->
            <div v-if="provider === providers.KITFINANCE">
                Используйте для импорта отчеты в формате xlsx.
            </div>

            <!-- URALSIB -->
            <div v-if="provider === providers.URALSIB">
                <UralsibInstruction></UralsibInstruction>
            </div>

            <!-- SBERBANK -->
            <div v-if="provider === providers.SBERBANK">
                <SberbankInstruction></SberbankInstruction>
            </div>

            <!-- VTB24 -->
            <div v-if="provider === providers.VTB24">
                <VtbInstruction></VtbInstruction>
            </div>

            <!-- Interactive brokers -->
            <div v-if="provider === providers.INTERACTIVE_BROKERS">
                <InteractiveBrokersInstruction></InteractiveBrokersInstruction>
            </div>

            <!-- Tinkoff -->
            <div v-if="provider === providers.TINKOFF">
                <TinkoffInstruction></TinkoffInstruction>
            </div>

            <!-- ATON -->
            <div v-if="provider === providers.ATON">
                Перейдите на сайт АТОН в раздел → <b>Входящие</b> → <b>Запросить отчет</b> → <b>Настройте параметры отчета</b>.
                Полученный файл используйте для импорта.
            </div>

            <!-- ALFACAPITAL -->
            <div v-if="provider === providers.ALFACAPITAL">
                <AlfaCapitalInstruction></AlfaCapitalInstruction>
            </div>

            <!-- Формат intelinvest -->
            <div v-if="provider === providers.INTELINVEST">
                <IntelinvestInstruction></IntelinvestInstruction>
            </div>

            <!-- QUIK -->
            <div v-if="provider === providers.QUIK">
                <QuikInstruction></QuikInstruction>
            </div>

            <div v-if="provider" class="import-default-text-margin-t">
                <!-- Не отображаем блок про Квик если он уже выбран -->
                <template v-if="provider !== providers.QUIK">
                    Если у вас возникли сложности при загрузке отчетов брокера и вы используете<br>
                    Quik, можете <a @click="selectProvider(providers.QUIK)">импортировать</a>
                    отчеты из терминала.
                </template>
            </div>
        </div>
    `,
    components: {
        AlfadirectInstruction, ItInvestInstruction, OtkrytieInstruction, PsbInstruction, BcsInstruction, BcsCyprusInstruction, ZerichInstruction, FinamInstruction,
        UralsibInstruction, TinkoffInstruction, QuikInstruction, IntelinvestInstruction, VtbInstruction, AlfaCapitalInstruction, FreedomFinanceInstruction,
        InteractiveBrokersInstruction, SberbankInstruction
    }
})
export class ImportInstructions extends UI {

    /** Провайдеры отчетов */
    private providers = DealsImportProvider;
    @Prop()
    private provider: DealsImportProvider;
    @Prop({required: true})
    private portfolioParams: PortfolioParams;

    /**
     * Отправляет событие выбора провайдера
     * @param provider
     */
    private selectProvider(provider: DealsImportProvider): void {
        this.$emit("selectProvider", provider);
    }

    private changePortfolioParams(portfolioParams: PortfolioParams): void {
        this.$emit("changePortfolioParams", portfolioParams);
    }
}
