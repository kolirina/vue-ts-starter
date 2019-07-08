import Decimal from "decimal.js";
import {BondTrade} from "./bondTrade";
import {TradeDataHolder} from "./tradeDataHolder";

export class BondSellTrade extends BondTrade {

    total(holder: TradeDataHolder): string {
        const totalWithoutFee = new Decimal(this.totalWithoutFee(holder)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        return holder.getFee() ? totalWithoutFee.minus(new Decimal(holder.getFee())).toString() : totalWithoutFee.toString();
    }

    signedTotal(holder: TradeDataHolder): string {
        return new Decimal(this.total(holder)).negated().toString();
    }
}