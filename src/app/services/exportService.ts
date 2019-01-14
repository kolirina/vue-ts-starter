import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";

@Service("ExportService")
@Singleton
export class ExportService {

    @Inject
    private http: Http;

    /**
     * Скачивает файл со сделками в формате csv
     * @param portfolioId идентификатор портфеля
     */
    async exportTrades(portfolioId: string): Promise<any> {
        const response = await this.http.get<Response>(`/export/${portfolioId}`);
        if (!window.navigator.msSaveOrOpenBlob) {
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `trades_portfolio_${portfolioId}.csv`;
            link.click();
        } else {
            // BLOB FOR EXPLORER 11
            window.navigator.msSaveOrOpenBlob(await response.blob(), `trades_portfolio_${portfolioId}.csv`);
        }
    }

    /**
     * Скачивает файл с отчетом в формате xlsx
     * @param portfolioId идентификатор портфеля
     * @param exportType тип отчета для экспорта
     */
    async exportReport(portfolioId: string, exportType: ExportType): Promise<any> {
        const response = await this.http.get<Response>(`/export/${exportType}/${portfolioId}`);
        const fileName = this.getFileName(response.headers);
        if (!window.navigator.msSaveOrOpenBlob) {
            const blob = response.blob();
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            // BLOB FOR EXPLORER 11
            window.navigator.msSaveOrOpenBlob(response.blob(), fileName);
        }
    }

    /**
     * Возвращает имя файла
     * @param headers заголовки ответа
     */
    private getFileName(headers: Headers): string {
        try {
            const contentDisposition = (headers as any)["content-disposition"];
            return contentDisposition.substring(contentDisposition.indexOf("=") + 1).trim();
        } catch (e) {
            return "report.xlsx";
        }
    }
}

/** Тип отчета для экспорта */
export enum ExportType {
    TRADES = "TRADES",
    STOCKS = "STOCKS",
    BONDS = "BONDS",
    DIVIDENDS = "DIVIDENDS",
    DIVIDENDS_BY_TICKER = "DIVIDENDS_BY_TICKER",
    DIVIDENDS_BY_YEAR_AND_TICKER = "DIVIDENDS_BY_YEAR_AND_TICKER",
    DIVIDENDS_BY_YEAR = "DIVIDENDS_BY_YEAR",
    COMPLEX = "COMPLEX",
    BOND_CALCULATIONS = "BOND_CALCULATIONS"
}