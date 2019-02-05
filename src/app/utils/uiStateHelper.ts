import {Container} from "typescript-ioc";
import {Storage} from "../platform/services/storage";

const localStorage: Storage = Container.get(Storage);

export class UiStateHelper {

    static readonly STOCKS = "stocks_panel";
    static readonly HISTORY_PANEL = "history_chart";
    static readonly STOCK_CHART_PANEL = "stocksChartPanel";
    static readonly BOND_CHART_PANEL = "bondsChartPanel";
    static readonly ASSET_CHART_PANEL = "assetChartPanel";
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
    static readonly LAST_UPDATE_NOTIFICATION = "last_update_notification";
    static readonly TRADES_FILTER = "trades_filter";
    static readonly IMPORT_SETTINGS = "import_settings";

    static set stocksTablePanel(value: number[]) {
        localStorage.set(UiStateHelper.STOCKS, value);
    }

    static get stocksTablePanel(): number[] {
        return [localStorage.get(UiStateHelper.STOCKS, 0)];
    }

    static set bondsTablePanel(value: number[]) {
        localStorage.set(UiStateHelper.BONDS, value);
    }

    static get bondsTablePanel(): number[] {
        return [localStorage.get(UiStateHelper.BONDS, 0)];
    }

    static set yearDivsTablePanel(value: number[]) {
        localStorage.set(UiStateHelper.YEAR_DIV_LIST, value);
    }

    static get yearDivsTablePanel(): number[] {
        return [localStorage.get(UiStateHelper.YEAR_DIV_LIST, 0)];
    }

    static set divTradesTablePanel(value: number[]) {
        localStorage.set(UiStateHelper.DIV_LIST, value);
    }

    static get divTradesTablePanel(): number[] {
        return [localStorage.get(UiStateHelper.DIV_LIST, 0)];
    }

    static set sumYearDivsTablePanel(value: number[]) {
        localStorage.set(UiStateHelper.SUM_YEAR_DIVIDENDS, value);
    }

    static get sumYearDivsTablePanel(): number[] {
        return [localStorage.get(UiStateHelper.SUM_YEAR_DIVIDENDS, 0)];
    }

    static set sumDivsTablePanel(value: number[]) {
        localStorage.set(UiStateHelper.SUM_DIVS, value);
    }

    static get sumDivsTablePanel(): number[] {
        return [localStorage.get(UiStateHelper.SUM_DIVS, 0)];
    }

    static set combinedPanel(value: number[]) {
        localStorage.set(UiStateHelper.COMBINED_CONTROL_PANEL, value);
    }

    static get combinedPanel(): number[] {
        return [localStorage.get(UiStateHelper.COMBINED_CONTROL_PANEL, 0)];
    }

    static set historyPanel(value: number[]) {
        localStorage.set(UiStateHelper.HISTORY_PANEL, value);
    }

    static get historyPanel(): number[] {
        return [localStorage.get(UiStateHelper.HISTORY_PANEL, 0)];
    }

    static set stockGraph(value: number[]) {
        localStorage.set(UiStateHelper.STOCK_CHART_PANEL, value);
    }

    static get stockGraph(): number[] {
        return [localStorage.get(UiStateHelper.STOCK_CHART_PANEL, 0)];
    }

    static set bondGraph(value: number[]) {
        localStorage.set(UiStateHelper.BOND_CHART_PANEL, value);
    }

    static get bondGraph(): number[] {
        return [localStorage.get(UiStateHelper.BOND_CHART_PANEL, 0)];
    }

    static set assetGraph(value: number[]) {
        localStorage.set(UiStateHelper.ASSET_CHART_PANEL, value);
    }

    static get assetGraph(): number[] {
        return [localStorage.get(UiStateHelper.ASSET_CHART_PANEL, 0)];
    }

    static set sectorsGraph(value: number[]) {
        localStorage.set(UiStateHelper.SECTORS_PANEL, value);
    }

    static get sectorsGraph(): number[] {
        return [localStorage.get(UiStateHelper.SECTORS_PANEL, 0)];
    }

    static set investmentsSettingsPanel(value: number[]) {
        localStorage.set(UiStateHelper.INVESTMENTS_SETTINGS_PANEL, value);
    }

    static get investmentsSettingsPanel(): number[] {
        return [localStorage.get(UiStateHelper.INVESTMENTS_SETTINGS_PANEL, 0)];
    }

    static set referralStatisticsPanel(value: number[]) {
        localStorage.set(UiStateHelper.REFERRAL_STATISTICS_PANEL, value);
    }

    static get referralStatisticsPanel(): number[] {
        return [localStorage.get(UiStateHelper.REFERRAL_STATISTICS_PANEL, 0)];
    }

    static set eventsCalendarPanel(value: number[]) {
        localStorage.set(UiStateHelper.EVENTS_CALENDAR, value);
    }

    static get eventsCalendarPanel(): number[] {
        return [localStorage.get(UiStateHelper.EVENTS_CALENDAR, 0)];
    }

    static set lastUpdateNotification(value: string) {
        localStorage.set(UiStateHelper.LAST_UPDATE_NOTIFICATION, value);
    }

    static get lastUpdateNotification(): string {
        return localStorage.get(UiStateHelper.LAST_UPDATE_NOTIFICATION, null);
    }

    static set tradesFilter(value: number[]) {
        localStorage.set(UiStateHelper.TRADES_FILTER, value);
    }

    static get tradesFilter(): number[] {
        return [localStorage.get(UiStateHelper.TRADES_FILTER, 0)];
    }

    static set importSettings(value: number[]) {
        localStorage.set(UiStateHelper.IMPORT_SETTINGS, value);
    }

    static get importSettings(): number[] {
        return [localStorage.get(UiStateHelper.IMPORT_SETTINGS, 0)];
    }

    static toggleState(type: string): void {
        localStorage.set(type, 1 - localStorage.get(type, 0));
    }
}
