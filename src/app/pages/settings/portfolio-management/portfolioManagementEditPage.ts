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
import {Component, UI} from "../../../app/ui";
import {IisType, PortfolioParams, PortfolioService} from "../../../services/portfolioService";
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
                        <div :class="['provider__image', portfolio.brokerName?.toLowerCase()]"></div>
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

    /**
     * Инициализация портфеля
     * @inheritDoc
     */
    async mounted(): Promise<void> {
        this.portfolio = await this.portfolioService.getPortfolioById(Number(this.$route.params.id));
        if (!this.portfolio.iisType) {
            this.portfolio.iisType = IisType.TYPE_A;
        }
    }

    /** Возвращает к списку портфелей */
    private goBack(): void {
        this.$router.push({name: "portfolio-management"});
    }
}