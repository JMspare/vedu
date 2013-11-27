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
            $board = $('#board .main'),
            boxes = '';

        data.forEach(function(box) {
            box.abbr = box.abbr || box.name;  // abbr 默认为名字
            // 将 relations 变成 , 分隔的字符串
            box.relations = (box.relations || []).join(',');
            boxes += template(tmpl, box);
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

        $('.box').click(function(e) {
            // mutation is bad :/
            var boxInfo = $.extend({}, $(e.currentTarget).data());

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

            e.preventDefault();
        });
    }).fail(function() {
        console.log('Don\'t panic!');
    });

})();
