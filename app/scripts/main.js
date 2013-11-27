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

    // === 布局设定 ===
    // 参照元素周期表的布局来设定
    // 坐标从 1 开始，原点在左上角
    // 每行可以指定哪些格是放置内容的
    // 假如该行没有设定放置内容，默认为整行都使用
    var layout = {
        1: [1, 18],  // 指 1 和 18 可以放,
        2: [1, 2, 13, 14, 15, 16, 17, 18],
        3: [1, 2, 13, 14, 15, 16, 17, 18]
    },
        totalCols = 18;

    // === description 模块 ===

    var $description = $('#description'),  // box 详细信息模块
        descriptionTmpl = $('#description-tmpl').text(),  // box 模块模板
        realtedTmpl = $('#related-tmpl').text();  // 相关 box 模板

    // 绑定 show 事件到 description 模块上
    $description.on('show', function(e, data) {
        var boxInfo = $.extend({}, data),   // mutation is bad :/
            relations = '';

        boxInfo.relations.forEach(function(friendName) {
            relations += template(realtedTmpl, {
                'name': friendName
            });
        });
        boxInfo.relations = relations || '无';

        // 填充内容
        $description.html(template(descriptionTmpl, boxInfo));

        // 绑定点击事件
        // TODO 添加返回按钮
        $description.click(function(e) {
            // 点击空白处关闭
            if (e.target.id !== $description.attr('id')) {
                return;
            }

            e.preventDefault();
            $description.trigger('hide');
        });

        // 绑定相关 box 下的链接点击事件
        $('.related a', $description).click(function(e) {
            var name = $(e.currentTarget).attr('data-name'),
                box = $('.box[data-name=' + name + ']');

            box.trigger('selected');
            e.preventDefault();
        });

        // 更改元素状态
        $description.removeClass('hide');
        if (!$description.hasClass('show')) {
            $description.addClass('show');
        }
    });

    // 绑定 hide 事件到 description 模块上
    $description.on('hide', function() {
        $description.removeClass('show');
        if (!$description.hasClass('hide')) {
            $description.addClass('hide');
        }

        // 清除选中状态
        // TODO 使用组合的方法来完成清除的操作
        $('.box-selected').removeClass('box-selected');
    });

    // === box 模块 ===

    // 获取 box 的内容
    $.get('/scripts/data.json').done(function(data) {
        var tmpl = $('#box-tmpl').text(),
            pesudoTmpl = $('#pesudo-box-tmpl').text(),
            $board = $('#board .main'),
            boxes = '',
            row = 1, col = 1;

        data.forEach(function(box) {
            var currentRow = layout[row];

            box.abbr = box.abbr || box.name;  // abbr 默认为名字
            // 将 relations 变成 , 分隔的字符串
            box.relations = (box.relations || []).join(',');


            // box 布局
            // 如果该行有定义则按照定义来填充
            if (currentRow) {
                for (;$.inArray(col, currentRow) === -1;col++) {
                    // 用空的 box 来填充
                    boxes += template(pesudoTmpl, {});
                }
            }
            boxes += template(tmpl, box);
            col += 1;

            // 转移到下一行
            if (col > totalCols) {
                row += 1;
                col %= totalCols;
            }
        });

        $board.html(boxes + $board.html());

        $('.box').each(function(i, e) {
            // 使用 FitText 调整每个 box 里面的字体大小
            window.fitText(e);
        });

        // 绑定相关 box 高亮事件
        $('.box').on('highlight', function() {
            $(this).addClass('box-selected');
        });

        // 绑定 box 选择事件
        $('.box').on('selected', function() {
            // mutation is bad :/
            var boxInfo = $.extend({}, $(this).data());

            // 清除之前的状态
            // TODO 使用组合的方法来完成清除的操作
            $('.box-selected').removeClass('box-selected');

            // 将 relations 重新变回数组
            boxInfo.relations = (boxInfo.relations || '')
                                    .split(',')
                                    .filter(function(e) { return e; });

            // 触发自己和关联 box 的 highlight 事件
            $(this).trigger('highlight', boxInfo);
            boxInfo.relations.forEach(function(friendName) {
                $('.box[data-name=' + friendName + ']')
                    .trigger('highlight', boxInfo);
            });

            // 触发 description 模块的 show 事件
            $description.trigger('show', boxInfo);
        });

        // 绑定 box 点击事件
        $('.box').not('.box-pesudo').click(function(e) {
            e.preventDefault();
            $(e.currentTarget).trigger('selected');
        });

    }).fail(function() {
        console.log('Don\'t panic!');
    });

})();
