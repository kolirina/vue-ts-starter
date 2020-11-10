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

import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class";
import {Component, UI} from "../../app/ui";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {CreateTagCategoryDialog} from "../../components/dialogs/createTagCategoryDialog";
import {TagCategoryForbiddenDialog} from "../../components/dialogs/tagCategoryForbiddenDialog";
import {TagCategoryCard} from "../../components/tags/tagCategoryCard";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo} from "../../services/clientService";
import {TagsService} from "../../services/tagsService";
import {Tag, TagCategory} from "../../types/tags";
import {Tariff} from "../../types/tariff";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid class="page-wrapper">
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Управление тэгами</div>
                </v-card-title>
            </v-card>
            <v-layout class="profile" column>
                <div class="tags-list" data-v-step="1">
                    <tag-category-card v-for="tagCategory in tagCategories" :key="tagCategory.id" :tag-category="tagCategory"
                                       @deleteCategory="onDeleteCategory" @deleteTag="onDeleteTag" @createTag="onCreateTag" @editCategory="onEditCategory"></tag-category-card>
                    <v-btn @click.stop="createNewCategory" color="#f7f9fb" class="tags-list-item-add"></v-btn>
                </div>
            </v-layout>
        </v-container>
    `,
    components: {TagCategoryCard}
})
export class TagsSettingsPage extends UI {

    @Inject
    private tagsService: TagsService;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    /** Категории тэгов пользователя */
    private tagCategories: TagCategory[] = [];

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadTagCategories();
    }

    /**
     * Загружает категории пользователя
     */
    @ShowProgress
    private async loadTagCategories(): Promise<void> {
        this.tagCategories = await this.tagsService.getTagCategories();
    }

    /**
     * Удаляет категорию пользователя
     * @param tagCategory категория
     */
    private async onDeleteCategory(tagCategory: TagCategory): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы собираетесь  удалить категорию ${tagCategory.name}, это приведет к потере всех тегов связанных с данной категорией.`);
        if (result === BtnReturn.YES) {
            await this.deleteTagCategory(tagCategory.id);
        }
    }

    @ShowProgress
    private async deleteTagCategory(categoryId: number): Promise<void> {
        await this.tagsService.deleteTagCategory(categoryId);
        this.tagsService.resetTagCategoriesCache();
        await this.loadTagCategories();
        this.$snotify.info("Категория успешно удалена");
    }

    @ShowProgress
    private async onDeleteTag(tag: Tag): Promise<void> {
        await this.tagsService.deleteTag(tag.id);
        const tagCategory = this.tagCategories.find(tagCategoryItem => tagCategoryItem.id === tag.categoryId);
        tagCategory.tags = tagCategory.tags.filter(tagItem => tagItem.id !== tag.id);
    }

    /**
     * Создает новую категорию
     */
    private async createNewCategory(): Promise<void> {
        if (this.tagCategories.length >= 1 && ![Tariff.PRO, Tariff.TRIAL].includes(this.clientInfo.user.tariff)) {
            await new TagCategoryForbiddenDialog().show();
            return;
        }
        const categoryName = await new CreateTagCategoryDialog().show();
        if (categoryName) {
            await this.tagsService.createTagCategory(categoryName);
            this.tagsService.resetTagCategoriesCache();
            await this.loadTagCategories();
        }
    }

    /**
     * Создает новый тэг
     * @param tagCreateEvent события с новым тэгом
     */
    private async onCreateTag(tagCreateEvent: { categoryId: number, tagName: string }): Promise<void> {
        const tagId = await this.tagsService.createTag({categoryId: tagCreateEvent.categoryId, name: tagCreateEvent.tagName});
        const tagCategory = this.tagCategories.find(tagCategoryItem => tagCategoryItem.id === tagCreateEvent.categoryId);
        tagCategory.tags.push({id: tagId, name: tagCreateEvent.tagName, categoryId: tagCreateEvent.categoryId});
    }

    /**
     * Редактирует название категории
     * @param editCategoryEvent
     */
    private async onEditCategory(editCategoryEvent: { categoryId: number, categoryName: string }): Promise<void> {
        await this.tagsService.editTagCategory({categoryId: editCategoryEvent.categoryId, name: editCategoryEvent.categoryName});
        const tagCategory = this.tagCategories.find(tagCategoryItem => tagCategoryItem.id === editCategoryEvent.categoryId);
        tagCategory.name = editCategoryEvent.categoryName;
    }
}
