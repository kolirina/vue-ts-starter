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

export class CurrencyTrade implements Trade {

    total(holder: TradeDataHolder): string {
        return this.totalWithoutFee(holder);
    }

    totalWithoutFee(holder: TradeDataHolder): string {
        if (holder.getMoneyAmount()) {
            return new Decimal(holder.getMoneyAmount()).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
        }
        return null;
    }

    signedTotal(holder: TradeDataHolder): string {
        return this.total(holder);
    }
}