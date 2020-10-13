import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {Prop, UI} from "../../app/ui";
import {ApplyPromoCodeDialog} from "../../components/dialogs/applyPromoCodeDialog";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo, ClientService} from "../../services/clientService";
import {SystemPropertyName} from "../../services/systemPropertiesService";
import {TariffService, UserPaymentInfo} from "../../services/tariffService";
import {EventType} from "../../types/eventType";
import {Permission} from "../../types/permission";
import {Tariff} from "../../types/tariff";
import {MapType} from "../../types/types";
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
            <p v-if="!newTariffsApplicable && foreignShares">
                В ваших портфелях имеются сделки с валютой или по иностранным ценным бумагам<br>
                Тариф {{ tariffForeignShares ? "" : "не " }}позволяет учитывать сделки по ценным бумагам в долларах или евро.
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

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private systemProperties: MapType;

    get maxPortfoliosCount(): string {
        return this.tariff.maxPortfoliosCount === 0x7fffffff ? "Без ограничений" : String(this.tariff.maxPortfoliosCount);
    }

    get maxSharesCount(): string {
        return this.tariff.maxSharesCount === 0x7fffffff ? "Без ограничений" : String(this.tariff.maxSharesCount);
    }

    get tariffForeignShares(): boolean {
        return this.tariff.hasPermission(Permission.FOREIGN_SHARES);
    }

    private get newTariffsApplicable(): boolean {
        return DateUtils.parseDate(this.clientInfo.user.regDate).isAfter(DateUtils.parseDate(this.systemProperties[SystemPropertyName.NEW_TARIFFS_DATE_FROM]));
    }
}

