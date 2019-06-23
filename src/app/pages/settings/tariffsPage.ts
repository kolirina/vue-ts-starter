import dayjs from "dayjs";
import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {Prop, UI, Watch} from "../../app/ui";
import {ApplyPromoCodeDialog} from "../../components/dialogs/applyPromoCodeDialog";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo, ClientService} from "../../services/clientService";
import {TariffService, UserPaymentInfo} from "../../services/tariffService";
import {Permission} from "../../types/permission";
import {Tariff} from "../../types/tariff";
import {Portfolio} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {DateUtils} from "../../utils/dateUtils";
import {TariffUtils} from "../../utils/tariffUtils";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <span>
            Превышены лимиты
            <p>
                Создано портфелей: <b>{{ portfoliosCount }}</b> - Доступно на тарифе: <b>{{ maxPortfoliosCount }}</b>, <br>
                добавлено ценных бумаг: <b>{{ sharesCount }}</b> - Доступно на тарифе: <b>{{ maxSharesCount }}</b> <br>
            </p>
            <p v-if="foreignShares">
                В ваших портфелях имеются сделки с валютой или по иностранным ценным бумагам<br>
                Тариф {{ tariffForeignShares ? "" : "не " }}позволяет учитывать сделки по ценным бумагам в долларах.
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
    /** Тариф */
    @Prop({required: true, type: Object})
    private tariff: Tariff;

    get maxPortfoliosCount(): string {
        return this.tariff.maxPortfoliosCount === 0x7fffffff ? "Без ограничений" : String(this.tariff.maxPortfoliosCount);
    }

    get maxSharesCount(): string {
        return this.tariff.maxSharesCount === 0x7fffffff ? "Без ограничений" : String(this.tariff.maxSharesCount);
    }

    get tariffForeignShares(): boolean {
        return this.tariff.hasPermission(Permission.FOREIGN_SHARES);
    }
}

@Component({
    // language=Vue
    template: `
        <div class="mt-3 alignC">
            <v-checkbox v-model="mutableValue" @change="onChange" hide-details>
                <template #label>
                <span>
                    Согласие с условиями
                    <v-tooltip content-class="custom-tooltip-wrap" max-width="340px" bottom>
                        <sup class="custom-tooltip" slot="activator">
                            <v-icon>fas fa-info-circle</v-icon>
                        </sup>
                        <span>
                            <p>
                                Нажимая чекбокс, вы соглашаетесь с условиями <br>
                                лицензионного соглашения.
                            </p>
                            <p>
                                По истечению оплаченного периода,  <br>
                                оплата за новый период будет снята <br>
                                с вашей карты автоматически. <br>
                                Отписаться от автопродления вы можете<br>
                                в любой момент в меню "Профиль"
                            </p>
                        </span>
                    </v-tooltip>
                </span>
                </template>
            </v-checkbox>
            <a href="https://intelinvest.ru/terms-of-use" target="_blank" class="fs12-non-opacity decorationNone link-license-agreement">Лицензионное соглашение</a>
        </div>
    `
})
export class TariffAgreement extends UI {

    @Prop({required: true, type: Boolean})
    private value = false;

    private mutableValue: boolean = false;

    @Watch("value")
    private setMutableValue(): void {
        this.mutableValue = this.value;
    }

    private onChange(newValue: boolean): void {
        this.$emit("agree", newValue);
    }
}

