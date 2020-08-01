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
import {RawLocation, Route} from "vue-router";
import {Vue} from "vue/types/vue";
import {Component, UI} from "../../../app/ui";
import {DealsImportProvider} from "../../../services/importService";
import {IisType, PortfolioAccountType, PortfolioParams, PortfolioService} from "../../../services/portfolioService";
import {Currency} from "../../../types/currency";
import {DateFormat, DateUtils} from "../../../utils/dateUtils";
import {PortfolioManagementGeneralTab} from "./portfolioManagementGeneralTab";
import {PortfolioManagementIntegrationTab} from "./portfolioManagementIntegrationTab";
import {PortfolioManagementShareTab} from "./portfolioManagementShareTab";

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Управление портфелями</div>
                </v-card-title>
            </v-card>
            <v-layout v-if="portfolio" class="profile" column>
                <div class="card__header">
                    <div class="card__header-title">
                        <div :class="['provider__image', selectedBroker?.code.toLowerCase()]"></div>
                        <div class="margRAuto">
                            <span>{{ portfolio.name }}</span>
                            <div @click="goBack" class="back-btn">Назад</div>
                        </div>
                    </div>
                    <!-- todo: экспорт -->
                    <v-btn>Экспорт</v-btn>
                </div>

                <v-tabs v-model="currentTab" class="portfolio-management-tabs">
                    <v-tab :class="{'active': 0 === currentTab}">Общие настройки</v-tab>
                    <v-tab :class="{'active': 1 === currentTab}">Публичный доступ</v-tab>
                    <v-tab :class="{'active': 2 === currentTab}">Интеграция</v-tab>
                    <v-tab-item>
                        <portfolio-management-general-tab :portfolio="portfolio"></portfolio-management-general-tab>
                    </v-tab-item>
                    <v-tab-item>
                        <portfolio-management-share-tab :portfolio="portfolio"></portfolio-management-share-tab>
                    </v-tab-item>
                    <v-tab-item>
                        <portfolio-management-integration-tab :portfolio="portfolio"></portfolio-management-integration-tab>
                    </v-tab-item>
                </v-tabs>
            </v-layout>
        </v-container>
    `,
    components: {PortfolioManagementGeneralTab, PortfolioManagementShareTab, PortfolioManagementIntegrationTab}
})
export class PortfolioManagementEditPage extends UI {
    /** Сервис по работе с портфелями */
    @Inject
    private portfolioService: PortfolioService;
    /** Портфель */
    private portfolio: PortfolioParams = null;

    private currentTab: any = null;
    /** Признак добавления нового портфеля */
    private isNew = false;

    async beforeRouteUpdate(to: Route, from: Route, next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void): Promise<void> {
        await this.loadPortfolio(to.params.id);
        next();
    }

    /**
     * Инициализация портфеля
     * @inheritDoc
     */
    async mounted(): Promise<void> {
        await this.loadPortfolio(this.$route.params.id);
    }

    /**
     * Загружает портфель
     * @param id идентификатор
     */
    private async loadPortfolio(id: string): Promise<void> {
        if (id === "new") {
            this.isNew = true;
            this.portfolio = {
                name: "",
                brokerId: null,
                access: 0,
                viewCurrency: Currency.RUB,
                openDate: DateUtils.formatDate(dayjs(), DateFormat.DATE2),
                accountType: PortfolioAccountType.BROKERAGE
            };
        } else {
            this.portfolio = await this.portfolioService.getPortfolioById(Number(id));
        }
        if (!this.portfolio.iisType) {
            this.portfolio.iisType = IisType.TYPE_A;
        }
    }

    /** Возвращает к списку портфелей */
    private goBack(): void {
        this.$router.push({name: "portfolio-management"});
    }

    private get selectedBroker(): DealsImportProvider {
        return this.portfolio.brokerId ? DealsImportProvider.valueById(this.portfolio.brokerId) : null;
    }
}