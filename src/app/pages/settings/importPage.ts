import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../../app/ui";
import {BrokerSwitcher} from "../../components/brokerSwitcher";
import {CurrencyBalances} from "../../components/currencyBalances";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {FeedbackDialog} from "../../components/dialogs/feedbackDialog";
import {ExpandedPanel} from "../../components/expandedPanel";
import {ImportResultComponent} from "../../components/importResultComponent";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo} from "../../services/clientService";
import {EventService} from "../../services/eventService";
import {
    DealImportError,
    DealsImportProvider,
    ImportProviderFeatures,
    ImportProviderFeaturesByProvider,
    ImportResponse,
    ImportService,
    ShareAliasItem,
    UserImport
} from "../../services/importService";
import {OverviewService} from "../../services/overviewService";
import {PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {CurrencyUnit} from "../../types/currency";
import {Portfolio, Share, Status} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {DateUtils} from "../../utils/dateUtils";
import {FileUtils} from "../../utils/fileUtils";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";
import {ImportInstructions} from "./importInstructions";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-slide-x-reverse-transition>
            <template v-if="initialized">
                <v-container fluid>
                    <v-card flat class="header-first-card">
                        <v-card-title class="header-first-card__wrapper-title">
                            <div class="section-title header-first-card__title-text">Импорт сделок</div>
                        </v-card-title>
                    </v-card>
                    <!-- Выбор брокера -->
                    <v-card v-if="!selectedProvider" flat class="import-wrapper paddB24">
                        <div class="info-block margB24">
                            Данный раздел поможет Вам перенести отчеты брокера на сервис.<br>
                            Обратите внимание, что для полного соответствия портфеля необходимо выгрузить сделки за все время, а не только за последний месяц.
                        </div>
                        <v-card-title class="import-wrapper-header">
                            <div class="import-wrapper-header__title">
                                Выберите своего брокера
                                <v-menu open-on-hover bottom nudge-bottom="11" content-class="pa-3 bg-white" max-width="600">
                                <span class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </span>
                                    <span class="fs13">
                                        Если в списке нет вашего брокера или терминала, вы всегда можете осуществить импорт через универсальный формат Intelinvest (csv)
                                        или обратиться к нам через <a @click.stop="openFeedBackDialog">обратную связь</a> ,
                                        <a href="mailto:web@intelinvest.ru">по почте</a> или в группе <a href="https://vk.com/intelinvest">вконтакте</a>.
                                </span>
                                </v-menu>
                            </div>
                        </v-card-title>
                    </v-card>
                    <v-card v-if="!selectedProvider" flat class="px-0 py-0" data-v-step="0">
                        <div class="providers">
                            <div v-for="provider in providers.values()" :key="provider.code" @click="onSelectProvider(provider)" class="item active">
                                <div :class="['item-img-block', provider.code.toLowerCase()]"></div>
                                <div class="item-text">
                                    {{ provider.description }}
                                </div>
                            </div>
                        </div>
                    </v-card>

                    <!-- Брокер выбран -->
                    <v-card v-if="selectedProvider" flat class="import-wrapper">
                        <v-card-text class="import-wrapper-content">
                            <div class="provider__info">
                                <div class="margRAuto">
                                    <!-- Иконка брокера и меню Изменить брокера -->
                                    <div class="provider">
                                        <div :class="['provider__image', selectedProvider.code.toLowerCase()]"></div>
                                        <div class="provider__name">
                                            {{ selectedProvider.description }}
                                            <div v-if="portfolio.overview.totalTradesCount">Дата последней сделки: {{ portfolio.overview.lastTradeDate | date }}</div>
                                        </div>
                                    </div>
                                </div>
                                <broker-switcher @selectProvider="onSelectProvider($event)" :class="{'margR12': importHistory.length}"></broker-switcher>
                                <v-btn v-if="showImportHistory" @click="goToImportHistory" color="#EBEFF7">
                                    <v-icon left>icon-import-history</v-icon>
                                    История импорта
                                </v-btn>
                            </div>
                            <v-stepper v-model="currentStep" class="provider__stepper">
                                <v-stepper-header>
                                    <v-stepper-step step="1">Загрузка отчета</v-stepper-step>
                                    <v-stepper-step step="2">Дополнительные данные</v-stepper-step>
                                    <v-stepper-step step="3">Результат импорта</v-stepper-step>
                                </v-stepper-header>

                                <v-stepper-items>
                                    <v-stepper-content step="1">
                                        <!-- История импорта -->
                                        <div v-if="providerAllowedExtensions" class="attachments__allowed-extensions">
                                            Допустимые расширения файлов: <span>{{ providerAllowedExtensions }}</span>
                                        </div>
                                        <div v-if="!files.length && importProviderFeatures" class="attachments">
                                            <file-drop-area @drop="onFileAdd($event)" class="attachments-file-drop">
                                                <div v-if="selectedProvider" class="attachments-file-drop__content">
                                                    <div class="attachments__title">Загрузить отчет по сделкам</div>
                                                    <div>
                                                        Перетащить сюда или
                                                        <file-link @select="onFileAdd($event)" :accept="allowedExtensions">выбрать</file-link>
                                                    </div>
                                                </div>
                                            </file-drop-area>
                                        </div>
                                        <div v-if="files.length !== 2 && importProviderFeatures && isSberbank" class="attachments">
                                            <file-drop-area @drop="onFileAdd($event)" class="attachments-file-drop">
                                                <div v-if="selectedProvider" class="attachments-file-drop__content">
                                                    <div class="attachments__title">Загрузить отчет с зачислениями и списаниями</div>
                                                    <div>
                                                        Перетащить сюда или
                                                        <file-link @select="onFileAdd($event)" :accept="allowedExtensions">выбрать</file-link>
                                                    </div>
                                                </div>
                                            </file-drop-area>
                                        </div>
                                        <div v-if="importProviderFeatures && files.length" class="attachments-block">
                                            <div class="fs0">
                                                <div v-for="(file, index) in files" :key="index" class="attach-file">
                                                    <v-list-tile-title class="attach-file__name">
                                                        {{ file.name }}
                                                    </v-list-tile-title>
                                                    <div class="attach-file__size">
                                                        {{ file.size | bytes }}
                                                    </div>
                                                    <v-icon color="#B0B4C2" small @click="deleteFile(file)">close</v-icon>
                                                </div>

                                                <v-layout class="section-upload-file" wrap data-v-step="2">
                                                    <v-btn color="primary" class="btn margR12" @click.stop="uploadFile">Загрузить</v-btn>
                                                    <file-link v-if="!isSberbank" @select="onFileAdd($event, true)" :accept="allowedExtensions" class="reselect-file-btn">
                                                        Выбрать другой файл
                                                    </file-link>
                                                </v-layout>
                                            </div>
                                            <div>
                                                <v-flex v-if="importProviderFeatures && showImportSettings">
                                                    <v-radio-group v-model="autoEvents">
                                                        <v-radio :value="true">
                                                            <template #label>
                                                                Автоматически исполнить события по бумагам
                                                                <tooltip>Дивиденды, купоны, амортизация будут созданы на основе внутренней базы данных</tooltip>
                                                            </template>
                                                        </v-radio>
                                                        <v-radio :value="false">
                                                            <template #label>
                                                                Внести купоны/дивиденды вручную
                                                                <tooltip>Дивиденды, купоны, амортизацию необходимо внести вручную или через Инструменты - События</tooltip>
                                                            </template>
                                                        </v-radio>
                                                    </v-radio-group>
                                                </v-flex>
                                            </div>
                                        </div>

                                        <v-divider class="margT32 margB24"></v-divider>

                                        <expanded-panel :value="showInstruction" class="promo-codes__statistics">
                                            <template #header>Как выгрузить отчет брокера?</template>
                                            <import-instructions :provider="selectedProvider" @selectProvider="onSelectProvider"
                                                                 @changePortfolioParams="changePortfolioParams" :portfolio-params="portfolioParams"
                                                                 class="margT20"></import-instructions>
                                        </expanded-panel>

                                    </v-stepper-content>

                                    <v-stepper-content step="2">
                                        <v-card class="dialog-wrap import-dialog-wrapper">
                                            <template v-if="importProviderFeatures.confirmMoneyBalance">
                                                <span class="fs14">Остатки денежных средств</span>
                                                <tooltip>
                                                    Остаток денежных средств может отличаться от брокера<br/>
                                                    В отчете брокера не указаны остатки денежных средств на данный момент.
                                                    Чтобы исключить несоответствие портфеля, пожалуйста укажите текущие остатки денежных средств в полях ввода
                                                </tooltip>
                                                <currency-balances ref="currencyBalances" :portfolio-id="portfolio.id" class="currency-balances"></currency-balances>

                                                <v-divider class="margB24"></v-divider>
                                            </template>

                                            <span v-if="shareAliases.length" class="fs14">Не распознаны тикеры следующих бумаг</span>
                                            <tooltip v-if="shareAliases.length">
                                                Брокер использует нестандартные названия для ценных бумаг в своих отчетах или не указывает уникальный идентификатор
                                                бумаги, по которому ее можно распознать.<br><br>

                                                Чтобы импортировать ваш портфель полностью соотнесите название бумаги из отчета с названием бумаги на сервисе.
                                                Например: «ПАО Газпром-ао» → GAZP
                                            </tooltip>
                                            <div v-if="shareAliases.length" class="margT20">
                                                <v-card-text class="selectable import-alias">
                                                    <div v-for="aliasItem in shareAliases" :key="aliasItem.alias" class="import-alias-item">
                                                        <!-- Алиас бумаги -->
                                                        <div class="import-alias-item__name" :title="aliasItem.alias">{{ aliasDescription(aliasItem) }}</div>
                                                        <!-- Выбранная бумага -->
                                                        <share-search @change="onShareSelect($event, aliasItem)" @clear="onShareClear(aliasItem)"
                                                                      @requestNewShare="onRequestNewShare"
                                                                      autofocus ellipsis allow-request></share-search>
                                                    </div>
                                                </v-card-text>
                                            </div>

                                            <v-btn color="primary" class="big_btn" @click.stop="goToFinalStep">Далее</v-btn>
                                        </v-card>
                                    </v-stepper-content>

                                    <v-stepper-content step="3">
                                        <div v-if="importResult" class="import-result-status">
                                            <div :class="['import-result-status__img',
                                                importStatus === Status.ERROR ? 'status-error' :
                                                importStatus === Status.SUCCESS ? 'status-success' : 'status-warn']"></div>
                                            <div class="import-result-status__content">
                                                <div :class="{'status-error': importStatus === Status.ERROR}">
                                                    {{ importStatus === Status.ERROR ? "Ошибка" : importStatus === Status.SUCCESS ? "Успех" : "Почти Успех" }}
                                                </div>
                                                <span v-if="savedTradesCount">
                                                    {{ savedTradesCount | declension("Добавлена", "Добавлено", "Добавлено") }}
                                                    {{ savedTradesCount }} {{ savedTradesCount | declension("сделка", "сделки", "сделок") }}
                                                </span>
                                            </div>
                                        </div>
                                        <div v-if="showResultsPanel" class="info-block">
                                            Портфель почти сформирован, для полного соответствия, возможно, потребуются дополнительные действия
                                        </div>

                                        <import-result v-if="showResultsPanel" :import-result="importResult" :import-provider="selectedProvider"
                                                       :portfolio-params="portfolioParams" :import-provider-features="importProviderFeatures"
                                                       :has-new-events-after-import="hasNewEventsAfterImport"></import-result>

                                        <v-btn @click="goToPortfolio" color="primary" class="margR12">Перейти в портфель</v-btn>
                                        <v-btn @click="goToNewImport">Новый импорт</v-btn>
                                    </v-stepper-content>
                                </v-stepper-items>
                            </v-stepper>
                        </v-card-text>
                    </v-card>
                </v-container>
            </template>
            <template v-else>
                <content-loader class="content-loader" :height="200" :width="800" :speed="1" primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                    <rect x="0" y="20" rx="5" ry="5" width="801.11" height="180"/>
                </content-loader>
            </template>
        </v-slide-x-reverse-transition>
    `,
    components: {BrokerSwitcher, CurrencyBalances, ImportInstructions, "import-result": ImportResultComponent, ExpandedPanel}
})
export class ImportPage extends UI {

    /** Текст ошибки о дублировании сделки */
    private static readonly DUPLICATE_MSG = "Сделка уже была импортирована ранее";
    /** Ошибка о репо */
    private static readonly REPO_TRADE_MSG = "Импорт сделки РЕПО не производится.";

    $refs: {
        currencyBalances: CurrencyBalances
    };

    /** Максимальный размер загружаемого файла 10 Мб */
    readonly MAX_SIZE = 1024 * 1024 * 10;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @Inject
    private importService: ImportService;
    @Inject
    private overviewService: OverviewService;
    @Inject
    private portfolioService: PortfolioService;
    @Inject
    private eventService: EventService;
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
    /** Допустимые MIME типы */
    private allowedExtensions = FileUtils.ALLOWED_MIME_TYPES;
    /** Отображение инструкции к провайдеру */
    private showInstruction: number[] = [1];
    /** Параметры текущего портфеля */
    private portfolioParams: PortfolioParams = null;
    /** Признак процесса импорта, чтобы не очищались файлы */
    private importInProgress = false;
    /** Текущий шаг */
    private currentStep = ImportStep._1;
    /** Алиасы бумаг */
    private shareAliases: ShareAliasItem[] = [];
    /** История импорта */
    private importHistory: UserImport[] = [];
    /** Результат импорта */
    private importResult: ImportResponse = null;
    /** Статусы */
    private Status = Status;
    /** Признак наличия события после импорта */
    private hasNewEventsAfterImport = false;
    /** Предыдущее значение успешно импортированных сделок, для отображения результата после повторного импорта */
    private previousImportValidatedTradesCount = 0;
    /** Признак автоисполнения событий. Для тех брокеров, которые не поддерживают импорт из отчета */
    private autoEvents = true;
    /** Признак инициализации */
    private initialized = false;

    /**
     * Инициализирует необходимые для работы данные
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        try {
            this.importProviderFeaturesByProvider = await this.importService.getImportProviderFeatures();
            await this.loadImportHistory();
            this.portfolioParams = {...this.portfolio.portfolioParams};
            this.selectUserProvider();
            this.showInstruction = [this.portfolioParams.brokerId ? 0 : 1];
        } finally {
            this.initialized = true;
        }
    }

    private async revertImport(userImportId: number): Promise<void> {
        const result = await new ConfirmDialog().show("Вы собираетесь откатить импорт, это приведет к удалению информации о нем из портфеля");
        if (result === BtnReturn.YES) {
            await this.revertImportConfirmed(userImportId);
            await this.reloadPortfolio(this.portfolio.id);
            this.$snotify.info("Результаты импорта были успешно отменены");
        }
    }

    @ShowProgress
    private async loadImportHistory(): Promise<void> {
        this.importHistory = await this.importService.importHistory();
    }

    @ShowProgress
    private async revertImportConfirmed(userImportId: number): Promise<void> {
        await this.importService.revertImport(userImportId, this.portfolio.id);
        await this.loadImportHistory();
    }

    private onShareSelect(share: Share, aliasItem: ShareAliasItem): void {
        aliasItem.share = share;
    }

    private onShareClear(aliasItem: ShareAliasItem): void {
        aliasItem.share = null;
    }

    /**
     * Вызывает диалог обратной связи для добавления новой бумаги в систему
     * @param newTicket название новой бумаги из компонента поиска
     */
    private async onRequestNewShare(newTicket: string): Promise<void> {
        const message = `Пожалуйста, добавьте бумагу ${newTicket} в систему.`;
        await new FeedbackDialog().show({clientInfo: this.clientInfo.user, message: message});
    }

    private async goToFinalStep(): Promise<void> {
        if (this.importProviderFeatures.confirmMoneyBalance) {
            const result = await this.$refs.currencyBalances.validateResiduals();
            if (!result) {
                this.$snotify.warning("Укажите остатки");
                return;
            }
            await this.$refs.currencyBalances.saveOrUpdateCurrentMoney();
        }
        const filled = this.shareAliases.filter(shareAlias => !!shareAlias.share);
        const allFilled = filled.length === this.shareAliases.length;
        if (!allFilled) {
            const answer = await new ConfirmDialog().show("Вы не указали соответствия для всех нераспознанных бумаг. " +
                "Если продолжить, будут импортированы только сделки по тем бумагам, которые вы указали.");
            if (answer !== BtnReturn.YES) {
                return;
            }
        }
        // отправляем запрос на сохранение алиасов и повторную загрузку отчета, только если в списке алиасов есть значения
        if (filled.length) {
            await this.importService.saveShareAliases(filled);
            this.importResult = await this.importReport();
            await this.handleUploadResponse(true);
        } else {
            // надо очистить, потому что повторно не загружаем
            this.previousImportValidatedTradesCount = 0;
        }
        // если начисления импортируем из отчета, дополнительно проверяем что в Событиях ничего нового не появилось
        if (!this.importProviderFeatures.autoEvents || !this.autoEvents) {
            this.hasNewEventsAfterImport = (await this.eventService.getEvents(this.portfolio.id)).events.length > 0;
        }
        this.currentStep = ImportStep._3;
    }

    private aliasDescription(shareAlias: ShareAliasItem): string {
        return `${shareAlias.alias}${shareAlias.currency ? ", " + CurrencyUnit.valueByCode(shareAlias.currency).symbol : ""}`;
    }

    @Watch("portfolio")
    @ShowProgress
    private async onPortfolioChange(): Promise<void> {
        if (this.importInProgress) {
            return;
        }
        this.selectUserProvider();
        await this.loadImportHistory();
    }

    private selectUserProvider(): void {
        const userProvider = DealsImportProvider.values().find(provider => provider.id === this.portfolio.portfolioParams.brokerId);
        if (userProvider) {
            this.onSelectProvider(userProvider);
        } else {
            this.selectedProvider = null;
            this.importProviderFeatures = null;
        }
    }

    /**
     * Событие при добавлении вложений
     * @param {FileList} fileList список файлов
     * @param replace признак того, что надо заменить, а не добавить файл
     */
    private onFileAdd(fileList: File[], replace: boolean = false): void {
        let filtered = fileList;
        if (fileList.length > 1 && !this.isSberbank) {
            this.$snotify.warning("Пожалуйста, загружайте по одному файлу для более точных результатов импорта.");
            filtered = [fileList[0]];
        }
        const isValid = fileList.map(file => FileUtils.checkExtension(file)).every(result => result);
        if (!isValid) {
            this.$snotify.warning(`Формат файла не соответствует разрешенным: ${FileUtils.ALLOWED_EXTENSION}.`);
            return;
        }
        if (filtered.map(file => file.size).reduce((previousValue: number, currentValue: number): number => previousValue + currentValue, 0) > this.MAX_SIZE) {
            this.$snotify.warning(`Максимальный размер загружаемого файла 10 Мб.`);
            return;
        }
        this.files = replace ? [...filtered] : [...this.files, ...filtered];
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
            this.importInProgress = true;
            if (this.portfolio.portfolioParams.brokerId && this.portfolio.portfolioParams.brokerId !== this.selectedProvider.id) {
                const result = await new ConfirmDialog().show(`Внимание! Вы загружаете отчет брокера ${this.selectedProvider.description} в портфель,
                    в который ранее были загружены отчеты брокера ${this.getNameCurrentBroker}.
                    При продолжении импорта, могут возникнуть дубли существующих в вашем портфеле сделок.
                    Мы рекомендуем загружать отчеты разных брокеров в разные портфели и объединять их в составной портфель.`);
                if (result !== BtnReturn.YES) {
                    return;
                }
            }
            if (this.isFinam && this.portfolioParams.fixFee !== this.portfolio.portfolioParams.fixFee) {
                await this.portfolioService.createOrUpdatePortfolio(this.portfolioParams);
            }
            this.importResult = await this.importReport();
            await this.handleUploadResponse();
        }
    }

    private get getNameCurrentBroker(): string {
        const provider = this.providers.values().find(item => item.id === this.portfolio.portfolioParams.brokerId);
        return provider ? provider.description : "";
    }

    /**
     * Отправляет отчет на сервер
     */
    @ShowProgress
    private async importReport(): Promise<ImportResponse> {
        const results = await this.importService.importReport(this.selectedProvider.code, this.portfolio.id, this.files,
            {...this.importProviderFeatures, autoEvents: this.showImportSettings ? this.autoEvents : this.importProviderFeatures.autoEvents});
        if (results.length > 1) {
            const hasErrorStatus = results.some(result => result.status === Status.ERROR);
            const hasWarnStatus = results.some(result => result.status === Status.WARN);
            return {
                validatedTradesCount: results.map(result => result.validatedTradesCount).reduce((previousValue, currentValue) => previousValue + currentValue, 0),
                generalError: hasErrorStatus ? results.find(result => result.generalError)?.generalError : null,
                message: hasErrorStatus ? results.find(result => result.generalError)?.message :
                    hasWarnStatus ? results.find(result => result.status === Status.WARN)?.message : results.find(result => result.status === Status.SUCCESS)?.message,
                status: hasErrorStatus ? Status.ERROR : hasWarnStatus ? Status.WARN : Status.SUCCESS,
                firstTradeDate: results.sort((a, b) => DateUtils.parseDate(a.firstTradeDate).isAfter(DateUtils.parseDate(b.firstTradeDate)) ? 1 : -1)[0].firstTradeDate,
                lastTradeDate: results.sort((a, b) => DateUtils.parseDate(a.lastTradeDate).isBefore(DateUtils.parseDate(b.lastTradeDate)) ? 1 : -1)[0].lastTradeDate,
                errors: results.map(result => result.errors).reduce((a, b) => a.concat(b), [])
            } as ImportResponse;
        }
        return results[0];
    }

    /**
     * Обрабатывает ответ от сервера после импорта отчета
     * @param retryUpload
     */
    private async handleUploadResponse(retryUpload: boolean = false): Promise<void> {
        if (this.importResult.status === Status.ERROR && CommonUtils.isBlank(this.importResult.generalError)) {
            this.$snotify.error(this.importResult.message);
            return;
        }
        if (this.importResult.generalError) {
            this.currentStep = ImportStep._3;
            return;
        }
        if (!retryUpload) {
            this.previousImportValidatedTradesCount = this.importResult.validatedTradesCount;
        }
        if (this.importResult.validatedTradesCount) {
            await this.reloadPortfolio(this.portfolio.id);
        }
        // если это повторная загрузка после сохранения алиасов, поторно в этот блок не заходи и сразу идем на третий шаг
        if (!retryUpload && this.importResult.errors && this.importResult.errors.length) {
            // если после удаления ошибки все еще остались, отображаем диалог
            // отображаем диалог с ошибками, но информацию по портфелю надо перезагрузить если были успешно импортированы сделки
            if (this.notFoundShareErrors.length) {
                this.shareAliases = this.notFoundShareErrors.map(error => {
                    return {
                        alias: error.dealTicker,
                        currency: error.currency,
                        share: null
                    } as ShareAliasItem;
                });
                this.currentStep = ImportStep._2;
                return;
            }
        }
        // если не повторная загрузка и требуется подтверждение балансов, переходим на второй шаг
        if (!retryUpload && this.importProviderFeatures.confirmMoneyBalance) {
            this.currentStep = ImportStep._2;
            return;
        }
        this.currentStep = ImportStep._3;
    }

    private async goToNewImport(): Promise<void> {
        this.currentStep = ImportStep._1;
        this.clearFields();
        await this.loadImportHistory();
    }

    private async goToPortfolio(): Promise<void> {
        await this.reloadPortfolio(this.portfolio.id);
        this.$router.push("portfolio");
    }

    private async goToImportHistory(): Promise<void> {
        this.$router.push("import-history");
    }

    /**
     * Обрабатывает событие выбора провайдера из стороннего компонента
     * @param provider выбранный провайдер
     */
    private onSelectProvider(provider: DealsImportProvider): void {
        this.selectedProvider = provider;
        this.importProviderFeatures = {...this.importProviderFeaturesByProvider[provider.code]};
        if (this.selectedProvider === this.providers.INTELINVEST) {
            this.importProviderFeatures.createLinkedTrade = false;
        }
        this.clearFields();
        this.currentStep = ImportStep._1;
    }

    private clearFields(): void {
        this.files = [];
        this.importInProgress = false;
        this.previousImportValidatedTradesCount = 0;
        this.shareAliases = [];
        this.autoEvents = true;
    }

    private get providerAllowedExtensions(): string {
        if (this.selectedProvider?.allowedExtensions) {
            return this.selectedProvider?.allowedExtensions.join(", ");
        }
        return "";
    }

    private get importStatus(): Status {
        if (this.importResult) {
            if (this.hasNotesAfterImport) {
                return Status.WARN;
            }
            if (this.importResult.generalError) {
                return Status.ERROR;
            }
            return Status.SUCCESS;
        }
        return null;
    }

    private get showImportSettings(): boolean {
        return this.importProviderFeatures?.autoEvents;
    }

    private get showResultsPanel(): boolean {
        return !this.isIntelinvest && this.importResult && this.hasNotesAfterImport;
    }

    private get showImportHistory(): boolean {
        return this.importHistory.length && [ImportStep._1, ImportStep._3].includes(this.currentStep);
    }

    /**
     * Возвращает признак замечаний или уведомлений требующих внимания от пользователя
     */
    private get hasNotesAfterImport(): boolean {
        return this.hasNewEventsAfterImport || this.importProviderFeatures.autoEvents || this.notFoundShareErrors.length > 0 ||
            this.isQuik || this.importProviderFeatures.confirmMoneyBalance || this.isFinam || this.requireMoreReports || this.otherErrors.length > 0 ||
            this.repoTradeErrors.length > 0 || this.duplicateTradeErrors.length > 0;
    }

    private get notFoundShareErrors(): DealImportError[] {
        return this.importResult ? this.importResult.errors.filter(error => error.shareNotFound) : [];
    }

    private get otherErrors(): DealImportError[] {
        return this.importResult ? this.importResult.errors.filter(error => !error.shareNotFound && error.message !== ImportPage.REPO_TRADE_MSG &&
            error.message !== ImportPage.DUPLICATE_MSG) : [];
    }

    private get repoTradeErrors(): DealImportError[] {
        return this.importResult ? this.importResult.errors.filter(error => error.message === ImportPage.REPO_TRADE_MSG) : [];
    }

    private get duplicateTradeErrors(): DealImportError[] {
        return this.importResult ? this.importResult.errors.filter(error => error.message === ImportPage.DUPLICATE_MSG) : [];
    }

    private get savedTradesCount(): number {
        if (this.importResult) {
            return this.importResult.validatedTradesCount + this.previousImportValidatedTradesCount;
        }
        return 0;
    }

    private get isFinam(): boolean {
        return this.selectedProvider === DealsImportProvider.FINAM;
    }

    private get isQuik(): boolean {
        return this.selectedProvider === DealsImportProvider.QUIK;
    }

    private get isSberbank(): boolean {
        return this.selectedProvider === DealsImportProvider.SBERBANK;
    }

    private get isIntelinvest(): boolean {
        return this.selectedProvider === DealsImportProvider.INTELINVEST;
    }

    /**
     * Возвращает признак необходимости загрузки дополнительных отчетов
     * Если дата последней сдеки не в текущем году
     */
    private get requireMoreReports(): boolean {
        return DateUtils.parseDate(this.importResult?.lastTradeDate).get("year") < dayjs().get("year");
    }

    private changePortfolioParams(portfolioParams: PortfolioParams): void {
        this.portfolioParams = portfolioParams;
    }
}

enum ImportStep {
    _1 = "1",
    _2 = "2",
    _3 = "3"
}
