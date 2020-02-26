import {Decimal} from "decimal.js";
import {Trade} from "./trade";
import {TradeDataHolder} from "./tradeDataHolder";

export class BondTrade implements Trade {

    total(holder: TradeDataHolder): string {
        const totalWithoutFee = new Decimal(this.totalWithoutFee(holder)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        return holder.getFee() ? totalWithoutFee.plus(new Decimal(holder.getFee())).toString() : totalWithoutFee.toString();
    }

    totalWithoutFee(holder: TradeDataHolder): string {
        let nkdTotal = new Decimal("0");
        if (holder.getNkd()) {
            if (holder.isPerOne()) {
                nkdTotal = new Decimal(holder.getNkd()).mul(new Decimal(holder.getQuantity()));
            } else if (holder.getQuantity() && !new Decimal(holder.getQuantity()).isZero()) {
                nkdTotal = new Decimal(holder.getNkd());
            }
        }
        return new Decimal(holder.getFacevalue() ? holder.getFacevalue() : "1000").mul(new Decimal(holder.getPrice())).dividedBy(100)
            .mul(new Decimal(holder.getQuantity())).plus(nkdTotal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
    }

    signedTotal(holder: TradeDataHolder): string {
        return this.total(holder);
    }
}