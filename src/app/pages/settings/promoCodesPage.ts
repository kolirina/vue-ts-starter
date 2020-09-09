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
                    <div class="section-content">
                        <div class="promo-codes">
                            <template v-if="isPartnerTab">
                                <div class="promo-codes__title">
                                    <div class="promo-codes__img-partner"></div>
                                    <div>Зарабатывайте с Intelinvest!</div>
                                    <v-tooltip content-class="custom-tooltip-wrap" :max-width="450" bottom right>
                                        <v-icon slot="activator">far fa-question-circle</v-icon>
                                        <span>
                                            <b>Условия партнерской программы:</b>
                                            <p class="margT16">1. Зарегистрироваться в Intelinvest и принять партнерское соглашение</p>
                                            <p>2. Скопировать индивидуальную ссылку и разместить ее в социальных сетях, блоге или курсе обучения</p>
                                            <p>3. Продемонстрировать полезность использования сервиса и предложить воспользоваться 20% скидкой</p>
                                            <p>4. Отслеживать результаты в личном кабинете и выводить<br>от 5 000 рублей в любой момент</p>
                                            <!-- TODO: добавить ссылку-->
                                            <a href="#" class="decorationNone">Узнать подробнее</a>
                                        </span>
                                    </v-tooltip>
                                </div>
                                <ul>
                                    <li>Рекомендуйте нас в социальных сетях, блоге или обучающем курсе</li>
                                    <li>Получайте 30% от оплат рефералов</li>
                                    <li>Выводите вознаграждение от 5000 до 100 000 рублей</li>
                                </ul>
                            </template>
                            <template v-else>
                                <div class="promo-codes__title">
                                    <div class="promo-codes__img-user"></div>
                                    <span>Учитывайте инвестиции бесплатно!</span>
                                </div>
                                <ul>
                                    <li>Поделитесь ссылкой с друзьями</li>
                                    <li>Получите месяц в подарок за каждую оплату приглашенного Вами пользователя</li>
                                </ul>
                            </template>
                            <v-radio-group v-model="currentShareType">
                                <v-radio v-for="type in shareTypes" :key="type.code" :label="type.description"
                                         :value="type" @change="onShareTypeChange"></v-radio>
                            </v-radio-group>
                            <div class="share-box">
                                <div class="promo-code__wrapper">
                                    <v-text-field :value="shareValue" placeholder="url для доступа к портфелю" readonly hide-details class="public-link"></v-text-field>
                                    <v-btn v-clipboard="() => shareValue" @click="copyShareValue">Копировать</v-btn>
                                </div>
                                <div class="share-box__links">
                                    <a class="intel-icon icon-circle-vk"></a>
                                    <a class="intel-icon icon-circle-fb"></a>
                                    <a class="intel-icon icon-circle-telegram"></a>
                                    <a class="intel-icon icon-circle-mail"></a>
                                    <a class="intel-icon icon-circle-more"></a>
                                </div>
                            </div>
                            <div v-if="isPartnerTab" class="achievements">
                                <div class="promo-codes__title"><span>Достижения</span></div>
                                <div class="achievements__items">
                                    <div class="achievements__item intel-icon icon-achievement-1"></div>
                                    <div class="achievements__item intel-icon icon-achievement-5"></div>
                                    <div class="achievements__item intel-icon icon-achievement-lock"></div>
                                    <div class="achievements__item intel-icon icon-achievement-lock"></div>
                                    <div class="achievements__item intel-icon icon-achievement-lock"></div>
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
                                <template v-if="isPartnerTab">
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
                        <expanded-panel v-if="isPartnerTab" class="rewards promo-codes__statistics">
                            <template #header>Связаться по вопросам сотрудничества</template>
                                <div>
                                    <span>Ваш менеджер</span>
                                    <span>Евгений</span>
                                </div>
                                <div>
                                    <span>Telegram</span>
                                    <span><a href="https://telegram.me/intelinvest_partner" title="Задайте вопрос в Telegram"
                                             target="_blank" class="decorationNone">@intelinvest_partner</a></span>
                                </div>
                                <div>
                                    <span>VK</span>
                                    <span><a href="https://vk.com/intelinvest_partner" target="_blank" class="decorationNone">https://vk.com/intelinvest_partner</a></span>
                                </div>
                                <div>
                                    <span>Email</span>
                                    <span><a href="mailto:partner@intelinvest.ru" target="_blank" class="decorationNone">partner@intelinvest.ru</a></span>
                                </div>
                        </expanded-panel>
                        <v-btn v-if="showRequestWithdrawal" class="mt-3" primary @click.stop="requestWithdrawal">Запрос на вывод вознаграждения</v-btn>
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

    private copyShareValue(): void {
        this.$snotify.info(this.currentShareType === ShareType.PROMO_CODE ? "Промокод скопирован" : "Реферальная ссылка скопирована");
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

    /** Значение поля "Поделиться" */
    private get shareValue(): string {
        return this.currentShareType === ShareType.PROMO_CODE ? this.clientInfo.user.promoCode.val : this.refLink;
    }

    /** Признак того, что выбратнный таб "Партнер" */
    private get isPartnerTab(): boolean {
        return this.currentTab === PromoCodesTab.PARTNER;
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
