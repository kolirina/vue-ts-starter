import dayjs from "dayjs";
import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../../app/ui";
import {BrokerSwitcher} from "../../components/brokerSwitcher";
import {CurrencyBalances} from "../../components/currencyBalances";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {FeedbackDialog} from "../../components/dialogs/feedbackDialog";
import {ExpandedPanel} from "../../components/expandedPanel";
import {ImportErrorsTable} from "../../components/imp/importErrorsTable";
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
                                или обратиться к нам через <a @click.stop="openFeedBackDialog">обратную связь</a> , <a href="mailto:web@intelinvest.ru">по почте</a> или в группе <a
                                    href="https://vk.com/intelinvest">вконтакте</a>.
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
                        <broker-switcher @selectProvider="onSelectProvider($event)"></broker-switcher>
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
                                <div v-if="providerAllowedExtensions" :class="{'attachments__allowed-extensions': true, 'withoutImportHistory': !importHistory.length}">
                                    Допустимые расширения файлов: <span>{{ providerAllowedExtensions }}</span>
                                </div>
                                <expanded-panel v-if="importHistory.length" class="import-history">
                                    <template #header>История импорта</template>
                                    <div v-for="userImport in importHistory" :key="userImport.id" class="import-history-block">
                                        <div :class="[{'import-history-block__header': true, 'withoutBorder': userImport.status === 'SUCCESS'}]">
                                            <span class="import-history-block__name">{{ userImport.fileName }}</span>
                                            <span class="import-history-block__date">{{ userImport.date }}</span>
                                            <span v-if="userImport.savedTradesCount" class="import-history-block__description">
                                                {{ userImport.savedTradesCount | declension("Добавлена", "Добавлено", "Добавлено") }}
                                                {{ userImport.savedTradesCount }} {{ userImport.savedTradesCount | declension("сделка", "сделки", "сделок") }}
                                            </span>
                                            <span :class="['import-history-block__status', userImport.status.toLowerCase()]">
                                                {{ userImport.status === Status.ERROR ? 'Ошибка' : userImport.status === Status.WARN ? 'С замечаниями' : 'Успешно' }}
                                            </span>
                                            <span v-if="userImport.state !== 'REVERTED'" @click.stop="revertImport(userImport.id)" class="import-history-block__delete"></span>
                                        </div>
                                        <div class="import-history-block__body">
                                            <div v-if="userImport.generalError">{{ userImport.generalError }}</div>
                                            <expanded-panel v-if="userImport.data && userImport.data.length" class="selectable">
                                                <template #header>Ошибки импорта</template>
                                                <import-errors-table :error-items="userImport.data"></import-errors-table>
                                            </expanded-panel>
                                        </div>
                                    </div>
                                </expanded-panel>

                                <div v-if="!files.length && importProviderFeatures" class="attachments" >
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
                                <div v-if="files.length !== 2 && importProviderFeatures && isSberbank" class="attachments" >
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
                                        <v-menu v-if="importProviderFeatures && showImportSettings" content-class="dialog-settings-menu"
                                                transition="slide-y-transition"
                                                nudge-bottom="36" right class="settings-menu"
                                                min-width="514" :close-on-content-click="false">
                                            <v-btn class="btn" slot="activator">
                                                Настройки
                                            </v-btn>
                                            <v-list dense>
                                                <div class="title-settings">
                                                    Расширенные настройки импорта
                                                </div>
                                                <v-flex>
                                                    <v-checkbox v-model="importProviderFeatures.createLinkedTrade" hide-details class="checkbox-settings">
                                                        <template #label>
                                                        <span>Добавлять сделки по списанию/зачислению денежных средств
                                                            <v-menu content-class="zi-102" transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12">
                                                                <sup class="custom-tooltip" slot="activator">
                                                                    <v-icon>fas fa-info-circle</v-icon>
                                                                </sup>
                                                                <v-list dense>
                                                                    <div class="hint-text-for-settings">
                                                                        Если включено, будут добавлены связанные сделки по зачислению/списанию денежных средств
                                                                    </div>
                                                                </v-list>
                                                            </v-menu>
                                                        </span>
                                                        </template>
                                                    </v-checkbox>
                                                    <v-checkbox v-model="importProviderFeatures.autoCommission" hide-details class="checkbox-settings">
                                                        <template #label>
                                                        <span>
                                                            Автоматически рассчитывать комиссию для сделок
                                                            <v-menu content-class="zi-102" transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12"
                                                                    max-width="520">
                                                                <sup class="custom-tooltip" slot="activator">
                                                                    <v-icon>fas fa-info-circle</v-icon>
                                                                </sup>
                                                                <v-list dense>
                                                                    <div class="hint-text-for-settings">
                                                                        Если включено, комиссия для каждой сделки по ценной бумаге будет рассчитана в соответствии
                                                                        со значением фиксированной комиссии, заданной для портфеля. Если комиссия для бумаги есть в отчете
                                                                        она не будет перезаписана.
                                                                    </div>
                                                                </v-list>
                                                            </v-menu>
                                                        </span>
                                                        </template>
                                                    </v-checkbox>
                                                    <v-checkbox v-model="importProviderFeatures.autoEvents" hide-details class="checkbox-settings">
                                                        <template #label>
                                                        <span>
                                                            Автоматически исполнять события по бумагам
                                                            <v-menu content-class="zi-102" transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12"
                                                                    max-width="520">
                                                                <sup class="custom-tooltip" slot="activator">
                                                                    <v-icon>fas fa-info-circle</v-icon>
                                                                </sup>
                                                                <v-list dense>
                                                                    <div class="hint-text-for-settings">
                                                                        Если включено, события (дивиденды, купоны, амортизация, погашение) по сделкам,
                                                                        полученным из отчета (на даты первой и последней сделки),
                                                                        будут автоматически исполнены после импорта.
                                                                    </div>
                                                                </v-list>
                                                            </v-menu>
                                                        </span>
                                                        </template>
                                                    </v-checkbox>
                                                    <v-checkbox v-model="importProviderFeatures.confirmMoneyBalance" hide-details class="checkbox-settings">
                                                        <template #label>
                                                        <span>
                                                            Спрашивать текущий остаток ДС
                                                            <v-menu content-class="zi-102" transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12"
                                                                    max-width="520">
                                                                <sup class="custom-tooltip" slot="activator">
                                                                    <v-icon>fas fa-info-circle</v-icon>
                                                                </sup>
                                                                <v-list dense>
                                                                    <div class="hint-text-for-settings">
                                                                        Если включено, то после успешного импорта будет предложено ввести текущий остаток денежных
                                                                        средств на счете. Отключите, если Вы хотите сами задать вводы и выводы денег.
                                                                    </div>
                                                                </v-list>
                                                            </v-menu>
                                                        </span>
                                                        </template>
                                                    </v-checkbox>
                                                    <v-checkbox v-model="importProviderFeatures.importMoneyTrades" hide-details class="checkbox-settings">
                                                        <template #label>
                                                        <span>
                                                            Импорт сделок по денежным средствам
                                                            <v-menu content-class="zi-102" transition="slide-y-transition" left top :open-on-hover="true" nudge-top="12"
                                                                    max-width="520">
                                                                <sup class="custom-tooltip" slot="activator">
                                                                    <v-icon>fas fa-info-circle</v-icon>
                                                                </sup>
                                                                <v-list dense>
                                                                    <div class="hint-text-for-settings">
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
                                    <template v-if="importProviderFeatures.confirmMoneyBalance">
                                        <span class="fs14">Остатки денежных средств</span>
                                        <tooltip>
                                            Остаток денежных средств может отличаться от брокера<br/>
                                            В отчете брокера не указаны остатки денежных средств на данный момент.
                                            Чтобы исключить несоответствие портфеля, пожалуйста укажите текущие остатки денежных средств в полях ввода
                                        </tooltip>
                                        <currency-balances :portfolio-id="portfolio.id" class="currency-balances"></currency-balances>

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
                                        <span>
                                            {{ savedTradesCount | declension("Добавлена", "Добавлено", "Добавлено") }}
                                            {{ savedTradesCount }} {{ savedTradesCount | declension("сделка", "сделки", "сделок") }}
                                        </span>
                                    </div>
                                </div>
                                <div v-if="showResultsPanel" class="info-block">Портфель почти сформирован, для полного соответствия требуются дополнительные данные</div>
                                <!-- todo import вынести в компонент -->
                                <div v-if="showResultsPanel" class="import-result-info">
                                    <!-- Блок отображается если из отчета не импортируются начисления или если импортируются, и есть новые события -->
                                    <expanded-panel v-if="hasNewEventsAfterImport || importProviderFeatures.autoEvents" name="dividends" :value="[true]"
                                                    class="selectable import-history">
                                        <template #header>
                                            <span>Отчет {{ importProviderFeatures.autoEvents ? "не" : "" }} содержит информацию по дивидендам, купонам, амортизации</span>
                                            <tooltip v-if="importProviderFeatures.autoEvents">
                                                В отчетах не содержится информации по выплаченным дивидендам, купонам или амортизации, поэтому мы добавили недостающие начисления
                                                из истории на основе ваших данных.
                                            </tooltip>
                                            <tooltip v-if="!importProviderFeatures.autoEvents">
                                                В отчетах содержится информация по выплаченным дивидендам, купонам или амортизации.
                                            </tooltip>
                                        </template>
                                        <span>
                                            <template v-if="importProviderFeatures.autoEvents">
                                                Отчет вашего брокера не содержит информацию о бумагах, по которым происходят выплаты. <br/>
                                                К счастью, мы постарались восстановить эти сделки на основе общедоступной информации. <br/>
                                                Однако, эта информация не всегда достоверна - возможны небольшие расхождения по суммам, <br/>
                                                о некоторых выплатах мы можем не знать. <br/>
                                            </template>
                                            <template v-if="importProviderFeatures.autoEvents || hasNewEventsAfterImport">
                                                Проверьте дополнительно раздел <router-link :to="{'name': 'events'}">События</router-link>, <br/>
                                                в нем будут отображены события по бумагам, которые еще не учтены.
                                            </template>
                                        </span>
                                    </expanded-panel>

                                    <expanded-panel v-if="notFoundShareErrors.length" name="tickers" :value="[true]" class="selectable import-history">
                                        <template #header>
                                            <span>Не распознаны тикеры следующих бумаг</span>
                                            <tooltip>
                                                Брокер использует нестандартные названия для ценных бумаг в своих отчетах или не указывает уникальный идентификатор
                                                бумаги, по которому ее можно распознать.<br><br>

                                                Чтобы импортировать ваш портфель полностью соотнесите название бумаги из отчета с названием бумаги на сервисе.
                                                Например: «ПАО Газпром-ао» → GAZP
                                            </tooltip>
                                        </template>
                                        <import-errors-table :error-items="notFoundShareErrors"></import-errors-table>
                                    </expanded-panel>

                                    <expanded-panel v-if="isQuik || importProviderFeatures.confirmMoneyBalance" name="residuals" :value="[true]" class="selectable import-history">
                                        <template #header>
                                            <span>Остаток денежных средств может отличаться от брокера</span>
                                            <tooltip>
                                                В отчете брокера не указаны остатки денежных средств на данный момент.
                                            </tooltip>
                                        </template>
                                        <template v-if="importProviderFeatures.confirmMoneyBalance">
                                            В отчете брокера не указаны остатки денежных средств на данный момент.<br/>
                                            Если Вы указали остатки на предыдущем шаге, система внесла корректирующую сделку.<br/>
                                            Вы можете занести сделки пополения счета вручную, чтобы получить более точные результаты.
                                        </template>
                                        <template v-if="isQuik">
                                            В отчете не содержится движения по списаниям и зачислениям денежных средств.<br/>
                                            Если Вы указали остатки на предыдущем шаге, система внесла корректирую сделку. <br/>
                                            Вы можете занести сделки пополения счета вручную, чтобы получить более точные результаты.
                                        </template>
                                    </expanded-panel>

                                    <expanded-panel v-if="isFinam" name="residuals" :value="[true]" class="selectable import-history">
                                        <template #header>
                                            <span>Сверьте расходы по комиссиям брокера</span>
                                        </template>
                                        Отчет вашего брокера не содержит информацию об удерживаемых комиссиях по сделкам. <br/>
                                        <template v-if="finamHasFixFee">
                                            Вы указали в настройках Портфеля размер фиксированной комиссии, и мы расчитали ее автоматически.<br/>
                                        </template>
                                        <template v-else>
                                            Вы можете указать в настройках Портфеля размер фиксированной комиссии, и мы расчитаем ее автоматически при следующем импорте.<br/>
                                        </template>
                                        Вы можете сверить результат и добавить корректирующию сделку типа Расход, если будет необходимо.
                                    </expanded-panel>

                                    <expanded-panel v-if="requireMoreReports" name="tickers" :value="[true]" class="selectable import-history">
                                        <template #header>
                                            <span>Не хватает сделок для формирования портфеля</span>
                                        </template>
                                        Для формирования портфеля загрузите отчет(отчеты) за все время ведения счета.
                                    </expanded-panel>

                                    <expanded-panel v-if="otherErrors.length" name="tickers" :value="[true]" class="selectable import-history">
                                        <template #header>
                                            <span>При импорте отчета возникли следующие ошибки</span>
                                            <tooltip>
                                                Возможно, изменился формат импорта или в отчете не содержится информации по сделкам.
                                            </tooltip>
                                        </template>
                                        <import-errors-table :error-items="otherErrors"></import-errors-table>
                                    </expanded-panel>

                                    <expanded-panel v-if="repoTradeErrors.length" name="tickers" :value="[true]" class="selectable import-history">
                                        <template #header>
                                            <span>РЕПО сделки не были добавлены</span>
                                            <tooltip>
                                                <span class="amount-deals">{{ repoTradeErrors.length }}</span>
                                                {{ repoTradeErrors.length | declension("сделка", "сделки", "сделок") }}
                                                из отчета имеют тип РЕПО и не были загружены, (если вы производили их самостоятельно, добавьте их вручную).
                                            </tooltip>
                                        </template>
                                        <span>
                                            РЕПО сделки могут быть совершены вашим брокером, если вы давали согласие на займы своих бумаг.
                                            Брокер может занимать и отдавать бумаги в течение дня, при этом в отчете такие сделки
                                            будут отображаться, например, как РЕПО часть 1 и РЕПО часть 2, и по своей сути,
                                            такие операции не должны влиять на расчет доходности вашего портфеля и попадать в список сделок,
                                            потому что вы их не совершали.<br/><br/>
                                            Если сделки РЕПО совершали вы самостоятельно, и хотите их учесть,
                                            рекомендуем внести их через диалог добавления сделки.
                                        </span>
                                    </expanded-panel>
                                </div>
                                <v-btn @click="goToPortfolio" color="primary" class="margR12">Перейти в портфель</v-btn>
                                <v-btn @click="goToNewImport">Новый импорт</v-btn>
                            </v-stepper-content>
                        </v-stepper-items>
                    </v-stepper>
                </v-card-text>
            </v-card>
        </v-container>
    `,
    components: {BrokerSwitcher, CurrencyBalances, ImportErrorsTable, ImportInstructions, ExpandedPanel}
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
    private portfolioParams: PortfolioParams = null;
    /** Признак процесса импорта, чтобы не очищались файлы */
    private importInProgress = false;
    /** Текущий шаг */
    private currentStep = ImportStep._1;

    private shareAliases: ShareAliasItem[] = [];

    private importHistory: UserImport[] = [];

    private importResult: ImportResponse = null;

    /** Статусы */
    private Status = Status;

    private hasNewEventsAfterImport = false;

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
        this.showInstruction = [this.portfolioParams.brokerId ? 0 : 1];
    }

    private async revertImport(userImportId: number): Promise<void> {
        const result = await new ConfirmDialog().show("Вы собираетесь откатить импорт, это приведет к удалению информации о нем из портфеля");
        if (result === BtnReturn.YES) {
            await this.revertImportConfirmed(userImportId);
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
        const filled = this.shareAliases.filter(shareAlias => !!shareAlias.share);
        const allFilled = filled.length === this.shareAliases.length;
        if (!allFilled) {
            const answer = await new ConfirmDialog().show("Вы не указали соответствия для всех нераспознанных бумаг. " +
                "Если продолжить, будут импортированы только сделки по тем бумагам, которые вы указали.");
            if (answer !== BtnReturn.YES) {
                return;
            }
        }
        await this.importService.saveShareAliases(filled);
        this.importResult = await this.importReport();
        await this.handleUploadResponse();
        // если начисления импортируем из отчета, дополнительно проверяем что в Событиях ничего нового не появилось
        if (!this.importProviderFeatures.autoEvents) {
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
        const results = await this.importService.importReport(this.selectedProvider.code, this.portfolio.id, this.files, this.importProviderFeatures);
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
        this.clearFiles();
        await this.loadImportHistory();
    }

    private goToPortfolio(): void {
        this.$router.push("portfolio");
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
        this.currentStep = ImportStep._1;
    }

    private clearFiles(): void {
        this.files = [];
        this.importInProgress = false;
    }

    private get providerAllowedExtensions(): string {
        if (this.selectedProvider?.allowedExtensions) {
            return this.selectedProvider?.allowedExtensions.join(", ");
        }
        return "";
    }

    private get importStatus(): Status {
        if (this.importResult) {
            if (this.importResult.errors && this.duplicateTradeErrors.length > 0 && this.importResult.errors.length === this.duplicateTradeErrors.length &&
                this.importResult.validatedTradesCount === 0) {
                // Импорт завершен. Все сделки из отчета уже были импортированы ранее.
                return Status.SUCCESS;
            } else if (!this.importResult.validatedTradesCount && !this.importResult.errors.length) {
                // Импорт завершен. В отчете не содержится информации по сделкам.");
                return Status.WARN;
            }
            return this.importResult.status;
        }
        return null;
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
            return this.importStatus === Status.SUCCESS && this.importResult.validatedTradesCount === 0 && this.duplicateTradeErrors.length > 0 ? this.duplicateTradeErrors.length :
                this.importResult.validatedTradesCount;
        }
        return 0;
    }

    private get isFinam(): boolean {
        return this.selectedProvider === DealsImportProvider.FINAM;
    }

    private get isQuik(): boolean {
        return this.selectedProvider === DealsImportProvider.QUIK;
    }

    private get finamHasFixFee(): boolean {
        const fixFee = this.portfolioParams.fixFee ? new Decimal(this.portfolioParams.fixFee) : null;
        return this.isFinam && !fixFee && !fixFee.isZero();
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

    private get showImportSettings(): boolean {
        return ![DealsImportProvider.SBERBANK, DealsImportProvider.TINKOFF, DealsImportProvider.VTB24].includes(this.selectedProvider);
    }

    private get showResultsPanel(): boolean {
        return !this.isIntelinvest && (this.hasNewEventsAfterImport || this.importProviderFeatures.autoEvents || this.notFoundShareErrors.length > 0 ||
            this.isQuik || this.importProviderFeatures.confirmMoneyBalance || this.isFinam || this.requireMoreReports || this.otherErrors.length > 0 ||
            this.repoTradeErrors.length > 0);
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
