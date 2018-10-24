/**
 * Сущность сделки, добавялемой пользователем (либо через ручной ввод, либо через импорт).
 * Определяет все необходимые и достаточные поля для занесения сделки в портфель.
 */
import {TradeDataHolder} from "./tradeDataHolder";

export interface Trade {

    total(holder: TradeDataHolder): string;
    signedTotal(holder: TradeDataHolder): string;
    totalWithoutFee(holder: TradeDataHolder): string;
}