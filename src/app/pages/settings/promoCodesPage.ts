import {Decimal} from "decimal.js";
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI} from "../../app/ui";
import {PartnerProgramJoiningDialog} from "../../components/dialogs/partnerProgramJoiningDialog";
import {PartnershipWithdrawalRequestDialog} from "../../components/dialogs/partnershipWithdrawalRequestDialog";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {Enum, EnumType, IStaticEnum} from "../../platform/enum";
import {ClientInfo, ClientService} from "../../services/clientService";
import {PromoCodeService, PromoCodeStatistics} from "../../services/promoCodeService";
import {EventType} from "../../types/eventType";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid class="page-wrapper">
            <v-layout row wrap>
                <v-flex>
                    <v-card flat class="header-first-card">
                        <v-card-title class="header-first-card__wrapper-title">
                            <div class="section-title header-first-card__title-text">Партнерская программа</div>
                        </v-card-title>
                    </v-card>
                    <v-tabs>
                        <v-tab v-for="tab in promoCodesTabs" :key="tab.code" @change="currentTab = tab" :class="{'active': tab === currentTab}" :ripple="false">
                            {{ tab.description }}
                        </v-tab>
                    </v-tabs>
                    <div v-if="currentTab === promoCodesTab.USER" class="section-content">
                        <div class="promo-codes">
                            <div class="promo-codes__title">
                                <img src="./img/promocodes/user.svg" alt="Партнерам">
                                <span>Учитывайте инвестиции бесплатно!</span>
                            </div>
                            <ul>
                                <li>Поделитесь ссылкой с друзьями</li>
                                <li>Получите месяц в подарок за каждую оплату приглашенного Вами пользователя</li>
                            </ul>
                            <v-radio-group v-model="currentShareType">
                                <v-radio v-for="type in shareTypes" :key="type.code" :label="type.description"
                                         :value="type" @change="onShareTypeChange"></v-radio>
                            </v-radio-group>
                            <div class="promo-code__wrapper">
                                <div class="promo-code selectable">{{ clientInfo.user.promoCode.val }}</div>
                                <div class="btns">
                                    <v-btn v-if="currentShareType === shareType.PROMO_CODE" v-clipboard="() => clientInfo.user.promoCode.val" @click="copyPromoCode">Копировать</v-btn>
                                    <v-btn v-else v-clipboard="() => refLink" @click="copyRefLink">Копировать</v-btn>
                                </div>
                            </div>
                            <div class="rewards">
                                <template v-if="clientInfo.user.referralAwardType === 'SUBSCRIPTION'">
                                    <div class="promo-codes__subtitle">Ваше вознаграждение</div>
                                    <div>
                                        Вы получаете месяц бесплатной подписки после оплаты каждого приглашенного пользователя.
                                    </div>
                                    <div class="mt-3">
                                        <div class="promo-codes__subtitle">Предлагаем стать Партнером</div>
                                        <div class="body-2">
                                            У вас свой блог или канал?<br/>
                                            Станьте нашим партнером и получайте до 150 000 руб. в месяц
                                        </div>
                                        <div class="body-1">
                                            Платим 30% с каждой оплаты приглашенного пользователя в течение 2 лет.<br/>
                                            Выделяем персонального менеджера.
                                        </div>
                                    </div>
                                    <a @click.stop="openPartnerProgramJoiningDialog">Стать партнером</a>
                                </template>
                                <div v-if="clientInfo.user.referralAwardType === 'PAYMENT'" class="mt-3">
                                    <div>
                                        <div class="promo-codes__subtitle mb-2">Связаться по вопросам сотрудничества</div>
                                        <div>Ваш менеджер: Евгений</div>
                                        Telegram: <a href="https://telegram.me/intelinvest_partner" title="Задайте вопрос в Telegram"
                                                     target="_blank" class="decorationNone">@intelinvest_partner</a><br/>
                                        ВК: <a href="https://vk.com/intelinvest_partner" target="_blank" class="decorationNone">https://vk.com/intelinvest_partner</a><br/>
                                        Email: <a href="mailto:partner@intelinvest.ru" target="_blank" class="decorationNone">partner@intelinvest.ru</a><br/>
                                    </div>
                                    <v-btn v-if="showRequestWithdrawal" class="mt-3" primary @click.stop="requestWithdrawal">Запрос на вывод вознаграждения</v-btn>
                                </div>
                            </div>
                        </div>

                        <expanded-panel v-if="promoCodeStatistics" :value="$uistate.referralStatisticsPanel" :state="$uistate.REFERRAL_STATISTICS_PANEL"
                                        class="promo-codes__statistics">
                            <template #header>Статистика по реферальной программе</template>
                            <div class="statistics">
                                <div>
                                    <span>Привлеченных пользователей:</span>
                                    <span>{{ promoCodeStatistics.referralCount }}</span>
                                </div>
                                <div>
                                    <span>Из них хоть раз оплативших:</span>
                                    <span>{{ promoCodeStatistics.hasPaymentsReferralCount }}</span>
                                </div>
                                <template v-if="clientInfo.user.referralAwardType === 'PAYMENT'">
                                    <div>
                                        <span>Всего заработано:</span>
                                        <span>
                                            {{ promoCodeStatistics.referrerPaymentsTotal | number }}
                                            <span class="rewards-currency rub"></span>
                                        </span>
                                    </div>
                                    <div>
                                        <span>Всего выплачено:</span>
                                        <span>
                                            {{ promoCodeStatistics.referrerPaymentsTotalPaid | number }}
                                            <span class="rewards-currency rub"></span>
                                        </span>
                                    </div>
                                    <div class="statistics__label">
                                        <span>Остаток для выплаты:</span>
                                        <span>
                                            {{ promoCodeStatistics.referrerPaymentsTotalUnpaid | number }}
                                            <span class="rewards-currency rub"></span>
                                        </span>
                                    </div>
                                </template>
                            </div>
                        </expanded-panel>
                    </div>
                    <div v-if="currentTab === promoCodesTab.PARTNER" class="section-content">
                        <div class="promo-codes">
                            <div class="promo-codes__subtitle">Промокод</div>
                            <div class="promo-code__wrapper">
                                <div class="promo-code selectable">{{ clientInfo.user.promoCode.val }}</div>
                                <div class="btns">
                                    <v-btn v-clipboard="() => clientInfo.user.promoCode.val" @click="copyPromoCode">Копировать промокод</v-btn>
                                    <v-btn v-clipboard="() => refLink" @click="copyRefLink">Копировать ссылку</v-btn>
                                </div>
                            </div>
                            <div class="rewards">
                                <template v-if="clientInfo.user.referralAwardType === 'SUBSCRIPTION'">
                                    <div class="promo-codes__subtitle">Ваше вознаграждение</div>
                                    <div>
                                        Вы получаете месяц бесплатной подписки после оплаты каждого приглашенного пользователя.
                                    </div>
                                    <div class="mt-3">
                                        <div class="promo-codes__subtitle">Предлагаем стать Партнером</div>
                                        <div class="body-2">
                                            У вас свой блог или канал?<br/>
                                            Станьте нашим партнером и получайте до 150 000 руб. в месяц
                                        </div>
                                        <div class="body-1">
                                            Платим 30% с каждой оплаты приглашенного пользователя в течение 2 лет.<br/>
                                            Выделяем персонального менеджера.
                                        </div>
                                    </div>
                                    <a @click.stop="openPartnerProgramJoiningDialog">Стать партнером</a>
                                </template>
                                <div v-if="clientInfo.user.referralAwardType === 'PAYMENT'" class="mt-3">
                                    <div>
                                        <div class="promo-codes__subtitle mb-2">Связаться по вопросам сотрудничества</div>
                                        <div>Ваш менеджер: Евгений</div>
                                        Telegram: <a href="https://telegram.me/intelinvest_partner" title="Задайте вопрос в Telegram"
                                                     target="_blank" class="decorationNone">@intelinvest_partner</a><br/>
                                        ВК: <a href="https://vk.com/intelinvest_partner" target="_blank" class="decorationNone">https://vk.com/intelinvest_partner</a><br/>
                                        Email: <a href="mailto:partner@intelinvest.ru" target="_blank" class="decorationNone">partner@intelinvest.ru</a><br/>
                                    </div>
                                    <v-btn v-if="showRequestWithdrawal" class="mt-3" primary @click.stop="requestWithdrawal">Запрос на вывод вознаграждения</v-btn>
                                </div>
                            </div>
                        </div>

                        <expanded-panel v-if="promoCodeStatistics" :value="$uistate.referralStatisticsPanel" :state="$uistate.REFERRAL_STATISTICS_PANEL"
                                        class="promo-codes__statistics">
                            <template #header>Статистика по реферальной программе</template>
                            <div class="statistics">
                                <div>
                                    <span>Привлеченных пользователей:</span>
                                    <span>{{ promoCodeStatistics.referralCount }}</span>
                                </div>
                                <div>
                                    <span>Из них хоть раз оплативших:</span>
                                    <span>{{ promoCodeStatistics.hasPaymentsReferralCount }}</span>
                                </div>
                                <template v-if="clientInfo.user.referralAwardType === 'PAYMENT'">
                                    <div>
                                        <span>Всего заработано:</span>
                                        <span>
                                            {{ promoCodeStatistics.referrerPaymentsTotal | number }}
                                            <span class="rewards-currency rub"></span>
                                        </span>
                                    </div>
                                    <div>
                                        <span>Всего выплачено:</span>
                                        <span>
                                            {{ promoCodeStatistics.referrerPaymentsTotalPaid | number }}
                                            <span class="rewards-currency rub"></span>
                                        </span>
                                    </div>
                                    <div class="statistics__label">
                                        <span>Остаток для выплаты:</span>
                                        <span>
                                            {{ promoCodeStatistics.referrerPaymentsTotalUnpaid | number }}
                                            <span class="rewards-currency rub"></span>
                                        </span>
                                    </div>
                                </template>
                            </div>
                        </expanded-panel>
                    </div>
                </v-flex>
            </v-layout>
        </v-container>
    `
})
export class PromoCodesPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;
    /** Сервис для работы с данными клиента */
    @Inject
    private clientService: ClientService;
    /** Сервис для работы с промокодами */
    @Inject
    private promoCodeService: PromoCodeService;
    /** Статистика по промокоду */
    private promoCodeStatistics: PromoCodeStatistics = null;
    /** Текущий таб */
    private currentTab: PromoCodesTab = PromoCodesTab.USER;
    /** Типы табов */
    private promoCodesTab = PromoCodesTab;
    /** Список табок */
    private promoCodesTabs = PromoCodesTab.values();
    /** Список радиокнопок */
    private shareTypes = ShareType.values();
    /** Типы радиокнопок */
    private shareType = ShareType;
    /** Выбранная радиокнопка */
    private currentShareType: ShareType = ShareType.PROMO_CODE;

    /**
     * Инициализация компонента
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        this.promoCodeStatistics = await this.promoCodeService.getPromoCodeStatistics();
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio());
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    /**
     * Открывает диалог принятия условия партнерской программы
     */
    private async openPartnerProgramJoiningDialog(): Promise<void> {
        const result = await new PartnerProgramJoiningDialog().show();
        if (result === BtnReturn.YES) {
            await this.becamePartner();
            this.clientInfo.user.partnershipAgreement = true;
            this.clientInfo.user.referralAwardType = "PAYMENT";
            this.$snotify.info("Вы успешно зарегистрированы в партнерской программе");
        }
    }

    @ShowProgress
    private async becamePartner(): Promise<void> {
        await Promise.all([
            this.clientService.setPartnerShipAgreement(),
            this.promoCodeService.changeReferralAwardType("PAYMENT")
        ]);
    }

    private async requestWithdrawal(): Promise<void> {
        const result = await new PartnershipWithdrawalRequestDialog().show(this.promoCodeStatistics.referrerPaymentsTotalUnpaid);
        if (result) {
            this.$snotify.info("Запрос на вывод средств успешно зарегистрирован");
        }
    }

    private copyPromoCode(): void {
        this.$snotify.info("Промокод скопирован");
    }

    private copyRefLink(): void {
        this.$snotify.info("Реферальная ссылка скопирована");
    }

    private onShareTypeChange(type: ShareType): void {
        this.currentShareType = type;
    }

    /**
     * Возвращает реферальную ссылку
     */
    private get refLink(): string {
        return `${window.location.protocol}//${window.location.host}/?registration=true&ref=${this.clientInfo.user.id}`;
    }

    /**
     * Возвращает признак отображения кнопки Запрос на вывод вознаграждения, если причитаемая сумма больше или равно 5000 рублей
     */
    private get showRequestWithdrawal(): boolean {
        return this.promoCodeStatistics && new Decimal(this.promoCodeStatistics.referrerPaymentsTotalUnpaid).comparedTo(new Decimal("5000")) >= 0;
    }
}

@Enum("code")
export class PromoCodesTab extends (EnumType as IStaticEnum<PromoCodesTab>) {

    static readonly USER = new PromoCodesTab("user", "Пользователям");
    static readonly PARTNER = new PromoCodesTab("partner", "Партнерам");

    private constructor(public code: string, public description: string) {
        super();
    }
}

@Enum("code")
export class ShareType extends (EnumType as IStaticEnum<ShareType>) {

    static readonly PROMO_CODE = new ShareType("PROMO_CODE", "Промокод");
    static readonly LINK = new ShareType("LINK", "Ссылка");

    private constructor(public code: string, public description: string) {
        super();
    }
}
