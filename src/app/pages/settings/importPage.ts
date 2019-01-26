import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ImportErrorsDialog} from "../../components/dialogs/importErrorsDialog";
import {ImportGeneralErrorDialog} from "../../components/dialogs/importGeneralErrorDialog";
import {ImportSuccessDialog} from "../../components/dialogs/importSuccessDialog";
import {ExpandedPanel} from "../../components/expandedPanel";
import {Filters} from "../../platform/filters/Filters";
import {ClientInfo} from "../../services/clientService";
import {ImportResponse, ImportService} from "../../services/importService";
import {OverviewService} from "../../services/overviewService";
import {Portfolio, Status} from "../../types/types";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";
import {ImportInstructions} from "./importInstructions";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card>
                <v-card-text>
                    <div class="import-wrapper">
                        <h4 class="display-1">Импорт сделок</h4>
                        <p>
                            Здесь вы можете быстро перенести все ваши сделки в автоматическом режиме. Для этого выберите вашего брокера или торговый терминал и
                            ознакомьтесь с инструкцией
                            по созданию файла для импорта.
                        </p>
                        <p>
                            Если в списке нет вашего брокера или терминала, вы всегда можете осуществить импорт через универсальный формат
                            <a @click="selectedProvider = providers.INTELINVEST">CSV</a>
                            или обратиться к нам через обратную связь, по <a href="mailto:web@intelinvest.ru" target="_blank">почте</a> или
                            в группе <a href="http://vk.com/intelinvest" target="_blank">вконтакте</a>.
                        </p>
                    </div>
                    <div class="providers">
                        <div v-for="provider in providers" :key="provider" @click="selectedProvider = provider"
                             :class="['item', provider.toLowerCase(), selectedProvider === provider ? 'active' : '']"></div>
                    </div>

                    <import-instructions :provider="selectedProvider" @selectProvider="onSelectProvider"></import-instructions>

                    <div class="attachments">
                        <file-drop-area @drop="onFileAdd" class="attachments-file-drop">
                            <div class="attachments-file-drop__content">
                                Перетащите<br>
                                или
                                <file-link @select="onFileAdd" multiple>загрузите</file-link>
                                файл
                            </div>
                        </file-drop-area>
                    </div>
                    <div v-if="files.length">
                        <ul>
                            <li v-for="(file, index) in files" :key="index">
                                <span>
                                    {{ file.name }}
                                    <v-icon small @click="deleteFile(file)">fas fa-times</v-icon>
                                </span>
                            </li>
                        </ul>
                    </div>

                    <expanded-panel :value="$uistate.stocksTablePanel" :state="$uistate.STOCKS">
                        <template slot="header">
                            <v-tooltip top>
                                <span slot="activator" style="cursor: pointer">Расширенные настройки импорта</span>
                                <span>Настройте дополнительные параметры импорта отчетов.</span>
                            </v-tooltip>
                        </template>
                        <v-card-text>
                            <v-layout row wrap>
                                <v-flex xs12 lg6>
                                    <v-checkbox v-model="linkTrades" class="d-inline-block">
                                        <template slot="label">
                                            <span>Добавлять сделки по списанию/зачислению денежных средств
                                                <v-tooltip :max-width="250" top>
                                                    <i slot="activator" class="far fa-question-circle"></i>
                                                    <span>
                                                        Если включено, будут добавлены связанные сделки по зачислению/списанию денежных средств
                                                    </span>
                                                </v-tooltip>
                                            </span>
                                        </template>
                                    </v-checkbox>
                                </v-flex>
                                <v-flex xs12 lg6>
                                    <v-checkbox v-model="autoCommission">
                                        <template slot="label">
                                            <span>
                                                Автоматически рассчитывать комисию для сделок
                                                <v-tooltip :max-width="250" top>
                                                    <i slot="activator" class="far fa-question-circle"></i>
                                                    <span>
                                                        Если включено, комиссия для каждой сделки по ценной бумаге будет рассчитана в соответствии
                                                        со значением фиксированной комиссии, заданной для портфеля. Если комиссия для бумаги есть в отчете
                                                        она не будет перезаписана.
                                                    </span>
                                                </v-tooltip>
                                            </span>
                                        </template>
                                    </v-checkbox>
                                </v-flex>
                                <v-flex xs12 lg6>
                                    <v-checkbox v-model="autoEvents">
                                        <template slot="label">
                                            <span>
                                                Автоматически исполнять события по бумагам
                                                <v-tooltip :max-width="250" top>
                                                    <i slot="activator" class="far fa-question-circle"></i>
                                                    <span>
                                                        Если включено, события (дивиденды, купоны, амортизация, погашение) по сделкам,
                                                        полученным из отчета (на даты первой и последней сделки),
                                                        будут автоматически исполнены после импорта.
                                                    </span>
                                                </v-tooltip>
                                            </span>
                                        </template>
                                    </v-checkbox>
                                </v-flex>
                                <v-flex xs12 lg6>
                                    <v-checkbox v-model="confirmMoneyBalance">
                                        <template slot="label">
                                            <span>
                                                Спрашивать текущий остаток ДС
                                                <v-tooltip :max-width="250" top>
                                                    <i slot="activator" class="far fa-question-circle"></i>
                                                    <span>
                                                        Если включено, то после успешного импорта будет предложено ввести текущий остаток денежных
                                                        средств на счете. Отключите, если Вы хотите сами задать вводы и выводы денег.
                                                    </span>
                                                </v-tooltip>
                                            </span>
                                        </template>
                                    </v-checkbox>
                                </v-flex>
                            </v-layout>
                        </v-card-text>
                    </expanded-panel>

                    <v-btn color="primary" @click="uploadFile" :disabled="!selectedProvider || files.length === 0">Загрузить</v-btn>
                </v-card-text>
            </v-card>
        </v-container>
    `,
    components: {ImportInstructions, ExpandedPanel}
})
export class ImportPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    @Inject
    private importService: ImportService;
    @Inject
    private overviewService: OverviewService;
    /** Файлы для импорта */
    private files: File[] = [];
    /** Провайдеры отчетов */
    private providers = DealsImportProvider;
    /** Выбранный провайдер */
    private selectedProvider: DealsImportProvider = null;
    /** Признак создания связанных сделок */
    private linkTrades = false;
    /** Признак автоматического рассчета комиссии по сделкам */
    private autoCommission = false;
    /** Призак автоисполнения Событий по сделкам из отчета */
    private autoEvents = true;
    /** Признак отображения диалога для ввода баланса портфеля после импорта */
    private confirmMoneyBalance = true;
    /** Признак отображения панели с расширенными настройками */
    private showExtendedSettings = false;

    /**
     * Событие при добавлении вложений
     * @param {FileList} fileList список файлов
     */
    private onFileAdd(fileList: File[]): void {
        this.files = fileList;
    }

    /**
     * Удаляет файл
     * @param file файл
     */
    private deleteFile(file: File): void {
        const index = this.files.indexOf(file);
        if (index !== -1) {
            this.files.splice(index, 1);
        }
    }

    /**
     * Отправляет отчет на сервер
     */
    private async uploadFile(): Promise<void> {
        if (this.files && this.files.length && this.selectedProvider) {
            const data = new FormData();
            this.files.forEach(file => data.append("files", file, file.name));
            const response = await this.importService.importReport(this.selectedProvider, this.portfolio.id, data, {
                linkTrades: this.linkTrades,
                autoCommission: this.autoCommission,
                autoEvents: this.autoEvents,
                confirmMoneyBalance: this.confirmMoneyBalance
            });
            await this.handleUploadResponse(response);
        }
    }

    /**
     * Обрабатывает ответ от сервера после импорта отчета
     * @param response
     */
    private async handleUploadResponse(response: ImportResponse): Promise<void> {
        if (response.status === Status.ERROR) {
            this.$snotify.error(response.message, "Ошибка");
            return;
        }
        if (response.generalError) {
            await new ImportGeneralErrorDialog().show({generalError: response.generalError, router: this.$router});
            return;
        }
        if (response.errors && response.errors.length) {
            await new ImportErrorsDialog().show({
                errors: response.errors, router: this.$router,
                validatedTradesCount: response.validatedTradesCount
            });
            return;
        }
        if (response.validatedTradesCount) {
            const firstWord = Filters.declension(response.validatedTradesCount, "Добавлена", "Добавлено", "Добавлено");
            const secondWord = Filters.declension(response.validatedTradesCount, "сделка", "сделки", "сделок");
            if (this.confirmMoneyBalance) {
                const currentMoneyRemainder = await this.overviewService.getCurrentMoney(this.portfolio.id);
                const enteredMoneyRemainder = await new ImportSuccessDialog().show({
                    currentMoneyRemainder,
                    router: this.$router,
                    store: this.$store.state[StoreType.MAIN],
                    importResult: response
                });
                await this.overviewService.saveOrUpdateCurrentMoney(this.portfolio.id, enteredMoneyRemainder);
                this.$router.push("portfolio");
                this.$snotify.info(`${firstWord} ${secondWord}`, "Результат импорта");
            } else {
                this.$snotify.info(`Импорт прошел успешно. ${firstWord} ${secondWord}`, "Результат импорта");
            }
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    /**
     * Обрабатывает событие выбора провайдера из стороннего компонента
     * @param provider выбранный провайдер
     */
    private onSelectProvider(provider: DealsImportProvider): void {
        this.selectedProvider = provider;
        if (this.selectedProvider === DealsImportProvider.INTELINVEST) {
            this.linkTrades = false;
        }
    }
}

/** Форматы поддерживаемых брокеров и отчетов */
export enum DealsImportProvider {
    ALFADIRECT = "ALFADIRECT",
    ITINVEST = "ITINVEST",
    OTKRYTIE = "OTKRYTIE",
    ZERICH = "ZERICH",
    PSBANK = "PSBANK",
    BCS = "BCS",
    BCS_CYPRUS = "BCS_CYPRUS",
    FINAM = "FINAM",
    FREEDOM_FINANCE = "FREEDOM_FINANCE",
    KITFINANCE = "KITFINANCE",
    URALSIB = "URALSIB",
    SBERBANK = "SBERBANK",
    VTB24 = "VTB24",
    INTERACTIVE_BROKERS = "INTERACTIVE_BROKERS",
    TINKOFF = "TINKOFF",
    NETTRADER = "NETTRADER",
    INTELINVEST = "INTELINVEST",
    ATON = "ATON",
    QUIK = "QUIK"
}
