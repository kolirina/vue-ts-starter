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

import {Component, namespace, Prop, UI} from "../../../app/ui";
import {BrokerSwitcher} from "../../../components/brokerSwitcher";
import {ClientInfo} from "../../../services/clientService";
import {PortfolioParams} from "../../../services/portfolioService";
import {StoreType} from "../../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div>
            <div class="portfolio-management-tab__wrapper">
                <v-switch v-model="access" @change="onAccessChange" class="margB20">
                    <template #label>
                        <span>Публичный доступ {{access ? "открыт" : "закрыт"}}</span>
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
                                            Публичное имя инвестора
                                            <tooltip>Ваше имя (будет использовано для отображения на карточке публичного портфеля)</tooltip>
                                        </div>
                                        <v-text-field name="publicName" :value="publicName" :counter="255" label="Публичное имя инвестора"
                                                      @input="onPublicNameChange"></v-text-field>
                                    </div>
                                    <div class="form-row" key="2">
                                        <div class="profile__subtitle form-row__title">
                                            Личный сайт
                                            <tooltip>Ссылка на профиль, блог, сайт (будет использована для отображения на карточке публичного портфеля)</tooltip>
                                        </div>
                                        <v-text-field name="publicLink" :value="publicLink" :counter="1024" label="Личный сайт" @input="onPublicLinkChange"></v-text-field>
                                    </div>
                                    <div class="form-row" key="3">
                                        <div class="profile__subtitle form-row__title">
                                            Цель портфеля
                                            <tooltip>Цель портфеля, описание, которое будет использовано для отображения на карточке публичного портфеля</tooltip>
                                        </div>
                                        <v-text-field name="target" v-model.trim="portfolio.description" label="Цель портфеля" :counter="120"></v-text-field>
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
    /** Публичное имя инвестора */
    @Prop({type: String, required: false})
    private publicName: string;
    /** Ссылка на публичный ресурс пользователя */
    @Prop({type: String, required: false})
    private publicLink: string;
    /** Публичный доступ */
    private access = false;
    /** Доступ только по ссылке */
    private linkAccess = false;

    async created(): Promise<void> {
        if (this.portfolio.access === 2) {
            this.access = true;
        } else if (this.portfolio.access === 1) {
            this.access = true;
            this.linkAccess = true;
        }
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
     */
    private onPublicLinkChange(newValue: string): void {
        this.$emit("publicLinkChange", newValue);
    }

    /**
     * Обрабатывает смену публичного имени имени
     */
    private onPublicNameChange(newValue: string): void {
        this.$emit("publicNameChange", newValue);
    }

    private get link(): string {
        return `${window.location.protocol}//${window.location.host}/public-portfolio/${this.portfolio.id}/`;
    }

    private copyLink(): void {
        this.$snotify.info("Ссылка скопирована");
    }
}
