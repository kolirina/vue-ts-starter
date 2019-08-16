import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Cache} from "../platform/services/cache";
import {Http} from "../platform/services/http";
import {EventChartData, HighStockEventsGroup, LineChartItem} from "../types/charts/types";
import {CombinedInfoRequest, CurrentMoneyRequest, Overview, Portfolio} from "../types/types";
import {ChartUtils} from "../utils/chartUtils";
import {IisType, PortfolioAccountType, PortfolioParams, PortfolioParamsResponse} from "./portfolioService";

const PORTFOLIOS_KEY = "PORTFOLIOS";

@Service("OverviewService")
@Singleton
export class OverviewService {

    @Inject
    private http: Http;

    @Inject
    private cacheService: Cache;

    private cache: { [key: number]: Portfolio } = {};

    async getById(id: number): Promise<Portfolio> {
        let portfolio = this.cache[id];
        if (!portfolio) {
            portfolio = await this.loadPortfolio(id);
            this.cache[id] = portfolio;
            return portfolio;
        }
        return portfolio;
    }

    /**
     * Перезагружает портфель
     * @param id идентификатор портфеля
     */
    async reloadPortfolio(id: number): Promise<Portfolio> {
        const portfolio = await this.loadPortfolio(id);
        this.cache[id] = portfolio;
        return portfolio;
    }

    /**
     * Сбрасывает из кеша портфель по переданному идентификатору
     * @param id идентификатор портфеля
     */
    resetCacheForId(id: number): void {
        this.cache[id] = null;
    }

    /**
     * Возвращает данные по комбинированному портфелю
     * @param request
     * @return {Promise<>}
     */
    async getPortfolioOverviewCombined(request: CombinedInfoRequest): Promise<Overview> {
        const overview = await this.http.post<Overview>(`/portfolios/overview-combined`, request);
        // проставляем идентификаторы чтобы работали разворачиваютщиеся блоки в табилицах
        overview.stockPortfolio.rows.forEach((value, index) => value.id = index.toString());
        overview.bondPortfolio.rows.forEach((value, index) => value.id = index.toString());
        return overview;
    }

    /**
     * Проставляет флаг combined в портфеле
     * @param {string} id
     * @param {boolean} combined
     * @return {Promise<void>}
     */
    async setCombinedFlag(id: number, combined: boolean): Promise<void> {
        await this.http.post(`/portfolios/${id}/combined/${combined}`, {});
    }

    /**
     * Устанавливает выбранный портфель по умолчанию
     * @param {string} id идентификатор портфеля по умолчанию
     * @return {Promise<void>}
     */
    async setDefaultPortfolio(id: number): Promise<void> {
        await this.http.post(`/portfolios/${id}/default`);
    }

    async getCostChart(id: number): Promise<LineChartItem[]> {
        return this.http.get<LineChartItem[]>(`/portfolios/${id}/cost-chart`);
    }

    async getCostChartCombined(request: CombinedInfoRequest): Promise<LineChartItem[]> {
        return this.http.post<LineChartItem[]>(`/portfolios/cost-chart-combined`, request);
    }

    async getEventsChartDataWithDefaults(id: number): Promise<HighStockEventsGroup[]> {
        return this.getEventsChartData(id);
    }

    async getEventsChartData(id: number): Promise<HighStockEventsGroup[]> {
        const data = await this.http.get<EventChartData[]>(`/portfolios/${id}/events-chart-data`);
        return ChartUtils.processEventsChartData(data);
    }

    async getEventsChartDataCombined(request: CombinedInfoRequest): Promise<HighStockEventsGroup[]> {
        const data = await this.http.post<EventChartData[]>(`/portfolios/events-chart-data-combined`, request);
        return ChartUtils.processEventsChartData(data);
    }

    async getCurrentMoney(portfolioId: number): Promise<string> {
        return await this.http.get<string>(`/portfolios/${portfolioId}/current-money`);
    }

    async saveOrUpdateCurrentMoney(portfolioId: number, currentMoneyRequests: CurrentMoneyRequest[]): Promise<void> {
        await this.http.post(`/portfolios/${portfolioId}/current-money`, currentMoneyRequests);
    }

    /**
     * Возвращает данные по портфелю
     * @param {string} id идентификатор портфеля
     * @return {Promise<Portfolio>}
     */
    private async loadPortfolio(id: number): Promise<Portfolio> {
        const portfolioResponse: PortfolioParamsResponse = await this.http.get<PortfolioParamsResponse>(`/portfolios/${id}`);
        const portfolio = {
            ...portfolioResponse,
            accountType: portfolioResponse.accountType ? PortfolioAccountType.valueByName(portfolioResponse.accountType) : null,
            iisType: portfolioResponse.iisType ? IisType.valueByName(portfolioResponse.iisType) : null,
            shareNotes: portfolioResponse.shareNotes ? portfolioResponse.shareNotes : {}
        } as PortfolioParams;
        const overview = await this.http.get<Overview>(`/portfolios/${id}/overview`);
        // проставляем идентификаторы чтобы работали разворачиваютщиеся блоки в табилицах
        overview.stockPortfolio.rows.forEach((value, index) => value.id = index.toString());
        overview.bondPortfolio.rows.forEach((value, index) => value.id = index.toString());
        return {id, portfolioParams: portfolio, overview};
    }
}
