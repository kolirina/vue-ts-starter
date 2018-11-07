import Decimal from "decimal.js";
import moment from "moment";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {TariffService} from "../../services/tariffService";
import {Permission} from "../../types/permission";
import {Tariff} from "../../types/tariff";
import {ClientInfo} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {DateUtils} from "../../utils/dateUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card>
                <v-card-text>
                    <h4 class="display-1">Тарифы</h4>
                    <div class="tariff">
                        <h2 class="title">
                            Выберите подходящий вам тарифный план
                        </h2>

                        <div class="subtitle">
                            <p>
                                У вас подключен план {{ clientInfo.user.tariff }} до
                                <b>
                                    <span>{{ clientInfo.user.paidTill | date }}</span>
                                    <span v-if="isSubscriptionExpired()">(срок подписки истек)</span>
                                </b>

                                <span id="payment-loader" style="display: none">
                                    <span id="check_payment"/>
                                </span>
                            </p>
                            <p>
                                Создано портфелей: <b>{{ clientInfo.user.portfoliosCount }}</b>, добавлено ценных бумаг: <b>{{ clientInfo.user.sharesCount }}</b>
                            </p>
                            <p v-if="clientInfo.user.foreignShares">
                                В ваших портфелях имеются сделки с валютой или по иностранным ценным бумагам
                            </p>
                            <p>
                                <v-text-field v-model="promoCode" maxlength="10" size="10" @keypress.enter="applyPromoCode"
                                              label="Введите сюда ваш промо-код" clearable outline
                                              append-outer-icon="check" @click:append-outer="applyPromoCode"></v-text-field>
                            </p>

                            <p style="font-size: 12px; padding-top: 15px;">
                                Не хотите платить? Порекомендуйте сервис, поделитесь промо-кодом на скидку 20% - и получите бесплатный месяц подписки.
                                <a @click="$router.push({name: 'promo-codes'})">Подробнее</a>
                            </p>
                        </div>

                        <p v-if="isDiscountApplied()" class="promotion" style="color: black">
                            Совершите покупку с вашей персональной скидкой <b>{{ clientInfo.user.nextPurchaseDiscount }}%</b>! (срок действия скидки до {{
                            clientInfo.user.nextPurchaseDiscountExpired | date }})
                        </p>

                        <div class="tab" id="planTabs">
                            <div class="tab-ctrl">
                                <v-btn :color="monthly ? 'primary' : ''" @click="monthly = true" :class="{'tab-btn': true, 'active': monthly}" light>На месяц</v-btn>

                                <v-btn :color="!monthly ? 'primary' : ''" @click="monthly = false" :class="{'tab-btn': true, 'active': !monthly}" light>
                                    На год{{ isDiscountApplied() ? '' : ' (дешевле на 20%)'}}
                                </v-btn>
                            </div>

                            <div class="tab-items active">
                                <div :class="{'tab-item': true, 'selected': isSelected(Tariff.FREE)}">
                                    <div class="tab-item__icon">
                                        <span/>
                                        <img src="/img/tariff/1.svg"></img>
                                    </div>

                                    <p class="tab-item__heading">
                                        Бесплатный
                                    </p>

                                    <ul class="tab-item__list" :style="isDiscountApplied() ? 'margin-bottom: 29px' : ''">
                                        <li>
                                            7 ценных бумаг<br/>
                                            1 портфель
                                        </li>
                                        <li>
                                            Базовый функционал сервиса без ограничений
                                        </li>
                                    </ul>
                                    <p class="tab-item__price">
                                        {{ getPriceLabel(Tariff.FREE) }}
                                    </p>

                                    <p v-if="isSelected(Tariff.FREE)" class="tab-item__expires">
                                        {{ getExpirationDescription() }}
                                    </p>

                                    <v-tooltip bottom>
                                        <a slot="activator" color="primary" @click="makePayment(Tariff.FREE)"
                                           class="tab-item__link" :style="isSelected(Tariff.FREE) ? 'margin-top: 10px' : ''"
                                           :disabled="!isAvailable(Tariff.FREE) || isSelected(Tariff.FREE) || isProgress">
                                            <span v-if="!busyState[Tariff.FREE.name]">{{ getButtonLabel(Tariff.FREE) }}</span>
                                            <v-progress-circular v-if="busyState[Tariff.FREE.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                        </a>
                                        <span>
                                            Переход на Бесплатный тарифный план <br/> возможен только если не превышены лимиты.
                                        </span>
                                    </v-tooltip>
                                </div>


                                <div :class="{'tab-item': true, 'selected': isSelected(Tariff.STANDARD)}">
                                    <div class="tab-item__icon">
                                        <span></span>
                                        <img src="/img/tariff/2.svg"></img>
                                    </div>

                                    <p class="tab-item__heading">
                                        Стандарт
                                    </p>

                                    <ul class="tab-item__list">
                                        <li>
                                            Неограниченное кол-во ценных бумаг<br/>
                                            2 портфеля
                                        </li>
                                        <li>
                                            «Бесплатный»
                                        </li>
                                        <li>
                                            Доступ к разделу “Инвестиции”
                                        </li>

                                        <li>
                                            Составной портфель
                                        </li>

                                        <li>
                                            <b>Мобильное приложение</b>
                                        </li>
                                    </ul>

                                    <p v-if="isDiscountApplied()" class="tab-item__old_price">
                                        {{ getNoDiscountPriceLabel(Tariff.STANDARD) }}
                                    </p>

                                    <p class="tab-item__price">
                                        {{ getPriceLabel(Tariff.STANDARD) }}
                                    </p>

                                    <p v-if="isSelected(Tariff.STANDARD)" class="tab-item__expires">
                                        {{ getExpirationDescription() }}
                                    </p>

                                    <v-tooltip bottom>
                                        <a slot="activator" color="primary" @click="makePayment(Tariff.STANDARD)"
                                           class="tab-item__link" :style="isSelected(Tariff.STANDARD) ? 'margin-top: 10px' : ''"
                                           :disabled="!isAvailable(Tariff.STANDARD) || isProgress">
                                            <span v-if="!busyState[Tariff.STANDARD.name]">{{ getButtonLabel(Tariff.STANDARD) }}</span>
                                            <v-progress-circular v-if="busyState[Tariff.STANDARD.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                        </a>
                                        <span>
                                            Переход на Стандарт тарифный план <br/> возможен только если не превышены лимиты.
                                        </span>
                                    </v-tooltip>
                                </div>


                                <div :class="{'tab-item': true, 'selected': isSelected(Tariff.PRO)}">
                                    <div class="tab-item__icon">
                                        <span/>
                                        <img src="/img/tariff/3.svg"></img>
                                    </div>

                                    <p class="tab-item__heading">
                                        Профессионал
                                    </p>

                                    <ul class="tab-item__list">
                                        <li>
                                            Неограниченное кол-во портфелей и ценных бумаг
                                        </li>
                                        <li>
                                            «Стандарт»
                                        </li>
                                        <li>
                                            Учет зарубежных акций
                                        </li>
                                        <li>
                                            Учет коротких позиций
                                        </li>
                                        <li>
                                            Ранний доступ к новому функционалу
                                        </li>
                                        <li>
                                            <b>Мобильное приложение</b>
                                        </li>
                                    </ul>

                                    <p v-if="isDiscountApplied()" class="tab-item__old_price">
                                        {{ getNoDiscountPriceLabel(Tariff.PRO) }}
                                    </p>

                                    <p class="tab-item__price">
                                        {{ getPriceLabel(Tariff.PRO) }}
                                    </p>

                                    <p v-if="isSelected(Tariff.PRO)" class="tab-item__expires">
                                        {{ getExpirationDescription() }}
                                    </p>

                                    <a @click="makePayment(Tariff.PRO)" class="tab-item__link" :style="isSelected(Tariff.PRO) ? 'margin-top: 10px' : ''"
                                       :disabled="!isAvailable(Tariff.PRO) || isProgress">
                                        <span v-if="!busyState[Tariff.PRO.name]">{{ getButtonLabel(Tariff.PRO) }}</span>
                                        <v-progress-circular v-if="busyState[Tariff.PRO.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-container>`
})
export class TariffsPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @Inject
    private tariffService: TariffService;

    private promoCode = "";

    private Tariff = Tariff;

    /** Признак оплаты за месяц. */
    private monthly = true;

    private busyState: { [key: string]: boolean } = {
        FREE: false, STANDARD: false, PRO: false
    };

    private isProgress = false;

    async mounted(): Promise<void> {

    }

    /**
     * Применяет введенный промо-код пользователя
     */
    private async applyPromoCode(): Promise<void> {
        if (CommonUtils.isBlank(this.promoCode)) {
            this.$snotify.warning("Введите пожалуйста промо-код");
            return;
        }
        await this.tariffService.applyPromoCode(this.promoCode);
        this.$snotify.info("Промо-код успешно применен");
    }

    /**
     * Сделать платеж
     * @param tariff выбранный тариф
     */
    private async makePayment(tariff: Tariff): Promise<void> {
        if (this.isProgress) {
            return;
        }
        console.log(this.busyState);
        this.isProgress = true;
        this.busyState[tariff.name] = true;
        try {
            const orderData = await this.tariffService.makePayment(tariff, this.monthly);
            // если оплата не завершена, открываем фрэйм для оплаты
            if (!orderData.paymentOrder.done) {
                await this.tariffService.openPaymentFrame(orderData, this.clientInfo);
            } else {
                this.$snotify.info("Оплата заказа успешно завершена");
            }
        } finally {
            this.busyState[tariff.name] = false;
            this.isProgress = false;
        }
    }

    private getPriceLabel(tariff: Tariff): string {
        return `${this.getPrice(tariff)} ${this.monthly ? " / месяц" : " / год"}`;
    }

    private getNoDiscountPriceLabel(tariff: Tariff): string {
        let price;
        if (this.monthly) {
            price = tariff.monthlyPrice;
        } else {
            price = new Decimal(tariff.monthlyPrice).mul(new Decimal(12));
        }
        return `${price.toFixed(2)} ${this.monthly ? " / месяц" : " / год"}`;
    }

    /**
     * Возвращает признак истекшей подписки
     */
    private isSubscriptionExpired(): boolean {
        return moment().isAfter(DateUtils.parseDate(this.clientInfo.user.paidTill));
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
        return (nextPurchaseDiscountExpired == null || moment().isBefore(nextPurchaseDiscountExpired)) && this.clientInfo.user.nextPurchaseDiscount > 0;
    }

    private isSelected(tariff: Tariff): boolean {
        let userTariff = Tariff.valueByName(this.clientInfo.user.tariff);
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
        return (paidTill.isAfter(moment()) ? "Действует до " : "Истек ") + this.getExpirationDate();
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
