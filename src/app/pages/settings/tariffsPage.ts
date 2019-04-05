import dayjs from "dayjs";
import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {Prop, UI} from "../../app/ui";
import {ApplyPromoCodeDialog} from "../../components/dialogs/applyPromoCodeDialog";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo, ClientService} from "../../services/clientService";
import {TariffService} from "../../services/tariffService";
import {Permission} from "../../types/permission";
import {Tariff} from "../../types/tariff";
import {Portfolio} from "../../types/types";
import {DateUtils} from "../../utils/dateUtils";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <span>
            Превышены лимиты
            <p>
                Создано портфелей: <b>{{ portfoliosCount }}</b>, добавлено ценных бумаг: <b>{{ sharesCount }}</b>
            </p>
            <p v-if="foreignShares">
                В ваших портфелях имеются сделки с валютой или по иностранным ценным бумагам
            </p>
        </span>
    `
})
export class TariffLimitExceedInfo extends UI {

    @Prop({required: true, type: Number})
    private portfoliosCount: number;
    @Prop({required: true, type: Number})
    private sharesCount: number;
    @Prop({default: false, type: Boolean})
    private foreignShares: boolean;
}

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Тарифы</div>
                </v-card-title>
            </v-card>
            <v-card class="overflowXA" flat>
                <div class="tariff">
                    <div class="tariff__header">
                        <div>
                            Выберите подходящий вам тарифный план
                            <div>
                                <v-radio-group v-model="monthly" class="radio-horizontal">
                                    <v-radio label="На месяц" :value="true"></v-radio>
                                    <v-radio label="На год" :value="false"></v-radio>
                                    <b>&nbsp;{{isDiscountApplied() ? '' : '-20%'}}</b>
                                </v-radio-group>
                            </div>
                        </div>
                        <div class="promo-code-component">
                            <v-tooltip v-if="isDiscountApplied()" content-class="custom-tooltip-wrap" :max-width="250" bottom>
                                <template #activator="{ on }">
                                    <span @click.stop="applyPromoCode" v-on="on">Применить промокод</span>
                                    <div v-on="on" class="promo-code-component__icon"></div>
                                </template>
                                <div>
                                    <div>Активирован промокод</div>
                                    <div>Скидка составляет {{ clientInfo.user.nextPurchaseDiscount }}%</div>
                                    <div v-if="clientInfo.user.nextPurchaseDiscountExpired">Срок действия до {{ clientInfo.user.nextPurchaseDiscountExpired | date }}</div>
                                </div>
                            </v-tooltip>
                            <span v-else @click.stop="applyPromoCode" v-on="on">Применить промокод</span>
                        </div>
                    </div>

                    <div class="tariff__info">

                    </div>

                    <p v-if="isDiscountApplied()" class="promotion">
                        Совершите покупку с вашей персональной скидкой <b>{{ clientInfo.user.nextPurchaseDiscount }}%</b>!
                        <template v-if="clientInfo.user.nextPurchaseDiscountExpired">(срок действия скидки до {{ clientInfo.user.nextPurchaseDiscountExpired | date }})</template>
                    </p>

                    <div class="tariff__plans">
                        <table>
                            <tr>
                                <td class="no-borders"></td>
                                <td colspan="3">
                                    Получите бесплатный месяц подписки.
                                    <a @click="$router.push({name: 'promo-codes'})">Подробнее</a>
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>
                                    <div class="tariff__plan_name">Бесплатный</div>
                                    <div class="tariff__plan_price-block">
                                        <div class="tariff__plan_price">{{ getPriceLabel(Tariff.FREE) }} <span>RUB</span></div>
                                    </div>
                                    <v-tooltip v-if="!isAvailable(Tariff.FREE)" content-class="custom-tooltip-wrap" bottom>
                                        <v-btn slot="activator" @click="makePayment(Tariff.FREE)" :class="{'big_btn': true, 'selected': isSelected(Tariff.FREE)}"
                                               :disabled="!isAvailable(Tariff.FREE) || isSelected(Tariff.FREE) || isProgress">
                                            <span v-if="!busyState[Tariff.FREE.name]">{{ getButtonLabel(Tariff.FREE) }}</span>
                                            <v-progress-circular v-if="busyState[Tariff.FREE.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                        </v-btn>
                                        <tariff-limit-exceed-info v-if="!isAvailable(Tariff.FREE)" :portfolios-count="clientInfo.user.portfoliosCount"
                                                                  :shares-count="clientInfo.user.sharesCount" :foreign-shares="clientInfo.user.foreignShares">
                                        </tariff-limit-exceed-info>
                                    </v-tooltip>
                                    <v-btn v-else @click="makePayment(Tariff.FREE)" :class="{'big_btn': true, 'selected': isSelected(Tariff.FREE)}"
                                           :disabled="!isAvailable(Tariff.FREE) || isSelected(Tariff.FREE) || isProgress">
                                        <span v-if="!busyState[Tariff.FREE.name]">{{ getButtonLabel(Tariff.FREE) }}</span>
                                        <v-progress-circular v-if="busyState[Tariff.FREE.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                    </v-btn>
                                    <div class="tariff__plan_expires" v-if="isSelected(Tariff.FREE)">
                                        {{ getExpirationDescription() }}
                                    </div>
                                </td>
                                <td>
                                    <div class="tariff__plan_name">Стандарт</div>
                                    <div class="tariff__plan_price-block">
                                        <span v-if="isDiscountApplied()" class="tariff__plan_old-price">{{ getNoDiscountPriceLabel(Tariff.STANDARD) }}</span>
                                        <span class="tariff__plan_price">{{ getPriceLabel(Tariff.STANDARD) }} <span>RUB</span></span>
                                    </div>
                                    <v-tooltip v-if="!isAvailable(Tariff.STANDARD)" content-class="custom-tooltip-wrap" bottom>
                                        <v-btn slot="activator" @click="makePayment(Tariff.STANDARD)"
                                               :class="{'big_btn': true, 'selected': isSelected(Tariff.STANDARD)}"
                                               :disabled="!isAvailable(Tariff.STANDARD) || isProgress">
                                            <span v-if="!busyState[Tariff.STANDARD.name]">{{ getButtonLabel(Tariff.STANDARD) }}</span>
                                            <v-progress-circular v-if="busyState[Tariff.STANDARD.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                        </v-btn>
                                        <tariff-limit-exceed-info v-if="!isAvailable(Tariff.STANDARD)" :portfolios-count="clientInfo.user.portfoliosCount"
                                                                  :shares-count="clientInfo.user.sharesCount" :foreign-shares="clientInfo.user.foreignShares">
                                        </tariff-limit-exceed-info>
                                    </v-tooltip>
                                    <v-btn v-else @click="makePayment(Tariff.STANDARD)"
                                           :class="{'big_btn': true, 'selected': isSelected(Tariff.STANDARD)}"
                                           :disabled="!isAvailable(Tariff.STANDARD) || isProgress">
                                        <span v-if="!busyState[Tariff.STANDARD.name]">{{ getButtonLabel(Tariff.STANDARD) }}</span>
                                        <v-progress-circular v-if="busyState[Tariff.STANDARD.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                    </v-btn>
                                    <div v-if="isSelected(Tariff.STANDARD)" class="tariff__plan_expires">
                                        {{ getExpirationDescription() }}
                                    </div>
                                </td>
                                <td>
                                    <div class="tariff__plan_name">Профессионал</div>
                                    <div class="tariff__plan_price-block">
                                        <span v-if="isDiscountApplied()" class="tariff__plan_old-price">{{ getNoDiscountPriceLabel(Tariff.PRO) }}</span>
                                        <span class="tariff__plan_price">{{ getPriceLabel(Tariff.PRO) }} <span>RUB</span></span>
                                    </div>
                                    <v-btn @click="makePayment(Tariff.PRO)"
                                           :class="{'big_btn': true, 'selected': isSelected(Tariff.PRO)}"
                                           :disabled="!isAvailable(Tariff.PRO) || isProgress">
                                        <span v-if="!busyState[Tariff.PRO.name]">{{ getButtonLabel(Tariff.PRO) }}</span>
                                        <v-progress-circular v-if="busyState[Tariff.PRO.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                    </v-btn>
                                    <div v-if="isSelected(Tariff.PRO)" class="tariff__plan_expires">
                                        {{ getExpirationDescription() }}
                                    </div>
                                </td>
                            </tr>
                            <tr class="no-borders">
                                <td>Объем портфеля</td>
                                <td class="fs13">
                                    <span>7 ценных бумаг<br>1 портфель</span>
                                </td>
                                <td class="fs13">
                                    <span>Неограниченное кол-во бумаг<br/>2 портфеля</span>
                                </td>
                                <td class="fs13">
                                    <span>Неограниченное кол-во бумаг и портфелей</span>
                                </td>
                            </tr>
                            <tr>
                                <td>Базовый функционал</td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>Доступ к разделу "Инвестиции"</td>
                                <td></td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>Составной портфель</td>
                                <td></td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>Доступ к функционалу "Стандарт"</td>
                                <td></td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>Мобильное приложение</td>
                                <td></td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>Учет зарубежных акций</td>
                                <td></td>
                                <td></td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>Учет коротких позиций</td>
                                <td></td>
                                <td></td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>Ранний доступ<br>к новому функционалу</td>
                                <td></td>
                                <td></td>
                                <td>
                                    <div class="tariff__plans_check"></div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </v-card>
        </v-container>
    `,
    components: {TariffLimitExceedInfo}
})
export class TariffsPage extends UI {

