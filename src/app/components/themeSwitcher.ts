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
import {BROWSER} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";

@Component({
    // language=Vue
    template: `
        <div v-if="invertSupported">
            <v-btn flat icon round @click="toggleTheme" :title="nightTheme ? 'Выключить Ночную тему' : 'Включить Ночную тему'" class="link-icon-btn">
                <v-icon v-if="nightTheme" light>far fa-moon</v-icon>
                <v-icon v-else light>far fa-lightbulb</v-icon>
            </v-btn>
        </div>
    `
})
export class ThemeSwitcher extends UI {

    @Inject
    private storage: Storage;

    private readonly CSS_STYLES = `
    :root {
        background-color: #fefefe;
        filter: invert(100%);
    }
    img:not([src*=\".svg\"]),video {
        filter: invert(100%);
    }
    .dashboard-wrap {
        filter: invert(100%);
    }
    .ii--green-markup {
        filter: invert(100%);
    }
    .ii--red-markup {
        filter: invert(100%);
    }
    a.decorationNone {
        filter: invert(100%);
    }
    .v-overlay--active:before {
        background-color: #ffffff !important;
    }`;

    private nightTheme = false;

    created(): void {
        if (!this.invertSupported) {
            return;
        }
        this.nightTheme = this.storage.get<string>(StoreKeys.THEME, Theme.DAY) === Theme.NIGHT;
        this.setStyles();
    }

    private toggleTheme(): void {
        this.nightTheme = !this.nightTheme;
        this.storage.set(StoreKeys.THEME, this.nightTheme ? Theme.NIGHT : Theme.DAY);
        this.setStyles();
    }

    private setStyles(): void {
        let stylesElement = document.getElementById(StoreKeys.THEME);
        if (!stylesElement) {
            stylesElement = document.createElement("style");
            stylesElement.id = "theme";
            document.head.appendChild(stylesElement);
        }
        stylesElement.innerHTML = this.nightTheme ? this.CSS_STYLES : "";
        stylesElement.setAttribute("media", this.nightTheme ? "screen" : "none");
    }

    private get invertSupported(): boolean {
        const browserInfo = CommonUtils.detectBrowser();
        if (browserInfo.name === BROWSER.FIREFOX) {
            return false;
        }
        const prop = "filter";
        const el = document.createElement("test");
        const mStyle = el.style;
        el.style.cssText = prop + ":invert(100%)";
        return !!(mStyle as any)[prop];
    }
}

enum Theme {
    DAY = "DAY",
    NIGHT = "NIGHT"
}
