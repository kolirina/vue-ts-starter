import {Decimal} from "decimal.js";
import {Trade} from "./trade";
import {TradeDataHolder} from "./tradeDataHolder";

export class BondTrade implements Trade {

    total(holder: TradeDataHolder): string {
        const totalWithoutFee = new Decimal(this.totalWithoutFee(holder)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        return holder.getFee() ? totalWithoutFee.plus(new Decimal(holder.getFee())).toString() : totalWithoutFee.toString();
    }

    totalWithoutFee(holder: TradeDataHolder): string {
        let nkd = new Decimal("0");
        if (holder.getNkd()) {
            if (holder.isPerOne()) {
                nkd = new Decimal(holder.getNkd());
            } else if (holder.getQuantity() && holder.getQuantity() !== 0) {
                nkd = new Decimal(holder.getNkd()).dividedBy(new Decimal(holder.getQuantity())).toDP(2, Decimal.ROUND_HALF_UP);
            }
        }
        return new Decimal(holder.getFacevalue() ? holder.getFacevalue() : "1000").mul(new Decimal(holder.getPrice())).dividedBy(100)
            .plus(nkd).mul(new Decimal(holder.getQuantity())).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
    }

    signedTotal(holder: TradeDataHolder): string {
        return this.total(holder);
    }
}