import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {CombinedInfoRequest} from "../types/types";

@Service("ExportService")
@Singleton
export class ExportService {

    @Inject
    private http: Http;

    /**
     * Скачивает файл со сделками в формате csv
     * @param portfolioId идентификатор портфеля
     */
    async exportTrades(portfolioId: number): Promise<any> {
        const response = await this.http.get<Response>(`/export/${portfolioId}`);
        const fileName = this.getFileName(response.headers, portfolioId, ExportType.TRADES_CSV);
        await this.download(response, fileName);
    }

    /**
     * Скачивает файл с отчетом в формате xlsx
     * @param portfolioId идентификатор портфеля
     * @param exportType тип отчета для экспорта
     */
    async exportReport(portfolioId: number, exportType: ExportType): Promise<any> {
        const response = await this.http.get<Response>(`/export/${exportType}/${portfolioId}`);
        const fileName = this.getFileName(response.headers, portfolioId, exportType);
        await this.download(response, fileName);
    }

    /**
     * Скачивает файл с отчетом в формате xlsx
     * @param request запрос экспорта комбинированного портфеля
     */
    async exportCombinedReport(request: CombinedInfoRequest): Promise<any> {
        const response = await this.http.post<Response>("/export/combined", request);
        const fileName = this.getCombinedFileName(response.headers, request.ids);
        await this.download(response, fileName);
    }

    private async download(response: Response, fileName: string): Promise<void> {
        if (!window.navigator.msSaveOrOpenBlob) {
            const blob = await response.blob();
            const binaryData = [];
            binaryData.push(blob);
            const link = document.createElement("a");
            link.href = (window.URL || (window as any).webkitURL).createObjectURL(new Blob(binaryData, {type: "application/octet-stream"}));
            link.download = fileName;
            link.dispatchEvent(new MouseEvent("click", {bubbles: true, cancelable: true, view: window}));
        } else {
            // BLOB FOR EXPLORER 11
            window.navigator.msSaveOrOpenBlob(await response.blob(), fileName);
        }
    }

    /**
     * Возвращает имя файла
     * @param headers заголовки ответа
     * @param portfolioId идентификатор портфеля
     * @param exportType тип экспорта
     */
    private getFileName(headers: Headers, portfolioId: number, exportType: ExportType): string {
        try {
            for (const entry of headers.entries()) {
                if (entry[0] === "content-disposition") {
                    const contentDisposition = entry[1];
                    if (contentDisposition) {
                        return contentDisposition.substring(contentDisposition.indexOf("=") + 1).trim();
                    }
                }
            }
        } catch (e) {
        }
        return `${exportType.toLowerCase()}_portfolio_${portfolioId}.${exportType === ExportType.TRADES_CSV ? "csv" : "xlsx"}`;
    }

    /**
     * Возвращает имя файла
     * @param headers заголовки ответа
     * @param portfolioIds идентификаторы портфелей
     */
    private getCombinedFileName(headers: Headers, portfolioIds: number[]): string {
        try {
            const contentDisposition = (headers as any)["content-disposition"];
            return contentDisposition.substring(contentDisposition.indexOf("=") + 1).trim();
        } catch (e) {
            return `combined_portfolio_[${portfolioIds.join(",")}].xlsx`;
        }
    }
}

/** Тип отчета для экспорта */
export enum ExportType {
    TRADES = "TRADES",
    TRADES_CSV = "TRADES_CSV",
    STOCKS = "STOCKS",
    ETF = "ETF",
    BONDS = "BONDS",
    ASSETS = "ASSETS",
    DIVIDENDS = "DIVIDENDS",
    DIVIDENDS_BY_TICKER = "DIVIDENDS_BY_TICKER",
    DIVIDENDS_BY_YEAR_AND_TICKER = "DIVIDENDS_BY_YEAR_AND_TICKER",
    DIVIDENDS_BY_YEAR = "DIVIDENDS_BY_YEAR",
    COMPLEX = "COMPLEX",
    BOND_CALCULATIONS = "BOND_CALCULATIONS"
}
