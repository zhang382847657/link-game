<template>
    <div ref="container" class="container">
        <div>
            <button class="music" :style="{backgroundImage: isMute ? `url(${require('../assets/jingyin.png')})` : `url(${require('../assets/yinliangjian.png')})` }"  @click="musicPress()"/>
        </div>
        <table ref="table" align="center" border="0" cellspacing="0" cellpadding="0">
            <tr v-for="(row, rowIndex) in linkData" :key="`row-${rowIndex}`">
                <td v-for="(col, colIndex) in row"
                    :ref="`cell-${rowIndex}-${colIndex}`"
                    :key="`col-${colIndex}`">
                    <!--    占位的空白Cell     -->
                    <img v-if="col.isBlank"
                         class="img-disactive"/>
                    <!--    图案Cell     -->
                    <img v-else
                         draggable="false"
                         :class="{'img-active':col.isActive, 'img-disactive':!col.isActive}"
                         :src="col.imgSrc"
                         @click="cellPress(rowIndex, colIndex)"/>
                </td>
            </tr>
        </table>
        <canvas ref="canvas" style="position: absolute;top: 0;left: 0;pointer-events: none; z-index: 999"></canvas>
        <audio ref="bgMusic" style="display:none; height: 0" preload="auto" controls="controls" loop="loop" autoplay :muted="isMute">
            <source src="../assets/bg_music.mp3" type="audio/mpeg">
        </audio>
        <audio ref="lightning" style="display:none; height: 0" preload="auto" controls="controls" :muted="isMute">
            <source src="../assets/lightning_music.mp3" type="audio/mpeg">
        </audio>
    </div>
</template>


