export class BigMoney {

    private _amount: string;

    private _currency: string;

    constructor(private value: string) {
        if (value) {
            const ar = value.split(' ');
            this._amount = ar[1];
            this._currency = ar[0];
        }
    }

    get amount(): string {
        return this._amount;
    }

    get currency(): string {
        return this._currency;
    }
}