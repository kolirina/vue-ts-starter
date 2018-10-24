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
}
