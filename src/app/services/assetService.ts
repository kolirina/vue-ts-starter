/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Http, UrlParams} from "../platform/services/http";
import {PageableResponse, Pagination} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {AssetQuotesFilter} from "./marketService";

@Service("AssetService")
@Singleton
export class AssetService {

    @Inject
    private http: Http;

    private readonly BASE = "/asset";

    /**
     * Возвращает данные по активам пользователя
     */
    async getUserAssets(): Promise<AssetModel[]> {
        const result = await this.http.get<AssetModelDto[]>(`${this.BASE}/user`);
        return result.map(asset => {
            return {
                ...asset,
                category: AssetCategory.valueByName(asset.category)
            } as AssetModel;
        });
    }

    /**
     * Возвращает данные по активам пользователя
     */
    async getCommonAssets(pagination: Pagination, assetFilter: AssetQuotesFilter): Promise<PageableResponse<AssetModel>> {
        const offset: number = pagination.rowsPerPage * (pagination.page - 1) || 0;
        const pageSize: number = pagination.rowsPerPage || 50;
        const sortColumn: string = pagination.sortBy || "ticker";
        const descending: boolean = pagination.descending;
        const search: string = assetFilter.searchQuery || "";
        const category: string[] = assetFilter.categories.map(c => c.code);
        const currency: string = assetFilter.currency;
        const urlParams: UrlParams = {offset, pageSize, search, category};
        if (sortColumn) {
            urlParams.sortColumn = sortColumn.toUpperCase();
        }
        if (CommonUtils.exists(descending)) {
            urlParams.descending = descending;
        }
        if (CommonUtils.exists(currency)) {
            urlParams.currency = currency;
        }
        const result = await this.http.get<PageableResponse<AssetModelDto>>(`${this.BASE}/common`, urlParams);
        return {
            descending: result.descending,
            offset: result.offset,
            pageNumber: result.pageNumber,
            pages: result.pages,
            pageSize: result.pageSize,
            totalItems: result.totalItems,
            content: result.content.map(asset => {
                return {
                    ...asset,
                    category: AssetCategory.valueByName(asset.category)
                } as AssetModel;
            })
        } as PageableResponse<AssetModel>;
    }

    async saveAsset(asset: AssetModel): Promise<void> {
        return this.http.post(this.BASE, this.mapToRequest(asset));
    }

    async editAsset(asset: AssetModel): Promise<void> {
        return this.http.put(this.BASE, this.mapToRequest(asset));
    }

    async checkSource(request: CheckAssetModel): Promise<string> {
        return this.http.post<string>(`${this.BASE}/check`, request);
    }

    async deleteAsset(assetId: number): Promise<void> {
        return this.http.delete(`${this.BASE}/${assetId}`);
    }

    private mapToRequest(asset: AssetModel): AssetModelDto {
        return {
            category: asset.category.code,
            ticker: asset.ticker,
            currency: asset.currency,
            name: asset.name,
            price: asset.price,
            source: asset.source,
            regex: asset.regex,
            tags: asset.tags,
            note: asset.note
        } as AssetModelDto;
    }
}

export interface AssetModelBase {
    /** Идентификатор актива */
    id?: number;
    /** Код актива (может быть ticker/isin или еще какой-то однозначно идентифицирцющий актив во внешней системе) */
    ticker: string;
    /** Валюта актива */
    currency: string;
    /** Название актива */
    name: string;
    /** Цена актива (текущая) */
    price: string;
    /** Url по которму можно парсить цену */
    source: string;
    /** Регулярное выражение для парсинга цены */
    regex: string;
    /** Список тэгов */
    tags: string;
    /** Заметка */
    note: string;
}

export interface AssetModel extends AssetModelBase {
    /** Тип актива */
    category: AssetCategory;
}

export interface CheckAssetModel {
    /** Url по которму можно парсить цену */
    source: string;
    /** Регулярное выражение для парсинга цены */
    regex: string;
}

export interface AssetModelDto extends AssetModelBase {
    /** Тип актива */
    category: string;
}

@Enum("code")
export class AssetCategory extends (EnumType as IStaticEnum<AssetCategory>) {

    static readonly STOCK = new AssetCategory("STOCK", "Акции");
    static readonly BOND = new AssetCategory("BOND", "Облигации");
    static readonly MONEY = new AssetCategory("MONEY", "Деньги");
    static readonly ETF = new AssetCategory("ETF", "ETF/ПИФ");
    static readonly FUTURE = new AssetCategory("FUTURE", "Фьючерсы");
    static readonly OPTION = new AssetCategory("OPTION", "Опционы");
    static readonly METALL = new AssetCategory("METALL", "Драгметаллы");
    static readonly REALTY = new AssetCategory("REALTY", "Недвижимость");
    static readonly CURRENCY = new AssetCategory("CURRENCY", "Валюты");
    static readonly CRYPTO_CURRENCY = new AssetCategory("CRYPTO_CURRENCY", "Криптовалюты");
    static readonly OTHER = new AssetCategory("OTHER", "Разное");

    private constructor(public code: string, public description: string) {
        super();
    }
}