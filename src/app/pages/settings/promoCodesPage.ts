import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ExpandedPanel} from "../../components/expandedPanel";
import {CatchErrors} from "../../platform/decorators/catchErrors";
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
                    <div class="section-title">Промо-коды</div>
                    <v-card>
                        <div class="promo-codes__steps">
                            <div class="promo-codes__step">
                                <div>Поделитесь промо-кодом или<br>ссылкой на регистрацию</div>
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
                                <div class="light-text">Промо-код</div>
                                <div class="promo-code">{{ clientInfo.user.promoCode }}</div>
                                <div class="btns">
                                    <v-btn>Копировать промо-код</v-btn>
                                    <v-btn>Копировать ссылку</v-btn>
                                </div>
                                <div class="rewards">
                                    <div>Вознаграждения на выбор</div>
                                    <v-radio-group v-model="clientInfo.user.referralAwardType" class="radio-horizontal">
                                      <v-radio label="Подписка" value="SUBSCRIPTION"></v-radio>
                                      <v-radio label="Платеж" value="PAYMENT"></v-radio>
                                    </v-radio-group>
                                    <div v-if="clientInfo.user.referralAwardType === 'SUBSCRIPTION'">
                                        После первой оплаты приглашенного Вами<br>
                                        пользователя вы получите месяц подписки бесплатно.
                                    </div>
                                    <div v-if="clientInfo.user.referralAwardType === 'PAYMENT'">
                                        Вы будете получать 30% от суммы всех оплат<br>
                                        каждого приглашенного Вами пользователя навсегда.<br>
                                        Вывод от 3000 <span class="rewards-currency">RUB</span>
                                    </div>
                                </div>
                            </div>

                            <expanded-panel :value="$uistate.referralStatisticsPanel" :state="$uistate.REFERRAL_STATISTICS_PANEL" class="promo-codes__statistics">
                                <template slot="header">Статистика по реферальной программе</template>
                                <div v-if="promoCodeStatistics" class="statistics">
                                    <div>Всего привлеченных пользователей: {{ promoCodeStatistics.referralCount }}</div>
                                    <div>Из них хоть раз оплативших: {{ promoCodeStatistics.hasPaymentsReferralCount }}</div>
                                    <div>Всего оплат пользователей: {{ promoCodeStatistics.referralPaymentTotalAmount }} <span class="rewards-currency">RUB</span></div>
                                    <div>Всего заработано: {{ promoCodeStatistics.referrerPaymentsTotal }} <span class="rewards-currency">RUB</span></div>
                                    <div>Всего выплачено: {{ promoCodeStatistics.referrerPaymentsTotalPaid }} <span class="rewards-currency">RUB</span></div>
                                    <div class="statistics__label">
                                        Остаток для выплаты: {{ promoCodeStatistics.referrerPaymentsTotalUnpaid }}
                                        <span class="rewards-currency">RUB</span>
                                    </div>
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
    /** Сервис для работы с промо-кодами */
    @Inject
    private promoCodeService: PromoCodeService;
    /** Статистика по промо-коду */
    private promoCodeStatistics: PromoCodeStatistics = null;

    /**
     * Инициализация компонента
     * @inheritDoc
     */
    @CatchErrors
    @ShowProgress
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
