// 将代码用一个自执行函数包含起来，防止
// 暴露到 window 下，污染全局作用域
(function() {
    /* 声明模式 */
    'use strict';

    /**
     * 填充模板内容
     *
     * @param tmpl 模板
     * @param data 填充数据
     * @return string
     */
    var template = function(tmpl, data) {
        var pattern = /<%=([\w ]+)%>/,
            r;

        while ((r = pattern.exec(tmpl)) !== null) {
            tmpl = tmpl.replace(r[0], data[r[1].trim()]);
        }

        return tmpl;
    };

    // 获取 box 的内容
    $.get('/scripts/data.json').done(function(data) {
        var tmpl = $('#box-tmpl').text(),
            $board = $('#board .main'),
            boxes = '';

        data.forEach(function(e) {
            e.abbr = e.abbr || e.name;
            boxes += template(tmpl, e);
        });

        $board.html(boxes + $board.html());

        /* 使用 FitText 调整每个 box 里面的字体大小 */
        $('.box').each(function(i, e) {
            window.fitText(e);
        });
    }).fail(function() {
        console.log('Don\'t panic!');
    });

})();
