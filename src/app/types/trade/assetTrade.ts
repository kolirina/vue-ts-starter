/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * ÑÒĞÎÃÎ ÊÎÍÔÈÄÅÍÖÈÀËÜÍÎ
 * ÊÎÌÌÅĞ×ÅÑÊÀß ÒÀÉÍÀ
 * ÑÎÁÑÒÂÅÍÍÈÊ:
 *       ÎÎÎ "Èíòåëëåêòóàëüíûå èíâåñòèöèè", ÈÍÍ 1655386205
 *       420107, ĞÅÑÏÓÁËÈÊÀ ÒÀÒÀĞÑÒÀÍ, ÃÎĞÎÄ ÊÀÇÀÍÜ, ÓËÈÖÀ ÑÏÀĞÒÀÊÎÂÑÊÀß, ÄÎÌ 2, ÏÎÌÅÙÅÍÈÅ 119
 * (c) ÎÎÎ "Èíòåëëåêòóàëüíûå èíâåñòèöèè", 2019
 */

import {Decimal} from "decimal.js";
import {Trade} from "./trade";
import {TradeDataHolder} from "./tradeDataHolder";

export class AssetTrade implements Trade {

    total(holder: TradeDataHolder): string {
        const totalWithoutFee = new Decimal(this.totalWithoutFee(holder)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        return holder.getFee() ? totalWithoutFee.plus(new Decimal(holder.getFee())).toString() : totalWithoutFee.toString();
    }

    totalWithoutFee(holder: TradeDataHolder): string {
        return new Decimal(holder.getPrice()).mul(new Decimal(holder.getQuantity())).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
    }

    signedTotal(holder: TradeDataHolder): string {
        return this.total(holder);
    }
}