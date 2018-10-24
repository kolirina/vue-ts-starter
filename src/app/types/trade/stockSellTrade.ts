import Decimal from "decimal.js";
import {StockTrade} from "./stockTrade";
import {TradeDataHolder} from "./tradeDataHolder";

export class StockSellTrade extends StockTrade {

    total(holder: TradeDataHolder): string {
        const totalWithoutFee = new Decimal(holder.getPrice()).mul(new Decimal(holder.getQuantity()));
        return holder.getFee() ? totalWithoutFee.minus(new Decimal(holder.getFee())).toString() : totalWithoutFee.toString();
    }

    signedTotal(holder: TradeDataHolder): string {
        return new Decimal(this.total(holder)).negated().toString();
    }
}