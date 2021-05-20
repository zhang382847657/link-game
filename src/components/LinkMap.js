const types = Symbol('types');
const flags = Symbol('flags');


export default class LinkMap {

    constructor(rows, cols, numberPerType){
        this.rows = rows;
        this.cols = cols;
        this.numberPerType = numberPerType;
        this._initData();
    }

    _initData(){
        this[types] = new Array();
        var typeNum = Math.floor(this.cols * this.rows / this.numberPerType);
        for( var i = 1; i <= typeNum; i++){
            for( var j = 0; j< this.numberPerType; j++ ){
                this[types].push(i);
            }
        }

        var yushu = this.cols * this.rows - typeNum * this.numberPerType;
        for( var yI = 0; yI < yushu; yI++ ){
            this[types].push(1)
        }
    }

    _randomIndex(){
        return parseInt(Math.random() * (this[flags].length - 1));
    }

    _getType(){
        var ran = -1;
        var ret = 0;
        ran = parseInt(this._randomIndex());
        var index = this[flags][ran];
        this[flags].splice(ran, 1);
        ret = this[types][index];
        return ret;
    }

    make(){
        this[flags] = new Array();
        for(var i=0; i<this[types].length; i++){
            this[flags].push(i);
        }
        var mapData = new Array();
        var rowData = new Array();
        var col = 0;
        rowData.push(0);

        for(col = 0; col<this.cols; col++){
            rowData.push(0);
        }

        rowData.push(0);
        mapData.push(rowData);

        for(var row = 0; row < this.rows; row++){
            rowData = new Array();
            rowData.push(0);
            for(col = 0; col<this.cols; col++){
                rowData.push(this._getType());
            }
            rowData.push(0);
            mapData.push(rowData);
        }
        rowData = new Array();
        rowData.push(0);
        for(col = 0; col<this.cols; col++){
            rowData.push(0);
        }
        rowData.push(0);
        mapData.push(rowData);
        return mapData;
    }


}
