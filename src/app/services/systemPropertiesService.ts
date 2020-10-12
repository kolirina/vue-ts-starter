/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {MapType} from "../types/types";

@Service("SystemPropertiesService")
@Singleton
export class SystemPropertiesService {

    @Inject
    private http: Http;

    private systemProperties: MapType = null;

    async getSystemProperties(): Promise<MapType> {
        if (!this.systemProperties) {
            this.systemProperties = await this.loadSystemProperties();
        }
        return this.systemProperties;
    }

    private async loadSystemProperties(): Promise<MapType> {
        return this.http.get<MapType>("/property");
    }
}

export enum SystemPropertyName {
    NEW_TARIFFS_DATE_FROM = "new_tariffs_date_from"
}
