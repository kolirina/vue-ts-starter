import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ImportErrorsDialog} from "../../components/dialogs/importErrorsDialog";
import {ImportGeneralErrorDialog} from "../../components/dialogs/importGeneralErrorDialog";
import {ImportSuccessDialog} from "../../components/dialogs/importSuccessDialog";
import {ExpandedPanel} from "../../components/expandedPanel";
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Filters} from "../../platform/filters/Filters";
import {ClientInfo} from "../../services/clientService";
import {DealsImportProvider, ImportProviderFeatures, ImportProviderFeaturesByProvider, ImportResponse, ImportService} from "../../services/importService";
import {OverviewService} from "../../services/overviewService";
import {Portfolio, Status} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {FileUtils} from "../../utils/fileUtils";
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
                            ознакомьтесь с инструкцией по созданию файла для импорта. <a href="#/help#import">Как работает импорт?</a>
                        </p>
                        <p>
                            Если в списке нет вашего брокера или терминала, вы всегда можете осуществить импорт через универсальный формат
                            <a @click="selectedProvider = providers.INTELINVEST">CSV</a>
                            или обратиться к нам через обратную связь, по <a href="mailto:web@intelinvest.ru" target="_blank">почте</a> или
                            в группе <a href="http://vk.com/intelinvest" target="_blank">вконтакте</a>.
                        </p>
                    </div>
                    <div class="providers">
                        <div v-for="provider in providers" :key="provider" @click="onSelectProvider(provider)"
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

                    <expanded-panel v-if="importProviderFeatures" :value="$uistate.importSettings" :state="$uistate.IMPORT_SETTINGS">
                        <template #header>
                            <v-tooltip content-class="custom-tooltip-wrap" top>
                                <span slot="activator" style="cursor: pointer">Расширенные настройки импорта</span>
                                <span>Настройте дополнительные параметры импорта отчетов.</span>
                            </v-tooltip>
                        </template>
                        <v-card-text @click.stop>
                            <v-layout row wrap>
                                <v-flex xs12 lg6>
                                    <v-checkbox v-model="importProviderFeatures.createLinkedTrade" class="d-inline-block">
                                        <template #label>
                                            <span>Добавлять сделки по списанию/зачислению денежных средств
                                                <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" top>
                                                    <sup class="custom-tooltip" slot="activator">
                                                        <v-icon>fas fa-info-circle</v-icon>
                                                    </sup>
                                                    <span>
                                                        Если включено, будут добавлены связанные сделки по зачислению/списанию денежных средств
                                                    </span>
                                                </v-tooltip>
                                            </span>
                                        </template>
                                    </v-checkbox>
                                </v-flex>
                                <v-flex xs12 lg6>
                                    <v-checkbox v-model="importProviderFeatures.autoCommission">
                                        <template #label>
                                            <span>
                                                Автоматически рассчитывать комиссию для сделок
                                                <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" top>
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
                                    <v-checkbox v-model="importProviderFeatures.autoEvents">
                                        <template #label>
                                            <span>
                                                Автоматически исполнять события по бумагам
                                                <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" top>
                                                    <sup class="custom-tooltip" slot="activator">
                                                        <v-icon>fas fa-info-circle</v-icon>
                                                    </sup>
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
                                    <v-checkbox v-model="importProviderFeatures.confirmMoneyBalance">
                                        <template #label>
                                            <span>
                                                Спрашивать текущий остаток ДС
                                                <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" top>
                                                    <sup class="custom-tooltip" slot="activator">
                                                        <v-icon>fas fa-info-circle</v-icon>
                                                    </sup>
                                                    <span>
                                                        Если включено, то после успешного импорта будет предложено ввести текущий остаток денежных
                                                        средств на счете. Отключите, если Вы хотите сами задать вводы и выводы денег.
                                                    </span>
                                                </v-tooltip>
                                            </span>
                                        </template>
                                    </v-checkbox>
                                </v-flex>
                                <v-flex xs12 lg6>
                                    <v-checkbox v-model="importProviderFeatures.importMoneyTrades">
                                        <template #label>
                                            <span>
                                                Импорт сделок по денежным средствам
                                                <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" top>
                                                    <sup class="custom-tooltip" slot="activator">
                                                        <v-icon>fas fa-info-circle</v-icon>
                                                    </sup>
                                                    <span>
                                                        Если включено, то из отчета будут импортированы сделки по денежным средствам.
                                                        Отключите, если Вы не хотите загружать сделки по движению денежных средств.
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
    /** Все провайдеры импорта */
    private importProviderFeaturesByProvider: ImportProviderFeaturesByProvider = null;
    /** Настройки импорта для выбранного провайдера */
    private importProviderFeatures: ImportProviderFeatures = null;
    /** Файлы для импорта */
    private files: File[] = [];
    /** Провайдеры отчетов */
    private providers = DealsImportProvider;
    /** Выбранный провайдер */
    private selectedProvider: DealsImportProvider = null;
    /** Признак отображения панели с расширенными настройками */
    private showExtendedSettings = false;

    /**
     * Инициализирует необходимые для работы данные
     * @inheritDoc
     */
    @CatchErrors
    @ShowProgress
    async created(): Promise<void> {
        this.importProviderFeaturesByProvider = await this.importService.getImportProviderFeatures();
    }

    /**
     * Событие при добавлении вложений
     * @param {FileList} fileList список файлов
     */
    private onFileAdd(fileList: File[]): void {
        let filtered = fileList;
        if (fileList.length > 1) {
            this.$snotify.warning("Пожалуйста загружайте по одному файлу для более точных результатов импорта.");
            filtered = [fileList[0]];
        }
        const isValid = FileUtils.checkExtension(filtered[0]);
        if (!isValid) {
            this.$snotify.warning(`Формат файла не соответствует разрешенным: ${FileUtils.ALLOWED_EXTENSION}.`);
            return;
        }
        this.files = filtered;
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
    @CatchErrors
    @ShowProgress
    private async uploadFile(): Promise<void> {
        if (this.files && this.files.length && this.selectedProvider) {
            const response = await this.importService.importReport(this.selectedProvider, this.portfolio.id, this.files, this.importProviderFeatures);
            await this.handleUploadResponse(response);
            this.files = [];
        }
    }

    /**
     * Обрабатывает ответ от сервера после импорта отчета
     * @param response
     */
    private async handleUploadResponse(response: ImportResponse): Promise<void> {
        if (response.status === Status.ERROR && CommonUtils.isBlank(response.generalError)) {
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
            // отображаем диалог с ошибками, но информацию по портфелю надо перезагрузить если были успешно импортированы сделки
            if (response.validatedTradesCount) {
                await this.reloadPortfolio(this.portfolio.id);
            }
            return;
        }
        if (response.validatedTradesCount) {
            const firstWord = Filters.declension(response.validatedTradesCount, "Добавлена", "Добавлено", "Добавлено");
            const secondWord = Filters.declension(response.validatedTradesCount, "сделка", "сделки", "сделок");
            if (this.importProviderFeatures.confirmMoneyBalance) {
                const currentMoneyRemainder = await this.overviewService.getCurrentMoney(this.portfolio.id);
                const enteredMoneyRemainder = await new ImportSuccessDialog().show({
                    currentMoneyRemainder,
                    router: this.$router,
                    store: this.$store.state[StoreType.MAIN],
                    importResult: response
                });
                await this.overviewService.saveOrUpdateCurrentMoney(this.portfolio.id, enteredMoneyRemainder);
                this.$router.push("portfolio");
                this.$snotify.info(`${firstWord} ${response.validatedTradesCount} ${secondWord}.`, "Результат импорта");
            } else {
                this.$snotify.info(`Импорт прошел успешно. ${firstWord} ${response.validatedTradesCount} ${secondWord}.`, "Результат импорта");
            }
            await this.reloadPortfolio(this.portfolio.id);
        } else {
            this.$snotify.warning("В отчете не содержится информации по сделкам.", "Импорт завершен");
        }
    }

    /**
     * Обрабатывает событие выбора провайдера из стороннего компонента
     * @param provider выбранный провайдер
     */
    private onSelectProvider(provider: DealsImportProvider): void {
        this.selectedProvider = provider;
        this.importProviderFeatures = {...this.importProviderFeaturesByProvider[provider]};
        if (this.selectedProvider === DealsImportProvider.INTELINVEST) {
            this.importProviderFeatures.createLinkedTrade = false;
        }
    }
}
