; (function () {
    'use strict';
    var $form_add_task = $('.add-task')
        , $delete_task = $('.action.delete')
        , $task_detail = $('.task-detail')
        , $task_item
        , $detail_task
        , $task_detail_mask = $('.task-detail-mask')
        , task_list = []
        , $alerter = $('.alerter')
        , current_index
        , $update_form
        , $checkbox_complete
        , $body = $('body')
        ;

    init();

    $form_add_task.on('click', 'button', on_add_task_form_submit);

    function on_add_task_form_submit(e) {
        /*禁用默认行为*/
        e.preventDefault();
        /*获取task值*/
        var $input = $(this).prev('input');
        var value = $input.val();
        var new_task = {}
        new_task.content = value;
        /*新的task为空，则返回 否则继续执行*/
        if (!new_task.content) return;
        /*存入新task*/
        var tmp = add_task(new_task);
        if (tmp) {
            $input.val(null);
        }
    }
    //添加备忘条目
    function add_task(data_) {
        /*更新task_list */

        task_list.push(data_);
        /*更新localStorage */
        refresh_task_list();

        return true;
    }



    $task_detail_mask.on('click', update_detail);


    //查找并监听细节按钮的点击事件
    function listener_task_detail() {
        //双击备忘条例显示详情
        $task_item.on('dblclick', function () {
            var $this = $(this);
            var index = $this.attr('data-index');
            show_task_detail(index);
        });
        //点击“详情”，显示详情
        $detail_task.on('click', function () {
            var $this = $(this);
            var $div = $this.parents('div:first');
            var index = $div.attr('data-index');
            show_task_detail(index);
        });

    }
    //查找并监听删除按钮的点击事件
    function listener_task_delete() {
        $delete_task.on('click', function () {
            //删除按钮所在的task元素
            var $div = $(this).parents('div:first');
            var index = $div.attr('data-index');
            //var tmp = confirm('确定删除？');

            pop("确定删除吗？").then(function(r){
                r ? delete_task(index) : null;
            });

            
        });

    }


    function pop(arg) {
        if (!arg) {
            console.log('pop title is required')
        }
        var conf = {},
            $box,
            $mask,
            $title,
            $content,
            $confirm,
            $cancel,
            timer,
            dfd,
            confirmed;
        dfd = $.Deferred()

        if (typeof arg == "string") {
            conf.title = arg;
        } else {
            conf = $.extend(conf, arg)
        }

        $box = $('<div class="title">' +
            '<div class="pop-title">'+conf.title+'</div>' +
            '<div class="pop-content">' +
            '<div><button class="primary confirm">确定</button> <button class="cancel">取消</button></div>' +
            '</div>' +

            '</div>').css({
                textAlign: 'center',
                color: '#444',
                position: "fixed",
                width: 300,
                height: 'auto',
                padding:'15px 10px',
                backgroundColor: "#fff",
                borderRadius: 3,
                boxShadow: '0 1px 2px rgba(0,0,0,.5)'
            });


        $title = $box.find('.pop-title').css({
            padding: '5px 10px',
            fontWeight: 900,
            fontSize: 20,
            textAlign: 'center'

        });

        $content = $box.find('.pop-content').css({
            color: 'red',
            padding: '5px 10px',
            textAlign: 'center'

        });
        $confirm = $content.find('button.confirm');
        $cancel = $content.find('button.cancel');
        timer = setInterval(function () {
            if (confirmed !== undefined) {
                dfd.resolve(confirmed);
                clearInterval(timer);
                dismiss_pop();
            }

        }, 50)
        function dismiss_pop(){
            $box.remove();
            $mask.remove()
        }
        $confirm.on('click', function () {
            confirmed = true;
        })


        $cancel.on('click', function () {
            confirmed = false;
        })

        $mask = $('<div></div>').css({
            position: "fixed",
            backgroundColor: "rgba(0,0,0,0.5)",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,

        })

        $mask.on('click', function () {
            confirmed = false;
        })
        function adjust_box_position() {
            var window_width = $(window).width();
            var window_height = $(window).height();
            var box_width = $box.width();
            var box_height = $box.height();
            var box_left = (window_width - box_width) / 2;
            $box.css({
                left: (window_width - box_width) / 2,
                top: (window_height - box_height) / 2 - 100,
            })


        }
        $(window).on('resize', function () {
            adjust_box_position();
        });



        
        $body.append($mask);
        $body.append($box);
        $(window).resize();
        return dfd.promise();

    }
    //显示详情
    function show_task_detail(index) {
        render_task_detail(index);
        current_index = index;
        $task_detail.show();
        $task_detail_mask.show();
    }
    //更新task
    function update_task(index, data) {
        if (index === undefined || !task_list[index]) return
        task_list[index] = $.extend({}, task_list[index], data);
        //task_list[index] = data;
        refresh_task_list();

    }
    //隐藏详情
    function hide_task_detail() {
        $task_detail.hide();
        $task_detail_mask.hide();
        refresh_task_list();
    }

    //渲染详情
    function render_task_detail(index) {
        if (index === undefined) return
        var item = task_list[index];
        var tpl =
            "<form>" +
            "<div class='content' contenteditable='true'>" +
            item.content +
            "</div>" +
            "<div class='inpit-item'>" +
            "</div>" +
            "<div>" +
            "<div class='desc input-item'>" +
            "<textarea name='desc'>" +
            (item.desc || '') +
            "</textarea>" +
            "</div>" +
            "</div>" +
            "<div class='remind input-item'>" +
            "提醒时间：" +
            "<input class='datetime' name='remind_date' type='text' value='" + (item.remind_date || '') + "'>" +
            "</div>" +
            "<div class='input-item'><button type='submit'>更新</button></div>" +
            "</form>";
        $task_detail.html('');
        $task_detail.append($(tpl))
        $update_form = $task_detail.find('form');
        $update_form.submit(update_detail);
        $('.datetime').datetimepicker();
    }

    //在详情列表更新本条备忘录的各个元素
    function update_detail(e) {

        e.preventDefault();
        var data = {}
        data.content = $('form div:first').html();
        data.desc = $('textarea[name="desc"]').val();
        data.remind_date = $('form input:last').val();

        update_task(current_index, data);
        hide_task_detail();


    }

    function refresh_task_list() {
        store.set('task_list', task_list);
        /*更新显示列表 */
        render_task_list();
    }
    //删除一条task
    function delete_task(index) {
        //如果没有index，或者index不在 就返回
        if (index === undefined || !task_list[index]) return;
        task_list.splice(index, 1);
        refresh_task_list();
    }
    function init() {
        task_list = store.get('task_list') || [];
        if (task_list.length > 0) {
            render_task_list();
        }

        task_remind_check();
    }
    function listener_remind() {
        $('.massage').find('button').on('click', function () {
            hide_remind();
        })
    }

    function task_remind_check() {
        var current_timestamp, task_timestamp;

        var itl = setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                var item = store.get('task_list')[i];
                if (!item || !item.remind_date || item.informed) {
                    continue;
                }
                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.remind_date)).getTime();
                if (current_timestamp - task_timestamp >= 1) {
                    update_task(i, { informed: true });
                    show_remind(item.content)

                }

            }

        }, 300);

    }
    function show_remind(massage) {
        $('.msg-content').html(massage);
        $('.massage').show();
        $alerter.get(0).play();
        listener_remind();


    }

    function hide_remind() {
        $('.massage').hide();

    }

    //渲染全部task
    function render_task_list() {
        var $task_list = $('.task-list:first')
        $task_list.html('');
        for (var i = 0; i < task_list.length; i++) {
            var $task = render_task_tpl(task_list[i], i);
            if (task_list[i].complete === true) {
                $task_list.append($task);
            } else {
                $task_list.prepend($task);
            }

        }
        $delete_task = $('.action.delete');
        $detail_task = $('.action.detail');
        $task_item = $('.task-list > .task-item');
        listener_task_delete();
        listener_task_detail();
        $checkbox_complete = $('.complete');
        listener_checkbox_complete();
    }
    /*提醒事件*/


    /*监听完成任务事件*/
    function listener_checkbox_complete() {
        $checkbox_complete.on('click', function () {
            var index = $(this).parents('div:first').attr('data-index');
            if (task_list[index].complete === true) {
                task_list[index].complete = false;
                $(this).attr('checked', false);
            } else {
                task_list[index].complete = true;
                $(this).attr('checked', true);
            }
            refresh_task_list();
        });
    }
    //渲染单挑task模板
    function render_task_tpl(data, index) {
        if (data === null || index === undefined) return
        var tmp = data.complete;
        if (tmp) {
            var list_item_tpl =
                "<div class='task-item' data-index='" + index + "'>" +
                "<span><input class='complete' type='checkbox' checked='checked'></span>" +
                "<span class='task-content'>" +
                data.content + "</span>" +
                "<span style='color:red'>" +
                " 已完成" +
                "</span>" +
                "<span class='fr'>" +
                "<span class='action delete'>  删除  </span>" +
                "<span class='action detail'>  详细  </span>" +
                "</span>" +
                "</div>";
        } else {
            var list_item_tpl = "<div class='task-item' data-index='" + index + "'>" +
                "<span><input class='complete' type='checkbox'></span>" +
                "<span class='task-content'>" +
                data.content + "</span>" +
                "<span class='fr'>" +
                "<span class='action delete'>  删除  </span>" +
                "<span class='action detail'>  详细  </span>" +
                "</span>" +
                "</div>";

        }

        return $(list_item_tpl);
    }

})();