import {Component, UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[2]" alt="0" @click.stop="openImageDialog">
                </figure>
            </div>

            Для получения отчета перейдите в личный кабинет брокера →
            в верхнем меню выберите пункт <b>Отчеты</b> →
            в левом меню выберите <b>Брокерский отчет</b> →
            Нажмите кнопку <b>Подать поручение</b><br/>
            В диалоговом окне настройте период (оптимальный вариант: с даты первой сделки по текущий день) →
            укажите тип отчета <b>Xls</b> → Нажмите кнопку Сохранить<br/>
            Через некоторое время отчет будет готов, скачайте его по ссылке в таблице <b>Открыть</b><br/>
            При возникновении ошибок, попробуйте открыть файл в Excel <br/>
            и пересохраните в формате Excel-2003.<br>

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="0" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[1]" alt="0" @click.stop="openImageDialog">
                </figure>
            </div>
        </div>
    `
})
export class VtbInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/vtb/4.png",
        "./img/import_instructions/vtb/5.png",
        "./img/import_instructions/vtb/video.gif",
    ];

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