@Component({
    // language=Vue
    template: `
        <v-layout v-if="tariff !== Tariff.TRIAL" column :class="['tariff-item', 'margB30', tariff === Tariff.PRO ? 'pro-tarrif' : '']">
            <div v-if="tariff == Tariff.PRO" class="alignC fs13 tariff-most-popular">
                Выбор 67% инвесторов
            </div>
            <v-layout align-center column class="px-4">
                <div class="fs14 bold margT20">{{ tariff.description }}</div>
                <div>
                    <span v-if="tariff !== Tariff.FREE && discountApplied" class="tariff__plan_old-price">{{ noDiscountPrice }}</span>
                    <span class="tariff__plan_price">&nbsp;{{ price }} <span class="rub"> / </span><span>{{ perPart }}<sup v-if="isNewUser">*</sup></span></span>
                    <div v-if="!monthly && isNewUser" class="tariff__plan_year-price">{{ tariff === Tariff.FREE ? "&nbsp;" : "* при оплате за год" }}</div>
                </div>
                <div>
                    <div v-if="tariff == Tariff.STANDARD" class="fs13 margB20 mt-2">
                        <div>
                            <span class="bold">Неограниченное</span> кол-во бумаг
                        </div>
                        <div>
                            <span class="bold">2</span> портфеля
                        </div>
                    </div>
                    <div v-if="tariff == Tariff.PRO" class="fs13 margB20 mt-2">
                        <div>
                            <span class="bold">Неограниченное</span> кол-во бумаг
                        </div>
                        <div>
                            <span class="bold">Неограниченное</span> кол-во портфелей
                        </div>
                    </div>
                    <div v-if="tariff == Tariff.FREE" class="fs13 margB20 mt-2">
                        <div>
                            <span class="bold">7</span> ценных бумаг
                        </div>
                        <div>
                            <span class="bold">1</span> портфель
                        </div>
                    </div>
                </div>
                <v-tooltip v-if="!available || !payAllowed" content-class="custom-tooltip-wrap" bottom>
                    <v-btn slot="activator" @click.stop="makePayment(tariff)"
                        :class="{'big_btn': true, 'selected': selected && agreementState[tariff.name]}"
                        :disabled="disabled">
                        <span v-if="!busyState[tariff.name]">{{ buttonLabel }}</span>
                        <v-progress-circular v-if="busyState[tariff.name]" indeterminate color="white" :size="20"></v-progress-circular>
                    </v-btn>
                    <tariff-limit-exceed-info v-if="!available" :portfolios-count="clientInfo.user.portfoliosCount" :tariff="tariff"
                                            :shares-count="clientInfo.user.sharesCount" :foreign-shares="clientInfo.user.foreignShares">
                    </tariff-limit-exceed-info>
                    <span v-if="!payAllowed">
                        У вас уже действует активная подписка<br>
                        Для управления подпиской перейдите в Профиль
                    </span>
                </v-tooltip>
                <v-btn v-else @click="makePayment(tariff)"
                    :class="{'big_btn': true, 'selected': selected && agreementState[tariff.name]}"
                    :disabled="disabled">
                    <span v-if="!busyState[tariff.name]">{{ buttonLabel }}</span>
                    <v-progress-circular v-if="busyState[tariff.name]" indeterminate color="white" :size="20"></v-progress-circular>
                </v-btn>
                <div v-if="selected" class="tariff__plan_expires">
                    {{ expirationDescription }}
                </div>
                <tariff-agreement :value="agreementState[tariff.name]" @agree="agreementState[tariff.name] = $event"></tariff-agreement>
                <div v-if="tariff == Tariff.STANDARD" class="tariff-description-wrap">
                    <div class="py-3 fs14">
                        Базовый функционал
                    </div>
                    <div class="py-3 fs14">
                        Доступ к разделу “Рекомендации”
                    </div>
                    <div class="py-3 fs14">
                        Формирование составного портфеля из портфелей различных брокеров
                    </div>
                    <div class="py-3 fs14">
                        Мобильное приложение
                    </div>
                </div>
                <div v-if="tariff == Tariff.PRO" class="tariff-description-wrap">
                    <div class="py-3 fs14">
                        Функционал тарифа Стандарт
                    </div>
                    <div class="py-3 fs14">
                        Учет зарубежных акций, валютных активов и коротких позиций
                    </div>
                    <div class="py-3 fs14">
                        VIP поддержка в закрытом чате в Telegram
                    </div>
                    <div class="py-3 fs14">
                        Приоритетный доступ к функционалу, который будет добавляться в сервис в будущем
                    </div>
                    <div class="py-3 fs14">
                        Льготные условия на обучение инвестированию у наших школ-партнеров
                    </div>
                </div>
                <div v-if="tariff == Tariff.FREE" class="tariff-description-wrap">
                    <div class="py-3 fs14">
                        Импорт и экспорт сделок
                    </div>
                    <div class="py-3 fs14">
                        Полная аналитика портфеля
                    </div>
                    <div class="py-3 fs14">
                        Учет дивидендов, купонов, комиссий и амортизации
                    </div>
                    <div class="py-3 fs14">
                        Котировки и актуальная информация о эмитенте
                    </div>
                    <div class="py-3 fs14">
                        Уведомления о ценах акций и облигаций
                    </div>
                    <div class="py-3 fs14">
                        Возможность публичного доступа к портфелю
                    </div>
                    <div class="py-3 fs14">
                        Дивидендный анализ
                    </div>
                    <div class="py-3 fs14">
                        Операции с валютой
                    </div>
                </div>
            </v-layout>
        </v-layout>
    `,
    components: {TariffAgreement, TariffLimitExceedInfo}
})
export class PayButton extends UI {

