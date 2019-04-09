import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ImportErrorsDialog} from "../../components/dialogs/importErrorsDialog";
import {ImportGeneralErrorDialog} from "../../components/dialogs/importGeneralErrorDialog";
import {ImportSuccessDialog} from "../../components/dialogs/importSuccessDialog";
import {ExpandedPanel} from "../../components/expandedPanel";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
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
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Импорт сделок</div>
                </v-card-title>
            </v-card>
            <v-card flat class="import-wrapper">
                <v-card-title class="import-wrapper-header">
                    <div class="import-wrapper-header__title">
                        Выберите своего брокера
                    </div>
                </v-card-title>
                <v-card-text class="import-wrapper-content">
                    <div class="providers">
                        <div v-for="provider in providers" :key="provider.id" @click="onSelectProvider(provider.id)" v-if="provider.id !== 'INTELINVEST'"
                            :class="['item' ,selectedProvider === provider.id ? 'active' : '']">
                            <div :class="['item-img-block', provider.id.toLowerCase()]">
                            </div>
                            <div class="item-text">
                                {{ provider.name }}
                            </div>
                        </div>
                    </div>

                    <v-layout justify-space-between wrap class="intelinvest-section">
                        <div class="intelinvest-section__description">
                            Если в списке нет вашего брокера или терминала, вы всегда можете осуществить импорт через универсальный формат
                            <a @click="selectedProvider = providers.INTELINVEST">CSV</a>
                            или обратиться к нам через обратную связь, по <a href="mailto:web@intelinvest.ru" target="_blank">почте</a> или
                            в группе <a href="http://vk.com/intelinvest" target="_blank">вконтакте</a>.
                        </div>
                        <v-btn class="btn" @click="onSelectProvider('INTELINVEST')">
                            Формат Intelinvest
                        </v-btn>
                    </v-layout>

                    <v-menu content-class="dialog-setings-menu"
                            transition="slide-y-transition"
                            nudge-bottom="36" right class="setings-menu"
                            v-if="importProviderFeatures" min-width="514" :close-on-content-click="false">
                        <v-btn class="btn" slot="activator">
                            Настройки
                        </v-btn>
                        <v-list dense>
                            <div class="title-setings">
                                Расширенные настройки импорта
                            </div>
                            <v-flex>
                                <v-checkbox v-model="importProviderFeatures.createLinkedTrade" hide-details color="#3B6EC9" class="checkbox-setings">
                                    <template #label>
                                        <span>Добавлять сделки по списанию/зачислению денежных средств
                                            <v-menu transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12">
                                                <sup class="custom-tooltip" slot="activator">
                                                    <v-icon>fas fa-info-circle</v-icon>
                                                </sup>
                                                <v-list dense>
                                                    <div class="hint-text-for-setings">
                                                        Если включено, будут добавлены связанные сделки по зачислению/списанию денежных средств
                                                    </div>
                                                </v-list>
                                            </v-menu>
                                        </span>
                                    </template>
                                </v-checkbox>
                                <v-checkbox v-model="importProviderFeatures.autoCommission" hide-details color="#3B6EC9" class="checkbox-setings">
                                    <template #label>
                                        <span>
                                            Автоматически рассчитывать комиссию для сделок
                                            <v-menu transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12" max-width="520">
                                                <sup class="custom-tooltip" slot="activator">
                                                    <v-icon>fas fa-info-circle</v-icon>
                                                </sup>
                                                <v-list dense>
                                                    <div class="hint-text-for-setings">
                                                        Если включено, комиссия для каждой сделки по ценной бумаге будет рассчитана в соответствии
                                                        со значением фиксированной комиссии, заданной для портфеля. Если комиссия для бумаги есть в отчете
                                                        она не будет перезаписана.
                                                    </div>
                                                </v-list>
                                            </v-menu>
                                        </span>
                                    </template>
                                </v-checkbox>
                                <v-checkbox v-model="importProviderFeatures.autoEvents" hide-details color="#3B6EC9" class="checkbox-setings">
                                    <template #label>
                                        <span>
                                            Автоматически исполнять события по бумагам
                                            <v-menu transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12" max-width="520">
                                                <sup class="custom-tooltip" slot="activator">
                                                    <v-icon>fas fa-info-circle</v-icon>
                                                </sup>
                                                <v-list dense>
                                                    <div class="hint-text-for-setings">
                                                        Если включено, события (дивиденды, купоны, амортизация, погашение) по сделкам,
                                                        полученным из отчета (на даты первой и последней сделки),
                                                        будут автоматически исполнены после импорта.
                                                    </div>
                                                </v-list>
                                            </v-menu>
                                        </span>
                                    </template>
                                </v-checkbox>
                                <v-checkbox v-model="importProviderFeatures.confirmMoneyBalance" hide-details color="#3B6EC9" class="checkbox-setings">
                                    <template #label>
                                        <span>
                                            Спрашивать текущий остаток ДС
                                            <v-menu transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12" max-width="520">
                                                <sup class="custom-tooltip" slot="activator">
                                                    <v-icon>fas fa-info-circle</v-icon>
                                                </sup>
                                                <v-list dense>
                                                    <div class="hint-text-for-setings">
                                                        Если включено, то после успешного импорта будет предложено ввести текущий остаток денежных
                                                        средств на счете. Отключите, если Вы хотите сами задать вводы и выводы денег.
                                                    </div>
                                                </v-list>
                                            </v-menu>
                                        </span>
                                    </template>
                                </v-checkbox>
                                <v-checkbox v-model="importProviderFeatures.importMoneyTrades" hide-details color="#3B6EC9" class="checkbox-setings">
                                    <template #label>
                                        <span>
                                            Импорт сделок по денежным средствам
                                            <v-menu transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12" max-width="520">
                                                <sup class="custom-tooltip" slot="activator">
                                                    <v-icon>fas fa-info-circle</v-icon>
                                                </sup>
                                                <v-list dense>
                                                    <div class="hint-text-for-setings">
                                                        Если включено, то из отчета будут импортированы сделки по денежным средствам.
                                                        Отключите, если Вы не хотите загружать сделки по движению денежных средств.
                                                    </div>
                                                </v-list>
                                            </v-menu>
                                        </span>
                                    </template>
                                </v-checkbox>
                            </v-flex>
                        </v-list>
                    </v-menu>

                    <div class="attachments" v-if="importProviderFeatures">
                        <file-drop-area @drop="onFileAdd" class="attachments-file-drop">
                            <div class="attachments-file-drop__content">
                                Перетащите файл
                            </div>
                        </file-drop-area>
                    </div>
                    <div v-if="files.length && importProviderFeatures">
                        <div v-for="(file, index) in files" :key="index">
                            <v-layout align-center class="item-files">
                                <div>
                                    <v-list-tile-title class="item-files__name">
                                        {{ file.name }}
                                    </v-list-tile-title>
                                    <div class="item-files__size">
                                        {{ file.size }} KB
                                    </div>
                                </div>
                                <v-spacer></v-spacer>
                                <div>
                                    <v-icon color="#B0B4C2" small @click="deleteFile(file)">close</v-icon>
                                </div>
                            </v-layout>
                        </div>
                    </div>

                    <v-layout align-center class="section-upload-file">
                        <v-btn v-if="importProviderFeatures && files.length" color="primary" class="big_btn" @click="uploadFile">Загрузить</v-btn>
                        <file-link @select="onFileAdd" :accept="allowedExtensions" v-if="importProviderFeatures && !files.length">Выбрать файл</file-link>
                        <v-spacer></v-spacer>
                        <div @click="showInstruction = !showInstruction" class="btn-show-instruction" v-if="importProviderFeatures">
                            Как сформировать отчет брокера?
                        </div>
                    </v-layout>

                    <import-instructions v-if="showInstruction" :provider="selectedProvider" @selectProvider="onSelectProvider"></import-instructions>

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
    private selectedProvider: string = null;
    /** Признак отображения панели с расширенными настройками */
    private showExtendedSettings = false;
    /** Отображение инструкции к провайдеру */
    private showInstruction: boolean = false;
    /** Допустимые MIME типы */
    private allowedExtensions = FileUtils.ALLOWED_MIME_TYPES;

    /**
     * Инициализирует необходимые для работы данные
     * @inheritDoc
     */
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
     * Отправляет отчет на сервер и обрабатывает ответ
     */
    private async uploadFile(): Promise<void> {
        if (this.files && this.files.length && this.selectedProvider) {
            const response = await this.importReport();
            await this.handleUploadResponse(response);
            this.clearFiles();
        }
    }

    /**
     * Отправляет отчет на сервер
     */
    @ShowProgress
    private async importReport(): Promise<ImportResponse> {
        return this.importService.importReport(this.selectedProvider, this.portfolio.id, this.files, this.importProviderFeatures);
    }

    /**
     * Обрабатывает ответ от сервера после импорта отчета
     * @param response
     */
    private async handleUploadResponse(response: ImportResponse): Promise<void> {
        if (response.status === Status.ERROR && CommonUtils.isBlank(response.generalError)) {
            this.$snotify.error(response.message);
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
            let navigateToPortfolioPage = true;
            if (this.importProviderFeatures.confirmMoneyBalance) {
                const currentMoneyRemainder = await this.overviewService.getCurrentMoney(this.portfolio.id);
                navigateToPortfolioPage = await new ImportSuccessDialog().show({
                    currentMoneyRemainder,
                    router: this.$router,
                    store: this.$store.state[StoreType.MAIN],
                    importResult: response
                }) === BtnReturn.YES;
            }
            await this.reloadPortfolio(this.portfolio.id);
            this.$snotify.info(`Импорт прошел успешно. ${firstWord} ${response.validatedTradesCount} ${secondWord}.`);
            if (navigateToPortfolioPage) {
                this.$router.push("portfolio");
            }
        } else {
            this.$snotify.warning("Импорт завершен. В отчете не содержится информации по сделкам.");
        }
    }

    /**
     * Обрабатывает событие выбора провайдера из стороннего компонента
     * @param provider выбранный провайдер
     */
    private onSelectProvider(provider: string): void {
        this.showInstruction = false;
        this.selectedProvider = provider;
        this.importProviderFeatures = {...this.importProviderFeaturesByProvider[provider]};
        if (this.selectedProvider === "INTELINVEST") {
            this.importProviderFeatures.createLinkedTrade = false;
        }
        this.clearFiles();
    }

    private clearFiles(): void {
        this.files = [];
    }
}
