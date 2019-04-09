import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {DealsImportProvider} from "../../services/importService";
import {Portfolio} from "../../types/types";
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
import {VtbInstruction} from "./import_instructions/vtbInstruction";
import {ZerichInstruction} from "./import_instructions/zerichInstruction";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div>
            <div class="import-instructions">
                <!-- ALFADIRECT -->
                <div v-if="provider === 'ALFADIRECT'">
                    <AlfadirectInstruction></AlfadirectInstruction>
                </div>

                <!-- ITINVEST -->
                <div v-if="provider === 'ITINVEST'">
                    <ItInvestInstruction></ItInvestInstruction>
                </div>

                <!-- ОТКРЫТИЕ -->
                <div v-if="provider === 'OTKRYTIE'">
                    <OtkrytieInstruction></OtkrytieInstruction>
                </div>

                <!-- ZERICH -->
                <div v-if="provider === 'ZERICH'">
                    <ZerichInstruction></ZerichInstruction>
                </div>

                <!-- PSBANK -->
                <div v-if="provider === 'PSBANK'">
                    <PsbInstruction></PsbInstruction>
                </div>

                <!-- BCS -->
                <div v-if="provider === 'BCS'">
                    <BcsInstruction></BcsInstruction>
                </div>

                <!-- BCS CYPRUS-->
                <div v-if="provider === 'BCS_CYPRUS'">
                    <BcsCyprusInstruction></BcsCyprusInstruction>
                </div>

                <!-- FINAM -->
                <div v-if="provider === 'FINAM'">
                    <FinamInstruction></FinamInstruction>
                </div>

                <!-- FREEDOM_FINANCE -->
                <div v-if="provider === 'FREEDOM_FINANCE'">
                    <p class="import-default-text">
                        Для импорта вы можете использовать отчеты, присылаемые брокером вам на электронную почту в формате xls.
                    </p>
                </div>

                <!-- KITFINANCE -->
                <div v-if="provider === 'KITFINANCE'">
                    <p class="import-default-text">
                        Используйте для импорта отчеты в формате xlsx.
                    </p>
                </div>

                <!-- URALSIB -->
                <div v-if="provider === 'URALSIB'">
                    <UralsibInstruction></UralsibInstruction>
                </div>

                <!-- SBERBANK -->
                <div v-if="provider === 'SBERBANK'">
                    <p class="import-default-text">
                        Используйте для импорта отчеты в формате txt, которые брокер присылает вам на почту.
                        Обратите внимание, что загружены будут только сделки, исполненные в отчетном периоде, имеющие статус в отчете
                        "И - на конец периода сделка исполнена в полном объеме" для избежания дублирования сделок при загрузке нескольких отчетов
                        подряд.
                    </p>
                </div>

                <!-- VTB24 -->
                <div v-if="provider === 'VTB24'">
                    <VtbInstruction></VtbInstruction>
                </div>

                <!-- Interactive brokers -->
                <div v-if="provider === 'INTERACTIVE_BROKERS'">
                    <p class="import-default-text">
                        Используйте для импорта отчеты в формате cpt, xls, csv. Форматы отчетов указаны в порядке предпочтительности.
                        Если отчет не пройдет импорт, попробуйте пересохранить файл в кодировке UTF-8 или windows-1251
                    </p>
                </div>

                <!-- Tinkoff -->
                <div v-if="provider === 'TINKOFF'">
                    <TinkoffInstruction></TinkoffInstruction>
                </div>

                <!-- Nettrader -->
                <div v-if="provider === 'NETTRADER'">
                    <p class="import-default-text">
                        Используйте для импорта отчеты в формате csv или txt. Убедитесь что загружаемый файл имеет кодировку UTF-8
                    </p>
                </div>

                <!-- ATON -->
                <div v-if="provider === 'ATON'">
                    <p class="import-default-text">
                        Используйте для импорта отчеты в формате xml. Будут импортированы сделки по бумагам, включая дивиденды, купоны, амортизацию,
                        и движения денежных средств.
                    </p>
                </div>

                <!-- Формат intelinvest -->
                <div v-if="provider === 'INTELINVEST'">
                    <IntelinvestInstruction></IntelinvestInstruction>
                </div>

                <!-- QUIK -->
                <div v-if="provider === 'QUIK'">
                    <QuikInstruction></QuikInstruction>
                </div>
            </div>

            <div v-if="provider" class="import-default-text">
                <!-- Не отображаем блок про Квик если он уже выбран -->
                <p v-if="provider !== 'QUIK'" class="import-default-text-margin-t">
                    Если у вас возникли сложности при загрузке отчетов брокера и вы используете<br>
                    Quik, можете <a @click="selectProvider(providers.QUIK)">импортировать</a>
                    отчеты из терминала.
                </p>
            </div>
        </div>
    `,
    components: {
        AlfadirectInstruction, ItInvestInstruction, OtkrytieInstruction, PsbInstruction, BcsInstruction, BcsCyprusInstruction, ZerichInstruction, FinamInstruction,
        UralsibInstruction, TinkoffInstruction, QuikInstruction, IntelinvestInstruction, VtbInstruction
    }
})
export class ImportInstructions extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Провайдеры отчетов */
    private providers = DealsImportProvider;
    @Prop()
    private provider: string;
    @Prop({type: String})
    private lastTradeDate: string;

    /**
     * Отправляет событие выбора провайдера
     * @param provider
     */
    private selectProvider(provider: string): void {
        this.$emit("selectProvider", provider);
    }
}
