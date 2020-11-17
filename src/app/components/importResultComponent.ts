/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

/**
 * Компонент для отображения ссылки на просмотр информации по акции
 */
import dayjs from "dayjs";
import Decimal from "decimal.js";
import {Component, Prop, UI} from "../app/ui";
import {DealImportError, DealsImportProvider, ImportProviderFeatures, ImportResponse, ImportResultLabel} from "../services/importService";
import {PortfolioParams} from "../services/portfolioService";
import {DateUtils} from "../utils/dateUtils";
import {ImportErrorsTable} from "./imp/importErrorsTable";

@Component({
    // language=Vue
    template: `
        <div class="import-result-info">
            <!-- Блок отображается если из отчета не импортируются начисления или если импортируются, и есть новые события -->
            <expanded-panel v-if="hasNewEventsAfterImport || importProviderFeatures.autoEvents" name="calculations" :value="[expandPanels]"
                            class="selectable import-history" :label="ImportResultLabel.ATTENTION">
                <template #header>
                    <span>Отчет {{ importProviderFeatures.autoEvents ? "не" : "" }} содержит информацию по дивидендам, купонам, амортизации</span>
                    <tooltip v-if="importProviderFeatures.autoEvents">
                        В отчетах не содержится информации по выплаченным дивидендам, купонам или амортизации, поэтому мы добавили недостающие
                        начисления
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

            <expanded-panel v-if="notFoundShareErrors.length" name="tickers" :value="[expandPanels]" class="selectable import-history"
                            :label="ImportResultLabel.CRITICAL">
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

            <expanded-panel v-if="isQuik || importProviderFeatures.confirmMoneyBalance" name="residuals" :value="[expandPanels]"
                            class="selectable import-history" :label="ImportResultLabel.ATTENTION">
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

            <expanded-panel v-if="hasProviderAutoCommission" name="residuals" :value="[expandPanels]" class="selectable import-history"
                            :label="ImportResultLabel.ATTENTION">
                <template #header>
                    <span>Сверьте расходы по комиссиям брокера</span>
                </template>
                Отчет вашего брокера не содержит информацию об удерживаемых комиссиях по сделкам. <br/>
                <template v-if="hasAutoCommission">
                    Вы указали в настройках Портфеля размер фиксированной комиссии, и мы расчитали ее автоматически.<br/>
                </template>
                <template v-else>
                    Вы можете указать в настройках Портфеля размер фиксированной комиссии, и мы расчитаем ее автоматически при следующем
                    импорте.<br/>
                </template>
                Вы можете сверить результат и добавить корректирующию сделку типа Расход, если будет необходимо.
            </expanded-panel>

            <expanded-panel v-if="requireMoreReports" name="requireMoreReports" :value="[expandPanels]" class="selectable import-history"
                            :label="ImportResultLabel.CRITICAL">
                <template #header>
                    <span>Не хватает сделок для формирования портфеля</span>
                </template>
                Для формирования портфеля загрузите отчет(отчеты) за все время ведения счета.
            </expanded-panel>

            <expanded-panel v-if="otherErrors.length" name="otherErrors" :value="[expandPanels]" class="selectable import-history"
                            :label="ImportResultLabel.ATTENTION">
                <template #header>
                    <span>При импорте отчета возникли следующие ошибки</span>
                    <tooltip>
                        Возможно, изменился формат импорта или в отчете не содержится информации по сделкам.
                    </tooltip>
                </template>
                <import-errors-table :error-items="otherErrors"></import-errors-table>
            </expanded-panel>

            <expanded-panel v-if="repoTradeErrors.length" name="repoTradeErrors" :value="[expandPanels]" class="selectable import-history"
                            :label="ImportResultLabel.INFO">
                <template #header>
                    <span>РЕПО сделки не были добавлены</span>
                    <tooltip>
                        <span class="amount-deals">{{ repoTradeErrors.length }}</span>
                        {{ repoTradeErrors.length | declension("сделка", "сделки", "сделок") }}
                        из отчета имеют тип РЕПО и не были загружены, (если вы производили их самостоятельно, добавьте их вручную).
                    </tooltip>
                </template>
                <span>
                    РЕПО сделки могут быть совершены вашим брокером, если вы давали согласие на займы своих бумаг.<br/>
                    Брокер может занимать и отдавать бумаги в течение дня, при этом в отчете такие сделки<br/>
                    будут отображаться, например, как РЕПО часть 1 и РЕПО часть 2, и по своей сути,<br/>
                    такие операции не должны влиять на расчет доходности вашего портфеля и попадать в список сделок,
                    потому что вы их не совершали.<br/><br/>
                    Если сделки РЕПО совершали вы самостоятельно, и хотите их учесть,
                    рекомендуем внести их через диалог добавления сделки.
                </span>
            </expanded-panel>

            <expanded-panel v-if="duplicateTradeErrors.length" name="duplicateTradeErrors" :value="[expandPanels]" class="selectable import-history"
                            :label="ImportResultLabel.INFO">
                <template #header>
                    <span>Некоторые сделки уже были импортированые ранее</span>
                    <tooltip>
                        Мы распознаем такие сделки, чтобы избежать дублирования и неправильных рассчетов
                    </tooltip>
                </template>
                <span>
                    В отчете присутствует {{ duplicateTradeErrors.length }}
                    {{ duplicateTradeErrors.length | declension("сделка", "сделки", "сделок") }}<br/>
                    уже импортированных ранее.
                </span>
            </expanded-panel>

            <expanded-panel v-if="isAlfaDirekt || isFf" :value="[expandPanels]" class="selectable import-history"
                            :label="ImportResultLabel.ATTENTION">
                <template #header>
                    <span>Комиссии по бумагам в валюте не переносятся</span>
                </template>
                <span>
                    Обратите внимание, что в отчетах брокера по сделкам с бумагами в валюте<br/>
                    комиссия указывается в рублях и не переносится.
                </span>
            </expanded-panel>
        </div>
    `,
    components: {ImportErrorsTable}
})
export class ImportResultComponent extends UI {

