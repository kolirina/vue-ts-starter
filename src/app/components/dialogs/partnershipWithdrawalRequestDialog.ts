/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

import {Inject} from "typescript-ioc";
import {Component} from "../../app/ui";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {Client, ClientService} from "../../services/clientService";
import {PartnershipWithdrawalRequest, PromoCodeService} from "../../services/promoCodeService";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" ref="dialog" persistent max-width="600px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="paddB0">
                    <span class="fs16 bold">Запрос на вывод вознаграждения</span>
                </v-card-title>

                <v-card-text class="paddT0 paddB0">
                    <v-container v-if="withdrawalRequest" grid-list-md class="paddT0 paddB0">
                        <v-layout wrap>
                            <v-form ref="form">
                                <!-- Сумма -->
                                <v-flex xs12 sm12>
                                    <ii-number-field label="Сумма" v-model="withdrawalRequest.amount" :decimals="2" maxLength="11" v-validate="'min_value:5000'"
                                                     :error-messages="errors.collect('amount')" persistent-hint
                                                     hint="Данная сумма вознаграждения будет перечислена вам" name="amount"></ii-number-field>
                                </v-flex>

                                <!-- Контакт -->
                                <v-flex xs12 sm12>
                                    <v-text-field label="Контакт" v-model.trim="withdrawalRequest.contact" :counter="1000" maxLength="1000"
                                                  v-validate="'max:1000'" :error-messages="errors.collect('contact')" name="contact" persistent-hint
                                                  hint="Как с вами можно связаться, если потребуется уточнение. Укажите предпочитаемый способ связи: telegram, email, vk">
                                    </v-text-field>
                                </v-flex>

                                <!-- ФИО -->
                                <v-flex xs12 sm12>
                                    <v-text-field label="ФИО/Наименование юр. лица" v-model.trim="withdrawalRequest.fio" :counter="255" persistent-hint maxLength="255"
                                                  v-validate="'max:255'" :error-messages="errors.collect('fio')" name="fio"
                                                  hint="Укажите ваши Фамилия Имя Отчество или наименование юр. лица"></v-text-field>
                                </v-flex>

                                <!-- ИНН -->
                                <v-flex xs12 sm12>
                                    <v-text-field label="ИНН" v-model="withdrawalRequest.inn" :counter="12" maxLength="12" mask="############" persistent-hint
                                                  v-validate="'min:10|max:12'" :error-messages="errors.collect('inn')" name="inn"
                                                  hint="Укажите ваш ИНН, он должен состоять из 10 цифр для юр.лица или 12 цифр для физ. лица"></v-text-field>
                                </v-flex>

                                <!-- Номер счета получателя -->
                                <v-flex xs12 sm12>
                                    <v-text-field label="Номер счета получателя" v-model="withdrawalRequest.account" :counter="20" maxLength="20" persistent-hint
                                                  mask="####################"
                                                  v-validate="'min:20'" :error-messages="errors.collect('account')" name="account"
                                                  hint="Укажите ваш счет в банке. Он должен состоять из 20 цифр"></v-text-field>
                                </v-flex>

                                <!-- БИК банка -->
                                <v-flex xs12 sm12>
                                    <v-text-field label="БИК банка" v-model="withdrawalRequest.bankBic" :counter="9" mask="#########" maxLength="9" persistent-hint
                                                  v-validate="'min:9'" :error-messages="errors.collect('bankBic')" name="bankBic"
                                                  hint="Укажите БИК вашего банка. Он должен состоять из 9 цифр"></v-text-field>
                                </v-flex>

                                <!-- Признак согласия, если раньше не соглашался -->
                                <v-flex v-if="!clientInfo.partnershipAgreement" xs12 sm12>
                                    <v-checkbox slot="activator" v-model="agree" class="mt-4" v-validate="'required'" hide-details>
                                        <template #label>
                                        <span class="fs12">
                                            Я ознакомился с <a :href="partnershipUrl">Партнерским договором Реферальной Программы</a>
                                        </span>
                                        </template>
                                    </v-checkbox>
                                </v-flex>
                            </v-form>
                        </v-layout>
                        <small class="fs12-opacity">* обозначает обязательные поля</small>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="!isValid || processState" color="primary" dark @click.native="createRequest">Отправить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `,
    components: {CustomDialog}
})
export class PartnershipWithdrawalRequestDialog extends CustomDialog<string, number> {

    @Inject
    private clientService: ClientService;
    /** Сервис для работы с промокодами */
    @Inject
    private promoCodeService: PromoCodeService;
    /** Информация о клиенте */
    private clientInfo: Client = null;
    /** Запрос на вывод */
    private withdrawalRequest: PartnershipWithdrawalRequest = null;
    /** Состояние прогресса */
    private processState = false;
    /** Признак согласия с условиями партнерской программы */
    private agree: boolean = false;

    /**
     * Инициализация данных компонента
     */
    async created(): Promise<void> {
        this.clientInfo = await this.clientService.getClientInfo();
        this.withdrawalRequest = {
            contact: "",
            bankBic: "",
            account: "",
            inn: "",
            fio: "",
            amount: this.data
        };
        await this.$nextTick();
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async createRequest(): Promise<void> {
        this.$validator.errors.clear();
        const result = await this.$validator.validateAll();
        if (!result) {
            return;
        }
        this.processState = true;
        try {
            const [withdrawalRequestNumber, none] = await Promise.all([
                this.promoCodeService.createPartnershipWithdrawalRequest(this.withdrawalRequest),
                this.clientService.setPartnerShipAgreement()
            ]);
            this.clientInfo.partnershipAgreement = true;
            this.close(withdrawalRequestNumber);
        } finally {
            this.processState = false;
        }
    }

    private get isValid(): boolean {
        return this.withdrawalRequest && !!this.withdrawalRequest.amount && !!this.withdrawalRequest.contact && !!this.withdrawalRequest.fio && !!this.withdrawalRequest.inn &&
            !!this.withdrawalRequest.account && !!this.withdrawalRequest.bankBic && (this.clientInfo.partnershipAgreement || this.agree);
    }

    private get partnershipUrl(): string {
        return `${window.location.protocol}//${window.location.host}/partnership-agreement`;
    }
}
