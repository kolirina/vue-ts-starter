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
import {PortfolioParams, PortfolioService} from "../../../services/portfolioService";
import {EventType} from "../../../types/eventType";

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
                <div>
                    <v-tabs>
                        <v-tab>Общие настройки</v-tab>
                        <v-tab>Публичный доступ</v-tab>
                        <v-tab>Интеграция</v-tab>
                        <v-tab-item>
                            <v-tooltip content-class="custom-tooltip-wrap" top>
                                <v-checkbox slot="activator" label="Профессиональный режим"
                                            @change="onProfessionalModeChange"
                                            v-model="portfolio.professionalMode" hide-details>
                                </v-checkbox>
                                <span>
                                    Профессиональный режим включает дополнительные возможности, необходимые опытным инвесторам:
                                    <ul>
                                        <li>возможность уходить в минус по деньгам (маржинальное кредитование)</li>
                                        <li>возможность открытия коротких позиций</li>
                                        <li>возможность учета времени заключения сделки</li>
                                    </ul>
                                </span>
                            </v-tooltip>

                            <v-text-field label="Введите название портфеля" v-model.trim="portfolio.name" required autofocus
                                          v-validate="'required|max:40|min:3'"
                                          :error-messages="errors.collect('name')"
                                          data-vv-name="name" @keyup.enter="savePortfolio"
                                          class="required">
                            </v-text-field>
                        </v-tab-item>
                        <v-tab-item>Публичный доступ</v-tab-item>
                        <v-tab-item>Интеграция</v-tab-item>
                    </v-tabs>
                </div>
            </v-layout>
        </v-container>
    `
})
export class PortfolioManagementEditPage extends UI {

    /** Сервис по работе с портфелями */
    @Inject
    private portfolioService: PortfolioService;
    /** Портфель */
    private portfolio: PortfolioParams = null;

    async created(): Promise<void> {
        this.portfolio = await this.portfolioService.getPortfolioById(Number(this.$route.params.id));
    }

    /** Включение/выключение профессионального режима */
    private async onProfessionalModeChange(): Promise<void> {
        const result = await this.portfolioService.updatePortfolio(this.portfolio);
        this.$snotify.info(`Профессиональный режим для портфеля ${result.professionalMode ? "включен" : "выключен"}`);
        UI.emit(EventType.PORTFOLIO_UPDATED, result);
    }

    /** Сохраняет изменения в портфеле */
    private async savePortfolio(): Promise<void> {
        // todo: сохранение портфеля
    }

    /** Возвращает к списку портфелей */
    private goBack(): void {
        this.$router.push({name: "portfolio-management"});
    }
}