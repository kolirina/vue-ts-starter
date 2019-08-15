import {AssetType} from "../assetType";
import {Operation} from "../operation";
import {AmortizationTrade} from "./amortizationTrade";
import {BondBuyTrade} from "./bondBuyTrade";
import {BondSellTrade} from "./bondSellTrade";
import {CouponTrade} from "./couponTrade";
import {DividendTrade} from "./dividendTrade";
import {MoneyBuyTrade} from "./MoneyBuyTrade";
import {MoneyDepositTrade} from "./moneyDepositTrade";
import {MoneyIncomeTrade} from "./moneyIncomeTrade";
import {MoneyLossTrade} from "./moneyLossTrade";
import {MoneySellTrade} from "./MoneySellTrade";
import {StockBuyTrade} from "./stockBuyTrade";
import {StockSellTrade} from "./stockSellTrade";
import {TradeDataHolder} from "./tradeDataHolder";
import {TradeValue} from "./tradeValue";

export class TradeMap {
    /**
     * Структура, повзоляющая быстро найти необходимый тип сделки по выбранным пользователям компонентам
     */
    static readonly TRADE_CLASSES: { [key: string]: { [key: string]: { [key: string]: (holder: TradeDataHolder) => string } } } = {
        [AssetType.STOCK.enumName]: {
            [Operation.BUY.enumName]: {
                [TradeValue.TOTAL]: new StockBuyTrade().total,
                [TradeValue.TOTAL_WF]: new StockBuyTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new StockBuyTrade().signedTotal
            },
            [Operation.SELL.enumName]: {
                [TradeValue.TOTAL]: new StockSellTrade().total,
                [TradeValue.TOTAL_WF]: new StockSellTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new StockSellTrade().signedTotal
            },
            [Operation.DIVIDEND.enumName]: {
                [TradeValue.TOTAL]: new DividendTrade().total,
                [TradeValue.TOTAL_WF]: new DividendTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new DividendTrade().signedTotal
            }
        },
        [AssetType.BOND.enumName]: {
            [Operation.BUY.enumName]: {
                [TradeValue.TOTAL]: new BondBuyTrade().total,
                [TradeValue.TOTAL_WF]: new BondBuyTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new BondBuyTrade().signedTotal
            },
            [Operation.SELL.enumName]: {
                [TradeValue.TOTAL]: new BondSellTrade().total,
                [TradeValue.TOTAL_WF]: new BondSellTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new BondSellTrade().signedTotal
            },
            [Operation.COUPON.enumName]: {
                [TradeValue.TOTAL]: new CouponTrade().total,
                [TradeValue.TOTAL_WF]: new CouponTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new CouponTrade().signedTotal
            },
            [Operation.AMORTIZATION.enumName]: {
                [TradeValue.TOTAL]: new AmortizationTrade().total,
                [TradeValue.TOTAL_WF]: new AmortizationTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new AmortizationTrade().signedTotal
            },
            [Operation.REPAYMENT.enumName]: {
                [TradeValue.TOTAL]: new BondSellTrade().total,
                [TradeValue.TOTAL_WF]: new BondSellTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new BondSellTrade().signedTotal
            }
        },
        [AssetType.MONEY.enumName]: {
            [Operation.DEPOSIT.enumName]: {
                [TradeValue.TOTAL]: new MoneyDepositTrade().total,
                [TradeValue.TOTAL_WF]: new MoneyDepositTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new MoneyDepositTrade().signedTotal
            },
            [Operation.CURRENCY_BUY.enumName]: {
                [TradeValue.TOTAL]: new MoneyBuyTrade().total,
                [TradeValue.TOTAL_WF]: new MoneyBuyTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new MoneyBuyTrade().signedTotal
            },
            [Operation.CURRENCY_SELL.enumName]: {
                [TradeValue.TOTAL]: new MoneySellTrade().total,
                [TradeValue.TOTAL_WF]: new MoneySellTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new MoneySellTrade().signedTotal
            },
            [Operation.INCOME.enumName]: {
                [TradeValue.TOTAL]: new MoneyIncomeTrade().total,
                [TradeValue.TOTAL_WF]: new MoneyIncomeTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new MoneyIncomeTrade().signedTotal
            },
            [Operation.LOSS.enumName]: {
                [TradeValue.TOTAL]: new MoneyLossTrade().total,
                [TradeValue.TOTAL_WF]: new MoneyLossTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new MoneyLossTrade().signedTotal
            }
        }
    };
}