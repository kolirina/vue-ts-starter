import {Decimal} from "decimal.js";
import {Trade} from "./trade";
import {TradeDataHolder} from "./tradeDataHolder";

export class CalculationTrade implements Trade {

    total(holder: TradeDataHolder): string {
        return this.totalWithoutFee(holder);
    }

    totalWithoutFee(holder: TradeDataHolder): string {
        if (holder.getPrice() && holder.getQuantity() && holder.getQuantity() !== 0) {
            let amount = new Decimal(holder.getPrice());
            const quantity = new Decimal(holder.getQuantity());
            if (!holder.isPerOne()) {
                amount = amount.dividedBy(quantity);
            }
            return amount.mul(quantity).toString();
        }
        return null;
    }

    signedTotal(holder: TradeDataHolder): string {
        return this.total(holder);
    }
}