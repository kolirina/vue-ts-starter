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

import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import {Component, Prop, UI} from "../../../app/ui";
import {BrokerSwitcher} from "../../../components/brokerSwitcher";
import {AccessTypes} from "../../../components/dialogs/portfolioEditDialog";
import {DisableConcurrentExecution} from "../../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../../platform/decorators/showProgress";
import {CustomDialog} from "../../../platform/dialogs/customDialog";
import {DealsImportProvider} from "../../../services/importService";
import {IisType, PortfolioAccountType, PortfolioParams, PortfoliosDialogType, PortfolioService} from "../../../services/portfolioService";
import {ALLOWED_CURRENCIES, Currency} from "../../../types/currency";
import {EventType} from "../../../types/eventType";
import {CommonUtils} from "../../../utils/commonUtils";
import {DateFormat, DateUtils} from "../../../utils/dateUtils";

@Component({
    // language=Vue
    template: `
        <div>
            <div class="portfolio-management-tab__wrapper">
                <v-switch v-model="access" @change="onAccessChange" class="margB20">
                    <template #label>
                        <span>Публичный доступ {{access ? "открыт" : "закрыт"}}</span>
                        <v-tooltip content-class="custom-tooltip-wrap" bottom>
                            <sup class="custom-tooltip" slot="activator">
                                <v-icon>fas fa-info-circle</v-icon>
                            </sup>
                            <span>
                                Текст подсказки
                            </span>
                        </v-tooltip>
                    </template>
                </v-switch>
            </div>
            <div v-if="link" class="portfolio-management-tab__flex-row">
                <v-text-field :value="link" placeholder="url для доступа к портфелю" readonly hide-details class="mw378"></v-text-field>
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
            <div class="portfolio-management-tab__wrapper">
                <v-layout column class="default-access-content">
                    <v-flex xs12 class="mb-2">
                        <v-checkbox v-model="linkAccess" @change="onAccessChange"
                                    hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                    label="Доступ только по ссылке"></v-checkbox>
                    </v-flex>
                    <v-flex xs12 class="mb-2">
                        <v-checkbox v-model="portfolio.dividendsAccess"
                                    hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                    label="Скрыть дивиденды"></v-checkbox>
                    </v-flex>
                    <v-flex xs12 class="mb-2">
                        <v-checkbox v-model="portfolio.tradesAccess"
                                    hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                    label="Скрыть сделки"></v-checkbox>
                    </v-flex>
                    <v-flex xs12 class="mb-2">
                        <v-checkbox v-model="portfolio.lineDataAccess"
                                    hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                    label="Скрыть график"></v-checkbox>
                    </v-flex>
                    <div class="form-row margT24">
                        <div class="profile__subtitle form-row__title">
                            Публичное имя
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>Текст подсказки</span>
                            </v-tooltip>
                        </div>
                        <v-text-field name="publicName" v-model="portfolio.publicName" label="Публичное имя"></v-text-field>
                    </div>
                    <div class="form-row">
                        <div class="profile__subtitle form-row__title">
                            Личный сайт
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>Текст подсказки</span>
                            </v-tooltip>
                        </div>
                        <v-text-field name="site" v-model="portfolio.site" label="Личный сайт"></v-text-field>
                    </div>
                    <div class="form-row">
                        <div class="profile__subtitle form-row__title">
                            Цель портфеля
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>Текст подсказки</span>
                            </v-tooltip>
                        </div>
                        <v-text-field name="target" v-model="portfolio.target" label="Цель портфеля" :counter="120"></v-text-field>
                    </div>
                </v-layout>
            </div>
        </div>
    `,
    components: {BrokerSwitcher}
})
export class PortfolioManagementShareTab extends UI {

    $refs: {
        dateMenu: any
    };

    @Prop()
    private portfolio: PortfolioParams;

    @Inject
    private portfolioService: PortfolioService;
    private dialogTypes = PortfoliosDialogType;

    private shareOption: PortfoliosDialogType = null;

    private access = false;
    private linkAccess = false;
    private expiredDate: string = DateUtils.formatDate(dayjs().add(7, "day"), DateFormat.DATE2);
    private userId = "";
    private shareUrlsCache: { [key: string]: string } = {
        [PortfoliosDialogType.DEFAULT_ACCESS.code]: null,
        [PortfoliosDialogType.BY_LINK.code]: null,
    };

    mounted(): void {
        this.shareOption = PortfoliosDialogType.DEFAULT_ACCESS;
        if (this.portfolio.access === 2) {
            this.access = true;
        } else if (this.portfolio.access === 1) {
            this.access = true;
            this.linkAccess = true;
        }
    }

    @ShowProgress
    private async generateTokenLink(): Promise<void> {
        const isValid = this.isValid();
        if (!isValid) {
            return;
        }
        this.shareUrlsCache[this.shareOption.code] = await this.portfolioService.getPortfolioShareUrl({
            id: this.portfolio.id, sharePortfolioType: this.shareOption.code, userName: this.userId, expiredDate: this.expiredDate
        });
    }

    /** Устанавливает доступ к портфелю: 0 - приватный, 1 - публичный только по ссылке, 2 - полностью публичный */
    private onAccessChange(): void {
        if (this.access && this.linkAccess) {
            this.portfolio.access = 1;
        } else if (this.access && !this.linkAccess) {
            this.portfolio.access = 2;
        } else {
            this.portfolio.access = 0;
        }
    }

    private get link(): string {
        if (this.shareOption === PortfoliosDialogType.DEFAULT_ACCESS) {
            return `${window.location.protocol}//${window.location.host}/public-portfolio/${this.portfolio.id}/`;
        }
        const link = this.shareUrlsCache[this.shareOption?.code];
        return link ? `${this.shareUrlsCache[this.shareOption?.code]}` : null;
    }

    private copyLink(): void {
        this.$snotify.info("Ссылка скопирована");
    }

    private isValid(): boolean {
        if (this.shareOption === PortfoliosDialogType.DEFAULT_ACCESS) {
            return true;
        }
        if (this.expiredDate === null || dayjs().isAfter(DateUtils.parseDate(this.expiredDate))) {
            this.$snotify.warning("Срок действия токена должна быть больше текущей даты");
            return false;
        }
        return true;
    }
}