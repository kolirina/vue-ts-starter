import moment from "moment";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {Permission} from "../../types/permission";
import {Tariff} from "../../types/tariff";
import {ClientInfo} from "../../types/types";
import {DateUtils} from "../../utils/dateUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card>
                <v-card-text>
                    <h4 class="display-1">Тарифы</h4>
                    <div class="tariff">
                        <h2 class="title">
                            Выберите подходящий вам тарифный план
                        </h2>

                        <div class="subtitle">
                            <p>
                                У вас подключен план {{ clientInfo.user.tariff }} до
                                <b>
                                    <span>{{ clientInfo.user.paidTill | date }}</span>
                                    <span v-if="isSubscriptionExpired">(срок подписки истек)</span>
                                </b>

                                <span id="payment-loader" style="display: none">
                        <span id="check_payment"/>
                    </span>
                            </p>
                            <p>
                                Создано портфелей: <b>{{ clientInfo.user.portfoliosCount }}</b>, добавлено ценных бумаг: <b>{{ clientInfo.user.sharesCount }}</b>
                            </p>
                            <p v-if="clientInfo.user.foreignShares">
                                В ваших портфелях имеются сделки с валютой или по иностранным ценным бумагам
                            </p>
                            <p>
                                Применить промо-код:
                                <v-text-field v-model="promoCode" maxlength="10" size="10" @keypress.enter="applyPromoCode"></v-text-field>
                                <a @click="applyPromoCode">Применить</a>
                            </p>

                            <p style="font-size: 12px; padding-top: 15px;">
                                Не хотите платить? Порекомендуйте сервис, поделитесь промо-кодом на скидку 20% - и получите бесплатный месяц подписки.
                                <a @click="$router.push({name: 'promo-codes'})">Подробнее</a>
                            </p>
                        </div>

                        <p v-if="isDiscountApplied" class="promotion" style="color: black">
                            Совершите покупку с вашей персональной скидкой <b>{{ clilentInfo.user.nextPurchaseDiscount }}%</b>!
                        </p>

                        <div class="tab" id="planTabs">
                            <div class="tab-ctrl">
                                <v-btn color="primary" @click="monthly = true" :class="{'tab-btn': true, 'active': monthly}">На месяц</v-btn>

                                <v-btn color="primary" @click="monthly = false" :class="{'tab-btn': true, 'active': monthly}">
                                    На год{{ isDiscountApplied() ? '' : ' (дешевле на 20%)'}}
                                </v-btn>
                            </div>

                            <div class="tab-items active">
                                <div class="tab-item #{tariffBean.isSelected('FREE') ? 'selected' : ''}">
                                    <div class="tab-item__icon">
                                        <span/>
                                        <v-img src="/resources/images/tariff/1.svg"></v-img>
                                    </div>

                                    <p class="tab-item__heading">
                                        Бесплатный
                                    </p>

                                    <ul class="tab-item__list" :style="isDiscountApplied() ? 'margin-bottom: 29px' : ''">
                                        <li>
                                            7 ценных бумаг<br/>
                                            1 портфель
                                        </li>
                                        <li>
                                            Базовый функционал сервиса без ограничений
                                        </li>
                                    </ul>
                                    <p class="tab-item__price">
                                        {{ getPriceLabel("FREE") }}
                                    </p>

                                    <p v-if="isSelected('FREE')" class="tab-item__expires">
                                        {{ getExpirationDescription() }}
                                    </p>

                                    <v-tooltip v-if="!clientInfo.user.emailConfirmed || isDownloadNotAllowed()" bottom>
                                        <v-btn color="primary" @click="makePayment('FREE')"
                                               class="tab-item__link" :style="isSelected('FREE') ? 'margin-top: 10px' : ''"
                                               :disabled="!isAvailable('FREE') || isSelected('FREE')">
                                            {{ getButtonLabel('FREE') }}
                                        </v-btn>
                                        <span v-if="isDownloadNotAllowed()">Экспорт сделок в csv-формат недоступен на TRIAL-плане.
                                           Переход на Бесплатный тарифный план&lt;br/&gt; возможен только если не превышены лимиты.
                                        </span>
                                    </v-tooltip>
                                </div>


                                <div :class="{'tab-item':  true, 'selected': isSelected('STANDARD')}">
                                    <div class="tab-item__icon">
                                        <span></span>
                                        <v-img src="/resources/images/tariff/2.svg"></v-img>
                                    </div>

                                    <p class="tab-item__heading">
                                        Стандарт
                                    </p>

                                    <ul class="tab-item__list">
                                        <li>
                                            Неограниченное кол-во ценных бумаг<br/>
                                            2 портфеля
                                        </li>
                                        <li>
                                            «Бесплатный»
                                        </li>
                                        <li>
                                            Доступ к разделу “Инвестиции”
                                        </li>

                                        <li>
                                            Составной портфель
                                        </li>

                                        <li>
                                            <b>Мобильное приложение</b>
                                        </li>
                                    </ul>

                                    <p v-if="isDiscountApplied()" class="tab-item__old_price">
                                        {{ getNoDiscountPriceLabel("STANDARD") }}
                                    </p>

                                    <p class="tab-item__price">
                                        {{ getPriceLabel("STANDARD") }}
                                    </p>

                                    <p v-if="isSelected('STANDARD')" class="tab-item__expires">
                                        {{ getExpirationDescription() }}
                                    </p>

                                    <a @click="makePayment('STANDARD')" class="tab-item__link" :style="isSelected('STANDARD') ? 'margin-top: 10px' : ''"
                                       :disabled="!isAvailable('STANDARD')">{{ getButtonLabel('STANDARD') }}</a>
                                </div>


                                <div class="tab-item #{tariffBean.isSelected('PRO') ? 'selected' : ''}">
                                    <div class="tab-item__icon">
                                        <span/>
                                        <v-img src="/resources/images/tariff/3.svg"></v-img>
                                    </div>

                                    <p class="tab-item__heading">
                                        Профессионал
                                    </p>

                                    <ul class="tab-item__list">
                                        <li>
                                            Неограниченное кол-во портфелей и ценных бумаг
                                        </li>
                                        <li>
                                            «Стандарт»
                                        </li>
                                        <li>
                                            Учет зарубежных акций
                                        </li>
                                        <li>
                                            Учет коротких позиций
                                        </li>
                                        <li>
                                            Ранний доступ к новому функционалу
                                        </li>
                                        <li>
                                            <b>Мобильное приложение</b>
                                        </li>
                                    </ul>

                                    <p v-if="isDiscountApplied()" class="tab-item__old_price">
                                        {{ getNoDiscountPriceLabel("PRO") }}
                                    </p>

                                    <p class="tab-item__price">
                                        {{ getPriceLabel("PRO") }}
                                    </p>

                                    <ui:fragment rendered="{{ isSelected('PRO') }}">
                                        <p class="tab-item__expires">
                                            {{ getExpirationDescription() }}
                                        </p>
                                    </ui:fragment>

                                    <a @click="makePayment('PRO')" class="tab-item__link" :style="isSelected('PRO') ? 'margin-top: 10px' : ''"
                                       :disabled="!isAvailable('PRO')">{{ getButtonLabel('PRO') }}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-container>`
})
export class TariffsPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    private promoCode = "";
    /** Признак оплаты за месяц. */
    private monthly = true;

    async mounted(): Promise<void> {

    }

    private async applyPromoCode(): Promise<void> {

    }

    private getPriceLabel(tariff: string): string {
        return ""; // new DecimalFormat("#0.##").format(getPrice(tariff)) + (monthly ? " / месяц" : " / год");
    }

    private getNoDiscountPriceLabel(tariff: string): string {
        return ""; // new DecimalFormat("#0.##").format(getPrice(tariff)) + (monthly ? " / месяц" : " / год");
    }

    /**
     * Возвращает признак истекшей подписки
     */
    private isSubscriptionExpired(): boolean {
        return moment().isAfter(DateUtils.parseDate(this.clientInfo.user.paidTill));
    }

    /**
     * Возвращает признак того что для пользователя действует скидка. При соблюдении условий:
     * <ul>
     *     <il>Дата истечения скидки равна {@code null} или больше текущей даты</il>
     *     <il>скидка больше 0</il>
     * </ul>
     * @return признак того что для пользователя действует скидка
     */
    private isDiscountApplied(): boolean {
        const nextPurchaseDiscountExpired = DateUtils.parseDate(this.clientInfo.user.nextPurchaseDiscountExpired);
        return (nextPurchaseDiscountExpired == null || moment().isBefore(nextPurchaseDiscountExpired)) && this.clientInfo.user.nextPurchaseDiscount > 0;
    }

    private isSelected(tariff: Tariff): boolean {
        let userTariff = this.clientInfo.user.tariff;
        if (userTariff === Tariff.TRIAL) {
            userTariff = Tariff.PRO;
        }
        return userTariff === tariff;
    }

    private getButtonLabel(tariff: Tariff): string {
        if (!this.isAvailable(tariff)) {
            return "Недоступно";
        }
        if (this.isSelected(tariff)) {
            return tariff === Tariff.FREE ? "Подключен" : "Продлить";
        }
        return "Подключить";
    }

    private isAvailable(tariff: Tariff): boolean {
        return tariff.maxSharesCount >= this.clientInfo.user.sharesCount &&
            tariff.maxPortfoliosCount >= this.clientInfo.user.portfoliosCount &&
            (tariff.hasPermission(Permission.FOREIGN_SHARES) || !this.clientInfo.user.foreignShares);
    }

    private getExpirationDescription(): string {
        const paidTill = DateUtils.parseDate(this.clientInfo.user.paidTill);
        return (paidTill.isAfter(moment()) ? "Действует до " : "Истек ") + this.getExpirationDate();
    }

    private getExpirationDate(): string {
        return DateUtils.formatDate(DateUtils.parseDate(this.clientInfo.user.paidTill));
    }
}
