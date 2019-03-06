import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Filters} from "../../platform/filters/Filters";
import {MarketService} from "../../services/marketService";
import {KeyWordsSearchType, Notification, NotificationsService, NotificationType} from "../../services/notificationsService";
import {AssetType} from "../../types/assetType";
import {Bond, Share} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {CustomDialog} from "./customDialog";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="480px">
            <v-card v-if="notification" class="add-notification dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-card-title class="headline add-notification-title">{{ notification.id ? "Редактирование" : "Создание" }} уведомления</v-card-title>
                <div>
                    <share-search :filteredShares="filteredShares" :assetType="assetType" @clear="onShareClear" @change="onShareSearchChange"></share-search>

                    <v-switch v-model="buyPriceNotification">
                        <template slot="label">
                            <span>Получать уведомления об изменении цены покупки</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                  Для получения уведомлений задайте целевые цены и допуск. Например, вы хотите получить уведомление
                                  для покупки акций <b>{{ share ? share.ticker : "SBER" }}</b> про цене <b>{{ sharePrice }}</b> {{ shareCurrency }}.
                                  Для этого укажите в "Целевая цена покупки:" <b>{{ sharePrice }}</b>.
                                  <br/>
                                  <br/>
                                  Задайте так же допуск цены, например, 3, чтобы получать
                                  уведомления для цен от {{ sharePrice }}-3  и до {{ sharePrice }}+3 {{ shareCurrency }}.
                                  Для покупки акции это значение будет просуммированно с целевой ценой.
                                  Допуск может быть нулевым.
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>

                    <v-expansion-panel :value="[buyPriceNotification]" expand>
                        <v-expansion-panel-content>
                            <div class="add-notification-conditional">
                                <div class="add-notification-conditional-block">
                                    <label for="buyPrice">Целевая цена покупки</label>
                                    <ii-number-field v-model="notification.buyPrice" id="buyPrice" :decimals="2"></ii-number-field>
                                </div>
                                <div class="add-notification-conditional-block">
                                    <label for="buyVariation">Допуск цены покупки</label>
                                    <ii-number-field v-model="notification.buyVariation" id="buyVariation" :decimals="2"></ii-number-field>
                                </div>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>

                    <v-switch v-model="sellPriceNotification">
                        <template slot="label">
                            <span>Получать уведомления об изменении цены продажи</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                  Для получения уведомлений задайте целевые цены и допуск. Например, вы хотите получить уведомление
                                  для покупки акций <b>{{ share ? share.ticker : "SBER" }}</b> про цене <b>{{ sharePrice }}</b> {{ shareCurrency }}.
                                  Для этого укажите в "Целевая цена покупки:" <b>{{ sharePrice }}</b>.
                                  <br/>
                                  <br/>
                                  Задайте так же допуск цены, например 3, чтобы получать
                                  уведомления для цен от {{ sharePrice }}-3  и до {{ sharePrice }}+3 {{ shareCurrency }}.
                                  Для покупки акции это значение будет просуммированно с целевой ценой.
                                  Допуск может быть нулевым.
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>

                    <v-expansion-panel :value="[sellPriceNotification]" expand>
                        <v-expansion-panel-content>
                            <div class="add-notification-conditional">
                                <div class="add-notification-conditional-block">
                                    <label for="sellPrice">Целевая цена продажи</label>
                                    <ii-number-field v-model="notification.sellPrice" id="sellPrice" :decimals="2"></ii-number-field>
                                </div>
                                <div class="add-notification-conditional-block">
                                    <label for="sellVariation">Допуск цены продажи</label>
                                    <ii-number-field v-model="notification.sellVariation" id="sellVariation" :decimals="2"></ii-number-field>
                                </div>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>

                    <v-switch v-if="isStockNotification" v-model="newsNotification" @change="onNewsNotificationChange">
                        <template slot="label">
                            <span>Получать уведомления о новостях</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                  Вы будет получать письма обо всех корпоративных событиях эмитента <b>{{ share ? share.ticker : "" }}</b>.
                                  Сюда относятся новости о публикациях отчетности,
                                  проведении собраний, о решении собраний, решения о выплате дивидендов, заключение значимых сделок,
                                  о которых эмитент должен отчитываться на сайтах раскрытия информации).
                                  Вы всегда будете в курсе всех значимых событий.
                                  <br/><br/>
                                  Новость будет отправлена вам на почту, как только появится новая публикация.
                                  <br/><br/>
                                  Также вы можете дополнительно настроить ключевые слова, которые должны встречаться в тексте новости.
                                  Ключевые слова разделить запятой. Можно задать как слово целиком, так и часть слова.
                                  <br/><br/>
                                  Доступно два режима поиска слов: будет искаться вхождение всех слов в тексте новости
                                  или вхождение любого из ключевых слов.
                                  Задавать список ключевых слов не обязательно.
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>

                    <v-expansion-panel :value="[newsNotification]" expand>
                        <v-expansion-panel-content>
                            <div class="add-notification-conditional">
                                <div class="add-notification-conditional-block">
                                    <v-text-field label="Ключевые слова для поиска" v-model="notification.keywords"></v-text-field>
                                </div>
                                <div class="add-notification-conditional-block">
                                    <v-select label="Тип поиска слов" v-model="notification.keyWordsSearchType" :items="selectParams"></v-select>
                                </div>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>

                    <v-switch v-if="isStockNotification" v-model="dividendNotification" @change="onDividendNotificationChange">
                        <template slot="label">
                            <span>Получать уведомления о планируемых дивидендах</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                  Вы будет получать письма как только эмитент <b>{{ share ? share.ticker : "" }}</b>
                                  примет решение о выплате дивидендов.
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>

                    <v-switch v-if="!isStockNotification" :readonly="!isStockNotification" v-model="bondEventNotification">
                        <template slot="label">
                            <span>Получать уведомления о событиях</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                  Вы будет получать письма как только эмитент <b>{{ share ? share.ticker : "" }}</b>
                                  произведет выплату купона, амортизации или погашение.
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>

                    <v-card-actions class="btn-group-right">
                        <v-btn @click.native="save" color="primary" light>{{ notification.id ? "Сохранить" : "Добавить" }}</v-btn>
                        <v-btn @click.native="close">Отмена</v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class CreateOrEditNotificationDialog extends CustomDialog<Notification, boolean> {

    @Inject
    private notificationsService: NotificationsService;
    @Inject
    private marketService: MarketService;

    private selectParams = [
        {text: "Вхождение любого слова", value: KeyWordsSearchType.CONTAINS_ONE},
        {text: "Вхождение всех слов", value: KeyWordsSearchType.CONTAINS_ALL}
    ];

    private assetType = AssetType.STOCK;
    private share: Share = null;
    private filteredShares: Share[] = [];
    private buyPriceNotification = false;
    private sellPriceNotification = false;
    private newsNotification = false;
    private dividendNotification = false;
    private bondEventNotification = false;
    private notification: Notification = null;

    async mounted(): Promise<void> {
        if (this.data) {
            this.notification = {...this.data};
            this.bondEventNotification = this.notification.type === NotificationType.bond;
            this.buyPriceNotification = CommonUtils.exists(this.notification.buyPrice);
            this.sellPriceNotification = CommonUtils.exists(this.notification.sellPrice);
            this.dividendNotification = CommonUtils.exists(this.notification.keywords) && this.notificationsService.DIVIDEND_WORDS === this.notification.keywords;
            this.newsNotification = CommonUtils.exists(this.notification.keyWordsSearchType) && this.notificationsService.DIVIDEND_WORDS !== this.notification.keywords;
            if (this.notification.type === NotificationType.stock) {
                this.share = (await this.marketService.getStockById(this.notification.shareId)).stock;
            } else if (this.notification.type === NotificationType.bond) {
                this.share = (await this.marketService.getBondById(this.notification.shareId)).bond;
            }
            this.filteredShares = [this.share];
        } else {
            this.notification = {
                type: NotificationType.stock
            };
        }
    }

    @ShowProgress
    @CatchErrors
    @DisableConcurrentExecution
    private async save(): Promise<void> {
        if (!this.isValid()) {
            return;
        }
        await this.addNotification();
    }

    private async addNotification(): Promise<void> {
        const shareId = this.share.id;
        const reqParams: Notification = {
            shareId,
            id: this.notification.id
        };

        // Заполнение полей для запроса
        if (this.buyPriceNotification) {
            reqParams.buyPrice = this.notification.buyPrice;
            reqParams.buyVariation = this.notification.buyVariation;
        }
        if (this.sellPriceNotification) {
            reqParams.sellPrice = this.notification.sellPrice;
            reqParams.sellVariation = this.notification.sellVariation;
        }

        if (this.newsNotification || this.dividendNotification) {
            reqParams.keywords = this.notification.keywords;
            reqParams.keyWordsSearchType = this.notification.keyWordsSearchType;
        }

        if (this.notification.id) {
            await this.notificationsService.editNotification(reqParams, this.notification.type);
        } else {
            await this.notificationsService.addNotification(reqParams, this.notification.type);
        }

        this.$snotify.info("Уведомление успешно сохранено");
        this.close(true);
    }

    private onNewsNotificationChange(value: boolean): void {
        this.notification.keyWordsSearchType = value ? KeyWordsSearchType.CONTAINS_ONE : null;
    }

    private onDividendNotificationChange(value: boolean): void {
        this.notification.keyWordsSearchType = value ? KeyWordsSearchType.CONTAINS_ONE : null;
        this.notification.keywords = value ? this.notificationsService.DIVIDEND_WORDS : null;
    }

    private onShareClear(): void {
        this.filteredShares = [];
    }

    private isValid(): boolean {
        // Валидация тикера
        if (!this.share) {
            this.$snotify.warning("Ценная бумага не выбрана");
            return false;
        }
        const emptyBuyPrice = !CommonUtils.exists(this.notification.buyPrice);
        const emptySellPrice = !CommonUtils.exists(this.notification.sellPrice);
        const emptySearchType = !CommonUtils.exists(this.notification.keyWordsSearchType);

        // Валидация активности одного из блоков(продажи или покупки)
        if (emptyBuyPrice && emptySellPrice && emptySearchType && this.notification.type === NotificationType.stock) {
            this.$snotify.warning("Заполните поля уведомления");
            return false;
        }
        return true;
    }

    private get isStockNotification(): boolean {
        return this.notification.type === NotificationType.stock;
    }

    private onShareSearchChange(share: Share): void {
        this.share = share;
    }

    private get sharePrice(): string {
        if (!this.share) {
            return "220";
        }
        return this.notification.type === NotificationType.stock ? Filters.formatMoneyAmount(this.share.price) : Filters.formatNumber((this.share as Bond).prevprice);
    }

    private get shareCurrency(): string {
        if (!this.share) {
            return "рублей";
        }
        if (this.notification.type === NotificationType.bond) {
            return "%";
        }
        switch (this.share.currency) {
            case "RUB":
                return "рублей";
            case "USD":
                return "долларов";
            case "EUR":
                return "евро";
        }
        return "рублей";
    }
}