import {Decimal} from "decimal.js";
import {Trade} from "./trade";
import {TradeDataHolder} from "./tradeDataHolder";

export class MoneyTrade implements Trade {

    total(holder: TradeDataHolder): string {
        return this.totalWithoutFee(holder);
    }

    totalWithoutFee(holder: TradeDataHolder): string {
        if (holder.getMoneyAmount()) {
            return new Decimal(holder.getMoneyAmount()).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
        }
        return null;
    }

    signedTotal(holder: TradeDataHolder): string {
        return this.total(holder);
    }
}