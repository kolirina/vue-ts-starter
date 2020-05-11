import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../../app/ui";
import {CurrencyBalances} from "../../components/currencyBalances";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {FeedbackDialog} from "../../components/dialogs/feedbackDialog";
import {ExpandedPanel} from "../../components/expandedPanel";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo} from "../../services/clientService";
import {
    DealsImportProvider,
    ImportProviderFeatures,
    ImportProviderFeaturesByProvider,
    ImportResponse,
    ImportService,
    ShareAliasItem,
    UserImport,
    UserLogStatus
} from "../../services/importService";
import {OverviewService} from "../../services/overviewService";
import {PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {CurrencyUnit} from "../../types/currency";
import {Portfolio, Share, Status, TableHeader} from "../../types/types";
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
            <!-- Выбор брокера -->
            <v-card v-if="!selectedProvider" flat class="import-wrapper paddB24">
                <div class="info-block margB24">
                    Данный раздел поможет Вам перенести отчеты брокера на сервис.<br>
                    Обратите внимание, что для полного соответствия портфеля необходимо выгрузить сделки за все время, а не только за последний месяц.
                </div>
                <v-card-title class="import-wrapper-header">
                    <div class="import-wrapper-header__title">
                        Выберите своего брокера
                        <v-tooltip content-class="custom-tooltip-wrap" max-width="563px" bottom>
                            <sup class="custom-tooltip" slot="activator">
                                <v-icon>fas fa-info-circle</v-icon>
                            </sup>
                            <span>
                                Если в списке нет вашего брокера или терминала, вы всегда можете осуществить импорт через универсальный Формат Intelinvest (CSV)
                                или обратиться к нам через <a @click.stop="openFeedBackDialog">обратную связь</a> , <a href="mailto:web@intelinvest.ru">по почте</a> или в группе <a href="https://vk.com/intelinvest">вконтакте</a>.
                            </span>
                        </v-tooltip>
                    </div>
                </v-card-title>
            </v-card>
            <v-card v-if="!selectedProvider" flat class="px-0 py-0" data-v-step="0">
                <div class="providers">
                    <div v-for="provider in providers.values()" :key="provider.code" @click="onSelectProvider(provider)"
                         :class="{'item': true, 'active': selectedProvider === provider}">
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
                        <div>
                            <!-- Иконка брокера и меню Изменить брокера -->
                            <div class="provider">
                                <div :class="['provider__image', selectedProvider.code.toLowerCase()]"></div>
                                <div class="provider__name">
                                    {{ selectedProvider.description }}
                                    <div v-if="portfolio.overview.totalTradesCount">Дата последней сделки: {{ portfolio.overview.lastTradeDate | date }}</div>
                                </div>
                            </div>
                        </div>
                        <v-btn>Изменить брокера</v-btn>
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
                                <div v-if="providerAllowedExtensions" class="attachments__allowed-extensions" >Допустимые расширения файлов: <span>{{ providerAllowedExtensions }}</span></div>
                                <expanded-panel class="import-history">
                                    <template v-if="importHistory.length" #header>История импорта</template>
                                    <div v-for="userImport in importHistory" :key="userImport.id" class="import-history-block">
                                        <div :class="[{'import-history-block__header': true, 'withoutBorder': userImport.status === 'SUCCESS'}]">
                                            <!-- TODO: нужно ли имя? в дизайне его нет -->
                                            <!-- <span>{{ userImport.fileName }}</span>-->
                                            <span class="import-history-block__date">{{ userImport.date }}</span>
                                            <span v-if="userImport.savedTradesCount" class="import-history-block__description">
                                                {{ userImport.savedTradesCount | declension("Добавлена", "Добавлено", "Добавлено") }}
                                                {{ userImport.savedTradesCount }} {{ userImport.savedTradesCount | declension("сделка", "сделки", "сделок") }}
                                            </span>
                                            <span :class="['import-history-block__status', userImport.status.toLowerCase()]">
                                                {{ userImport.status === Status.ERROR ? 'Ошибка' : userImport.status === Status.WARN ? 'С замечаниями' : 'Успешно' }}
                                            </span>
                                            <span v-if="userImport.state !== 'REVERTED'" @click.stop="revertImport(userImport.id)" class="import-history-block__delete"></span>
                                            <!-- TODO: нужно ли это? в дизайне его нет -->
                                            <span v-if="userImport.state === 'REVERTED'">REVERTED</span>
                                        </div>
                                        <div class="import-history-block__body">
                                            <div v-if="userImport.generalError">{{ userImport.generalError }}</div>
                                            <expanded-panel v-if="userImport.data && userImport.data.length" name="userImportData" :value="[true]" class="selectable" disabled
                                                            always-open>
                                                <template #header>
                                                    <span>Ошибки импорта</span>
                                                </template>
                                                <v-data-table :headers="headers" :items="userImport.data" class="data-table" hide-actions must-sort>
                                                    <template #items="props">
                                                        <tr class="selectable">
                                                            <td class="text-xs-center"><span v-if="props.item.dealDate">{{ props.item.dealDate | date }}</span></td>
                                                            <td class="text-xs-left">{{ props.item.dealTicker }}</td>
                                                            <td class="text-xs-left error-message">{{ props.item.message }}</td>
                                                        </tr>
                                                    </template>
                                                </v-data-table>
                                            </expanded-panel>
                                        </div>
                                    </div>
                                </expanded-panel>

                                <div class="attachments" v-if="!files.length && importProviderFeatures">
                                    <file-drop-area @drop="onFileAdd" class="attachments-file-drop">
                                        <div v-if="selectedProvider" class="attachments-file-drop__content">
                                            <div class="attachments__title">Загрузить отчет</div>
                                            <div>
                                                Перетащить сюда или
                                                <file-link @select="onFileAdd" :accept="allowedExtensions" class="select-file-btn">
                                                    выбрать
                                                </file-link>
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
                                            <v-btn color="primary" class="btn" @click.stop="uploadFile">Загрузить</v-btn>
                                            <file-link @select="onFileAdd" :accept="allowedExtensions" class="reselect-file-btn margL12">
                                                Выбрать другой файл
                                            </file-link>
                                        </v-layout>
                                    </div>
                                    <div>
                                        <v-menu content-class="dialog-setings-menu"
                                                transition="slide-y-transition"
                                                nudge-bottom="36" right class="setings-menu margT0"
                                                v-if="importProviderFeatures" min-width="514" :close-on-content-click="false">
                                            <v-btn class="btn" slot="activator">
                                                Настройки
                                            </v-btn>
                                            <v-list dense>
                                                <div class="title-setings">
                                                    Расширенные настройки импорта
                                                </div>
                                                <v-flex>
                                                    <v-checkbox v-model="importProviderFeatures.createLinkedTrade" hide-details class="checkbox-setings">
                                                        <template #label>
                                                    <span>Добавлять сделки по списанию/зачислению денежных средств
                                                        <v-menu content-class="zi-102" transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12">
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
                                                    <v-checkbox v-model="importProviderFeatures.autoCommission" hide-details class="checkbox-setings">
                                                        <template #label>
                                                    <span>
                                                        Автоматически рассчитывать комиссию для сделок
                                                        <v-menu content-class="zi-102" transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12"
                                                                max-width="520">
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
                                                    <v-checkbox v-model="importProviderFeatures.autoEvents" hide-details class="checkbox-setings">
                                                        <template #label>
                                                    <span>
                                                        Автоматически исполнять события по бумагам
                                                        <v-menu content-class="zi-102" transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12"
                                                                max-width="520">
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
                                                    <v-checkbox v-model="importProviderFeatures.confirmMoneyBalance" hide-details class="checkbox-setings">
                                                        <template #label>
                                                    <span>
                                                        Спрашивать текущий остаток ДС
                                                        <v-menu content-class="zi-102" transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12"
                                                                max-width="520">
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
                                                    <v-checkbox v-model="importProviderFeatures.importMoneyTrades" hide-details class="checkbox-setings">
                                                        <template #label>
                                                    <span>
                                                        Импорт сделок по денежным средствам
                                                        <v-menu content-class="zi-102" transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12"
                                                                max-width="520">
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
                                    </div>
                                </div>

                                <v-divider class="margT32 margB24"></v-divider>

                                <expanded-panel :value="showInstruction" class="promo-codes__statistics">
                                    <template #header>Как выгрузить отчет брокера?</template>
                                    <import-instructions :provider="selectedProvider" @selectProvider="onSelectProvider"
                                                         @changePortfolioParams="changePortfolioParams" :portfolio-params="portfolioParams" class="margT20"></import-instructions>
                                </expanded-panel>

                            </v-stepper-content>

                            <v-stepper-content step="2">
                                <v-card class="dialog-wrap import-dialog-wrapper">
                                    <currency-balances v-if="importProviderFeatures.confirmMoneyBalance || true" :portfolio-id="portfolio.id"
                                                       class="currency-balances"></currency-balances>
                                    <v-divider></v-divider>
                                    <v-layout column justify-space-between class="min-height-wrapper">
                                        <v-card-text v-if="shareAliases.length" class="selectable">
                                            <div v-for="aliasItem in shareAliases" :key="aliasItem.alias">
                                                <v-layout align-center justify-start wrap row fill-height class="mt-2 mb-2">
                                                    <!-- Алиас бумаги -->
                                                    <v-flex xs12 sm4>
                                                        <span class="fs12" :title="aliasItem.alias">{{ aliasDescription(aliasItem) }}</span>
                                                    </v-flex>

                                                    <!-- Выбранная бумага -->
                                                    <v-flex xs12 sm8>
                                                        <share-search @change="onShareSelect($event, aliasItem)" @clear="onShareClear(aliasItem)"
                                                                      @requestNewShare="onRequestNewShare"
                                                                      autofocus ellipsis allow-request></share-search>
                                                    </v-flex>
                                                </v-layout>
                                            </div>
                                        </v-card-text>
                                    </v-layout>

                                    <v-btn color="primary" class="big_btn" @click.native="goToFinalStep">Далее</v-btn>
                                </v-card>
                            </v-stepper-content>

                            <v-stepper-content step="3">
                                <div v-if="importResult" class="import-result-status">
                                    <div :class="['import-result-status__img',
                                        importResult.status === Status.ERROR ? 'status-error' :
                                        importResult.status === Status.SUCCESS ? 'status-success' : 'status-warn']"></div>
                                    <div class="import-result-status__content">
                                        <div :class="{'status-error': importResult.status === Status.ERROR}">
                                            {{ importResult.status === Status.ERROR ? "Ошибка" : importResult.status === Status.SUCCESS ? "Успех" : "Почти Успех" }}
                                        </div>
                                        <span>
                                            {{ importResult.validatedTradesCount | declension("Добавлена", "Добавлено", "Добавлено") }}
                                            {{ importResult.validatedTradesCount }} {{ importResult.validatedTradesCount | declension("сделка", "сделки", "сделок") }}
                                        </span>
                                    </div>
                                </div>
                                <div class="info-block">Портфель почти сформирован, для полного соответствия требуются дополнительные данные</div>
                                <div class="import-result-info">
                                    <expanded-panel name="dividends" :value="[true]" class="selectable import-history">
                                        <template #header>
                                            <span>Отчет не содержит информацию по дивидендам</span>
                                            <v-tooltip content-class="custom-tooltip-wrap" max-width="563px" bottom>
                                                <sup class="custom-tooltip" slot="activator">
                                                    <v-icon>fas fa-info-circle</v-icon>
                                                </sup>
                                                <!-- TODO проверить текст подсказки-->
                                                <span>
                                                   Текст подсказки
                                                </span>
                                            </v-tooltip>
                                        </template>
                                        <span>content</span>
                                    </expanded-panel>

                                    <expanded-panel name="tickers" :value="[true]" class="selectable import-history">
                                        <template #header>
                                            <span>Не распознаны тикеры средующий бумаг</span>
                                            <v-tooltip content-class="custom-tooltip-wrap" max-width="563px" bottom>
                                                <sup class="custom-tooltip" slot="activator">
                                                    <v-icon>fas fa-info-circle</v-icon>
                                                </sup>
                                                <!-- TODO проверить текст подсказки-->
                                                <span>
                                                    Брокер использует нестандартные названия для ценных бумаг в своих отчетах или не указывает уникальный идентификатор
                                                    бумаги, по которому ее можно распознать.<br><br>

                                                    Чтобы импортировать ваш портфель полностью соотнесите название бумаги из отчета с названием бумаги на сервисе.
                                                    Например: « ПАО Газпром-ао » → GAZP
                                                </span>
                                            </v-tooltip>
                                        </template>
                                        <span>content</span>
                                    </expanded-panel>

                                    <expanded-panel name="residuals" :value="[true]" class="selectable import-history">
                                        <template #header>
                                            <span>Остаток денежных средств может отличаться от брокера</span>
                                            <v-tooltip content-class="custom-tooltip-wrap" max-width="563px" bottom>
                                                <sup class="custom-tooltip" slot="activator">
                                                    <v-icon>fas fa-info-circle</v-icon>
                                                </sup>
                                                <!-- TODO проверить текст подсказки-->
                                                <span>
                                                    В отчете брокера не указаны остатки денежных средств на данный момент.
                                                    Чтобы исключить несоответствие портфеля, пожалуйста укажите текущие остатки денежных средств в полях ввода
                                                </span>
                                            </v-tooltip>
                                        </template>
                                        <span>content</span>
                                    </expanded-panel>
                                </div>
                                <!-- TODO: добавить действия -->
                                <v-btn color="primary" class="margR12">Перейти в портфель</v-btn>
                                <v-btn>Новый импорт</v-btn>
                            </v-stepper-content>
                        </v-stepper-items>
                    </v-stepper>
                </v-card-text>
            </v-card>
        </v-container>
    `,
    components: {CurrencyBalances, ImportInstructions, ExpandedPanel}
})
export class ImportPage extends UI {

    /** Текст ошибки о дублировании сделки */
    private static readonly DUPLICATE_MSG = "Сделка уже была импортирована ранее";
    /** Ошибка о репо */
    private static readonly REPO_TRADE_MSG = "Импорт сделки РЕПО не производится.";
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
    private portfolioParams: PortfolioParams = null;
    /** Признак процесса импорта, чтобы не очищались файлы */
    private importInProgress = false;
    /** Текущий шаг */
    private currentStep = "1";

    private shareAliases: ShareAliasItem[] = [];

    private importHistory: UserImport[] = [];

    private importResult: ImportResponse = null;

    /** Заголовки таблицы с ошибками */
    private headers: TableHeader[] = [
        {text: "Дата", align: "center", value: "dealDate", sortable: false},
        {text: "Тикер", align: "left", value: "dealTicker", sortable: false},
        {text: "Ошибка", align: "center", value: "message", sortable: false}
    ];

    /** Статусы */
    private Status = Status;

    /**
     * Инициализирует необходимые для работы данные
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        this.importProviderFeaturesByProvider = await this.importService.getImportProviderFeatures();
        // this.importHistory = await this.importService.importHistory();
        await this.loadImportHistory();
        this.portfolioParams = {...this.portfolio.portfolioParams};
        this.selectUserProvider();
    }

    private async revertImport(userImportId: number): Promise<void> {
        const result = await new ConfirmDialog().show("Вы собираетесь откатить импорт, это приведет к удалению информации о нем из портфеля");
        if (result === BtnReturn.YES) {
            await this.revertImportConfirmed(userImportId);
            await this.loadImportHistory();
        }
    }

    @ShowProgress
    private async loadImportHistory(): Promise<void> {
        // this.importHistory = await this.importService.importHistory();
        this.importHistory = [{
            id: 1519,
            userId: 28,
            date: "2020-05-09",
            status: "ERROR" as UserLogStatus,
            provider: DealsImportProvider.SBERBANK,
            savedTradesCount: 0,
            hasErrors: true,
            data: [],
            generalError: "Ошибка при импорте файла",
            fileName: "broker_rep (3).xlsx",
            state: null
        }, {
            id: 1520,
            userId: 28,
            date: "2020-05-09",
            status: "SUCCESS" as UserLogStatus,
            provider: DealsImportProvider.TINKOFF,
            savedTradesCount: 2,
            hasErrors: false,
            data: [],
            generalError: null,
            fileName: "broker_rep (3).xlsx",
            state: null
        }, {
            id: 1521,
            userId: 28,
            date: "2020-05-09",
            status: "WARN" as UserLogStatus,
            provider: DealsImportProvider.TINKOFF,
            savedTradesCount: 10,
            hasErrors: true,
            data: [{
                message: "Неверный идентификатор бумаги",
                dealDate: null,
                dealTicker: "FFFF",
                currency: null,
                shareNotFound: true
            }, {message: "Сделка уже была импортирована ранее", dealDate: "2020-01-21", dealTicker: null, currency: null, shareNotFound: false}],
            generalError: null,
            fileName: "broker_rep (3).xlsx",
            state: null
        }];
    }

    @ShowProgress
    private async revertImportConfirmed(userImportId: number): Promise<void> {
        await this.importService.revertImport(userImportId, this.portfolio.id);
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
        const filled = this.shareAliases.filter(shareAlias => !!shareAlias.share);
        const allFilled = filled.length === this.shareAliases.length;
        if (!allFilled) {
            const answer = await new ConfirmDialog().show("Вы не указали соответствия для всех нераспознанных бумаг." +
                "Если продолжить, будут импортированы только сделки по тем бумагам, которые вы указали.");
            if (answer !== BtnReturn.YES) {
                return;
            }
        }
        await this.importService.saveShareAliases(filled);
        this.currentStep = "3";
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
     */
    private onFileAdd(fileList: File[]): void {
        let filtered = fileList;
        if (fileList.length > 1) {
            this.$snotify.warning("Пожалуйста, загружайте по одному файлу для более точных результатов импорта.");
            filtered = [fileList[0]];
        }
        const isValid = FileUtils.checkExtension(filtered[0]);
        if (!isValid) {
            this.$snotify.warning(`Формат файла не соответствует разрешенным: ${FileUtils.ALLOWED_EXTENSION}.`);
            return;
        }
        if (filtered.map(file => file.size).reduce((previousValue: number, currentValue: number): number => previousValue + currentValue, 0) > this.MAX_SIZE) {
            this.$snotify.warning(`Максимальный размер загружаемого файла 10 Мб.`);
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
            // this.importResult = await this.importReport();
            this.importResult = this.importResult = {
                message: "Импорт завершен",
                errors: [{
                    message: "Сделка уже была импортирована ранее",
                    dealDate: "2020-01-17",
                    dealTicker: "FXGD",
                    currency: null,
                    shareNotFound: false
                }, {message: "Сделка уже была импортирована ранее", dealDate: "2020-01-21", dealTicker: null, currency: null, shareNotFound: false}],
                generalError: null,
                validatedTradesCount: 10,
                status: "WARN" as Status
            };
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
        return this.importService.importReport(this.selectedProvider.code, this.portfolio.id, this.files, this.importProviderFeatures);
    }

    /**
     * Обрабатывает ответ от сервера после импорта отчета
     * @param response
     */
    private async handleUploadResponse(): Promise<void> {
        if (this.importResult.status === Status.ERROR && CommonUtils.isBlank(this.importResult.generalError)) {
            this.$snotify.error(this.importResult.message);
            return;
        }
        if (this.importResult.generalError) {
            this.currentStep = "3";
            return;
        }
        let duplicateTradeErrorCount = 0;
        if (this.importResult.errors && this.importResult.errors.length) {
            const duplicateTradeErrors = this.importResult.errors.filter(error => error.message === ImportPage.DUPLICATE_MSG);
            const repoTradeErrors = this.importResult.errors.filter(error => error.message === ImportPage.REPO_TRADE_MSG);
            const errors = this.importResult.errors.filter(error => !duplicateTradeErrors.includes(error) && !repoTradeErrors.includes(error));
            duplicateTradeErrorCount = duplicateTradeErrors.length;
            // если после удаления ошибки все еще остались, отображаем диалог
            // отображаем диалог с ошибками, но информацию по портфелю надо перезагрузить если были успешно импортированы сделки
            if (errors.length) {
                this.shareAliases = errors.filter(error => error.shareNotFound).map(error => {
                    return {
                        alias: error.dealTicker,
                        currency: error.currency,
                        share: null
                    } as ShareAliasItem;
                });
                this.currentStep = "2";
                return;
            }
        }
        if (this.importResult.validatedTradesCount) {
            await this.reloadPortfolio(this.portfolio.id);
        }
        this.currentStep = "3";
    }

    /**
     * Показать инструкцию после нажатия на кнопку "CSV"
     */
    private showIntelinvestInstruction(): void {
        this.onSelectProvider(this.providers.INTELINVEST);
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
        this.clearFiles();
    }

    private clearFiles(): void {
        this.files = [];
        this.importInProgress = false;
    }

    private get isFinam(): boolean {
        return this.selectedProvider === DealsImportProvider.FINAM;
    }

    private get providerAllowedExtensions(): string {
        if (this.selectedProvider?.allowedExtensions) {
            return this.selectedProvider?.allowedExtensions.join(", ");
        }
        return "";
    }

    private changePortfolioParams(portfolioParams: PortfolioParams): void {
        this.portfolioParams = portfolioParams;
    }
}
