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
import {Component, namespace, UI} from "../../../app/ui";
import {ConfirmDialog} from "../../../components/dialogs/confirmDialog";
import {UnsubscribedAnswerDialog} from "../../../components/dialogs/unsubscribedAnswerDialog";
import {ShowProgress} from "../../../platform/decorators/showProgress";
import {BtnReturn} from "../../../platform/dialogs/customDialog";
import {ClientInfo, ClientService} from "../../../services/clientService";
import {CancelOrderRequest, TariffService, UserPaymentInfo} from "../../../services/tariffService";
import {EventType} from "../../../types/eventType";
import {Tariff} from "../../../types/tariff";
import {CommonUtils} from "../../../utils/commonUtils";
import {DateUtils} from "../../../utils/dateUtils";
import {MutationType} from "../../../vuex/mutationType";
import {StoreType} from "../../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Профиль</div>
                </v-card-title>
            </v-card>
            <v-layout class="profile" column>
                <div class="card__header">
                    <div class="card__header-title">
                        <img src="./img/profile/payment-method.svg" alt="">
                        <div>
                            <span>Способ оплаты</span>
                            <div @click="goBack" class="back-btn">Назад</div>
                        </div>
                    </div>
                </div>
                <v-layout class="wrapper-payment-info margB20" column>
                    <v-card flat>
                        <span class="profile__subtitle">Тарифный план</span>
                        <div class="mt-3">
                            <div class="wrapper-payment-info__title">{{ clientInfo.user.tariff.description }}</div>
                            <span class="wrapper-payment-info__description">{{ expirationDescription }}</span>
                        </div>
                    </v-card>
                    <v-card v-if="hasPaymentInfo" class="margT20" flat>
                        <span class="profile__subtitle">Способ оплаты</span>
                        <v-layout class="profile__payment-method mt-3">
                            <div class="mr-4">
                                <v-tooltip content-class="custom-tooltip-wrap payment-card-hint" max-width="280px" bottom nudge-right="60">
                                    <div slot="activator">
                                        <v-layout align-center>
                                            <div class="wrapper-payment-info__title pan">
                                                {{ paymentInfo.pan }}
                                            </div>
                                        </v-layout>
                                        <div class="wrapper-payment-info__description">{{ paymentInfo.expDate }}</div>
                                    </div>
                                    <span class="fs13">У вас активировано автоматическое продление подписки, вы можете отменить ее с помощью кнопки "Отвязать карту".</span>
                                </v-tooltip>
                            </div>
                            <v-btn @click.stop="cancelOrderSchedule" class="mt-0" color="#EBEFF7">
                                Отвязать карту
                            </v-btn>
                        </v-layout>
                    </v-card>
                </v-layout>
            </v-layout>
        </v-container>
    `
})
export class ProfilePaymentPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;
    @MainStore.Getter
    private expiredTariff: boolean;
    /** Сервис для работы с данными клиента */
    @Inject
    private clientService: ClientService;
    /** Сервис для работы с тарифами */
    @Inject
    private tariffService: TariffService;
    /** Платежная информация пользователя */
    private paymentInfo: UserPaymentInfo = null;

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        if (![Tariff.FREE, Tariff.TRIAL].includes(this.clientInfo.user.tariff)) {
            this.paymentInfo = await this.tariffService.getPaymentInfo();
        }
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio());
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    /**
     * Отменяет автоматическую подписку
     */
    private async cancelOrderSchedule(): Promise<void> {
        const result = await new ConfirmDialog().show("Вы уверены, что хотите отменить подписку? Автоматическое продление будет отключено. " +
            " После окончания подписки некоторые услуги могут стать недоступны.");
        if (result !== BtnReturn.YES) {
            return;
        }
        const request = await new UnsubscribedAnswerDialog().show();
        if (request) {
            await this.cancelOrderScheduleConfirmed(request);
            this.paymentInfo = await this.tariffService.getPaymentInfo();
            this.$snotify.info("Автоматическое продление подписки успешно отключено");
        }
    }

    @ShowProgress
    private async cancelOrderScheduleConfirmed(request: CancelOrderRequest): Promise<void> {
        await this.tariffService.cancelOrderSchedule(request);
    }

    private goBack(): void {
        this.$router.push({name: "profile"});
    }

    /**
     * Возвращает признак наличия информации о периодической подписке
     */
    private get hasPaymentInfo(): boolean {
        return this.paymentInfo && CommonUtils.exists(this.paymentInfo.pan) && CommonUtils.exists(this.paymentInfo.expDate);
    }

    private get expirationDescription(): string {
        return `${this.expiredTariff ? "истек " : "действует до "} ${this.expirationDate}`;
    }

    private get expirationDate(): string {
        return DateUtils.formatDate(DateUtils.parseDate(this.clientInfo.user.paidTill));
    }
}