@Component({
    // language=Vue
    template: `
        <v-layout :class="['tariff-item', tariff === Tariff.PRO ? 'pro-tariff' : '']" column>
            <div v-if="tariff === Tariff.PRO" class="alignC fs13 tariff-most-popular">
                Выбор инвесторов
            </div>
            <v-layout align-center column class="px-4">
                <div class="tariff-item__title">{{ tariff.description }}</div>
                <div class="tariff-item__description">{{ tariff.functional }}</div>
                <div>
                    <span v-if="tariff !== Tariff.FREE && discountApplied" class="tariff__plan_old-price">{{ noDiscountPrice }}</span>
                    <span :class="{'tariff-item__price': true, 'free-tariff':tariff === Tariff.FREE}">
                        &nbsp;{{ price }} <span class="rub"> / </span><span class="margL8">мес.</span>
                    </span>
                    <div v-if="!monthly" class="tariff__plan_year-price">{{ tariff === Tariff.FREE ? "&nbsp;" : "при оплате за год" }}</div>
                    <div v-if="monthly" class="tariff__plan_year-price">&nbsp;</div>
                </div>
                <div class="tariff__limits fs13">
                    <span v-if="tariff === Tariff.FREE">7 ценных бумаг,</span>
                    <span v-if="tariff === Tariff.STANDARD && newTariffsApplicable">30 бумаг на портфель,</span>
                    <span v-if="tariff === Tariff.STANDARD && !newTariffsApplicable">&infin; кол-во бумаг,</span>
                    <span v-if="tariff === Tariff.PRO">&infin; кол-во бумаг,</span>
                    <span class="mt-1">
                        <template v-if="tariff === Tariff.PRO">
                            &infin; кол-во портфелей
                        </template>
                        <template v-else>
                            {{ tariff.maxPortfoliosCount }} {{ tariff.maxPortfoliosCount | declension("портфель", "портфеля", "портфелей") }}
                        </template>
                    </span>
                </div>
                <v-tooltip v-if="!isMobile && (!available || isTariffsDifferent)" :content-class="classPaymentBtn" bottom>
                    <v-btn slot="activator" @click.stop="makePayment(tariff)" :class="{'big_btn': true, 'selected': selected}" :disabled="disabled">
                        <span v-if="!busyState[tariff.name]">{{ buttonLabel }}</span>
                        <v-progress-circular v-if="busyState[tariff.name]" indeterminate color="white" :size="20"></v-progress-circular>
                    </v-btn>
                    <tariff-limit-exceed-info v-if="!available" :portfolios-count="clientInfo.user.portfoliosCount" :tariff="tariff"
                                              :shares-count="clientInfo.user.sharesCount" :foreign-shares="clientInfo.user.foreignShares">
                    </tariff-limit-exceed-info>
                    <div v-else class="pa-3">
                        При переходе на данный тарифный план, остаток неиспользованных дней текущего тарифа пересчитаются согласно новому тарифу и продлит срок его действия
                    </div>
                </v-tooltip>
                <template v-if="isMobile && (!available || isTariffsDifferent)">
                    <v-btn slot="activator" @click.stop="makePayment(tariff)" :class="{'big_btn': true, 'selected': selected}" :disabled="disabled">
                        <span v-if="!busyState[tariff.name]">{{ buttonLabel }}</span>
                        <v-progress-circular v-if="busyState[tariff.name]" indeterminate color="white" :size="20"></v-progress-circular>
                    </v-btn>
                    <expanded-panel :value="notAvailablePanelState" class="margT16 promo-codes__statistics w100pc">
                        <template #header>{{ available ? 'Подробнее' : 'Почему мне недоступен тариф?' }}</template>
                        <div class="statistics">
                            <tariff-limit-exceed-info v-if="!available" :portfolios-count="clientInfo.user.portfoliosCount" :tariff="tariff"
                                                      :shares-count="clientInfo.user.sharesCount" :foreign-shares="clientInfo.user.foreignShares">
                            </tariff-limit-exceed-info>
                            <div v-else>
                                При переходе на данный тарифный план, остаток неиспользованных дней текущего тарифа пересчитаются согласно новому тарифу и продлит срок его действия
                            </div>
                        </div>
                    </expanded-panel>
                </template>
                <v-btn v-if="available && !isTariffsDifferent" @click.stop="makePayment(tariff)"
                       :class="{'big_btn': true, 'selected': selected}"
                       :style="disabled ? 'opacity: 0.7;' : ''"
                       :disabled="disabled">
                    <span v-if="!busyState[tariff.name]">{{ buttonLabel }}</span>
                    <v-progress-circular v-if="busyState[tariff.name]" indeterminate color="white" :size="20"></v-progress-circular>
                </v-btn>
                <div class="tariff__plan_expires">
                    <template v-if="selected">
                        {{ expirationDescription }}
                    </template>
                </div>
                <div class="tariff-agreement__notification">
                    <template v-if="tariff !== Tariff.FREE">
                        Средства списываются регулярно.<br>Отказаться от подписки можно в любой момент
                    </template>
                </div>
                <div class="tariff-description-wrap">
                    <div>Учет акций, облигаций, ПИФов и&nbsp;драгметаллов</div>
                    <div v-if="newTariffsApplicable">Учёт активов номинированных в&nbsp;рублях и&nbsp;валюте</div>
                    <div>Импорт отчетов 18 брокеров</div>
                    <div>Полная аналитика по портфелю</div>
                    <div>Учет дивидендов, купонов, комиссий и&nbsp;амортизации</div>
                    <div>Уведомления о ценах и событиях</div>
                    <div>Мобильное приложение</div>
                    <div>
                        <span>
                            Публичный доступ к портфелю
                            <tooltip>Возможность поделиться портфелем с друзьями, коллегами, подписчиками</tooltip>
                        </span>
                    </div>
                    <template v-if="tariff === Tariff.STANDARD || tariff === Tariff.PRO">
                        <div>
                            <span>
                                Произвольные активы (недвижимость, депозиты, кредиты, и тд.)
                                <tooltip>Позволяет учитывать любые виды активо, которые не поддерживаются напрямую сервисом</tooltip>
                            </span>
                        </div>
                        <div>Возможность объединения двух и&nbsp;более портфелей</div>
                    </template>
                    <template v-if="!newTariffsApplicable">
                        <div v-if="tariff === Tariff.PRO">Учёт активов номинированных в&nbsp;рублях и&nbsp;валюте</div>
                        <div v-if="tariff !== Tariff.PRO">Учёт активов номинированных в рублях</div>
                    </template>
                    <template v-if="tariff === Tariff.PRO">
                        <div>
                            <span>
                                Учет сделок маржинальной торговли (РЕПО) и&nbsp;
                                коротких позиций
                                <tooltip>Используйте профессиональные возможности для более точного учета</tooltip>
                            </span>
                        </div>
                        <div>Учет валютных пар и криптовалюты</div>
                    </template>
                </div>
            </v-layout>
        </v-layout>
    `,
    components: {TariffLimitExceedInfo}
})
export class TariffBlock extends UI {

    /** Тариф */
    @Prop({required: true, type: Object})
    private tariff: Tariff;
    /** Признак оплаты за месяц. */
    @Prop({required: true, type: Boolean})
    private monthly: boolean;
    /** Состояния оплат тарифов */
    @Prop({required: true, type: Object})
    private busyState: { [key: string]: boolean };
    /** Состояние прогресса оплаты */
    @Prop({required: true, type: Boolean})
    private isProgress: boolean;
    /** Платежная информация пользователя */
    @Prop({required: false, type: Object})
    private paymentInfo: UserPaymentInfo;
    /** Панель с отображением подробностей о недоступном тарифе (для мобилы онли) */
    private notAvailablePanelState = [0];

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private expiredTariff: boolean;
    @MainStore.Getter
    private systemProperties: MapType;

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
        return `${TariffUtils.getSubscribeDescription(this.clientInfo.user)} ${this.expirationDate}`;
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
        if (this.newTariffsApplicable) {
            return this.monthly ? this.tariff.monthlyPriceNew : this.tariff.monthlyYearPriceNew;
        } else {
            return this.monthly ? this.tariff.monthlyPrice : this.tariff.monthlyYearPrice;
        }
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

