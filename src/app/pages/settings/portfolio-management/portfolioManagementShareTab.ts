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
        <div class="portfolio-management-tab__wrapper">
            <v-card-text class="paddT0 paddB0">
                <div>
                    <v-layout column class="mt-4">
                        <v-layout align-center class="px-0 py-0" wrap>
                            <v-flex v-if="showCalendar" align-center class="xs11 sm5">
                                <v-menu
                                        ref="dateMenu"
                                        :close-on-content-click="false"
                                        v-model="dateMenuValue"
                                        :return-value.sync="expiredDate"
                                        lazy
                                        transition="scale-transition"
                                        offset-y
                                        full-width
                                        min-width="290px">
                                    <v-text-field
                                            slot="activator"
                                            v-model="expiredDate"
                                            label="Срок действия токена до"
                                            required
                                            append-icon="event"
                                            readonly></v-text-field>
                                    <v-date-picker v-model="expiredDate" :no-title="true" locale="ru" :first-day-of-week="1"
                                                   @input="$refs.dateMenu.save(expiredDate)"></v-date-picker>
                                </v-menu>
                            </v-flex>
                            <v-flex v-if="link && showCalendar" sm1 xs1 class="mt-1">
                                <v-tooltip transition="slide-y-transition"
                                           open-on-hover content-class="menu-icons" bottom max-width="292"
                                           nudge-right="120">
                                    <sup slot="activator">
                                        <div class="repeat-link-btn" @click="generateTokenLink">
                                            <img src="img/portfolio/link.svg">
                                        </div>
                                    </sup>
                                    <div class="tooltip-text pa-3">
                                        Сгенерировать ссылку повторно
                                    </div>
                                </v-tooltip>
                            </v-flex>
                        </v-layout>
                        <v-flex xs12 v-if="link" :class="[shareOption !== dialogTypes.DEFAULT_ACCESS ? 'input-link-section' : '']">
                            <v-text-field :value="link" placeholder="url для доступа к портфелю" readonly hide-details></v-text-field>
                        </v-flex>
                    </v-layout>

                    <v-layout v-if="shareOption === dialogTypes.DEFAULT_ACCESS" column class="default-access-content">
                        <v-layout wrap justify-space-between>
                            <div>
                                <v-flex xs12 class="mb-2">
                                    <v-checkbox v-model="access"
                                                hide-details class="shrink mr-2 portfolio-default-text"
                                                label="Публичный доступ к портфелю"></v-checkbox>
                                </v-flex>
                                <v-flex xs12 class="mb-2 mt-4">
                                    <v-checkbox v-model="divAccess"
                                                hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                                label="Просмотр дивидендов"></v-checkbox>
                                </v-flex>
                                <v-flex xs12 class="mb-2">
                                    <v-checkbox v-model="tradeAccess"
                                                hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                                label="Просмотр сделок"></v-checkbox>
                                </v-flex>
                                <v-flex xs12 class="mb-2">
                                    <v-checkbox v-model="lineDataAccess"
                                                hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                                label="Просмотр графика"></v-checkbox>
                                </v-flex>
                                <v-flex xs12>
                                    <v-checkbox v-model="dashboardAccess"
                                                hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                                label="Просмотр дашборда"></v-checkbox>
                                </v-flex>
                            </div>
                            <div>
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
                        </v-layout>
                    </v-layout>

                    <v-layout wrap v-if="shareOption !== dialogTypes.DEFAULT_ACCESS" class="action-btn-section">
                        <div v-if="!link">
                            <v-btn class="btn" slot="activator" @click="generateTokenLink">
                                Сгенерировать ссылку
                            </v-btn>
                        </div>
                        <div v-if="link">
                            <v-btn class="btn" v-clipboard="() => link" slot="activator" @click="copyLink">
                                Копировать ссылку
                            </v-btn>
                        </div>
                        <div v-if="link">
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
                    </v-layout>
                </div>
            </v-card-text>
            <v-card-actions class="save-btn-section">
                <v-spacer></v-spacer>
                <v-btn color="primary" light @click.native="savePublicParams">Сохранить</v-btn>
            </v-card-actions>
        </div>
    `,
    components: {BrokerSwitcher}
})
export class PortfolioManagementShareTab extends UI {

    $refs: {
        dateMenu: any
    };

    @Prop()
    portfolio: PortfolioParams;

    @Inject
    private portfolioService: PortfolioService;
    private dialogTypes = PortfoliosDialogType;

    private shareOption: PortfoliosDialogType = null;

    private access = true;
    private divAccess = false;
    private tradeAccess = false;
    private lineDataAccess = false;
    private dashboardAccess = false;
    private expiredDate: string = DateUtils.formatDate(dayjs().add(7, "day"), DateFormat.DATE2);
    private dateMenuValue = false;
    private userId = "";
    private shareUrlsCache: { [key: string]: string } = {
        [PortfoliosDialogType.DEFAULT_ACCESS.code]: null,
        [PortfoliosDialogType.BY_LINK.code]: null,
    };

    mounted(): void {
        this.shareOption = PortfoliosDialogType.DEFAULT_ACCESS;
        this.access = this.portfolio.access;
        this.divAccess = this.portfolio.dividendsAccess;
        this.tradeAccess = this.portfolio.tradesAccess;
        this.lineDataAccess = this.portfolio.lineDataAccess;
        this.dashboardAccess = this.portfolio.dashboardAccess;
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

    @ShowProgress
    @DisableConcurrentExecution
    private async savePublicParams(): Promise<void> {
        const result = await this.portfolioService.updatePortfolio({
            ...this.portfolio,
            access: this.access,
            tradesAccess: this.tradeAccess,
            dividendsAccess: this.divAccess,
            dashboardAccess: this.dashboardAccess,
            lineDataAccess: this.lineDataAccess
        });
        this.$snotify.info("Настройки доступа к портфелю успешно изменены");
        UI.emit(EventType.PORTFOLIO_UPDATED, result);
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

    /** Условие для отображения календаря */
    private get showCalendar(): boolean {
        return PortfoliosDialogType.BY_LINK === this.shareOption;
    }

    private selectDialogType(type: PortfoliosDialogType): void {
        this.shareOption = type;
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