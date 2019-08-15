import {Decimal} from "decimal.js";
import {MoneyTrade} from "./moneyTrade";
import {TradeDataHolder} from "./tradeDataHolder";

export class MoneySellTrade extends MoneyTrade {

    total(holder: TradeDataHolder): string {
        const totalWithoutFee = new Decimal(this.totalWithoutFee(holder)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        return holder.getFee() ? totalWithoutFee.plus(new Decimal(holder.getFee())).toString() : totalWithoutFee.toString();
    }

    totalWithoutFee(holder: TradeDataHolder): string {
        return holder.getDebitingCurrencyValue();
    }

    signedTotal(holder: TradeDataHolder): string {
        return new Decimal(this.totalWithoutFee(holder)).negated().toString();
    }
}