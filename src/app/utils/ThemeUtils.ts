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
import {BROWSER, Theme} from "../types/types";
import {CommonUtils} from "./commonUtils";

export class ThemeUtils {

    private static readonly CSS_STYLES = `
     .data-table a,
     .v-card a,
     .items-dialog-title,
     .item-files__name {color: #75b2ef}

     .add-notification .v-input--is-label-active label, .data-table thead th.active, .v-label.v-label--active.theme--light {color: #75b2ef !important}

     .v-input--switch__thumb.accent--text {background-color: #82b1ff}

     .v-input--switch .accent--text,
     .v-input--checkbox .theme--light.accent--text,
     .v-input--checkbox .theme--light.v-icon {
        border-color: #82b1ff;
        color: #82b1ff !important;
     }

     .v-btn:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro).theme--light.primary,
     .v-btn:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro).v-btn--disabled.primary,
     .import-wrapper-content .section-upload-file .reselect-file-btn,
     .free-subscribe a {
        background-color: #3b6ec9 !important;
        color: #fff !important;
        border-color: transparent !important;
     }

     .v-btn:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro).theme--light,
     .v-btn:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro).v-btn--disabled {
        background-color: transparent !important;
        color: #fff !important;
        border-color: #fff !important;
     }

     .v-btn:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro).v-btn--disabled {opacity: 0.5}

    .profile,
    .theme--light.v-navigation-drawer,
    .theme--light.v-sheet,
    .theme--light.v-table tbody tr,
    .adviser-wrap .adviser-diagram-section,
    .trades-filter,
    .v-calendar-weekly__day,
    .v-radio .v-input--selection-controls__input:before,
    .wrapper-list-reference,
    .theme--light.v-picker__body,
    .theme--light.v-datatable .v-datatable__actions,
    .v-overlay--active:before,
    .info-about-event,
    .theme--light.v-table,
    .data-table thead, .theme--light.v-data-iterator .v-data-iterator__actions thead,
    .theme--light.v-expansion-panel .v-expansion-panel__container .v-expansion-panel__header .v-expansion-panel__header__icon .v-icon thead,
    .theme--light.v-btn-toggle,
    .negative-balance-notification,
    .sing-in-wrap .paired-section__left-section,
    .empty-station {background: #2C3040 !important;}

    .tariff-description-wrap div:nth-child(even) {background-color: #2C3040}

    .v-content__wrap,
    .header-first-card,
    .theme--light.v-footer,
    .submenu-v-menu,
    .custom-tooltip-wrap,
    .theme--light.v-list,
    .v-input--switch__track,
    .v-calendar-weekly__head,
    .events-calendar-wrap .v-calendar-weekly__head .v-outside,
    .theme--light.v-sheet.notifications-card.notifications-card-main,
    .v-menu__content.theme--light.bg-white,
    .header-first-card.v-card.v-card--flat.v-sheet.theme--light,
    .tariff-most-popular,
    .v-picker__title.primary,
    .portfolio-rows-filter__button:hover,
    .v-tooltip__content.menu-icons,
    .theme--light.application,
    .custom-v-menu .v-menu-content{background: #21232F !important}

    .active-link, .wrap-list-menu .v-list__tile:hover,
    .header-first-card__title-text,
    .layout,
    .v-expansion-panel__header,
    .wrapper-content-panel,
    .wrapper-list-reference a:not(:hover),
    .fs13, .fs14,
    .submenu-v-menu .v-list__tile,
    .theme--light.v-icon,
    .data-table thead tr:first-child th,
    .theme--light.v-data-iterator .v-data-iterator__actions thead tr:first-child th,
    .theme--light.v-expansion-panel .v-expansion-panel__container .v-expansion-panel__header .v-expansion-panel__header__icon .v-icon thead tr:first-child th,
    .inplace-custom-input input, .portfolio-rows-filter__settings .theme--light.v-label, .portfolio-rows-filter__settings .v-label,
    .v-radio .v-label,
    .chart-title, .info-share-page .info-about-stock__content-title,
    .portfolio-default-text label,
    .theme--light.v-label:not(.v-label--active) {color: #fff !important}

    .data-table tbody .selectable td,
    .custom-tooltip-wrap,
    .theme--light.v-list,
    .theme--light.v-data-iterator .v-data-iterator__actions tbody .selectable td,
    .theme--light.v-expansion-panel .v-expansion-panel__container .v-expansion-panel__header .v-expansion-panel__header__icon .v-icon tbody .selectable td,
    .theme--light.v-input:not(.v-input--is-disabled) input, .theme--light.v-input:not(.v-input--is-disabled) textarea,
    .theme--light.v-table,
    .events__card-title,
    .eventsAggregateInfo .item-block,
    .theme--light.v-sheet,
    .events-calendar-wrap .calendar-events-title,
    .theme--light.v-calendar-weekly .v-calendar-weekly__day,
    .theme--light.v-calendar-weekly .v-calendar-weekly__head-weekday.v-past,
    .checkbox-settings span, .dialog-setings-menu .title-setings,
    .control-portfolios-title,
    .export-page .info-block,
    .promo-codes .rewards,
    .statistics, .export-page__info-block,
    .gif-block .title-gif-block,
    .gif-block-item__title,
    .tariff, .theme--light.v-btn,
    .theme--light.v-date-picker-header .v-date-picker-header__value:not(.v-date-picker-header__value--disabled) button:not(:hover):not(:focus),
    .theme--light.v-input:not(.v-input--is-disabled) input, .theme--light.v-input:not(.v-input--is-disabled) textarea,
    .theme--light.v-select .v-select__selections, .dialog-header-text,
    .theme--light.v-date-picker-table .v-date-picker-table--date__week, .theme--light.v-date-picker-table th,
    .theme--light.v-datatable .v-datatable__actions,
    .info-share-page__name-stock-block__title, .info-share-page__name-stock-block__subtitle,
    .info-share-page .info-about-stock__content-value,
    .import-wrapper-header__title,
    .import-wrapper-content .intelinvest-section__description,
    .providers .item-text,
    .select-section .v-select__selection,
    .v-menu__content .v-select-list .v-list__tile__title,
    .dialog-default-text, .attachments__allowed-extensions span,
    .v-btn.portfolio-rows-filter__button:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro),
    .import-wrapper-content .v-btn:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro),
    .v-tooltip__content.menu-icons, .hint-text-for-setings,
    .intel-invest-instruction__title, .intel-invest-instruction__format-text, .intel-invest-instruction__title-values,
    .intel-invest-instruction__values, .intel-invest-instruction__template-requirements, .import-instructions, .import-default-text .tooltip-text,
    .snotifyToast__body, .info-share-page__empty, .import-dialog-wrapper__title-text, .fs18, .fs36, .import-default-text,
    .snotifyToast__buttons button, .update-service-dialog__content,
    .custom-v-menu .v-menu-content, .section-title, .public-portfolio-item__title, .public-portfolio-item__footer-title,
    .public-portfolio-item__footer-social > div,
    .v-date-picker-years, .empty-station__description {color: #fff}

    .theme--light.v-label,
    .fs12-opacity,
    .theme--light.v-counter, .theme--light.v-input--is-disabled input, .provider__stepper .currency-balances>div .v-text-field__suffix,
    .theme--light.v-messages, .theme--light.v-stepper .v-stepper__label, .attachments .attachments__title {color: #fff; opacity: 0.7}

    .import-wrapper-content .intelinvest-section .v-btn {color: rgba(0,0,0,.87) !important;}

    .theme--light.v-pagination .v-pagination__navigation, .theme--light.v-stepper {background: none}

    .active-link, .wrap-list-menu .v-list__tile:hover,
    .theme--dark.v-btn:not(.v-btn--icon):not(.v-btn--flat),
    .data-table thead tr:first-child th,
    .theme--light.v-data-iterator .v-data-iterator__actions thead tr:first-child th,
    .theme--light.v-expansion-panel .v-expansion-panel__container .v-expansion-panel__header .v-expansion-panel__header__icon .v-icon thead tr:first-child th,
    .adviser-wrap .adviser-diagram-section .left-section .flex, .adviser-wrap .adviser-diagram-section .right-section .flex,
    .eventsAggregateInfo .item-block,
    .events-calendar-wrap .calendar-events-title,
    .tariff-item,
    .v-text-field .v-input__slot,
    .v-btn.portfolio-rows-filter__button:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro).theme--light,
    .v-btn.portfolio-rows-filter__button:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro),
    .portfolio-rows-filter__button, .import-wrapper-content .setings-menu .v-btn,
    .snotifyToast, .theme--light.v-chip,
    .import-wrapper-content .setings-menu .v-btn:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro).theme--light,
    .import-wrapper-content .setings-menu .v-btn:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro),
    .wrapper-content-panel__privacy-section-up-page-btn, .free-subscribe, .events__info-panel, .info-block,
    .sing-in-wrap .pre-footer, .promo-codes__steps, .tariff-notification, .import-history-block,
    .import-result-info .exp-panel, .import-result-info .exp-panel .v-card,
    input.highcharts-range-selector:focus, .inplace-custom-input, .currency-card.v-card {background-color: #252A35 !important}

    .dashboard-wrap {background-color: #0a0d19;}

    .theme--light.v-table tbody tr:not(:last-child),
    .theme--light.v-calendar-weekly .v-calendar-weekly__head-weekday,
    .theme--light.v-calendar-weekly .v-calendar-weekly__day,
    .events-calendar-wrap .v-calendar-weekly__head {border-color: #181a33;}

    .v-btn.portfolio-rows-filter__button:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro).theme--light,
    .v-btn.portfolio-rows-filter__button:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro),
    .import-wrapper-content .v-btn.portfolio-rows-filter__button:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro).theme--light,
    .import-wrapper-content .v-btn.portfolio-rows-filter__button:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro),
    .import-wrapper-content .setings-menu .v-btn:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro).theme--light,
    .import-wrapper-content .setings-menu .v-btn:not(.v-btn--floating):not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline):not(.v-btn--ro) {border-color: #fff !important}

    .import-wrapper-content .setings-menu .v-btn,
    .portfolio-rows-filter__button__icon {background-image: url("./img/fileimport/settings-light.svg")}

    .theme--light.v-table tbody tr.selectable:hover:not(.v-datatable__expand-row) {background: #3b6ec9 !important;}

    .search-section .v-text-field .v-input__slot {background: none !important}

    .qr-code-section .v-list {background-color: #fff !important}

    .custom-action-icon, .exp-panel-arrow, .profile-edit {filter: brightness(2)}

    .arrow-up .dashboard-summary-income-icon {background: #405242}
    .arrow-down .dashboard-summary-income-icon {background: #61343f}

    .highcharts-legend text,
    .highcharts-axis-labels text,
    .highcharts-label text,
    .highcharts-plot-line-label,
    .averageAnnualYieldChart text tspan,
    .highcharts-label.highcharts-data-label tspan,
    .highcharts-label.highcharts-tooltip-box tspan {
        fill: #fff !important;
        stroke-width: 0;
        font-weight: normal !important;
    }
    .highcharts-background {fill: #252A35 !important}
    .highcharts-markers.highcharts-spline-series path,
    .simple-line .highcharts-label-box.highcharts-tooltip-box,
    .highcharts-tooltip .highcharts-label-box {fill: #3B6EC9 !important}

    .highcharts-tooltip .highcharts-label-box {
        stroke: none
    }

    .highcharts-grid.highcharts-xaxis-grid path,
    .highcharts-grid.highcharts-yaxis-grid path,
    .highcharts-axis-line, .highcharts-axis.highcharts-xaxis path, .highcharts-navigator-outline {stroke: #3c4450}

    .highcharts-graph {stroke: #3B6EC9 !important}
    .simple-line .highcharts-label-box.highcharts-tooltip-box,
    .averageAnnualYieldChart .highcharts-label-box.highcharts-tooltip-box {stroke: none}

    .averageAnnualYieldChart .highcharts-label-box.highcharts-tooltip-box {fill: #474d67}

    .profitability-diagram .highcharts-series .highcharts-point:nth-child(1) {fill: #4E4FA4 !important}
    .profitability-diagram .highcharts-series .highcharts-point:nth-child(2) {fill: #6B75C6 !important}
    .profitability-diagram .highcharts-series .highcharts-point:nth-child(3) {fill: #74D1F4 !important}
    .profitability-diagram .highcharts-series .highcharts-point:nth-child(4) {fill: #178BC6 !important}

    .providers .item-img-block {filter: none}

    .content-loader stop {stop-color: #2c3040}

    .sing-in-wrap .paired-section__right-section {background-image: url(../img/sign_in/bg-dark.svg)}
    .wrapper-payment-info__title.pan {background-image: url(../img/profile/done-light.svg) !important}

    .v-input input::-webkit-input-placeholder {color: #cfd0d4 !important}
    .v-input input::-ms-input-placeholder {color: #cfd0d4 !important}
    .v-input input::-moz-placeholder {color: #cfd0d4 !important}

    .public-portfolio-item .highcharts-background {fill: none !important}
    .public-portfolio-item__chart:after {background: linear-gradient(to top, #2c3040 20%,transparent 50%);}
    `;

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

    static detectPrefersColorScheme(): Theme {
        // Detect if prefers-color-scheme is supported
        if (window.matchMedia("(prefers-color-scheme)").media !== "not all") {
            // Set colorScheme to Dark if prefers-color-scheme is dark. Otherwise set to light.
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.NIGHT : Theme.DAY;
        } else {
            // If the browser doesn't support prefers-color-scheme, set it as default to dark
            return Theme.NIGHT;
        }
    }

    /**
     * Устанавливает слушатель для автоматической смены темы
     * Сафари и Ие не поддерживают данный обработчик
     */
    static detectTheme(): void {
        try {
            const browserInfo = CommonUtils.detectBrowser();
            if (![BROWSER.SAFARY, BROWSER.IE].includes(browserInfo.name as BROWSER)) {
                window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
                    ThemeUtils.setStyles(e.matches);
                });
            }
        } catch (e) {
            // mute
        }
    }
}
