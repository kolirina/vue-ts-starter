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
import {Storage} from "../platform/services/storage";
import {StoreKeys} from "../types/storeKeys";
import {AssetCategory} from "./assetService";
import {AssetQuotesFilter} from "./marketService";

/**
 * Сервис по работе с фильтром данных. Позволяет сохранять настройки фильтра в сессионном хранилище
 */
@Service("FiltersService")
@Singleton
export class FiltersService {

    @Inject
    private storageService: Storage;

    /**
     * Возвращает данные фильтра из хранилища
     * @return данные фильтра
     */
    getFilter<T>(stateKey: StoreKeys, defaultFilter: T = null): T {
        const filtersCache = this.storageService.get<FilterCache<T>>(StoreKeys.FILTERS_KEY, {});
        const filter = filtersCache[stateKey];
        if (filter) {
            return {
                ...(defaultFilter ? defaultFilter : null),
                ...filter
            };
        }
        return defaultFilter;
    }

    /**
     * Возвращает данные фильтра из хранилища
     * @return данные фильтра
     */
    getAssetFilter(stateKey: StoreKeys, defaultFilter: AssetQuotesFilter = null): AssetQuotesFilter {
        const filtersCache = this.storageService.get<FilterCache<AssetQuotesFilterPlain>>(StoreKeys.FILTERS_KEY, {});
        const filter = filtersCache[stateKey];
        if (filter) {
            return {
                ...(defaultFilter ? defaultFilter : null),
                searchQuery: filter.searchQuery,
                categories: filter.categories.map(category => AssetCategory.valueByName(category))
            } as AssetQuotesFilter;
        }
        return defaultFilter;
    }

    /**
     * Сохраняет данные фильтра в хранилище
     * @param stateKey ключ для сохранения фильтра в хранилище
     * @param filter данные фильтра
     */
    saveFilter<T>(stateKey: StoreKeys, filter: T): void {
        const filtersCache = this.storageService.get<FilterCache<T>>(StoreKeys.FILTERS_KEY, {});
        filtersCache[stateKey] = filter;
        this.storageService.set(StoreKeys.FILTERS_KEY, filtersCache);
    }

    /**
     * Сохраняет данные фильтра в хранилище
     * @param stateKey ключ для сохранения фильтра в хранилище
     * @param filter данные фильтра
     */
    saveAssetFilter(stateKey: StoreKeys, filter: AssetQuotesFilter): void {
        const filtersCache = this.storageService.get<FilterCache<AssetQuotesFilterPlain>>(StoreKeys.FILTERS_KEY, {});
        filtersCache[stateKey] = {
            searchQuery: filter.searchQuery,
            categories: filter.categories.map(category => category.code)
        };
        this.storageService.set(StoreKeys.FILTERS_KEY, filtersCache);
    }
}

type FilterCache<T> = {
    [key: string]: T
};

interface AssetQuotesFilterPlain {
    searchQuery: string;
    categories: string[];
}