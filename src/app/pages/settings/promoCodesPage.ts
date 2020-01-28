import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI} from "../../app/ui";
import {PartnerProgramRulesDialog} from "../../components/dialogs/partnerProgramRulesDialog";
import {ExpandedPanel} from "../../components/expandedPanel";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {ClientInfo, ClientService} from "../../services/clientService";
import {PromoCodeService, PromoCodeStatistics} from "../../services/promoCodeService";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-layout row wrap>
                <v-flex>
                    <v-card flat class="header-first-card">
                        <v-card-title class="header-first-card__wrapper-title">
                            <div class="section-title header-first-card__title-text">Партнерская программа</div>
                        </v-card-title>
                    </v-card>
                    <v-card class="overflowXA" flat>
                        <div class="promo-codes__steps">
                            <div class="promo-codes__step">
                                <div>Поделитесь промокодом или<br>ссылкой на регистрацию</div>
                            </div>
                            <div class="promo-codes__step">
                                <div>Друзья получают скидку 20%<br>на первую покупку</div>
                            </div>
                            <div class="promo-codes__step">
                                <div>Вы получаете подарок<br>на выбор</div>
                            </div>
                        </div>
                        <div class="section-content">
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
                                    <div class="promo-codes__subtitle">Выберите тип вознаграждения</div>
                                    <v-radio-group v-model="clientInfo.user.referralAwardType" @change="onReferralAwardTypeChange" class="radio-horizontal">
                                        <v-radio label="Подписка" value="SUBSCRIPTION"></v-radio>
                                        <v-radio label="Платеж" value="PAYMENT"></v-radio>
                                    </v-radio-group>
                                    <div v-if="clientInfo.user.referralAwardType === 'SUBSCRIPTION'">
                                        После первой оплаты приглашенного Вами<br>
                                        пользователя Вы получите месяц подписки бесплатно.
                                    </div>
                                    <div v-if="clientInfo.user.referralAwardType === 'PAYMENT'">
                                        Вы будете получать 30% от суммы всех оплат<br>
                                        каждого приглашенного Вами пользователя навсегда.<br>
                                        Вывод от 3000 <span class="rewards-currency rub"></span>, через Вашего менеджера
                                    </div>
                                    <div v-if="clientInfo.user.referralAwardType === 'PAYMENT'" class="mt-3">
                                        <a @click.stop="openPartnerProgramRulesDialog">Правила Партнерской программы</a>
                                    </div>
                                    <div v-if="clientInfo.user.referralAwardType === 'PAYMENT'" class="mt-3">
                                        <div>
                                            <div class="promo-codes__subtitle mb-2">Связаться по вопросам сотрудничества</div>
                                            <div>Ваш менеджер: Евгений</div>
                                            Telegram: <a href="https://telegram.me/intelinvest_partner" title="Задайте вопрос в Telegram"
                                                         target="_blank" class="decorationNone">@intelinvest_partner</a><br/>
                                            ВК: <a href="https://vk.com/intelinvest_partner" target="_blank" class="decorationNone">https://vk.com/intelinvest_partner</a><br/>
                                            Email: <a href="mailto:partner@intelinvest.ru" target="_blank" class="decorationNone">partner@intelinvest.ru</a><br/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <expanded-panel v-if="promoCodeStatistics" :value="$uistate.referralStatisticsPanel" :state="$uistate.REFERRAL_STATISTICS_PANEL"
                                            class="promo-codes__statistics">
                                <template #header>Статистика по реферальной программе</template>
                                <div class="statistics">
                                    <div>
                                        <span>Привлеченных пользователей:</span>{{ promoCodeStatistics.referralCount }}
                                    </div>
                                    <div>
                                        <span>Из них хоть раз оплативших:</span>{{ promoCodeStatistics.hasPaymentsReferralCount }}
                                    </div>
                                    <template v-if="clientInfo.user.referralAwardType === 'PAYMENT'">
                                        <div>
                                            <span>Всего заработано:</span>{{ promoCodeStatistics.referrerPaymentsTotal }}
                                            <span class="rewards-currency rub"></span>
                                        </div>
                                        <div>
                                            <span>Всего выплачено:</span>{{ promoCodeStatistics.referrerPaymentsTotalPaid }}
                                            <span class="rewards-currency rub"></span>
                                        </div>
                                        <div class="statistics__label">
                                            <span>Остаток для выплаты:</span>{{ promoCodeStatistics.referrerPaymentsTotalUnpaid }}
                                            <span class="rewards-currency rub"></span>
                                        </div>
                                    </template>
                                </div>
                            </expanded-panel>
                        </div>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    `,
    components: {ExpandedPanel}
})
export class PromoCodesPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    /** Сервис для работы с данными клиента */
    @Inject
    private clientService: ClientService;
    /** Сервис для работы с промокодами */
    @Inject
    private promoCodeService: PromoCodeService;
    /** Статистика по промокоду */
    private promoCodeStatistics: PromoCodeStatistics = null;

    /**
     * Инициализация компонента
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        this.promoCodeStatistics = await this.promoCodeService.getPromoCodeStatistics();
    }

    @ShowProgress
    private async onReferralAwardTypeChange(): Promise<void> {
        await this.promoCodeService.changeReferralAwardType(this.clientInfo.user.referralAwardType);
    }

    private async openPartnerProgramRulesDialog(): Promise<void> {
        await new PartnerProgramRulesDialog().show();
    }

    private copyPromoCode(): void {
        this.$snotify.info("Промокод скопирован");
    }

    private copyRefLink(): void {
        this.$snotify.info("Реферальная ссылка скопирована");
    }

    /**
     * Возвращает реферальную ссылку
     */
    private get refLink(): string {
        return `${window.location.protocol}//${window.location.host}/?registration=true&ref=${this.clientInfo.user.id}`;
    }
}
