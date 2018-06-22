import {Trade} from "./trade";
import {Decimal} from "decimal.js";
import {TradeDataHolder} from "./tradeDataHolder";

export class BondTrade implements Trade {

    total(holder: TradeDataHolder): string {
        const totalWithoutFee = new Decimal(this.totalWithoutFee(holder));
        return holder.getFee() ? totalWithoutFee.plus(new Decimal(holder.getFee())).toString() : totalWithoutFee.toString();
    }

    totalWithoutFee(holder: TradeDataHolder): string {
        console.log(holder);
        let nkd = new Decimal('0');
        if (holder.getNkd()) {
            if (holder.isPerOne()) {
                nkd = new Decimal(holder.getNkd());
            } else if (holder.getQuantity() && holder.getQuantity() != 0) {
                nkd = new Decimal(holder.getNkd()).dividedBy(new Decimal(holder.getQuantity())).toDP(2, Decimal.ROUND_HALF_UP);
            }
        }
        return new Decimal(holder.getFacevalue() ? holder.getFacevalue() : '1000').mul(new Decimal(holder.getPrice())).dividedBy(100)
            .plus(nkd).mul(new Decimal(holder.getQuantity())).toString();
    }

    signedTotal(holder: TradeDataHolder): string {
        return this.total(holder);
    }
}