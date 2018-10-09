import {Inject} from 'typescript-ioc';
import Component from 'vue-class-component';
import {Watch} from 'vue-property-decorator';
import {namespace} from 'vuex-class/lib/bindings';
import {ui} from '../../app/ui';
import {ClientService} from '../../services/clientService';
import {ClientInfo} from '../../types/types';
import {StoreType} from '../../vuex/storeType';

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-layout row wrap>
                <v-flex>
                    <v-card>
                        <v-card-title primary-title>
                            <div>
                                <h3 class="headline mb-0">Рекомендуйте сервис друзьям и знакомым, дарите скидку 20% и получайте бонусы</h3>
                                <div>Для рекомендации сервиса поделитесь промо-кодом со скидкой 20% на первую покупку:</div>
                                <v-text-field :value="clientInfo.user.promoCode" class="display-3" readonly box label="Промо-код"></v-text-field>
                                <div>Или просто поделитеcь этой ссылкой на регистрацию:</div>
                                <v-text-field :value="refLink" class="display-3" readonly box label="Реферальная ссылка"></v-text-field>
                                <div>В благодарность за рекомендации мы предоставляем два вида вознаграждений на выбор:</div>
                                <v-btn-toggle v-model="clientInfo.user.referralAwardType">
                                    <v-btn value="SUBSCRIPTION" color="info">
                                        Подписка
                                    </v-btn>
                                    <v-btn value="PAYMENT" color="info">
                                        Платеж
                                    </v-btn>
                                </v-btn-toggle>
                                <div>После первой оплаты каждого приглашенного вами пользователя вы получите месяц подписки бесплатно</div>
                            </div>
                        </v-card-title>
                    </v-card>

                </v-flex>
            </v-layout>
        </v-container>
    `
})
export class PromoCodesPage extends ui {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    @Inject
    private clientService: ClientService;

    private async mounted(): Promise<void> {

    }

    @Watch('clientInfo.user.referralAwardType')
    private async onReferralAwardTypeChange(): Promise<void> {
        console.log('change', this.clientInfo.user.referralAwardType);
        await this.clientService.changeReferralAwardType(this.clientInfo.user.referralAwardType);
    }

    private get refLink(): string {
        return `${window.location.protocol}//${window.location.host}/?registration=true&ref=${this.clientInfo.user.id}`;
    }
}
