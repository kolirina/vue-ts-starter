import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";

@Service("ExportService")
@Singleton
export class ExportService {

    /**
     * Скачивает файл со сделками в формате csv
     * @param portfolioId идентификатор портфеля
     */
    async exportTrades(portfolioId: string): Promise<any> {
        const response = await HTTP.INSTANCE.get(`/export/${portfolioId}`, {responseType: "blob"});
        if (!window.navigator.msSaveOrOpenBlob) {
            const blob = new Blob([response.data], {type: "text/plain"});
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `trades_portfolio_${portfolioId}.csv`;
            link.click();
        } else {
            // BLOB FOR EXPLORER 11
            window.navigator.msSaveOrOpenBlob(new Blob([response.data]), `trades_portfolio_${portfolioId}.csv`);
        }
    }

    /**
     * Скачивает файл с отчетом в формате xlsx
     * @param portfolioId идентификатор портфеля
     * @param exportType тип отчета для экспорта
     */
    async exportReport(portfolioId: string, exportType: ExportType): Promise<any> {
        const response = await HTTP.INSTANCE.get(`/export/${exportType}/${portfolioId}`, {responseType: "blob"});
        const fileName = this.getFileName(response.headers);
        if (!window.navigator.msSaveOrOpenBlob) {
            const blob = new Blob([response.data]);
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            // BLOB FOR EXPLORER 11
            window.navigator.msSaveOrOpenBlob(new Blob([response.data]), fileName);
        }
    }

    /**
     * Возвращает имя файла
     * @param headers заголовки ответа
     */
    private getFileName(headers: { [key: string]: string }): string {
        try {
            const contentDisposition = headers["content-disposition"];
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