    /** Дата, начиная с которой действуют новые тарифы */
    private readonly NEW_TARIFFS_DATE = DateUtils.parseDate("2019-06-10");

    /** Тариф */
    @Prop({required: true, type: Object})
    private tariff: Tariff;
    /** Информация о клиенте */
    @Prop({required: true, type: Object})
    private clientInfo: ClientInfo;
    /** Признак оплаты за месяц. */
    @Prop({required: true, type: Boolean})
    private monthly: boolean;
    /** Состояния оплат тарифов */
    @Prop({required: true, type: Object})
    private busyState: { [key: string]: boolean };
    /** Состояния оплат тарифов */
    @Prop({required: true, type: Object})
    private agreementState: { [key: string]: boolean };
    /** Состояние прогресса оплаты */
    @Prop({required: true, type: Boolean})
    private isProgress: boolean;
    /** Платежная информация пользователя */
    @Prop({required: false, type: Object})
    private paymentInfo: UserPaymentInfo;
    /** Тарифы */
    private Tariff = Tariff;

    /**
     * Сделать платеж
     * @param tariff выбранный тариф
     */
    private makePayment(tariff: Tariff): void {
        this.$emit("pay", tariff);
    }

    /**
     * Возвращает признак выбранного тарифа у пользователя
     */
    private get selected(): boolean {
        let userTariff = this.clientInfo.user.tariff;
        if (userTariff === Tariff.TRIAL) {
            userTariff = Tariff.PRO;
        }
        return userTariff === this.tariff;
    }

    /**
     * Возвращает признак доступности тарифа для выбора
     */
    private get available(): boolean {
        return this.tariff.maxSharesCount >= this.clientInfo.user.sharesCount &&
            this.tariff.maxPortfoliosCount >= this.clientInfo.user.portfoliosCount &&
            (this.tariff.hasPermission(Permission.FOREIGN_SHARES) || !this.clientInfo.user.foreignShares);
    }

    /**
     * Возвращает подпись к кнопке оплаты тарифа
     */
    private get buttonLabel(): string {
        if (!this.available) {
            return "Недоступно";
        }
        if (this.activeSubscription) {
            return this.selected ? "Продлить" : "Подписаться";
        }
        return "Подписаться";
    }

    private get expirationDescription(): string {
        const paidTill = DateUtils.parseDate(this.clientInfo.user.paidTill);
        return (paidTill.isAfter(dayjs()) ? "Действует до " : "Истек ") + this.expirationDate;
    }

    private get expirationDate(): string {
        return DateUtils.formatDate(DateUtils.parseDate(this.clientInfo.user.paidTill));
    }

    private get noDiscountPrice(): string {
        return `${this.commonPrice.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()}`;
    }

    /**
     * Возвращает цену для тарифа с учетом скидки, если она действует
     * @return цена для тарифа
     */
    private get price(): string {
        const nextPurchaseDiscount = this.discountApplied ? this.clientInfo.user.nextPurchaseDiscount : 0;
        return this.discountApplied ? this.commonPrice.mul(new Decimal(100 - nextPurchaseDiscount))
            .mul(new Decimal("0.01")).toDecimalPlaces(0, Decimal.ROUND_UP).toString() : this.commonPrice.toString();
    }

    /**
     * Возвращает цену без скидок, с учетом признака нового пользователя
     */
    private get commonPrice(): Decimal {
        return this.monthly ? this.isNewUser ? this.tariff.monthlyPriceNew : this.tariff.monthlyPrice :
            this.isNewUser ? this.tariff.monthlyPrice : this.tariff.yearPrice;
    }

    /**
     * Возвращает признак использования новой тарифной сетки для пользователей
     */
    private get isNewUser(): boolean {
        return DateUtils.parseDate(this.clientInfo.user.regDate).isAfter(this.NEW_TARIFFS_DATE);
    }

    /**
     * Возвращает признак того что для пользователя действует скидка. При соблюдении условий:
     * <ul>
     *     <il>Дата истечения скидки равна {@code null} или больше текущей даты</il>
     *     <il>скидка больше 0</il>
     * </ul>
     * @return признак того что для пользователя действует скидка
     */
    private get discountApplied(): boolean {
        return TariffUtils.isDiscountApplied(this.clientInfo);
    }

    private get perPart(): string {
        return this.isNewUser ? " мес." : this.monthly ? " мес." : " год";
    }

    /**
     * Возвращает признак возможности оплаты выбранного тарифа.
     * Оплата возможна если нет активной подписки и выбранный тариф совпадает с пользовательским
     */
    private get payAllowed(): boolean {
        return !this.activeSubscription || this.selected;
    }

