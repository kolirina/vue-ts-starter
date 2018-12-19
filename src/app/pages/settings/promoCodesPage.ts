import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
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
                    <v-card>
                        <v-card-title primary-title>
                            <div class="promo-codes">
                                <h4 class="display-1">Промо-коды</h4>
                                <h3 class="headline mb-0">Рекомендуйте сервис друзьям и знакомым, дарите скидку 20% и получайте бонусы</h3>

                                <div>Для рекомендации сервиса поделитесь промо-кодом со скидкой 20% на первую покупку:</div>
                                <v-text-field :value="clientInfo.user.promoCode" class="display-1" readonly box label="Промо-код"></v-text-field>

                                <div>Или просто поделитеcь этой ссылкой на регистрацию:</div>
                                <v-text-field :value="refLink" class="headline" readonly box label="Реферальная ссылка"></v-text-field>

                                <div>В благодарность за рекомендации мы предоставляем два вида вознаграждений на выбор:</div>
                                <v-btn-toggle v-model="clientInfo.user.referralAwardType" dark class="promo-code-type">
                                    <v-btn value="SUBSCRIPTION" color="info">
                                        Подписка
                                    </v-btn>
                                    <v-btn value="PAYMENT" color="info">
                                        Платеж
                                    </v-btn>
                                </v-btn-toggle>
                                <div v-if="clientInfo.user.referralAwardType === 'SUBSCRIPTION'">
                                    После первой оплаты каждого приглашенного вами пользователя вы получите месяц подписки бесплатно
                                </div>
                                <div v-if="clientInfo.user.referralAwardType === 'PAYMENT'">
                                    Вы будете получать 30% от суммы всех оплат каждого приглашенного вами пользователя навсегда. Вывод от 3000 рублей.
                                </div>
                            </div>

                            <v-expansion-panel focusable expand :value="$uistate.referralStatisticsPanel">
                                <v-expansion-panel-content :lazy="true" v-state="$uistate.REFERRAL_STATISTICS_PANEL">
                                    <div slot="header">Статистика по реферальной программе</div>
                                    <v-card>
                                        <div v-if="promoCodeStatistics" class="statistics">
                                            <div class="statistics__label">Всего привлеченных пользователей:</div>
                                            <span class="statistics__value">{{ promoCodeStatistics.referralCount }}</span>

                                            <div class="statistics__label">Из них хоть раз оплативших:</div>
                                            <span class="statistics__value">{{ promoCodeStatistics.hasPaymentsReferralCount }}</span>

                                            <div class="statistics__label">Всего оплат пользователей:</div>
                                            <span class="statistics__value">{{ promoCodeStatistics.referralPaymentTotalAmount }}</span>

                                            <div class="statistics__label">Всего заработано:</div>
                                            <span class="statistics__value">{{ promoCodeStatistics.referrerPaymentsTotal }}</span>

                                            <div class="statistics__label">Всего выплачено:</div>
                                            <span class="statistics__value">{{ promoCodeStatistics.referrerPaymentsTotalPaid }}</span>

                                            <div class="statistics__label">Остаток для выплаты:</div>
                                            <span class="statistics__value">{{ promoCodeStatistics.referrerPaymentsTotalUnpaid }}</span>
                                        </div>
                                    </v-card>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-card-title>
                    </v-card>

                </v-flex>
            </v-layout>
        </v-container>
    `
})
export class PromoCodesPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    /** Сервис для работы с данными клиента */
    @Inject
    private clientService: ClientService;
    /** Сервис для работы с промо-кодами */
    @Inject
    private promoCodeService: PromoCodeService;
    /** Статистика по промо-коду */
    private promoCodeStatistics: PromoCodeStatistics = null;

    /**
     * Инициализация компонента
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.promoCodeStatistics = await this.promoCodeService.getPromoCodeStatistics(this.clientInfo.user.id);
    }

    @Watch("clientInfo.user.referralAwardType")
    private async onReferralAwardTypeChange(): Promise<void> {
        await this.promoCodeService.changeReferralAwardType(this.clientInfo.user.referralAwardType);
    }

    /**
     * Возвращает реферальную ссылку
     */
    private get refLink(): string {
        return `${window.location.protocol}//${window.location.host}/?registration=true&ref=${this.clientInfo.user.id}`;
    }
}
