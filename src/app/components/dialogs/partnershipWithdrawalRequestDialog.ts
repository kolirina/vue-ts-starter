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
import {PartnerPayoutSettings, PayoutType, PromoCodeService} from "../../services/promoCodeService";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" ref="dialog" persistent max-width="600px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="paddB0">
                    <span class="fs16 bold">Настройка вывода</span>
                </v-card-title>

                <v-card-text class="paddT0 paddB0">
                    <v-container v-if="withdrawalRequest" grid-list-md class="paddT0 paddB0">
                        <v-layout row wrap>
                            <v-radio-group v-model="currentType" hide-details class="mb-2">
                                <v-radio v-for="type in payoutTypes" :key="type.code" :label="type.description" :value="type" @change="onPayoutTypeChange"></v-radio>
                            </v-radio-group>
                        </v-layout>
                        <v-layout wrap>
                            <span class="fs12 mb-2">
                                <template v-if="currentType === PayoutType.WIRE">
                                    Перевод денежных средств будет осуществляться 1 раз в месяц (15-20 числах) по банковским реквизитам, указанным ниже.
                                    Перевод осуществляется только если сумма накоплений не меньше 5000 рублей.
                                </template>
                                <template v-else>
                                    Свяжитесь, пожалуйста, с Вашим менеджером для обсуждения способа вывода.
                                    Вывод в индивидуальном порядке осуществляется при накоплениях более 30000 рублей.
                                </template>
                            </span>
                            <v-form ref="form">
                                <!-- Контакт -->
                                <v-flex xs12 sm12>
                                    <v-text-field label="Контакт" v-model.trim="withdrawalRequest.contact" :counter="1000" maxLength="1000"
                                                  v-validate="'max:1000'" :error-messages="errors.collect('contact')" name="contact" persistent-hint
                                                  hint="Как с вами можно связаться, если потребуется уточнение. Укажите предпочитаемый способ связи: telegram, email, vk">
                                    </v-text-field>
                                </v-flex>

                                <template v-if="currentType === PayoutType.WIRE">
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

                                    <!-- КПП -->
                                    <v-flex xs12 sm12>
                                        <v-text-field label="КПП" v-model="withdrawalRequest.kpp" :counter="9" maxLength="9" mask="#########" persistent-hint
                                                      v-validate="'min:9|max:9'" :error-messages="errors.collect('kpp')" name="kpp"
                                                      hint="Укажите КПП банка, он должен состоять из 9 цифр"></v-text-field>
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
                                </template>
                                <!-- Комментарий -->
                                <v-flex xs12 sm12>
                                    <v-text-field :label="currentType === PayoutType.WIRE ? 'Комментарий' : 'Подробности (реквизиты)'" v-model.trim="withdrawalRequest.comment"
                                                  :counter="1000" maxLength="1000" v-validate="'max:1000'" :error-messages="errors.collect('comment')"
                                                  name="comment" persistent-hint hint="Произвольный комментарий, если требуются уточнения">
                                    </v-text-field>
                                </v-flex>

                                <!-- Признак согласия, если раньше не соглашался -->
                                <v-flex xs12 sm12>
                                    <v-checkbox slot="activator" v-model="policyAgree" class="mt-4" v-validate="'required'" hide-details>
                                        <template #label>
                                        <span class="fs12">
                                            Нажимая на кнопку <b>Сохранить</b>, я даю <a :href="policyUrl" target="_blank">согласие на обработку персональных данных</a>
                                        </span>
                                        </template>
                                    </v-checkbox>
                                </v-flex>

                                <!-- Признак согласия, если раньше не соглашался -->
                                <v-flex v-if="!clientInfo.partnershipAgreement" xs12 sm12>
                                    <v-checkbox slot="activator" v-model="partnershipAgree" class="mt-4" v-validate="'required'" hide-details>
                                        <template #label>
                                        <span class="fs12">
                                            Я ознакомился с <a :href="partnershipUrl" target="_blank">Партнерским договором Реферальной Программы</a>
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
                    <v-btn :disabled="!isValid || processState" color="primary" dark @click.native="createRequest">Сохранить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `,
    components: {CustomDialog}
})
export class PartnershipWithdrawalRequestDialog extends CustomDialog<void, boolean> {

    @Inject
    private clientService: ClientService;
    /** Сервис для работы с промокодами */
    @Inject
    private promoCodeService: PromoCodeService;
    /** Информация о клиенте */
    private clientInfo: Client = null;
    /** Запрос на вывод */
    private withdrawalRequest: PartnerPayoutSettings = null;
    /** Состояние прогресса */
    private processState = false;
    /** Признак согласия с условиями партнерской программы */
    private partnershipAgree: boolean = false;
    /** Признак согласия с условиями партнерской программы */
    private policyAgree: boolean = false;
    /** Признак согласия с условиями партнерской программы */
    private currentType: PayoutType = PayoutType.WIRE;
    /** Типы выплат */
    private payoutTypes = PayoutType.values();
    /** Типы выплат */
    private PayoutType = PayoutType;

    /**
     * Инициализация данных компонента
     */
    async created(): Promise<void> {
        this.clientInfo = await this.clientService.getClientInfo();
        const userSettings = await this.loadPayoutSettings();
        if (userSettings) {
            this.withdrawalRequest = {...userSettings};
            this.currentType = userSettings.type === PayoutType.WIRE.code ? PayoutType.WIRE : PayoutType.OTHER;
        } else {
            this.withdrawalRequest = {
                id: null,
                contact: "",
                bankBic: "",
                account: "",
                inn: "",
                kpp: "",
                fio: "",
                comment: "",
                type: this.currentType.code,
            };
        }
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
            await this.promoCodeService.savePayoutSettings(this.withdrawalRequest);
            if (!this.clientInfo.partnershipAgreement) {
                await this.clientService.setPartnerShipAgreement();
            }
            this.withdrawalRequest = {...await this.loadPayoutSettings()};
            this.clientInfo.partnershipAgreement = true;
            this.close(true);
        } finally {
            this.processState = false;
        }
    }

    private async loadPayoutSettings(): Promise<PartnerPayoutSettings> {
        return this.promoCodeService.getPayoutSettings();
    }

    private onPayoutTypeChange(type: PayoutType): void {
        this.currentType = type;
        this.withdrawalRequest.type = this.currentType.code;
    }

    private get isValid(): boolean {
        return this.withdrawalRequest &&
            ((this.currentType === PayoutType.WIRE && !!this.withdrawalRequest.contact && !!this.withdrawalRequest.fio &&
                !!this.withdrawalRequest.kpp && !!this.withdrawalRequest.inn && !!this.withdrawalRequest.account && !!this.withdrawalRequest.bankBic) ||
                (this.currentType === PayoutType.OTHER && !!this.withdrawalRequest.contact))
            && (this.clientInfo.partnershipAgreement || this.partnershipAgree) && this.policyAgree;
    }

    private get partnershipUrl(): string {
        return `${window.location.protocol}//${window.location.host}/partnership-agreement`;
    }

    private get policyUrl(): string {
        return `${window.location.protocol}//${window.location.host}/privacy-policy`;
    }
}