    /**
     * Возвращает true если кнопка недоступна для нажатия
     */
    private get disabled(): boolean {
        return !this.available || this.isProgress;
    }

    /**
     * Возвращает true если тариф пользовтеля не ТРИАЛ и не бесплатный, он не совпадает с выбираемым и выбираемый не Бесплатный
     */
    private get isTariffsDifferent(): boolean {
        return ![Tariff.TRIAL, Tariff.FREE].includes(this.clientInfo.user.tariff) && this.tariff !== Tariff.FREE && this.clientInfo.user.tariff !== this.tariff;
    }

    private get classPaymentBtn(): string {
        return `custom-tooltip-wrap ${this.available ? "pa-0" : ""}`;
    }

    private get isMobile(): boolean {
        return CommonUtils.isMobile();
    }

    private get newTariffsApplicable(): boolean {
        return DateUtils.parseDate(this.clientInfo.user.regDate).isAfter(DateUtils.parseDate(this.systemProperties[SystemPropertyName.NEW_TARIFFS_DATE_FROM]));
    }
}

@Component({
    // language=Vue
    template: `
        <v-container class="page-wrapper" fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Тарифы</div>
                </v-card-title>
            </v-card>
            <v-card class="overflowXA" flat>
                <div class="tariff">
                    <div class="tariff__header">
                        <div>
                            <div class="tariff__header-title">Выберите подходящее для вас решение</div>
                            <div>
                                <v-radio-group v-model="monthly" class="radio-horizontal">
                                    <v-radio label="На год" :value="false"></v-radio>
                                    <b>&nbsp;-50%</b>
                                    <v-radio label="На месяц" :value="true" class="margL20"></v-radio>
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
                    <p v-if="discountApplied" class="promotion alignC">
                        Совершите покупку с вашей персональной скидкой <b>{{ clientInfo.user.nextPurchaseDiscount }}%</b>!
                        <template v-if="clientInfo.user.nextPurchaseDiscountExpired">(срок действия скидки до {{ clientInfo.user.nextPurchaseDiscountExpired | date }})</template>
                    </p>

                    <v-layout class="wrap-tariffs-sentence" wrap>
                        <tariff-block v-for="item in availableTariffs" :key="item.name" @pay="makePayment" :tariff="item" :client-info="clientInfo" :monthly="monthly"
                                      :busy-state="busyState" :is-progress="isProgress" :payment-info="paymentInfo"></tariff-block>
                    </v-layout>
                </div>
                <div class="free-subscribe">
                    <span>Получите бесплатный месяц подписки.</span>
                    <a @click="$router.push({name: 'promo-codes'})">Подробнее</a>
                </div>
                <div class="payment-system">
                    <div class="payment-system__text">
                        Интернет-платежи защищены сертификатом SSL и протоколом 3D Secure.<br>
                        АО "Тинькофф Банк" не передает платежные данные, в том числе данные карт.<br>
                        Intelinvest не хранит платежные данные и данные карт.
                    </div>
                    <div class="payment-system__items">
                        <img src="./img/tariffs/payment-system/visa.svg" alt="">
                        <img src="./img/tariffs/payment-system/mastercard.svg" alt="">
                        <img src="./img/tariffs/payment-system/maestro.svg" alt="">
                        <img src="./img/tariffs/payment-system/verified.svg" alt="">
                        <img src="./img/tariffs/payment-system/mastercard-secure.svg" alt="">
                        <img src="./img/tariffs/payment-system/mir.svg" alt="">
                        <img src="./img/tariffs/payment-system/mir-accept.svg" alt="">
                        <img src="./img/tariffs/payment-system/pci.svg" alt="">
                    </div>
                </div>
            </v-card>
        </v-container>
    `,
    components: {TariffBlock}
})
export class TariffsPage extends UI {

    @Inject
    private clientService: ClientService;
    @Inject
    private tariffService: TariffService;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;
    @MainStore.Getter
    private expiredTariff: boolean;
    @MainStore.Action(MutationType.RELOAD_CLIENT_INFO)
    private reloadUser: () => Promise<void>;
    /** Тарифы */
    private Tariff = Tariff;
    /** Доступные Тарифы */
    private availableTariffs: Tariff[] = [Tariff.FREE, Tariff.STANDARD, Tariff.PRO];
    /** Признак оплаты за месяц. */
    private monthly = false;
    /** Состояния оплат тарифов */
    private busyState: { [key: string]: boolean } = {
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
        }
        if (this.$route.params.status) {
            this.$snotify.info("Оплата заказа успешно завершена");
            this.$router.push({name: "tariffs"});
        }
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio());
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
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
        let result = BtnReturn.YES;
        // если переходим на тариф Бесплатный и подписка не истекла, спрашиваем пользователя
        if (tariff === Tariff.FREE && !this.isSubscriptionExpired()) {
            result = await new ConfirmDialog().show("Вы собираетесь перейти на Бесплатный план. " +
                "Оплата за неиспользованные дни вашего текущего тарифного плана будет при этом утеряна.");
        }
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
        return this.expiredTariff;
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
