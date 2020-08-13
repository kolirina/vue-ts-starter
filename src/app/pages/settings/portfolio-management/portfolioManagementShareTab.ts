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
import {Component, namespace, Prop, UI} from "../../../app/ui";
import {BrokerSwitcher} from "../../../components/brokerSwitcher";
import {ShowProgress} from "../../../platform/decorators/showProgress";
import {ClientInfo, ClientService} from "../../../services/clientService";
import {PortfolioParams, PortfolioService} from "../../../services/portfolioService";
import {Tariff} from "../../../types/tariff";
import {CommonUtils} from "../../../utils/commonUtils";
import {StoreType} from "../../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div>
            <div class="portfolio-management-tab__wrapper">
                <v-switch v-model="access" @change="onAccessChange" :readonly="settingsNotAllowed" class="margB20">
                    <template #label>
                        <span>Публичный доступ {{access ? "открыт" : "закрыт"}}</span>
                        <tooltip v-if="settingsNotAllowed">
                            Публичный доступ к портфелю недоступен на Бесплатном тарифе<br/>
                            Пожалуйста обновите тариф, чтобы воспользоваться всеми преимуществами сервиса.
                        </tooltip>
                    </template>
                </v-switch>
            </div>
            <v-fade-transition mode="out-in" group>
                <template v-if="access">
                    <div class="portfolio-management-tab__flex-row" key="1">
                        <v-text-field :value="link" placeholder="url для доступа к портфелю" readonly hide-details class="public-link"></v-text-field>
                        <div class="portfolio-management-tab__wrap-row">
                            <v-btn class="btn" v-clipboard="() => link" slot="activator" @click="copyLink">
                                Копировать ссылку
                            </v-btn>
                            <v-menu content-class="qr-code-section"
                                    transition="slide-y-transition"
                                    nudge-bottom="36" left class="settings-menu"
                                    :close-on-content-click="false">
                                <v-btn class="btn qr-code-btn" slot="activator">
                                    QR code
                                </v-btn>
                                <v-list dense>
                                    <v-flex>
                                        <qriously :value="link" :size="120"></qriously>
                                    </v-flex>
                                </v-list>
                            </v-menu>
                        </div>
                    </div>
                    <div class="portfolio-management-tab__wrapper" key="2">
                        <v-layout column class="default-access-content">
                            <v-flex xs12 class="mb-2">
                                <v-checkbox slot="activator" v-model="linkAccess" @change="onAccessChange"
                                            hide-details class="shrink mr-2 mt-0 portfolio-default-text">
                                    <template #label>
                                        Доступ только по ссылке
                                        <tooltip>
                                            Если включено, портфель не будет публиковаться в разделе Публичные портфели
                                            и пользователи сервиса не смогут просмотреть или проголосовать за него
                                        </tooltip>
                                    </template>
                                </v-checkbox>
                            </v-flex>
                            <v-flex xs12 class="mb-2">
                                <v-checkbox v-model="portfolio.dividendsAccess" :true-value="false" :false-value="true"
                                            hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                            label="Скрыть дивиденды"></v-checkbox>
                            </v-flex>
                            <v-flex xs12 class="mb-2">
                                <v-checkbox v-model="portfolio.tradesAccess" :true-value="false" :false-value="true"
                                            hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                            label="Скрыть сделки"></v-checkbox>
                            </v-flex>
                            <v-flex xs12 class="mb-2">
                                <v-checkbox v-model="portfolio.lineDataAccess" :true-value="false" :false-value="true"
                                            hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                            label="Скрыть график"></v-checkbox>
                            </v-flex>
                            <v-fade-transition mode="out-in" group>
                                <template v-if="portfolio.access === 2">
                                    <div class="form-row margT24" key="1">
                                        <div class="profile__subtitle form-row__title">
                                            Публичное имя
                                            <tooltip>Ваше имя (будет использовано для отображения на карточке публичного портфеля)</tooltip>
                                        </div>
                                        <inplace-input name="publicName" :value="publicName" :max-length="255" @input="onPublicNameChange"></inplace-input>
                                    </div>
                                    <div class="form-row" key="2">
                                        <div class="profile__subtitle form-row__title">
                                            Личный сайт
                                            <tooltip>Ссылка на профиль, блог, сайт (будет использована для отображения на карточке публичного портфеля)</tooltip>
                                        </div>
                                        <inplace-input name="publicLink" :value="publicLink" :max-length="1024" @input="onPublicLinkChange"></inplace-input>
                                    </div>
                                    <div class="form-row" key="3">
                                        <div class="profile__subtitle form-row__title">
                                            Цель портфеля
                                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                                <sup class="custom-tooltip" slot="activator">
                                                    <v-icon>fas fa-info-circle</v-icon>
                                                </sup>
                                                <span>Цель портфеля, описание, которое будет использовано для отображения на карточке публичного портфеля</span>
                                            </v-tooltip>
                                        </div>
                                        <v-text-field name="target" v-model="portfolio.description" label="Цель портфеля" :counter="120"></v-text-field>
                                    </div>
                                </template>
                            </v-fade-transition>
                        </v-layout>
                    </div>
                </template>
            </v-fade-transition>
        </div>
    `,
    components: {BrokerSwitcher}
})
export class PortfolioManagementShareTab extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    @Prop()
    private portfolio: PortfolioParams;

    @Inject
    private portfolioService: PortfolioService;
    /** Сервис по работе с нформацией о клиенте */
    @Inject
    private clientService: ClientService;
    /** Публичный доступ */
    private access = false;
    /** Доступ только по ссылке */
    private linkAccess = false;
    /** Публичное имя пользователя */
    private publicName = "";
    /** Ссылка на публичный ресурс пользователя */
    private publicLink = "";

    async created(): Promise<void> {
        if (this.portfolio.access === 2) {
            this.access = true;
        } else if (this.portfolio.access === 1) {
            this.access = true;
            this.linkAccess = true;
        }
        this.publicName = this.clientInfo.user.publicName;
        this.publicLink = this.clientInfo.user.publicLink;
    }

    /** Устанавливает доступ к портфелю: 0 - приватный, 1 - публичный только по ссылке, 2 - полностью публичный */
    private onAccessChange(): void {
        if (this.access) {
            this.portfolio.access = this.linkAccess ? 1 : 2;
        } else {
            this.portfolio.access = 0;
        }
    }

    /**
     * Обрабатывает смену публичной ссылки
     * @param publicLink
     */
    @ShowProgress
    private async onPublicLinkChange(publicLink: string): Promise<void> {
        this.publicLink = CommonUtils.isBlank(publicLink) ? this.clientInfo.user.publicLink : publicLink;
        // отправляем запрос только если действительно поменяли
        if (this.publicLink !== this.clientInfo.user.publicLink) {
            await this.clientService.changePublicLink(this.publicLink);
            this.clientInfo.user.publicLink = this.publicLink;
            this.$snotify.info("Новое Публичная ссылка успешно сохранена");
        }
    }

    /**
     * Обрабатывает смену публичного имени имени
     * @param publicName
     */
    @ShowProgress
    private async onPublicNameChange(publicName: string): Promise<void> {
        this.publicName = CommonUtils.isBlank(publicName) ? this.clientInfo.user.publicName : publicName;
        // отправляем запрос только если действительно поменяли
        if (this.publicName !== this.clientInfo.user.publicName) {
            await this.clientService.changePublicName(this.publicName);
            this.clientInfo.user.publicName = this.publicName;
            this.$snotify.info("Новое Публичное имя успешно сохранено");
        }
    }

    private get link(): string {
        return `${window.location.protocol}//${window.location.host}/public-portfolio/${this.portfolio.id}/`;
    }

    private get settingsNotAllowed(): boolean {
        return this.clientInfo.user.tariff === Tariff.FREE;
    }

    private copyLink(): void {
        this.$snotify.info("Ссылка скопирована");
    }
}
