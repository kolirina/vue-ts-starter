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

import {StoreKeys} from "../types/storeKeys";
import {BROWSER} from "../types/types";
import {CommonUtils} from "./commonUtils";

export class ThemeUtils {

    private static readonly CSS_STYLES = `
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
    .green--text {
        filter: invert(100%);
    }
    .red--text {
        filter: invert(100%);
    }
    a.decorationNone {
        filter: invert(100%);
    }
    .v-overlay--active:before {
        background-color: #ffffff !important;
    }`;

    static setStyles(nightTheme: boolean): void {
        let stylesElement = document.getElementById(StoreKeys.THEME);
        if (!stylesElement) {
            stylesElement = document.createElement("style");
            stylesElement.id = "theme";
            document.head.appendChild(stylesElement);
        }
        stylesElement.innerHTML = nightTheme ? ThemeUtils.CSS_STYLES : "";
        stylesElement.setAttribute("media", nightTheme ? "screen" : "none");
    }

    static invertSupported(): boolean {
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
