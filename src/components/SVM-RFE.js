/**
 * 判断两个图案能否消除
 * @param mapData  原地图数据
 * @param row1 图案1的行
 * @param col1 图案1的列
 * @param row2 图案2的行
 * @param col2 图案2的列
 * @return {result:true,step:[{row:1,col:1},{row:1,col:2}]}   result 结果   step 消除的路径数组
 */
export function cellRemove(mapData, row1, col1, row2, col2) {
    if(mapData[row1][col1].value != mapData[row2][col2].value){
        return {result:false};
    }

    let result = horizon(mapData, row1, col1, row2, col2);
    if(result.result){
        return result
    }
    result = vertical(mapData, row1, col1, row2, col2);
    if(result.result){
        return result
    }
    result = turn_once(mapData, row1, col1, row2, col2);
    if(result.result){
        return result
    }
    result = turn_twice(mapData, row1, col1, row2, col2);
    if(result.result){
        return result
    }
    return {result:false};
}

/**
 * 水平检测
 *
 * 水平检测用来判断两个点的纵坐标是否相等，同时判断两点间有没有障碍物。
 * @param mapData  原地图数据
 * @param row1 图案1的行
 * @param col1 图案1的列
 * @param row2 图案2的行
 * @param col2 图案2的列
 * @return {result:true,step:[{row:1,col:1},{row:1,col:2}]}   result 结果   step 消除的路径数组
 */
function horizon(mapData, row1, col1, row2, col2) {

    if (row1 == row2 && col1 == col2) {
        return {result:false};
    }

    if (row1 != row2) {
        return {result:false};
    }

    var start_y = Math.min(col1, col2);
    var end_y = Math.max(col1, col2);
    var step = [[{row:row1, col:start_y},{row:row1, col:end_y}]];

    for (var j = start_y + 1; j < end_y; j++) {
        if (isBlocked(mapData[row1][j])) {
            return {result:false};
        }
    }
    return {result: true, step:step};
}

/**
 * 垂直检测
 *
 * 垂直检测用来判断两个点的横坐标是否相等，同时判断两点间有没有障碍物。
 * @param mapData  原地图数据
 * @param row1 图案1的行
 * @param col1 图案1的列
 * @param row2 图案2的行
 * @param col2 图案2的列
 * @return {result:true,step:[{row:1,col:1},{row:1,col:2}]}   result 结果   step 消除的路径数组
 */
function vertical(mapData, row1, col1, row2, col2) {

    if (row1 == row2 && col1 == col2) {
        return {result:false};
    }

    if (col1 != col2) {
        return {result:false};
    }

    var start_x = Math.min(row1, row2);
    var end_x = Math.max(row1, row2);
    var step = [[{row:start_x, col:col1},{row:end_x, col:col1}]];

    for (var i = start_x + 1; i < end_x; i++) {
        if (isBlocked(mapData[i][col1])) {
            return {result:false};
        }
    }
    return {result: true, step:step};
}

/**
 * 一个拐角检测
 *
 * 一个拐角检测可分解为水平检测和垂直检测，当两个同时满足时，便两点可通过一个拐角相连。
 * 即：一个拐角检测 = 水平检测 && 垂直检测
 * @param mapData  原地图数据
 * @param row1 图案1的行
 * @param col1 图案1的列
 * @param row2 图案2的行
 * @param col2 图案2的列
 * @return {result:true,step:[{row:1,col:1},{row:1,col:2}]}   result 结果   step 消除的路径数组
 */
function turn_once(mapData, row1, col1, row2, col2) {

    if (row1 == row2 && col1 == col2) {
        return {result:false};
    }

    var c_x = row1, c_y = col2;
    var d_x = row2, d_y = col1;

    var ret = false;
    var step = [];
    if (!isBlocked(mapData[c_x][c_y])) {
        let h_result =  horizon(mapData, row1, col1, c_x, c_y);
        let v_result = vertical(mapData, c_x, c_y, row2, col2);
        ret = h_result.result && v_result.result;
        if(ret){
            step = h_result.step.concat(v_result.step);
            return {result:true,step:step}
        }
    }

    if (!isBlocked(mapData[d_x][d_y])) {
        let h_result = horizon(mapData, row1, col1, d_x, d_y);
        let v_result = vertical(mapData, d_x, d_y, row2, col2);
        ret |= h_result.result && v_result.result;
        if(ret){
            step = h_result.step.concat(v_result.step);
            return {result:true,step:step}
        }
    }

    return {result: false};

}

/**
 * 两个拐角检测
 *
 * 两个拐角检测可分解为一个拐角检测和水平检测或垂直检测。
 * 即：两个拐角检测 = 一个拐角检测 && (水平检测 || 垂直检测)
 * @param mapData  原地图数据
 * @param row1 图案1的行
 * @param col1 图案1的列
 * @param row2 图案2的行
 * @param col2 图案2的列
 * @return {result:true,step:[{row:1,col:1},{row:1,col:2}]}   result 结果   step 消除的路径数组
 */
function turn_twice(mapData, row1, col1, row2, col2) {

    if (row1 == row2 && col1 == col2) {
        return {result:false};
    }

    for (var i = 0; i <= mapData.length-1; i++) {
        for (var j = 0; j <= mapData[i].length-1; j++) {
            if (i != row1 && i != row2 && j != col1 && j != col2) {
                continue;
            }

            if ((i == row1 && j == col1) || (i == row2 && j == col2)) {
                continue;
            }

            if (isBlocked(mapData[i][j])) {
                continue;
            }

            let step = [];
            let to_result_ij = turn_once(mapData, row1, col1, i, j);
            let h_result_ij = horizon(mapData, i, j, row2, col2);
            let v_result_ij = vertical(mapData, i, j, row2, col2);

            if(to_result_ij.result){
                if(h_result_ij.result){
                    step = to_result_ij.step.concat(h_result_ij.step);
                    return {result:true, step:step}
                }
                if(v_result_ij.result){
                    step = to_result_ij.step.concat(v_result_ij.step);
                    return {result:true, step:step}
                }
            }


            let ij_to_result = turn_once(mapData, i, j, row2, col2);
            let ij_h_result = horizon(mapData, row1, col1, i, j);
            let ij_v_result = vertical(mapData, row1, col1, i, j);

            if(ij_to_result.result){
                if(ij_h_result.result){
                    step = ij_to_result.step.concat(ij_h_result.step);
                    return {result:true, step:step}
                }
                if(ij_v_result.result){
                    step = ij_to_result.step.concat(ij_v_result.step);
                    return {result:true, step:step}
                }
            }
        }
    }
    return {result:false};
}

/**
 * 当前块是否是障碍物
 * @param cell
 * @return true|false
 */
function isBlocked(cell) {
    return !cell.isBlank
}

