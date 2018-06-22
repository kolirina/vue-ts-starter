import {Share} from "../types";

export interface TradeDataHolder {

    getShare(): Share;

    getDate(): Date;

    getQuantity(): number;

    getPrice(): string;

    getFacevalue(): string;

    getNkd(): string;

    isPerOne(): boolean;

    getFee(): string;

    getNote(): string;

    isKeepMoney(): boolean;

    getMoneyAmount(): string;

    getCurrency(): string;
}