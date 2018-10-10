import {Decimal} from "decimal.js";
import {MoneyTrade} from "./moneyTrade";
import {TradeDataHolder} from "./tradeDataHolder";

export class MoneyWithdrawTrade extends MoneyTrade {

    total(holder: TradeDataHolder): string {
        return this.totalWithoutFee(holder);
    }

    signedTotal(holder: TradeDataHolder): string {
        return new Decimal(this.totalWithoutFee(holder)).negated().toString();
    }
}