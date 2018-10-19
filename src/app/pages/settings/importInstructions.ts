import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ClientInfo, Portfolio} from "../../types/types";
import {StoreType} from "../../vuex/storeType";
import {AlfadirectInstruction} from "./import_instructions/alfadirectInstruction";
import {BcsCyprusInstruction} from "./import_instructions/bcsCyprusInstruction";
import {BcsInstruction} from "./import_instructions/bcsInstruction";
import {FinamInstruction} from "./import_instructions/finamInstruction";
import {IntelinvestInstruction} from "./import_instructions/intelinvestInstruction";
import {ItInvestInstruction} from "./import_instructions/itInvestInstruction";
import {OtkrytieInstruction} from "./import_instructions/otkrytieInstruction";
import {PsbInstruction} from "./import_instructions/psbInstruction";
import {QuikInstruction} from "./import_instructions/quikInstruction";
import {TinkoffInstruction} from "./import_instructions/tinkoffInstruction";
import {UralsibInstruction} from "./import_instructions/uralsibInstruction";
import {ZerichInstruction} from "./import_instructions/zerichInstruction";
import {DealsImportProvider} from "./importPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div>
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
                    <FinamInstruction></FinamInstruction>
                </div>

                <!-- FREEDOM_FINANCE -->
                <div v-if="provider === providers.FREEDOM_FINANCE">
                    <p>
                        Для импорта вы можете использовать отчеты, присылаемые брокером вам на электронную почту в формате xls.
                    </p>
                </div>

                <!-- KITFINANCE -->
                <div v-if="provider === providers.KITFINANCE">
                    <p>
                        Используйте для импорта отчеты в формате xlsx.
                    </p>
                </div>

                <!-- URALSIB -->
                <div v-if="provider === providers.URALSIB">
                    <UralsibInstruction></UralsibInstruction>
                </div>

                <!-- SBERBANK -->
                <div v-if="provider === providers.SBERBANK">
                    <p>
                        Используйте для импорта отчеты в формате txt, которые брокер присылает вам на почту.
                        Обратите внимание, что загружены будут только сделки, исполненные в отчетном периоде, имеющие статус в отчете
                        "И - на конец периода сделка исполнена в полном объеме" для избежания дублирования сделок при загрузке нескольких отчетов
                        подряд.
                    </p>
                </div>

                <!-- VTB24 -->
                <div v-if="provider === providers.VTB24">
                    <ui:include src="import_instructions/vtb/instruction.xhtml"/>
                </div>

                <!-- Interactive brokers -->
                <div v-if="provider === providers.INTERACTIVE_BROKERS">
                    <p>
                        Используйте для импорта отчеты в формате cpt, xls, csv. Форматы отчетов указаны в порядке предпочтительности.
                        Если отчет не пройдет импорт, попробуйте пересохранить файл в кодировке UTF-8 или windows-1251
                    </p>
                </div>

                <!-- Tinkoff -->
                <div v-if="provider === providers.TINKOFF">
                    <TinkoffInstruction></TinkoffInstruction>
                </div>

                <!-- Nettrader -->
                <div v-if="provider === providers.NETTRADER">
                    <p>
                        Используйте для импорта отчеты в формате csv или txt. Убедитесь что загружаемый файл имеет кодировку UTF-8
                    </p>
                </div>

                <!-- ATON -->
                <div v-if="provider === providers.ATON">
                    <p>
                        Используйте для импорта отчеты в формате xml. Будут импортированы сделки по бумагам, включая дивиденды, купоны, амортизацию,
                        и движения денежных средств.
                    </p>
                </div>

                <!-- Формат intelinvest -->
                <div v-if="provider === providers.INTELINVEST">
                    <IntelinvestInstruction></IntelinvestInstruction>
                </div>

                <!-- QUIK -->
                <div v-if="provider === providers.QUIK">
                    <QuikInstruction></QuikInstruction>
                </div>
            </div>

            <div class="common-instructions">
                <p v-if="provider !== providers.ATON" style="margin-top: 30px;">
                    Из отчета будут импортированы записи по сделками с ценными бумагами и движения денежных средств.
                    Дивиденды, купоны, амортизация и погашение будут автоматически добавлены при успешном импорте.
                </p>
                <p>
                    После импорта проверьте остатки по денежным средствам в портфеле, при необходимости,
                    исполните начисления в разделе События (при наличии).
                </p>
                <!-- Не отображаем блок про Квик если он уже выбран -->
                <p v-if="provider !== providers.QUIK">
                    Если у вас возникли сложности при загрузке отчетов брокера и вы используете Quik,
                    можете
                    <a @click="selectProvider(providers.QUIK)">импортировать</a>
                    отчеты из терминала.
                </p>

                <p v-if="portfolio.overview.totalTradesCount" style="text-align: center;padding: 20px;">
                    <b>
                        Последняя зарегистрированная сделка в портфеле от
                        <!-- TODO дата последней сделки -->
                        <i>ДАТА ПОСЛЕДНЕЙ СДЕЛКИ</i>.
                        Во избежание задвоений загружайте отчет со сделками позже этой даты.
                    </b>
                </p>
            </div>
        </div>
    `,
    components: {
        AlfadirectInstruction, ItInvestInstruction, OtkrytieInstruction, PsbInstruction, BcsInstruction, BcsCyprusInstruction, ZerichInstruction, FinamInstruction,
        UralsibInstruction, TinkoffInstruction, QuikInstruction, IntelinvestInstruction
    }
})
export class ImportInstructions extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Провайдеры отчетов */
    private providers = DealsImportProvider;
    @Prop({required: true})
    private provider: DealsImportProvider = null;

    /**
     * Отправляет событие выбора провайдера
     * @param provider
     */
    private selectProvider(provider: DealsImportProvider): void {
        this.provider = provider;
        this.$emit("selectProvider", provider);
    }
}
