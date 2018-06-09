export type AssetRow = {
    name: string,
    currentCost: string,
    profit: string,
    currentShare: string
}

export type TradeRow = {
    id: string,
    ticker: string,
    name: string,
    operation: string,
    date: string,
    quantity: string,
    price: string,
    fee: string,
    total: string,
    comment?: string
}

export type ShareRow = {
    company: string,
    ticker: string,
    avgPrice: string,
    currentPrice: string,
    currentCost: string,
    profit: string,
    profitPercent: string,
    currentShare: string
}

export type _stockRow = {
    stock?: string
}

export type _bondRow = {
    bond?: string
}

export type StockRow = ShareRow & _stockRow;

export type BondRow = ShareRow & _bondRow;

export type Overview = {
    stockRows: StockRow[],
    bondRows: BondRow[],
    assets: AssetRow[],
    dashboard: DashboardBlock
}

export type Portfolio = {
    id: string,
    trades: TradeRow[],
    overview: Overview
}

export type TableHeader = {
    text: string,
    align?: string,
    sortable?: boolean,
    value: string
}

export type DashboardBrick = {
    name: string,
    mainValue: string,
    secondValue: string,
    secondValueDesc?: string,
    color: string,
    icon: string
}

export type DashboardBlock = {
    bricks: DashboardBrick[]
}

export type PortfolioRow = {
    id: string,
    name: string,
    access: string,
    fixFee: string,
    currency: string,
    type: string,
    openDate: string
}

export class ClientInfo {

    token: string;
    client: Client
}

export type Client = {
    id: string,
    username: string,
    email: string,
    tariff: string,
    paidTill: string,
    currentPortfolioId: string,
    portfolios: PortfolioRow[]
}

export interface ProfileState {
    user?: ClientInfo;
    error: boolean;
}

export interface RootState {
    version: string;
}