    @Inject
    private clientService: ClientService;
    @Inject
    private tariffService: TariffService;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_CLIENT_INFO)
    private reloadUser: () => Promise<void>;

    private Tariff = Tariff;

    /** Признак оплаты за месяц. */
    private monthly = true;

    private busyState: { [key: string]: boolean } = {
        FREE: false, STANDARD: false, PRO: false
    };

    private isProgress = false;

    /**
     * Проверка успешно завершенной оплаты
     */
    async created(): Promise<void> {
        this.clientService.resetClientInfo();
        await this.reloadUser();
        if (this.$route.params.status) {
            await this.afterSuccessPayment();
        }
    }

    /**
     * Открывает диалог для ввода промокода пользователя
     */
    private async applyPromoCode(): Promise<void> {
        const result = await new ApplyPromoCodeDialog().show();
        if (result === BtnReturn.YES) {
            this.clientService.resetClientInfo();
            await this.reloadUser();
        }
    }

    /**
     * Сделать платеж
     * @param tariff выбранный тариф
     */
    @ShowProgress
    private async makePayment(tariff: Tariff): Promise<void> {
        if (this.isProgress) {
            return;
        }
        this.isProgress = true;
        this.busyState[tariff.name] = true;
        try {
            const orderData = await this.tariffService.makePayment(tariff, this.monthly);
            // если оплата не завершена, открываем фрэйм для оплаты
            if (orderData.status === "NEW") {
                window.location.assign(orderData.paymentURL);
            } else if (orderData.status === "CONFIRMED") {
                await this.afterSuccessPayment();
            }
        } finally {
            this.busyState[tariff.name] = false;
            this.isProgress = false;
        }
    }

    private async afterSuccessPayment(): Promise<void> {
        this.clientService.resetClientInfo();
        await this.reloadUser();
        this.$snotify.info("Оплата заказа успешно завершена");
    }

    private getPriceLabel(tariff: Tariff): string {
        return `${this.getPrice(tariff)}`;
    }

    private getNoDiscountPriceLabel(tariff: Tariff): string {
        let price;
        if (this.monthly) {
            price = tariff.monthlyPrice;
        } else {
            price = new Decimal(tariff.monthlyPrice).mul(new Decimal(12));
        }
        return `${price.toFixed(2)}`;
    }

    /**
     * Возвращает признак истекшей подписки
     */
    private isSubscriptionExpired(): boolean {
        return dayjs().isAfter(DateUtils.parseDate(this.clientInfo.user.paidTill));
    }

    /**
     * Возвращает признак того что для пользователя действует скидка. При соблюдении условий:
     * <ul>
     *     <il>Дата истечения скидки равна {@code null} или больше текущей даты</il>
     *     <il>скидка больше 0</il>
     * </ul>
     * @return признак того что для пользователя действует скидка
     */
    private isDiscountApplied(): boolean {
        const nextPurchaseDiscountExpired = DateUtils.parseDate(this.clientInfo.user.nextPurchaseDiscountExpired);
        return (this.clientInfo.user.nextPurchaseDiscountExpired == null || dayjs().isBefore(nextPurchaseDiscountExpired)) &&
            this.clientInfo.user.nextPurchaseDiscount > 0;
    }

    private isSelected(tariff: Tariff): boolean {
        let userTariff = this.clientInfo.user.tariff;
        if (userTariff === Tariff.TRIAL) {
            userTariff = Tariff.PRO;
        }
        return userTariff === tariff;
    }

    private getButtonLabel(tariff: Tariff): string {
        if (!this.isAvailable(tariff)) {
            return "Недоступно";
        }
        if (this.isSelected(tariff)) {
            return tariff === Tariff.FREE ? "Подключен" : "Продлить";
        }
        return "Подключить";
    }

    private isAvailable(tariff: Tariff): boolean {
        return tariff.maxSharesCount >= this.clientInfo.user.sharesCount &&
            tariff.maxPortfoliosCount >= this.clientInfo.user.portfoliosCount &&
            (tariff.hasPermission(Permission.FOREIGN_SHARES) || !this.clientInfo.user.foreignShares);
    }

    private getExpirationDescription(): string {
        const paidTill = DateUtils.parseDate(this.clientInfo.user.paidTill);
        return (paidTill.isAfter(dayjs()) ? "Действует до " : "Истек ") + this.getExpirationDate();
    }

    private getExpirationDate(): string {
        return DateUtils.formatDate(DateUtils.parseDate(this.clientInfo.user.paidTill));
    }

    /**
     * Возвращает цену для тарифа с учетом скидки, если она действует
     * @param tariff тариф
     * @return цена для тарифа
     */
    private getPrice(tariff: Tariff): string {
        const isDiscountApplied = this.isDiscountApplied();
        const price = this.monthly ? tariff.monthlyPrice : isDiscountApplied ? tariff.yearFullPrice : tariff.yearPrice;
        const nextPurchaseDiscount = isDiscountApplied ? this.clientInfo.user.nextPurchaseDiscount : 0;
        return new Decimal(price).mul(new Decimal(100 - nextPurchaseDiscount)).div(new Decimal("100")).toFixed(0);
    }
}