    /**
     * Возвращает признак наличия информации о периодической подписке
     */
    private get activeSubscription(): boolean {
        return this.paymentInfo && CommonUtils.exists(this.paymentInfo.expDate) && CommonUtils.exists(this.paymentInfo.pan);
    }

    /**
     * Возвращает true если кнопка недоступна для нажатия
     */
    private get disabled(): boolean {
        return !this.available || this.isProgress || !this.agreementState[this.tariff.name] || !this.payAllowed;
    }
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
                                    <v-radio label="На год" :value="false"></v-radio>
                                    &nbsp;
                                    <v-radio label="На месяц" :value="true"></v-radio>
                                </v-radio-group>
                            </div>
                        </div>
                        <div class="promo-code-component">
                            <v-tooltip v-if="discountApplied" content-class="custom-tooltip-wrap" :max-width="250" bottom>
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
                            <span v-else @click.stop="applyPromoCode">Применить промокод</span>
                        </div>
                    </div>

                    <div class="tariff__info">

                    </div>
                    <div class="alignC">
                        Получите бесплатный месяц подписки.
                        <a @click="$router.push({name: 'promo-codes'})">Подробнее</a>
                    </div>
                    <p v-if="discountApplied" class="promotion alignC">
                        Совершите покупку с вашей персональной скидкой <b>{{ clientInfo.user.nextPurchaseDiscount }}%</b>!
                        <template v-if="clientInfo.user.nextPurchaseDiscountExpired">(срок действия скидки до {{ clientInfo.user.nextPurchaseDiscountExpired | date }})</template>
                    </p>

                    <v-layout class="wrap-tariffs-sentence">
                        <v-layout justify-space-around wrap>
                            <pay-button v-for="item in Tariff.values()" :key="item.name" @pay="makePayment" :tariff="item" :client-info="clientInfo" :monthly="monthly"
                                        :agreement-state="agreementState" :busy-state="busyState" :is-progress="isProgress" :payment-info="paymentInfo"></pay-button>
                        </v-layout>
                    </v-layout>
                </div>
            </v-card>
        </v-container>
    `,
    components: {PayButton}
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
    /** Тарифы */
    private Tariff = Tariff;
    /** Признак оплаты за месяц. */
    private monthly = false;
    /** Состояния оплат тарифов */
    private busyState: { [key: string]: boolean } = {
        FREE: false, STANDARD: false, PRO: false
    };
    /** Состояния оплат тарифов */
    private agreementState: { [key: string]: boolean } = {
        FREE: false, STANDARD: false, PRO: false
    };
    /** Состояние прогресса оплаты */
    private isProgress = false;
    /** Платежная информация пользователя */
    private paymentInfo: UserPaymentInfo = null;

    /**
     * Проверка успешно завершенной оплаты
     */
    @ShowProgress
    async created(): Promise<void> {
        this.clientService.resetClientInfo();
        await this.reloadUser();
        if (![Tariff.FREE, Tariff.TRIAL].includes(this.clientInfo.user.tariff)) {
            this.paymentInfo = await this.tariffService.getPaymentInfo();
            this.agreementState[this.clientInfo.user.tariff.name] = this.activeSubscription;
        }
        if (this.$route.params.status) {
            this.$snotify.info("Оплата заказа успешно завершена");
            this.$router.push({name: "tariffs"});
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
    private async makePayment(tariff: Tariff): Promise<void> {
        if (this.isProgress) {
            return;
        }
        this.isProgress = true;
        this.busyState[tariff.name] = true;
        const result = tariff === Tariff.FREE ? await new ConfirmDialog().show("Вы собираетесь перейти на Бесплатный план. " +
            "Оплата за неиспользованные дни вашего текущего тарифного плана будет при этом утеряна.") : BtnReturn.YES;
        if (result === BtnReturn.YES) {
            await this.makePaymentConfirmed(tariff);
        } else {
            this.busyState[tariff.name] = false;
            this.isProgress = false;
        }
    }

    /**
     * Сделать платеж
     * @param tariff выбранный тариф
     */
    @ShowProgress
    private async makePaymentConfirmed(tariff: Tariff): Promise<void> {
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
    private get discountApplied(): boolean {
        return TariffUtils.isDiscountApplied(this.clientInfo);
    }

    /**
     * Возвращает признак наличия информации о периодической подписке
     */
    private get activeSubscription(): boolean {
        return this.paymentInfo && CommonUtils.exists(this.paymentInfo.expDate) && CommonUtils.exists(this.paymentInfo.pan);
    }
}
