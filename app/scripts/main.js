/* 将代码用一个自执行函数包含起来
 * 防止暴露到 window 下
 */
(function() {
    /* 声明模式 */
    'use strict';

    /* 使用 FitText 调整每个 box 里面的字体大小 */
    $('.box').each(function(i, e) {
        window.fitText(e);
    });

})();
