import {MoneyTrade} from "./moneyTrade";
import {TradeDataHolder} from "./tradeDataHolder";
import {Decimal} from "decimal.js";

export class MoneyWithdrawTrade extends MoneyTrade {

    total(holder: TradeDataHolder): string {
        return this.totalWithoutFee(holder);
    }

    signedTotal(holder: TradeDataHolder): string {
        return new Decimal(this.totalWithoutFee(holder)).negated().toString();
    }
}