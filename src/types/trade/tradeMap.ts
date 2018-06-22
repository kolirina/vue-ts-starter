import {AssetType} from "../assetType";
import {Operation} from "../operation";
import {TradeData} from "../types";
import {Trade} from "./trade";
import {StockBuyTrade} from "./stockBuyTrade";
import {StockSellTrade} from "./stockSellTrade";
import {StockTrade} from "./stockTrade";
import {TradeDataHolder} from "./tradeDataHolder";
import {TradeValue} from "./tradeValue";
import {BondBuyTrade} from "./bondBuyTrade";
import {BondSellTrade} from "./bondSellTrade";
import {CouponTrade} from "./couponTrade";
import {DividendTrade} from "./dividendTrade";
import {AmortizationTrade} from "./amortizationTrade";
import {MoneyDepositTrade} from "./moneyDepositTrade";
import {MoneyWithdrawTrade} from "./moneyWithdrawTrade";
import {MoneyIncomeTrade} from "./moneyIncomeTrade";
import {MoneyLossTrade} from "./moneyLossTrade";

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
            [Operation.WITHDRAW.enumName]: {
                [TradeValue.TOTAL]: new MoneyWithdrawTrade().total,
                [TradeValue.TOTAL_WF]: new MoneyWithdrawTrade().totalWithoutFee,
                [TradeValue.TOTAL_SIGN]: new MoneyWithdrawTrade().signedTotal
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
    /*

    Map<OperationType, Class<? extends Trade>> moneyTrades = new HashMap<>();
    moneyTrades.put(OperationType.DEPOSIT, MoneyDepositTrade.class);
    moneyTrades.put(OperationType.WITHDRAW, MoneyWithdrawTrade.class);
    moneyTrades.put(OperationType.INCOME, IncomeTrade.class);
    moneyTrades.put(OperationType.LOSS, LossTrade.class);
    TRADE_CLASSES.put(AssetType.MONEY, moneyTrades);
}

public static Map<AssetType, Map<OperationType, Class<? extends Trade>>> getTradeClasses() {
    return TRADE_CLASSES;
}*/
}