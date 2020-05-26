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
import {ThemeSwitcher} from "../../../components/themeSwitcher";
import {ShowProgress} from "../../../platform/decorators/showProgress";
import {ClientInfo, ClientService} from "../../../services/clientService";
import {HelpDeskUtils} from "../../../utils/HelpDeskUtils";
import {StoreType} from "../../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Настройки интерфейса</div>
                </v-card-title>
            </v-card>
            <v-layout class="profile" column>
                <v-layout wrap align-center class="mt-3">
                    <v-card flat>
                        <span class="profile__subtitle">
                            Настройки темы интерфейса
                        </span>
                        <v-layout wrap>
                            <div class="fs13 maxW778 mr-4 mt-3">
                                <theme-switcher></theme-switcher>
                            </div>
                        </v-layout>
                    </v-card>
                </v-layout>
                <expanded-panel :value="widgetPanel" class="promo-codes__statistics mt-3">
                    <template #header>Виджет помощи</template>
                    <v-card flat @click.stop>
                        <v-layout wrap @click.stop>
                            <v-switch v-model="clientInfo.user.needShowHelpDeskWidget" @change="onShowHelpDeskWidgetChange" class="ml-3">
                                <template #label>
                                    <span>Отображать виджет помощи</span>
                                    <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                        <sup class="custom-tooltip" slot="activator">
                                            <v-icon>fas fa-info-circle</v-icon>
                                        </sup>
                                        <span>Скрывает виджет помощи в правом нижнем углу.</span>
                                    </v-tooltip>
                                </template>
                            </v-switch>
                        </v-layout>
                    </v-card>
                </expanded-panel>
            </v-layout>
        </v-container>
    `,
    components: {ThemeSwitcher}
})
export class ProfileInterfacePage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    /** Сервис для работы с данными клиента */
    @Inject
    private clientService: ClientService;
    /** Индикатор панели управления виджетом */
    private widgetPanel = [0];

    /**
     * Обновляет признак тображения виджета помощи
     */
    @ShowProgress
    private async onShowHelpDeskWidgetChange(): Promise<void> {
        await this.clientService.setNeedShowHelpDeskWidget(this.clientInfo.user.needShowHelpDeskWidget);
        HelpDeskUtils.toggleWidget(this.clientInfo.user.needShowHelpDeskWidget, this.clientInfo.user);
    }
}
