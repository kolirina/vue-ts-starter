import {Component, UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <v-fade-transition mode="out-in">
            <div v-show="showed" class="loader">
                <svg
                        xmlns:dc="http://purl.org/dc/elements/1.1/"
                        xmlns:cc="http://creativecommons.org/ns#"
                        xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                        xmlns:svg="http://www.w3.org/2000/svg"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                        xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
                        version="1.1"
                        width="48"
                        enable-background="new 0 0 36 24"
                        xml:space="preserve"
                        height="26"
                        id="svg3694"
                        sodipodi:docname="vectorpaint2.svg"
                        inkscape:version="0.92.1 r15371">
            <metadata id="metadata3698">
              <rdf:RDF><cc:Work rdf:about=""
                  ><dc:format>image/svg+xml</dc:format
                  ><dc:type
                      rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title></dc:title></cc:Work></rdf:RDF>
            </metadata>
                    <sodipodi:namedview
                            pagecolor="#ffffff"
                            bordercolor="#666666"
                            borderopacity="1"
                            objecttolerance="10"
                            gridtolerance="10"
                            guidetolerance="10"
                            inkscape:pageopacity="0"
                            inkscape:pageshadow="2"
                            inkscape:window-width="1743"
                            inkscape:window-height="1057"
                            id="namedview3696"
                            showgrid="false"
                            inkscape:zoom="13.058824"
                            inkscape:cx="15.491337"
                            inkscape:cy="18.722967"
                            inkscape:window-x="-8"
                            inkscape:window-y="-8"
                            inkscape:window-maximized="1"
                            inkscape:current-layer="svg3694"/>
                    <rect
                            id="backgroundrect"
                            width="68.89077%"
                            height="90.391113%"
                            x="0"
                            y="0"
                            style="fill:none;stroke:none;stroke-width:0.78912061"/>
                    <defs id="defs3683">
              <clipPath id="mask">
                <polygon
                        transform="rotate(180,18,11)"
                        points="13.5,10.9 23.2,20.8 35.7,7.9 35.7,0 10,0 10,15.2 "
                        id="svg_1"/>
              </clipPath>
            </defs>
                    <g class="currentLayer" id="g3692" transform="scale(0.68890766)">
              <title id="title3685">Layer 1</title>
                        <g
                                transform="rotate(180,18,11)"
                                clip-path="url(#mask)"
                                id="svg_2"
                                class="selected"
                                style="fill:#4a78cc;fill-opacity:1">
                <rect
                        x="0"
                        y="0"
                        width="7"
                        height="14"
                        id="svg_3"
                        transform="scale(1,1.25136)"
                        style="fill:#4a78cc;fill-opacity:1">
                  <animateTransform
                          attributeType="xml"
                          attributeName="transform"
                          type="scale"
                          values="1,1; 1,1.5; 1,1"
                          begin="0.4s"
                          dur="0.8s"
                          repeatCount="indefinite"/>
                </rect>
                            <rect
                                    x="9"
                                    y="0"
                                    width="7"
                                    height="19"
                                    id="svg_4"
                                    transform="scale(1,0.452714)"
                                    style="fill:#4a78cc;fill-opacity:1">
                  <animateTransform
                          attributeType="xml"
                          attributeName="transform"
                          type="scale"
                          values="1,0.2; 1,1.2; 1,0.2"
                          begin="0.3s"
                          dur="0.8s"
                          repeatCount="indefinite"
                  />
                </rect>
                            <rect
                                    x="18"
                                    y="0"
                                    width="8"
                                    height="14"
                                    id="svg_5"
                                    transform="scale(1,0.846472)"
                                    style="fill:#4a78cc;fill-opacity:1">
                  <animateTransform
                          attributeType="xml"
                          attributeName="transform"
                          type="scale"
                          values="1,0.2; 1,1.5; 1,0.2"
                          begin="0s"
                          dur="0.8s"
                          repeatCount="indefinite"
                  />
                </rect>
              </g>
                        <polygon
                                points="10.2,17.7 0,30.2 10,20.8 10,34 16.9,34 16.9,22.2 19.7,25.1 19.7,34 26.7,34 26.7,25.3 29.5,22.5 29.5,34 36.4,34
                36.4,15.5 44.1,7.1 46.4,9.7 48,0 38.6,2 41.4,4.2 36.1,10.2 29.5,17 26.8,19.8 23.3,23.3 19.9,19.8 17.1,17 13.7,13.5 "
                                id="svg_6"
                                class=""
                                style="fill:#91da4a;fill-opacity:1"
                        />
            </g>
          </svg>
                <span>Загрузка...</span>
            </div>
        </v-fade-transition>
    `
})
export class LoaderState extends UI {

    private showed = false;

    mounted(): void {
        this.showed = true;
    }

    /**
     * Показывает лоадер
     */
    show(): void {
        if (this.$el) {
            // лоадер показан или закрыт
            return;
        }
        this.$mount(document.body.appendChild(document.createElement("div")));
    }

    /**
     * Скрывает лоадер
     */
    hide(): void {
        if (!this.$el || !this.$el.parentNode) {
            // лоадер не показан или закрыт
            return;
        }
        this.$destroy();
        document.body.removeChild(this.$el);
    }
}
