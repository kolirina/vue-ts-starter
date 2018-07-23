import Component from 'vue-class-component';
import {namespace} from 'vuex-class/lib/bindings';
import {UI} from '../app/UI';
import {ClientInfo} from '../types/types';
import {StoreType} from '../vuex/storeType';

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            Импорт и экспорт
            <v-card>
                <v-card-text>
                    <el-upload class="upload-demo"
                               drag
                               action="https://jsonplaceholder.typicode.com/posts/"
                               :show-file-list="false"
                               :auto-upload="false"
                               :on-change="onChange"
                               :limit="1">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                        <div class="el-upload__tip" slot="tip">jpg/png files with a size less than 500kb</div>
                    </el-upload>
                    <el-button size="small" type="primary">Click to upload</el-button>
                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class ImportExportPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    private async mounted(): Promise<void> {

    }

    private onChange(file: any, fileList: any): void {
        console.log(file, fileList);
    }
}
