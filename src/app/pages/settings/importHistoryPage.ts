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
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../../app/ui";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {ImportResultComponent} from "../../components/importResultComponent";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo} from "../../services/clientService";
import {ImportProviderFeatures, ImportProviderFeaturesByProvider, ImportService, UserImport} from "../../services/importService";
import {EventType} from "../../types/eventType";
import {Portfolio, Status} from "../../types/types";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-slide-x-reverse-transition>
            <template v-if="initialized">
                <v-container fluid>
                    <v-card flat class="header-first-card">
                        <v-card-title class="header-first-card__wrapper-title">
                            <div class="section-title header-first-card__title-text">Импорт сделок</div>
                        </v-card-title>
                    </v-card>

                    <!-- История импорта -->
                    <v-card flat class="import-wrapper">
                        <div class="card__header">
                            <div class="card__header-title">
                                <img src="./img/import/import-icon.svg" alt="">
                                <div>
                                    <span>История импорта</span>
                                    <div @click="goBack" class="back-btn">Назад</div>
                                </div>
                            </div>
                        </div>
                        <div class="info-block margB24">
                            Данный раздел поможет Вам отменить результаты импорта.<br>
                            Отмена импорта может быть полезна, если Вы по ошибке импортировали отчет не в тот портфель<br>
                            или Вы загрузили не тот отчет.
                        </div>
                        <div v-if="importHistory.length" class="import-history">
                            <div v-for="userImport in importHistory" :key="userImport.id" class="import-history-block">
                                <div :class="[{'import-history-block__header': true, 'withoutBorder': userImport.status === 'SUCCESS'}]">
                                    <span class="import-history-block__name">{{ userImport.fileName }}</span>
                                    <span class="import-history-block__date">{{ userImport.date }}</span>
                                    <span v-if="userImport.savedTradesCount" class="import-history-block__description">
                                                    {{ userImport.savedTradesCount | declension("Добавлена", "Добавлено", "Добавлено") }}
                                                    {{ userImport.savedTradesCount }} {{ userImport.savedTradesCount | declension("сделка", "сделки", "сделок") }}
                                                    </span>
                                    <span :class="['import-history-block__status', userImport.status.toLowerCase()]">
                                                        {{ userImport.status === Status.ERROR ? 'Ошибка' : userImport.status === Status.WARN ? 'С замечаниями' : 'Успешно' }}
                                                    </span>
                                    <span v-if="userImport.state !== 'REVERTED'" @click.stop="revertImport(userImport.id)"
                                          class="import-history-block__delete"></span>
                                </div>
                                <div class="import-history-block__body">
                                    <div v-if="userImport.generalError">{{ userImport.generalError }}</div>
                                    <import-result v-if="userImport.errors && userImport.errors.length" :import-result="userImport" :import-provider="userImport.provider"
                                                   :portfolio-params="portfolio.portfolioParams" :import-provider-features="getImportProviderFeatures(userImport)"
                                                   :expand-panels="false"></import-result>
                                </div>
                            </div>
                        </div>
                    </v-card>
                </v-container>
            </template>
            <template v-else>
                <content-loader class="content-loader" :height="200" :width="800" :speed="1" primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                    <rect x="0" y="20" rx="5" ry="5" width="801.11" height="180"/>
                </content-loader>
            </template>
        </v-slide-x-reverse-transition>
    `,
    components: {"import-result": ImportResultComponent}
})
export class ImportHistoryPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;
    @Inject
    private importService: ImportService;
    /** История импорта */
    private importHistory: UserImport[] = [];
    /** Статусы */
    private Status = Status;
    /** Признак инициализации */
    private initialized = false;
    /** Все провайдеры импорта */
    private importProviderFeaturesByProvider: ImportProviderFeaturesByProvider = null;

    /**
     * Инициализирует необходимые для работы данные
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        await this.loadImportHistory();
        this.importProviderFeaturesByProvider = await this.importService.getImportProviderFeatures();
        this.initialized = true;
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio());
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    private async revertImport(userImportId: number): Promise<void> {
        const result = await new ConfirmDialog().show("Вы собираетесь откатить импорт, это приведет к удалению информации о нем из портфеля");
        if (result === BtnReturn.YES) {
            await this.revertImportConfirmed(userImportId);
            // todo проверка
            if (this.portfolio.id === this.portfolio.id) {
                await this.reloadPortfolio();
            }
            this.$snotify.info("Результаты импорта были успешно отменены");
        }
    }

    @ShowProgress
    private async loadImportHistory(): Promise<void> {
        this.importHistory = await this.importService.importHistory();
    }

    @ShowProgress
    private async revertImportConfirmed(userImportId: number): Promise<void> {
        await this.importService.revertImport(userImportId, this.portfolio.id);
        await this.loadImportHistory();
    }

    @Watch("portfolio")
    @ShowProgress
    private async onPortfolioChange(): Promise<void> {
        await this.loadImportHistory();
    }

    private async goBack(): Promise<void> {
        this.$router.push("import");
    }

    private getImportProviderFeatures(userImport: UserImport): ImportProviderFeatures {
        return this.importProviderFeaturesByProvider[userImport.provider.code];
    }
}
