/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {Inject} from "typescript-ioc";
import {Component, UI} from "../app/ui";
import {Storage} from "../platform/services/storage";
import {StoreKeys} from "../types/storeKeys";
import {Theme} from "../types/types";
import {ThemeUtils} from "../utils/ThemeUtils";

@Component({
    // language=Vue
    template: `
        <v-btn flat @click="toggleTheme" :title="nightTheme ? 'Выключить Ночную тему' : 'Включить Ночную тему'" class="btn">
            <v-icon v-if="nightTheme" light>far fa-moon</v-icon>
            <v-icon v-else light>far fa-lightbulb</v-icon>
            <span class="ml-2">{{ nightTheme ? 'Темная тема' : 'Светлая тема' }}</span>
        </v-btn>
    `
})
export class ThemeSwitcher extends UI {

    @Inject
    private storage: Storage;

    /** Признак темной темы */
    private nightTheme = false;

    created(): void {
        this.nightTheme = this.storage.get<string>(StoreKeys.THEME, ThemeUtils.detectPrefersColorScheme()) === Theme.NIGHT;
        ThemeUtils.setStyles(this.nightTheme);
    }

    private toggleTheme(): void {
        this.nightTheme = !this.nightTheme;
        this.storage.set(StoreKeys.THEME, this.nightTheme ? Theme.NIGHT : Theme.DAY);
        ThemeUtils.setStyles(this.nightTheme);
    }
}
