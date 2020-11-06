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
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

/**
 * Компонент для отображения ссылки на просмотр информации по акции
 */
import {Component, Prop, UI} from "../../app/ui";
import {CommonUtils} from "../../utils/commonUtils";
import {TagItem} from "./tagItem";
import {Tag, TagCategory} from "../../types/tags";

@Component({
    // language=Vue
    template: `
        <div class="portfolio-item">
            <div class="portfolio-item__header">
                <div v-if="!categoryEditMode" class="portfolio-item__header-description">{{ tagCategory.name }}</div>
                <div v-show="categoryEditMode" class="portfolio-item__header-description">
                    <v-text-field label="Название категории" v-model="categoryName" :counter="50" ref="categoryNameInput"
                                  v-validate="'required|max:50'" :error-messages="errors.collect('categoryNameInput')" name="categoryNameInput"
                                  @keydown.enter="editCategoryName" @keydown.esc="closeEditCategory"></v-text-field>
                </div>
                <v-icon title="Редактировать" @click="editCategory" small>fas fa-pencil-alt</v-icon>
                <div @click.stop class="margLAuto">
                    <v-icon title="Удалить" @click="deleteCategory" small>fas fa-trash-alt</v-icon>
                </div>
            </div>
            <div class="portfolio-item__body">
                <div class="portfolio-item__body-info">
                    <tag-item v-for="tag in tagCategory.tags" :key="tag.id" :tag="tag" @deleteTag="onDeleteTag"></tag-item>
                    <span @click="showCreateTagField">+</span>
                    <v-text-field v-show="createTag" label="Введите новый тэг" v-model="tagName" :counter="50" ref="tagNameInput"
                                  v-validate="'required|max:50'" :error-messages="errors.collect('tagName')" name="tagName"
                                  @keydown.enter="addTag" @keydown.esc="closeAddTag"></v-text-field>
                    <v-btn v-show="createTag" color="primary" @click.native="addTag" :disabled="!isTagValid">Сохранить</v-btn>
                    <v-btn v-show="createTag" @click.native="closeAddTag">Отмена</v-btn>
                </div>
            </div>
        </div>
    `,
    components: {TagItem}
})
export class TagCategoryCard extends UI {

    $refs: {
        tagNameInput: any;
        categoryNameInput: any;
    };

    @Prop({type: Object, required: true})
    private tagCategory: TagCategory;

    /** Признак создания тэга */
    private createTag = false;
    /** Название тэга */
    private tagName = "";
    /** Признак создания категории */
    private categoryEditMode = false;
    /** Название категории */
    private categoryName = "";

    /**
     * Инициализирует данные компонента
     */
    created(): void {
        this.categoryName = this.tagCategory.name;
    }

    /**
     * Посылает события удаления категории
     */
    private deleteCategory(): void {
        this.$emit("deleteCategory", this.tagCategory);
    }

    /**
     * Посылает событие удаления тэга
     * @param tag тэг
     */
    private onDeleteTag(tag: Tag): void {
        this.$emit("deleteTag", tag);
    }

    /**
     * Редактирует название категории
     */
    private editCategory(): void {
        this.categoryName = this.tagCategory.name;
        this.categoryEditMode = true;
        this.$nextTick(() => {
            try {
                this.$refs.categoryNameInput?.$refs?.input?.focus();
                this.$validator.errors.clear();
            } catch (e) {
                // mute
            }
        });
    }

    /**
     * Отображает поле для создания тэга и ставит в него фокус
     */
    private showCreateTagField(): void {
        this.createTag = true;
        this.$nextTick(() => {
            try {
                this.$refs.tagNameInput?.$refs?.input?.focus();
                this.$validator.errors.clear();
            } catch (e) {
                // mute
            }
        });
    }

    /**
     * Валидирует и посылает событие добавления тэга
     */
    private addTag(): void {
        if (!this.isTagValid()) {
            return;
        }
        this.$emit("createTag", {categoryId: this.tagCategory.id, tagName: this.tagName});
        this.closeAddTag();
    }

    /**
     * Посылает событие на изменение категории
     */
    private editCategoryName(): void {
        this.categoryName = CommonUtils.isBlank(this.categoryName) ? this.tagCategory.name : this.categoryName;
        // отправляем запрос только если действительно поменяли
        if (this.categoryName !== this.tagCategory.name) {
            this.$emit("editCategory", {categoryId: this.tagCategory.id, categoryName: this.categoryName});
            this.closeEditCategory();
        }
    }

    /**
     * Закрывает поле ввода нового тэга и очищает его
     */
    private closeAddTag(): void {
        this.createTag = false;
        this.tagName = "";
    }

    /**
     * Закрывает поле редактирования категории и очищает переменную
     */
    private closeEditCategory(): void {
        this.categoryEditMode = false;
        this.categoryName = "";
    }

    /**
     * Проверяет название тэга
     */
    private isTagValid(): boolean {
        return !CommonUtils.isBlank(this.tagName);
    }
}
