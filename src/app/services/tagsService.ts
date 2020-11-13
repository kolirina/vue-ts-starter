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
import {Http} from "../platform/services/http";
import {COLORS, DEFAULT_TAG_CATEGORY_NAME, DEFAULT_TAGS, NewTagCategoryRequest, NewTagRequest, TagCategory, UpdateTagCategoryRequest, UpdateTagRequest} from "../types/tags";

@Service("TagsService")
@Singleton
export class TagsService {

    @Inject
    private http: Http;

    private readonly BASE = "/tags";

    private tagCategories: TagCategory[] = null;

    /**
     * Возвращает данные по активам пользователя
     */
    async getTagCategories(): Promise<TagCategory[]> {
        if (!this.tagCategories) {
            this.tagCategories = await this.http.get<TagCategory[]>(this.BASE);
        }
        return this.tagCategories;
    }

    resetTagCategoriesCache(): void {
        this.tagCategories = null;
    }

    async createTagCategory(tagCategoryName: string): Promise<number> {
        const color = await this.getNewCategoryColor();
        const request: NewTagCategoryRequest = {
            name: tagCategoryName,
            color: color
        };
        return this.http.post<number>(`${this.BASE}/category`, request);
    }

    async createTag(newTagRequest: NewTagRequest): Promise<number> {
        return this.http.post<number>(`${this.BASE}/tag`, newTagRequest);
    }

    async editTagCategory(updateTagCategoryRequest: UpdateTagCategoryRequest): Promise<void> {
        return this.http.put(`${this.BASE}/category`, updateTagCategoryRequest);
    }

    async editTag(updateTagRequest: UpdateTagRequest): Promise<void> {
        return this.http.put(`${this.BASE}/tag`, updateTagRequest);
    }

    async deleteTagCategory(categoryId: number): Promise<void> {
        return this.http.delete(`${this.BASE}/category/${categoryId}`);
    }

    async deleteTag(tagId: number): Promise<void> {
        return this.http.delete(`${this.BASE}/tag/${tagId}`);
    }

    async createDefaults(): Promise<void> {
        const categoryId = await this.createTagCategory(DEFAULT_TAG_CATEGORY_NAME);
        for (const tag of DEFAULT_TAGS) {
            tag.categoryId = categoryId;
            await this.createTag(tag);
        }
        this.resetTagCategoriesCache();
    }

    /**
     * Возвращает цвет для новой категории
     */
    async getNewCategoryColor(): Promise<string> {
        const currentCategories = await this.getTagCategories();
        const newCategoryIndex = currentCategories.length;
        const color = COLORS[newCategoryIndex % 10];
        if (currentCategories.some(category => category.color === color)) {
            return COLORS[(newCategoryIndex + 1) % 10];
        }
        return color;
    }
}
