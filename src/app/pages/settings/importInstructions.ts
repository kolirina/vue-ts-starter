import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ClientInfo, Portfolio} from "../../types/types";
import {StoreType} from "../../vuex/storeType";
import {AlfadirectInstruction} from "./import_instructions/alfadirectInstruction";
import {DealsImportProvider} from "./importPage";

const MainStore = namespace(StoreType.MAIN);

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
                <p>
                    В электронном кабинете выберите вкладку ОТЧЕТЫ, затем подпункт
                    ОТЧЕТЫ БРОКЕРА ЗА ОПРЕДЕЛЕННЫЙ ПЕРИОД. Выберите период и поставьте две галочки -
                    "Отчет в формате XML" и "Показывать сделки". Полученный файл необходимо открыть в Excel и
                    сохранить в формате CSV. Используйте этот CSV-файл для импорта.
                </p>
            </div>

            <!-- ОТКРЫТИЕ -->
            <div v-if="provider === providers.OTKRYTIE">
                <ui:include src="import_instructions/otkrytie/instruction.xhtml"/>
            </div>

            <!-- ZERICH -->
            <div v-if="provider === providers.ZERICH">
                <p>
                    Перейдите по адресу <a href="https://login.zerich.com/profile.html#/home"
                                           target="_blank">https://login.zerich.com/profile.html#/home</a>
                    Выберите пункт "Брокерское обслуживание" - "Отчеты", выберите свой счет.
                    Нажмите кнопку "Создать отчет".
                    Настройте "Сводный отчет", период отчета и формат XML.
                    После его формирования отчет появится в списке отчетов. Нажмите ссылку "Скачать" для скачивания отчета.
                    Доступна загрузка сделок по бумагам, комиссий и денежных транзакций.
                </p>
            </div>

            <!-- PSBANK -->
            <div v-if="provider === providers.PSBANK">
                <ui:include src="import_instructions/psb/instruction.xhtml"/>
            </div>

            <!-- BCS -->
            <div v-if="provider === providers.BCS">
                <ui:include src="import_instructions/bcs/instruction.xhtml"/>
            </div>

            <!-- BCS CYPRUS-->
            <div v-if="provider === providers.BCS_CYPRUS">
                <p>
                    Используйте отчеты в формате xls.
                    Импорт позволит вам загрузить в сервис сделки, указанные в разделе отчета: 3. TRANSACTIONS
                </p>
            </div>

            <!-- FINAM -->
            <div v-if="provider === providers.FINAM">
                <p>
                    Используйте для импорта отчеты в формате xml.
                    Доступна загрузка сделок по бумагам, комиссий и денежных транзакций.
                </p>
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
                <ui:include src="import_instructions/uralsib/instruction.xhtml"/>
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
                <ui:include src="import_instructions/tinkoff/instruction.xhtml"/>
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
                <p>Вы можете импортировать сделки сами, создав CSV-файл следующей структуры:</p>
                <p>
                    Файл должен содержать следующие столбцы, в перечисленном порядке:
                    <span style="border: 1px solid #929292; background-color: #e6e6e6; padding: 8px; word-wrap: normal; word-break: keep-all; display: block">
                    TYPE;DATE;TICKER;QUANTITY;PRICE;FEE;NKD;NOMINAL;CURRENCY;NOTE;LINK_ID;
                </span>
                </p>
                Поле <b>TYPE</b> может принимать значения:
                <p style="word-wrap: break-word">
                    <b>STOCKBUY / STOCKSELL</b> Покупка/Продажа Акции. Поля: тикер, дата, количество, цена, комиссия, заметка, валюта, [id
                    связанной сделки]<br/>
                    <b>BONDBUY / BONDSELL</b> Покупка/Продажа Облигации. Поля: secid, дата, количество, цена в %, комиссия, НКД, номинал,
                    заметка, валюта, [id связанной сделки]<br/>
                    <b>COUPON</b> Выплата купона. Поля: тикер, дата, количество, сумма выплаты, заметка, валюта, [id связанной сделки]<br/>
                    <b>AMORTIZATION</b> Выплата амортизации. Поля: тикер, дата, количество, сумма выплаты, заметка, валюта, [id связанной
                    сделки]<br/>
                    <b>DIVIDEND</b> Выплата Дивиденда. Поля: тикер, дата, количество, сумма выплаты, заметка, валюта, [id связанной сделки]<br/>
                    <b>MONEYDEPOSIT</b> зачисление денежных средств на счет. Поля: дата, сумма, заметка, валюта, [id связанной сделки]<br/>
                    <b>MONEYWITHDRAW</b> вывод денежных средств со счета. Поля: дата, сумма, заметка, валюта, [id связанной сделки]<br/>
                    <b>INCOME</b> произвольный доход. Поля: дата, сумма, заметка, валюта, [id связанной сделки]<br/>
                    <b>LOSS</b> произвольный расход. Поля: дата, сумма, заметка, валюта, [id связанной сделки]<br/>
                    <br/>
                    Опциональный параметр <b>LINK_ID</b> (id связанной сделки), для создания связанных сделок, должен быть уникальным и
                    совпадать
                    у двух связанных сделок. Например, у сделки по покупке акции указываете 1, и у сделки по деньгам тоже 1.
                    В заметке, по возможности, не используйте спецсимволы.
                    Если используете русские символы в заметке, проверьте кодировку файла, она должна быть UTF8.
                    Перенос строки в конце каждй строки обязателен.
                </p>
                <p><b>Пример:</b></p>
                <p>
                <span style="border: 1px solid #929292; background-color: #e6e6e6; padding: 8px; white-space: pre-line; display: block">
                    STOCKBUY;29.12.2017;SIBN;10;244.1;2.44;;;RUB;;74031712
                    MONEYDEPOSIT;29.12.2017;;;174;;;;RUB;Зачисление дивидендов по акции SIBN от 2017.12.29;08976088
                    MONEYWITHDRAW;29.12.2017;;;2443.44;;;;RUB;Списание денег за сделку по Газпрнефть;74031712
                    DIVIDEND;29.12.2017;SIBN;20;8.7;;;;RUB;Зачисление дивидендов по акции ПАО "Газпром нефть" (SIBN) за период 9 месяцев 2017,
                    дата отсечки: 2017-12-29;08976088
                    MONEYDEPOSIT;02.01.2018;;;220.8;;;;RUB;Зачисление денег за сделку по внесению купона БелгОб2015;46831841
                    COUPON;02.01.2018;RU000A0JVL33;10;22.08;;;;RUB;Зачисление купона по облигации БелгОб2015 (RU000A0JVL33), дата выплаты
                    купона: 2018-01-02;46831841
                    STOCKBUY;03.01.2018;FEES;10000;0.16285;1.63;;;RUB;;38137480
                    MONEYWITHDRAW;03.01.2018;;;1630.13;;;;RUB;Списание денег за сделку по ФСК ЕЭС ао;38137480
                    STOCKBUY;07.01.2018;OGKB;1000;0.4744;0.47;;;RUB;;64503206
                    MONEYWITHDRAW;07.01.2018;;;474.87;;;;RUB;Списание денег за сделку по ОГК-2 ао;64503206
                    LOSS;01.05.2018 22:44:43;;;3000;;;;RUB;Депозитарная комиссия;
                    MONEYDEPOSIT;25.05.2018 22:38:46;;;394.47;;;;RUB;Зачисление денег за доходную операцию от 2018.05.25;68044253
                    INCOME;25.05.2018 22:38:46;;;394.47;;;;RUB;Дополнительный доход;68044253
                </span>
                </p>
            </div>

            <!-- QUIK -->
            <div v-if="provider === providers.QUIK">
                <ui:include src="import_instructions/quik/instruction.xhtml"/>
            </div>

            <!--<h:panelGroup rendered="#{fileUpload.provider ne 'INTELINVEST'}">-->
            <!--<ui:include src="import_instructions/commonInstruction.xhtml">-->
            <!--<ui:param name="notEmptyPortfolio" value="#{not empty currentPortfolioBean.trades}"/>-->
            <!--<ui:param name="lastTradeDate" value="#{currentPortfolioBean.lastTradeDate}"/>-->
            <!--<ui:param name="quikSelected" value="#{fileUpload.provider eq 'QUIK'}"/>-->
            <!--</ui:include>-->
            <!--</h:panelGroup>-->
        </div>
    `,
    components: {AlfadirectInstruction}
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
}