    /** Текст ошибки о дублировании сделки */
    private static readonly DUPLICATE_MSG = "Сделка уже была импортирована ранее";
    /** Ошибка о репо */
    private static readonly REPO_TRADE_MSG = "Импорт сделки РЕПО не производится.";

    @Prop({type: Object, required: true})
    /** Результат импорта */
    private importResult: ImportResponse;

    @Prop({type: Object, required: true})
    /** Выбранный провайдер */
    private importProvider: DealsImportProvider;

    @Prop({type: Object, required: true})
    /** Параметры текущего портфеля */
    private portfolioParams: PortfolioParams;

    @Prop({type: Object, required: true})
    /** Настройки импорта для выбранного провайдера */
    private importProviderFeatures: ImportProviderFeatures;

    @Prop({type: Boolean, default: false})
    /** Признак наличия события после импорта */
    private hasNewEventsAfterImport: boolean;

    @Prop({type: Boolean, default: true})
    /** Признак наличия события после импорта */
    private expandPanels: boolean;
    /** Перечисление результатов импорта для доступа из шаблона */
    private ImportResultLabel = ImportResultLabel;

    private get notFoundShareErrors(): DealImportError[] {
        return this.importResult ? this.importResult.errors.filter(error => error.shareNotFound) : [];
    }

    private get otherErrors(): DealImportError[] {
        return this.importResult ? this.importResult.errors.filter(error => !error.shareNotFound && error.message !== ImportResultComponent.REPO_TRADE_MSG &&
            error.message !== ImportResultComponent.DUPLICATE_MSG) : [];
    }

    private get repoTradeErrors(): DealImportError[] {
        return this.importResult ? this.importResult.errors.filter(error => error.message === ImportResultComponent.REPO_TRADE_MSG) : [];
    }

    private get duplicateTradeErrors(): DealImportError[] {
        return this.importResult ? this.importResult.errors.filter(error => error.message === ImportResultComponent.DUPLICATE_MSG) : [];
    }

    private get hasProviderAutoCommission(): boolean {
        return [DealsImportProvider.FINAM, DealsImportProvider.BCS].includes(this.importProvider);
    }

    private get isQuik(): boolean {
        return this.importProvider === DealsImportProvider.QUIK;
    }

    private get hasAutoCommission(): boolean {
        const fixFee = this.portfolioParams.fixFee ? new Decimal(this.portfolioParams.fixFee) : null;
        return this.hasProviderAutoCommission && !fixFee && !fixFee.isZero();
    }

    private get isAlfaDirekt(): boolean {
        return this.importProvider === DealsImportProvider.ALFADIRECT;
    }

    private get isFf(): boolean {
        return this.importProvider === DealsImportProvider.FREEDOM_FINANCE;
    }

    private get isSberbank(): boolean {
        return this.importProvider === DealsImportProvider.SBERBANK;
    }

    private get isIntelinvest(): boolean {
        return this.importProvider === DealsImportProvider.INTELINVEST;
    }

    /**
     * Возвращает признак необходимости загрузки дополнительных отчетов
     * Если дата последней сдеки не в текущем году
     */
    private get requireMoreReports(): boolean {
        return DateUtils.parseDate(this.importResult?.lastTradeDate).get("year") < dayjs().get("year");
    }

    private get resultLabels(): ImportResultLabel[] {
        const labels: ImportResultLabel[] = [];
        if (this.hasNewEventsAfterImport || this.importProviderFeatures.autoEvents) {
            labels.push(ImportResultLabel.ATTENTION);
        }
        if (this.notFoundShareErrors.length) {
            labels.push(ImportResultLabel.CRITICAL);
        }
        if (this.isQuik || this.importProviderFeatures.confirmMoneyBalance) {
            labels.push(ImportResultLabel.ATTENTION);
        }
        if (this.hasProviderAutoCommission) {
            labels.push(ImportResultLabel.ATTENTION);
        }
        if (this.requireMoreReports) {
            labels.push(ImportResultLabel.CRITICAL);
        }
        if (this.otherErrors.length) {
            labels.push(ImportResultLabel.ATTENTION);
        }
        if (this.repoTradeErrors.length) {
            labels.push(ImportResultLabel.INFO);
        }
        if (this.duplicateTradeErrors.length) {
            labels.push(ImportResultLabel.INFO);
        }
        if (this.isAlfaDirekt || this.isFf) {
            labels.push(ImportResultLabel.ATTENTION);
        }
        const reduced: { [key: string]: ImportResultLabel } = {};
        labels.forEach(label => {
           reduced[label] = label;
        });
        return Object.keys(reduced).map(key => reduced[key]);
    }
}
