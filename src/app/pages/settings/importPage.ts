import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../../app/ui";
import {BrokerSwitcher} from "../../components/brokerSwitcher";
import {CurrencyBalances} from "../../components/currencyBalances";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {FeedbackDialog} from "../../components/dialogs/feedbackDialog";
import {ImportResultComponent} from "../../components/importResultComponent";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo, ClientService} from "../../services/clientService";
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
import {SystemPropertyName} from "../../services/systemPropertiesService";
import {CurrencyUnit} from "../../types/currency";
import {EventType} from "../../types/eventType";
import {MapType, Portfolio, Share, Status} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {DateUtils} from "../../utils/dateUtils";
import {FileUtils} from "../../utils/fileUtils";
import {PortfolioUtils} from "../../utils/portfolioUtils";
import {TariffUtils} from "../../utils/tariffUtils";
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
                                    <!-- Иконка брокера и меню Изменить портфель -->
                                    <div class="provider">
                                        <div :class="['provider__image', selectedProvider.code.toLowerCase()]"></div>
                                        <div class="provider__name">
                                            <v-menu content-class="dialog-type-menu" nudge-bottom="32" bottom right max-height="480">
                                                <div slot="activator" class="provider__name-select">
                                                    {{ selectedPortfolio ? portfolioParams.name : 'Выберите портфель' }}
                                                    <v-icon>keyboard_arrow_down</v-icon>
                                                </div>
                                                <v-list dense>
                                                    <v-flex>
                                                        <div class="menu-text" v-for="portfolioParams in availablePortfolios" :key="portfolioParams.id"
                                                             @click="changePortfolio(portfolioParams.id)">
                                                            {{ portfolioParams.name }}
                                                        </div>
                                                    </v-flex>
                                                </v-list>
                                            </v-menu>
                                            <div v-if="selectedPortfolio && selectedPortfolio.overview.totalTradesCount" class="provider__name-date">
                                                Дата последней сделки: {{ selectedPortfolio.overview.lastTradeDate | date }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <broker-switcher @selectProvider="onSelectProvider" class="margR12"></broker-switcher>
                                <v-btn v-if="showImportHistory" @click="goToImportHistory" color="#EBEFF7">
                                    <v-icon left>icon-import-history</v-icon>
                                    История импорта
                                </v-btn>
                            </div>
                            <v-stepper v-model="currentStep" class="provider__stepper">

                                <div v-if="currentStep === '3' && tariffLimitExceeded" class="info-block info-block__warning margB24">
                                    <p>Превышены лимиты по бумагам.</p>
                                    <p>Лимит бумаг в одном портфеле равен {{ maxSharesCount }}, чтобы снять ограничение подпишитесь<br>
                                        на тарифный план "‎Профессионал" и получите полный набор инструментов для учета активов</p>
                                    <a @click="goToTariffs" class="big-link">Сменить тариф</a>
                                </div>

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

                                        <v-divider v-if="portfolioParams" class="margT32 margB24"></v-divider>

                                        <expanded-panel v-if="portfolioParams" :value="showInstruction" class="promo-codes__statistics">
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
                                                <currency-balances v-if="currentStep === '2'" ref="currencyBalances" :portfolio-id="selectedPortfolio.id"
                                                                   class="currency-balances"></currency-balances>

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
                                                <span v-if="importStatus === Status.NO_TRADES">
                                                    Брокерский отчет не содержит сделок. <br/>
                                                    Увеличьте период отчета, и загрузите отчет за все время (несколько отчетов, что охватывают все время)
                                                </span>
                                            </div>
                                        </div>

                                        <expanded-panel v-if="portfolioParams && importStatus === Status.NO_TRADES" :value="showInstruction" class="promo-codes__statistics">
                                            <template #header>Как выгрузить отчет брокера?</template>
                                            <import-instructions :provider="selectedProvider" @selectProvider="onSelectProvider"
                                                                 @changePortfolioParams="changePortfolioParams" :portfolio-params="portfolioParams"
                                                                 class="margT20"></import-instructions>
                                        </expanded-panel>

                                        <template v-if="showResultsPanel">
                                            <div class="info-block margB24">
                                                Портфель почти сформирован, для полного соответствия, возможно, потребуются дополнительные действия
                                            </div>
                                            <import-result :import-result="importResult" :import-provider="selectedProvider"
                                                           :portfolio-params="portfolioParams" :import-provider-features="importProviderFeatures"
                                                           :has-new-events-after-import="hasNewEventsAfterImport"></import-result>
                                        </template>
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
    components: {BrokerSwitcher, CurrencyBalances, ImportInstructions, "import-result": ImportResultComponent}
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
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;
    @MainStore.Action(MutationType.RELOAD_CLIENT_INFO)
    private reloadUser: () => Promise<void>;
    /** Комбинированный портфель */
    @MainStore.Getter
    private combinedPortfolioParams: PortfolioParams;
    @MainStore.Getter
    private systemProperties: MapType;
    @Inject
    private clientService: ClientService;
    @Inject
    private importService: ImportService;
    @Inject
    private overviewService: OverviewService;
    @Inject
    private portfolioService: PortfolioService;
    @Inject
    private eventService: EventService;
    /** Текущий портфель */
    private selectedPortfolio: Portfolio = null;
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
            // если выбран обычный портфель, загружаем данные по нему, иначе пользователь должен сам выбрать портфель
            if (this.portfolio.id) {
                await this.changePortfolio(this.portfolio.id);
                if (!this.selectedProvider) {
                    this.selectUserProvider();
                }
                this.showInstruction = [this.portfolioParams.brokerId ? 0 : 1];
            }
        } finally {
            this.initialized = true;
        }
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio());
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    @Watch("portfolio")
    @ShowProgress
    private async onPortfolioChange(): Promise<void> {
        if (this.importInProgress) {
            return;
        }
        this.portfolioParams = {...this.clientInfo.user.portfolios.find(portfolio => portfolio.id === this.clientInfo.user.currentPortfolioId)};
        this.selectUserProvider();
        await this.loadImportHistory();
    }

    @ShowProgress
    private async loadImportHistory(): Promise<void> {
        this.importHistory = await this.importService.importHistory();
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

    @ShowProgress
    private async goToFinalStep(): Promise<void> {
        if (this.importProviderFeatures.confirmMoneyBalance) {
            const result = await this.$refs.currencyBalances.validateResiduals();
            if (!result) {
                this.$snotify.warning("Укажите остатки");
                return;
            }
            await this.$refs.currencyBalances.saveOrUpdateCurrentMoney();
            await this.resetPortfolioCache();
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
            await this.revertImport(this.importResult.importId);
            this.importResult = await this.importReport();
            await this.handleUploadResponse(true);
        } else {
            // надо очистить, потому что повторно не загружаем
            this.previousImportValidatedTradesCount = 0;
        }
        // если начисления импортируем из отчета, дополнительно проверяем что в Событиях ничего нового не появилось
        if (!this.importProviderFeatures.autoEvents || !this.autoEvents) {
            this.hasNewEventsAfterImport = (await this.eventService.getEvents(this.portfolioParams.id)).events.length > 0;
        }
        this.currentStep = ImportStep._3;
    }

    private async revertImport(userImportId: number): Promise<void> {
        // если был составной импорт, идентификатора ну будет
        if (!userImportId) {
            return;
        }
        await this.importService.revertImport(userImportId, this.portfolioParams.id);
        await this.loadImportHistory();
        this.overviewService.resetCacheForId(this.selectedPortfolio.id);
        this.resetCombinedOverviewCache(this.selectedPortfolio.id);
    }

    private aliasDescription(shareAlias: ShareAliasItem): string {
        return `${shareAlias.alias}${shareAlias.currency ? ", " + CurrencyUnit.valueByCode(shareAlias.currency).symbol : ""}`;
    }

    private selectUserProvider(): void {
        const userProvider = DealsImportProvider.values().find(provider => provider.id === this.portfolioParams.brokerId);
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
        const isValid = fileList.map(file => FileUtils.checkExtension(this.selectedProvider.allowedExtensions, file)).every(result => result);
        if (!isValid) {
            this.$snotify.warning(`Формат файла не соответствует разрешенным: ${this.selectedProvider.allowedExtensions}.
            Пожалуйста, обратите внимание на инструкцию по получению отчета.`);
            this.showInstruction = [1];
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
    @DisableConcurrentExecution
    private async uploadFile(): Promise<void> {
        this.validate();
        if (this.files && this.files.length && this.selectedProvider) {
            this.importInProgress = true;
            if (this.portfolioParams.brokerId && this.portfolioParams.brokerId !== this.selectedProvider.id) {
                const result = await new ConfirmDialog().show(`Внимание! Вы загружаете отчет брокера ${this.selectedProvider.description} в портфель,
                    в который ранее были загружены отчеты брокера ${this.getNameCurrentBroker}.
                    При продолжении импорта, могут возникнуть дубли существующих в вашем портфеле сделок.
                    Мы рекомендуем загружать отчеты разных брокеров в разные портфели и объединять их в составной портфель.`);
                if (result !== BtnReturn.YES) {
                    return;
                }
            }
            if (this.needUpdateAutoCommission && this.portfolioParams.fixFee !== this.portfolio.portfolioParams.fixFee) {
                await this.portfolioService.updatePortfolio(this.portfolioParams);
            }
            this.importResult = await this.importReport();
            await this.handleUploadResponse();
        }
    }

    private validate(): void {
        if (!this.selectedPortfolio) {
            throw new Error("Выберите портфель для импорта.");
        }
    }

    private get getNameCurrentBroker(): string {
        const provider = this.providers.values().find(item => item.id === this.portfolioParams.brokerId);
        return provider ? provider.description : "";
    }

    /**
     * Отправляет отчет на сервер
     */
    @ShowProgress
    private async importReport(): Promise<ImportResponse> {
        const results = await this.importService.importReport(this.selectedProvider.code, this.portfolioParams.id, this.files,
            {...this.importProviderFeatures, autoEvents: this.showImportSettings ? this.autoEvents : this.importProviderFeatures.autoEvents});
        if (results.length > 1) {
            const hasErrorStatus = results.some(result => result.status === Status.ERROR);
            const hasWarnStatus = results.some(result => result.status === Status.WARN);
            const hasNoTradesStatus = results.some(result => result.status === Status.NO_TRADES);
            // для таких случаев не будет отката импорта
            return {
                importId: null,
                validatedTradesCount: results.map(result => result.validatedTradesCount).reduce((previousValue, currentValue) => previousValue + currentValue, 0),
                generalError: hasErrorStatus ? results.find(result => result.generalError)?.generalError : null,
                message: hasErrorStatus ? results.find(result => result.generalError)?.message :
                    hasWarnStatus ? results.find(result => result.status === Status.WARN)?.message :
                        hasNoTradesStatus ? results.find(result => result.status === Status.NO_TRADES)?.message :
                            results.find(result => result.status === Status.SUCCESS)?.message,
                status: hasErrorStatus ? Status.ERROR : hasWarnStatus ? Status.WARN : hasNoTradesStatus ? Status.NO_TRADES : Status.SUCCESS,
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
            await this.resetPortfolioCache();
            this.clientService.resetClientInfo();
            await this.reloadUser();
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
        if (this.importResult.status === Status.NO_TRADES) {
            this.showInstruction = [1];
        }
        // если не повторная загрузка и требуется подтверждение балансов, переходим на второй шаг
        if (!retryUpload && this.importProviderFeatures.confirmMoneyBalance) {
            this.currentStep = ImportStep._2;
            return;
        }
        // надо очистить, потому что повторно не загружаем
        this.previousImportValidatedTradesCount = 0;
        this.currentStep = ImportStep._3;
    }

    private async goToNewImport(): Promise<void> {
        this.currentStep = ImportStep._1;
        this.clearFields();
        await this.loadImportHistory();
    }

    private async goToPortfolio(): Promise<void> {
        this.$router.push("portfolio");
    }

    private async goToImportHistory(): Promise<void> {
        this.$router.push("import-history");
    }

    private async goToTariffs(): Promise<void> {
        const routeData = this.$router.resolve({name: "tariffs"});
        window.open(routeData.href, "_blank");
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

    /**
     * Устанавливает информацию о выбранном портфеле
     * @param portfolioParams
     */
    private changePortfolioParams(portfolioParams: PortfolioParams): void {
        this.portfolioParams = {...portfolioParams};
    }

    /**
     * Устанавливает информацию о выбранном портфеле
     * @param portfolioId идентификатор портфеля
     */
    @ShowProgress
    private async changePortfolio(portfolioId: number): Promise<void> {
        this.selectedPortfolio = await this.overviewService.getById(portfolioId);
        this.portfolioParams = {...this.selectedPortfolio.portfolioParams};
        await this.loadImportHistory();
        if (this.portfolioParams.brokerId) {
            const provider = DealsImportProvider.valueById(this.portfolioParams.brokerId);
            if (provider) {
                this.onSelectProvider(provider);
            }
        }
    }

    private resetCombinedOverviewCache(portfolioId: number): void {
        PortfolioUtils.resetCombinedOverviewCache(this.combinedPortfolioParams, portfolioId, this.overviewService);
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
            if (this.importResult.status === Status.NO_TRADES || this.importResult.validatedTradesCount === 0) {
                return Status.NO_TRADES;
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
            this.isQuik || this.importProviderFeatures.confirmMoneyBalance || this.needUpdateAutoCommission || this.requireMoreReports || this.otherErrors.length > 0 ||
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

    private get needUpdateAutoCommission(): boolean {
        return [DealsImportProvider.FINAM, DealsImportProvider.BCS].includes(this.selectedProvider);
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

    /**
     * Возвращает список портфелей доступных для переключения
     */
    private get availablePortfolios(): PortfolioParams[] {
        return this.clientInfo.user.portfolios.filter(portfolio => !portfolio.combinedFlag);
    }

    private get tariffLimitExceeded(): boolean {
        return TariffUtils.limitsExceeded(this.clientInfo.user, this.systemProperties);
    }

    private get newTariffsApplicable(): boolean {
        return DateUtils.parseDate(this.clientInfo.user.regDate).isAfter(DateUtils.parseDate(this.systemProperties[SystemPropertyName.NEW_TARIFFS_DATE_FROM]));
    }

    get maxSharesCount(): string {
        if (this.newTariffsApplicable) {
            return this.clientInfo.user.tariff.maxSharesCountNew === 0x7fffffff ? "Без ограничений" : String(this.clientInfo.user.tariff.maxSharesCountNew);
        }
        return this.clientInfo.user.tariff.maxSharesCount === 0x7fffffff ? "Без ограничений" : String(this.clientInfo.user.tariff.maxSharesCount);
    }

    /**
     * Сбрасывает кэш портфеля
     */
    private async resetPortfolioCache(): Promise<void> {
        this.overviewService.resetCacheForId(this.selectedPortfolio.id);
        this.resetCombinedOverviewCache(this.selectedPortfolio.id);
        if (this.selectedPortfolio.id === this.clientInfo.user.currentPortfolioId) {
            await this.reloadPortfolio();
        }
    }
}

enum ImportStep {
    _1 = "1",
    _2 = "2",
    _3 = "3"
}
