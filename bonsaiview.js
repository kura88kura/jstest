/**
 * Created by yuzhou on 15/8/20.
 */
    //bonsai启动！run方法用于启动
bonsai.run(document.getElementById('area'),//获取div#area绘图区来绘图
    {
        code: run,//run方法是一个入口方法，直接执行
        width: 200,//设置svg viewBox宽高尺寸
        height: 200
    });

function run() {
    var secValue = 1000;//每次运动的时间ms--正常肯定是1s一次啦！但这个参数可作为调试使用，比如修改为200，这样就让时间走的更快了，更方便测试看效果

    //由于bonsai的绘svg图原因，我们知道，当用弧度绘制一个圆的时候应该是从0~2π，但是如果用一整个圆周动画时候会有问题，所以要绘制0~1.9999π,这个变量就是起到一个差值，
    //在绘弧形时候让弧线无线接近于一周但不等于一周
    var boundary = 0.0001;

    var step = Math.PI / 6, stepMin = Math.PI / 30;//step：每小时格数弧度,stepMin：每秒格数弧度

    var sCounter, mCounter, hCounter;//秒，分，时的计数器
    var secScale = 60, minScale = 60 * 60, horScale = 60 * 60 * 12;//秒，分，时的计数器界限值，计数到此就要归零了，如：每sCounter次==secScale时候秒环就走完一圈要归零了

    //通过new Arc()的方法绘制一个黑色背景圆形表盘--参数说明：（圆心x,圆心y,半径,起始弧度,截至弧度,顺/逆[boolean,默认false顺时针绘制]）
    //注意每次画完一个图都要.addTo(stage)来添加到svg里面
    var bg = new Arc(100, 100, 98, 1.5 * Math.PI, (3.5 - boundary) * Math.PI).addTo(stage)
        .attr('fillColor', '#212121');
    //绘制秒环（红色），分环（绿色），时环（蓝色）；注意起始弧度是1.5π，因为为了让起始弧度在0点位置，这里的截至弧度没有任何意义，因为在校对时间时候会重新设置，
    var ss = new Arc(100, 100, 70, 1.5 * Math.PI, 2 * Math.PI).addTo(stage)
        .attr('strokeWidth', 12).attr('strokeColor', '#e91e63');
    var mm = new Arc(100, 100, 55, 1.5 * Math.PI, 2 * Math.PI).addTo(stage)
        .attr('strokeWidth', 12).attr('strokeColor', '#8bc34a');
    var hh = new Arc(100, 100, 40, 1.5 * Math.PI, 2 * Math.PI).addTo(stage)
        .attr('strokeWidth', 12).attr('strokeColor', '#00bcd4');

    /*
     * 绘制表盘60个刻度
     */
    var drawScale = function () {
        var rad = 90;//因为表盘半径是98，刻度往里一点，半径用90
        //绘制60个刻度点
        for (var i = 0; i < 60; i++) {
            //圆心100 半径90，结合圆的直角坐标方程和极坐标方程（忘了的人回去看初中课本）得出每个刻度的位置
            var x = (rad * Math.cos(stepMin * i) + 100);
            var y = (rad * Math.sin(stepMin * i) + 100);
            if (i % 5 == 0) {//每5个点用大刻度，也就是12个小时的刻度
                new Circle(x, y, 3).addTo(stage)
                    .attr('fillColor', '#cccccc');
            } else {
                new Circle(x, y, 1).addTo(stage)
                    .attr('fillColor', '#cccccc');
            }

        }
    };
    /*
     * 校准当前时间
     */
    var adjustClock = function () {
//            var now = new Date('2015-08-18 23:59:20');
        var now = new Date();//当前时间
        sCounter = now.getSeconds();//将秒计数器设置为当前秒数
        mCounter = now.getMinutes() * 60 + sCounter;//将分计数器设置为当前分数*60+当前秒计数器值
        hCounter = Math.abs(now.getHours() - 12) * 60 * 60 + mCounter;//将时计数器设置为当前时数*60*60+当前分计数器值，注意将获取的24h制转成12h制
        //依次判断，如果等于了各自界限值就归零
        sCounter = sCounter >= secScale ? 0 : sCounter;
        mCounter = mCounter >= minScale ? 0 : mCounter;
        hCounter = hCounter >= horScale ? 0 : hCounter;

        //分别设置时、分、秒环截至弧度
        ss.attr({endAngle: 1.5 * Math.PI + stepMin * sCounter});
        mm.attr({endAngle: 1.5 * Math.PI + stepMin / 60 * mCounter});
        hh.attr({endAngle: 1.5 * Math.PI + step / 60 / 60 * hCounter});
    };
    /**
     * 时、分、秒环运动动画
     * xx 环形图对象
     * xd 时、分、秒计数器值
     * scale 时分秒每秒走动弧度倍率
     */
    var walking = function (xx, xd, scale) {
        xx.animate(secValue + 'ms', {
            endAngle: 1.5 * Math.PI + stepMin / scale * xd
        }, {
            easing: 'linear'
        });
    };
    /**
     * 时、分、秒环运动即将走完一圈归零的最后一次的动画方法，和上面方法几乎一样，只是在最后一步时候的截至弧度有区别，
     * 就是最开始提到的，动画不能是完整的一周2π而是要减去boundary差值那一小部分
     * xx 环形图对象
     * xd 时、分、秒计数器值
     * scale 时分秒每秒走动弧度倍率
     * sumCounter 计数器界限值
     */
    var walkend = function (xx, xd, scale, sumCounter) {
        xx.animate((secValue - 100) + 'ms', {//区别1：因为secValue ms内既要动画就要动画完执行一次设置过程，所以最后一次动画快些，预留100ms给后面方法用
            endAngle: 1.5 * Math.PI + stepMin / scale * (sumCounter - boundary)//区别2：动画不能是完整的一周2π而是要减去boundary差值那一小部分
        }, {
            easing: 'linear',
            onEnd: function () {//区别3：动画进行的虽然不是一周2π，但是动画进行完还是要正确的重置截至弧度的
                xx.attr({endAngle: 1.5 * Math.PI});
            }
        });
    };
    /**
     * 秒/分/时环的动画方法
     * 实现思路：最后会每隔secValue(正常1s)，时分秒3个环分别进行一次时长1s的动画，只是运动的弧度不同而已
     * 也就是：1s内秒环肯定是1小格也就是stepMin弧度值，而分环就是stepMin/60弧度值，时环就是stepMin/60/12弧度值
     */
    var runSec = function () {
        sCounter++;
        if (sCounter >= secScale) {
            sCounter = 0;
            walkend(ss, sCounter, 1, secScale);
        } else {
            walking(ss, sCounter, 1);
        }
    };
    var runMin = function () {
        mCounter++;
        if (mCounter >= minScale) {
            mCounter = 0;
            walkend(mm, mCounter, 60, minScale);
        } else {
            walking(mm, mCounter, 60);
        }
    };
    var runHor = function () {
        hCounter++;
        if (hCounter >= horScale) {
            hCounter = 0;
            walkend(hh, hCounter, 60 * 12, horScale);
        } else {
            walking(hh, hCounter, 60 * 12);
        }
    };

    drawScale();
    adjustClock();

    //为了保证时间准确每分钟矫正一次时间
    setInterval(function () {
        adjustClock();
    }, 60000);
    //每隔secValue(正常1s)，进行一次环的动画
    setInterval(function () {
        runSec();
        runMin();
        runHor();
    }, secValue);
}
