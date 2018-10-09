import {Decimal} from 'decimal.js';

export class BigMoney {

    private _amount: Decimal;

    private _currency: string;

    constructor(private value: string) {
        if (value) {
            const ar = value.split(' ');
            this._amount = new Decimal(ar[1]);
            this._currency = ar[0];
        }
    }

    get amount(): Decimal {
        return this._amount;
    }

    get currency(): string {
        return this._currency;
    }
}