<script>
    import LinkMap from 'components/LinkMap.js';
    import { cellRemove } from 'components/SVM-RFE.js';
    import { lightningAnimate } from 'components/Lightning.js';
    export default {
        name: 'Index',
        props: {
            msg: String
        },
        data() {
            return {
                linkData: [], //连连看地图数据
                pressData: [], //当前选中的2个图案数据
                isMute:true //是否静音
            }
        },
        created() {

            var linkMap = new LinkMap(6, 6, 4); //初始化地图  6行14列，每个图案可重复生成2对，即4个
            var mapData = linkMap.make(); //生成地图数据，地图会在最外围添补一圈空白的cell
            let tmpLinkData = new Array();
            mapData.map(function (row, rowIndex) {
                tmpLinkData[rowIndex] = [];
                row.map(function (col, colIndex) {
                    if(col === 0){ //0代表是看不见的空白cell
                        tmpLinkData[rowIndex][colIndex] = {isBlank:true, value:col, isActive:false}
                    }else { //非0代表是生成的图案
                        tmpLinkData[rowIndex][colIndex] = {isBlank:false, imgSrc: require(`assets/${col}.jpeg`), value:col, isActive:false}
                    }
                })
            });
            this.linkData = tmpLinkData.concat([]);

        },
        mounted(){
            // 监听浏览器变化，来重绘画布尺寸
            window.addEventListener('resize',this.onResize());
        },
        methods:{
            /**
             * 图案点击事件
             * @param rowIndex  行
             * @param colIndex  列
             */
            cellPress(rowIndex, colIndex){
                // 这里如果用户重复点击当前图案，则不做任何处理
                for(var i=0; i< this.pressData.length; i++){
                    if(this.pressData[i].rowIndex === rowIndex && this.pressData[i].colIndex === colIndex){
                        return
                    }
                }

                // 始终保持用户只会选择2个当前的图案，之前选中的会自动消失
                if(this.pressData.length === 2) {
                    let firstCell = this.pressData[0];
                    this.linkData[firstCell.rowIndex][firstCell.colIndex].isActive = false;
                    this.pressData.splice(0,1);
                }
                this.pressData.push({rowIndex:rowIndex, colIndex:colIndex});
                this.linkData[rowIndex][colIndex].isActive = true;

                if(this.pressData.length == 2){ //当用户选中了2个图案时

                    let cell1 = this.pressData[0];
                    let cell2 = this.pressData[1];
                    let result = cellRemove(this.linkData,cell1.rowIndex,cell1.colIndex,cell2.rowIndex,cell2.colIndex); //调取消除的方法，判断能否消除

                    if(result.result){ //如果可以消除，则给画布上绘制消除轨迹

                        if(this.$refs.canvas.getContext){

                            let canvas = this.$refs.canvas;
                            // 设置画布宽高跟table保持一致
                            canvas.width = this.$refs.container.offsetWidth;
                            canvas.height = this.$refs.table.offsetHeight;

                            // 设置画布
                            var ctx = canvas.getContext("2d");

                            let that = this;
                            let lightningPts = []; //最终生成闪电效果的路径数组
                            result.step.map(function (lines) { //拿到消除的轨迹数据（是一个二维数组，每个小数组里是一个横线的开始、结束的坐标点）
                                let start_point_element_rect = that.$refs[`cell-${lines[0].row}-${lines[0].col}`].getBoundingClientRect();
                                let end_point_element_rect = that.$refs[`cell-${lines[1].row}-${lines[1].col}`].getBoundingClientRect();
                                console.log("start_point_element_rect == ",start_point_element_rect);
                                console.log("end_point_element_rect == ",end_point_element_rect);

                                // 这里开始点和结束点的x，y坐标都要从图片的中心点开始，故要用原始的x减去图片宽的一半，y同理
                                lightningPts.push([
                                    {x:start_point_element_rect.x + start_point_element_rect.width / 2.0, y:start_point_element_rect.y + start_point_element_rect.height / 2.0},
                                    {x:end_point_element_rect.x + end_point_element_rect.width / 2.0, y:end_point_element_rect.y + end_point_element_rect.height / 2.0}
                                    ]);
                            });

                            // 先清空原来的动画
                            this.interval && window.clearInterval(this.interval);
                            // 再生成新的闪电连线动画
                            this.interval = lightningAnimate(ctx, canvas,lightningPts);
                            this.$refs.lightning.playbackRate = 2;
                            this.$refs.lightning.play();


                            //做一个延迟动画，显示线段后再让相同的图案消失
                            setTimeout(function () {
                                that.linkData[cell1.rowIndex][cell1.colIndex] = {isBlank:true, value:0, isActive:false};
                                that.linkData[cell2.rowIndex][cell2.colIndex] = {isBlank:true, value:0, isActive:false};
                                that.pressData = [];
                                ctx.clearRect(0,0,canvas.width,canvas.height);
                                that.interval && window.clearInterval(that.interval);
                                that.$refs.lightning.pause();
                                that.$refs.lightning.currentTime = 0;
                            }, 500);
                        }

                    }
                }

            },

            /**
             * 界面变化，重新布局画布大小
             */
            onResize(){
                if(this.$refs.canvas.getContext) {
                    // 设置画布宽高跟table保持一致
                    this.$refs.canvas.width = this.$refs.container.offsetWidth;
                    this.$refs.canvas.height = this.$refs.table.offsetHeight;
                }
            },


            musicPress(){
                this.isMute = !this.isMute;
                if(!this.isMute){
                    this.$refs.bgMusic.play();
                }
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .container {
        position: relative;
        width: 100%;
        height: 100%;
        background: url("../assets/bg.jpeg") no-repeat;
        background-size: cover;
        background-position: center 0;
    }
    .music {
        background-repeat:no-repeat;
        background-size:100% 100%;
        width: 30px;
        height: 30px;
        background-color: white;
    }
    table{
        /*position: absolute;*/
        border-collapse:collapse;
    }
    td{
        width: 80px;
        height: 80px;
    }

    td img {
        border-radius: 5px;
        width: 92%;
        height: 92%;
        object-fit:cover;
        vertical-align: middle;
        box-shadow:2px 2px 5px #000;
    }

    img[src=""],img:not([src]){
        opacity:0;
    }

    canvas {
        top: 0;
        left:0;
        right:0;
        margin: auto;
        pointer-events: none;
        z-index: 999;
    }

    .img-active {
        border: 2px solid 	#1E90FF;
    }
    .img-disactive {
        border: 2px solid transparent;
    }
</style>
