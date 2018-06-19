import {Container} from "typescript-ioc";
import {Storage} from '../platform/services/storage';

const localStorage: Storage = Container.get(Storage);

export class UiStateHelper {

    static readonly STOCKS = "stocks_panel";
    static readonly HISTORY_PANEL = "history_chart";
    static readonly STOCK_CHART_PANEL = "stocksChartPanel";
    static readonly BOND_CHART_PANEL = "bondsChartPanel";
    static readonly SECTORS_PANEL = "sectorsPanel";
    static readonly BONDS = "bonds_panel";
    static readonly YEAR_DIV_LIST = "yearDivListAccordion";
    static readonly DIV_LIST = "divListAccordion";
    static readonly SUM_YEAR_DIVIDENDS = "sumYearDividendsAccordion";
    static readonly SUM_DIVS = "sumDivsAccordion";
    static readonly COMBINED_CONTROL_PANEL = "combinedControlPanel";
    static readonly INVESTMENTS_SETTINGS_PANEL = "investmentsSettingsPanel";
    static readonly REFERRAL_STATISTICS_PANEL = "referralStatistics";
    static readonly EVENTS_CALENDAR = "events_calendar";

    static set stocksTablePanel(value: boolean) {
        localStorage.set(UiStateHelper.STOCKS, value);
    }

    static get stocksTablePanel(): boolean {
        return localStorage.get(UiStateHelper.STOCKS, false);
    }

    static set bondsTablePanel(value: boolean) {
        localStorage.set(UiStateHelper.BONDS, value);
    }

    static get bondsTablePanel(): boolean {
        return localStorage.get(UiStateHelper.BONDS, false);
    }

    static set yearDivsTablePanel(value: boolean) {
        localStorage.set(UiStateHelper.YEAR_DIV_LIST, value);
    }

    static get yearDivsTablePanel(): boolean {
        return localStorage.get(UiStateHelper.YEAR_DIV_LIST, false);
    }

    static set divTradesTablePanel(value: boolean) {
        localStorage.set(UiStateHelper.DIV_LIST, value);
    }

    static get divTradesTablePanel(): boolean {
        return localStorage.get(UiStateHelper.DIV_LIST, false);
    }

    static set sumYearDivsTablePanel(value: boolean) {
        localStorage.set(UiStateHelper.SUM_YEAR_DIVIDENDS, value);
    }

    static get sumYearDivsTablePanel(): boolean {
        return localStorage.get(UiStateHelper.SUM_YEAR_DIVIDENDS, false);
    }

    static set sumDivsTablePanel(value: boolean) {
        localStorage.set(UiStateHelper.SUM_DIVS, value);
    }

    static get sumDivsTablePanel(): boolean {
        return localStorage.get(UiStateHelper.SUM_DIVS, false);
    }

    static set combinedPanel(value: boolean) {
        localStorage.set(UiStateHelper.COMBINED_CONTROL_PANEL, value);
    }

    static get combinedPanel(): boolean {
        return localStorage.get(UiStateHelper.COMBINED_CONTROL_PANEL, false);
    }

    static set historyPanel(value: boolean) {
        localStorage.set(UiStateHelper.HISTORY_PANEL, value);
    }

    static get historyPanel(): boolean {
        return localStorage.get(UiStateHelper.HISTORY_PANEL, false);
    }

    static set stockGraph(value: boolean) {
        localStorage.set(UiStateHelper.STOCK_CHART_PANEL, value);
    }

    static get stockGraph(): boolean {
        return localStorage.get(UiStateHelper.STOCK_CHART_PANEL, false);
    }

    static set bondGraph(value: boolean) {
        localStorage.set(UiStateHelper.BOND_CHART_PANEL, value);
    }

    static get bondGraph(): boolean {
        return localStorage.get(UiStateHelper.BOND_CHART_PANEL, false);
    }

    static set sectorsGraph(value: boolean) {
        localStorage.set(UiStateHelper.SECTORS_PANEL, value);
    }

    static get sectorsGraph(): boolean {
        return localStorage.get(UiStateHelper.SECTORS_PANEL, false);
    }

    static set investmentsSettingsPanel(value: boolean) {
        localStorage.set(UiStateHelper.INVESTMENTS_SETTINGS_PANEL, value);
    }

    static get investmentsSettingsPanel(): boolean {
        return localStorage.get(UiStateHelper.INVESTMENTS_SETTINGS_PANEL, false);
    }

    static set referralStatisticsPanel(value: boolean) {
        localStorage.set(UiStateHelper.REFERRAL_STATISTICS_PANEL, value);
    }

    static get referralStatisticsPanel(): boolean {
        return localStorage.get(UiStateHelper.REFERRAL_STATISTICS_PANEL, false);
    }

    static set eventsCalendarPanel(value: boolean) {
        localStorage.set(UiStateHelper.EVENTS_CALENDAR, value);
    }

    static get eventsCalendarPanel(): boolean {
        return localStorage.get(UiStateHelper.EVENTS_CALENDAR, false);
    }

    static setState(type: string, value: boolean): void {
        localStorage.set(type, value);
    }

    static toggleState(type: string): void {
        localStorage.set(type, !localStorage.get(type, false));
    }
}