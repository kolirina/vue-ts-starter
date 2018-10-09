import {Decimal} from 'decimal.js';
import {Trade} from './trade';
import {TradeDataHolder} from './tradeDataHolder';

export class StockTrade implements Trade {

    total(holder: TradeDataHolder): string {
        const totalWithoutFee = new Decimal(this.totalWithoutFee(holder));
        return holder.getFee() ? totalWithoutFee.plus(new Decimal(holder.getFee())).toString() : totalWithoutFee.toString();
    }

    totalWithoutFee(holder: TradeDataHolder): string {
        return new Decimal(holder.getPrice()).mul(new Decimal(holder.getQuantity())).toString();
    }

    signedTotal(holder: TradeDataHolder): string {
        return this.total(holder);
    }
}