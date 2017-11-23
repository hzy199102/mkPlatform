/**
 * 对原生md文件生成的html做结构解析，
 * 1.生成对应目录结构
 * 2.相应特效，例如滚动，跳转
 *
 * ps:标题顺序是h1,h2,h3,h4,h5,h6.如果md打乱这个书写顺序，或者顺序中间有缺失，会造成标题级别强制提升，
 * 例如：h2,h1,h2 会变成h1,h1,h2
 *       h1,h2,h2,h4,h4,h1 会变成 h1,h2,h2,h3,h4,h1
 *       h1,h3,h2,h1 会变成 h1,h2,h2,h1
 */


;(function($) {

    /**
     * 打印日志
     * @param opts
     * @param str
     * @private
     */
    _log = function (opts, str) {
        if (opts.debug) {
            console.log(str)
        }
    }

    /**
     * 更新位置_header_offsets，注意是全部的，因为不知道img是哪个标题中的
     * @param opts
     * @private
     */
    _update_position_data = function (opts) {
        opts._header_offsets = []
        $('#' + opts._mdContentId).find(':header').each(function() {
            opts._header_offsets.push($(this).offset().top);
        });
        _bind_scroll_event_and_update_postion(opts)
    }

    /**
     * 图片加载有延时性，全部图片加载完毕之后更新位置_header_offsets，这里用不到，需要jquery版本 > 1.5
     * @param opts
     * @private
     */
    _all_img_handle = function (opts) {
        var imgdefereds = [];
        $('img').each(function(){
            var dfd = $.Deferred();
            $(this).bind('load',function(){
                dfd.resolve();
            }).bind('error',function(){
                //图片加载错误，加入错误处理
                dfd.resolve();
            })
            if(this.complete) setTimeout(function(){
                dfd.resolve();
            },1000);
            imgdefereds.push(dfd);
        })
        $.when.apply(null,imgdefereds).done(function(){
            _update_position_data(opts)
        });
    }

    /**
     * 图片加载有延时性，需要在每张图片加载完成之后更新位置_header_offsets
     * @param opts
     * @private
     */
    _img_handle = function (opts) {
        $('img').each(function(){
            // 如果图片已经存在于浏览器缓存，直接调用回调函数
            if(this.complete) {
                _update_position_data(opts)
                return false;
            }
            $(this).bind('load',function(){
                _update_position_data(opts)
            }).bind('error',function(){
                //图片加载错误，加入错误处理
                _update_position_data(opts)
            })
        })
    }

    /**
     * 根据header生成ztree的node的id
     * 根目录节点默认是0
     * @param headerLevel
     * @param headerStep
     * @param type id类型，false：自身id；true：父id;
     * @returns {number}
     * @private
     */
    _ztree_node_id = function (headerLevel, headerStep, type) {
        var result = 0;
        var _type = type ? 1 : 0;
        if (headerLevel.length === _type) {
            return result;
        }
        for (var i = 0; i < headerLevel.length - _type; i++ ) {
            result += headerLevel[i] * Math.pow(headerStep, headerLevel.length - _type - i - 1);
        }
        return result;
    }

    /**
     * 生成ztree的源数据，给header绑定id，绑定锚点，并且确定节点对应的内容位置
     * @param opts
     * @param header_obj
     * @private
     */
    _header_node = function (opts, header_obj) {
        var id  = _ztree_node_id(opts._headerLevel, opts._headerStep);
        var pId = _ztree_node_id(opts._headerLevel, opts._headerStep, true);
        // 设置锚点id
        $(header_obj).attr('id', id);
        opts._header_offsets.push($(header_obj).offset().top);
        opts._zTree_nodes.push({
            id: id,
            pId: pId ,
            name: $(header_obj).text(),
            url: '#'+ id,
            target: '_self'
        });
    }

    /**
     * 重命名标题
     * @param opts
     * @param header_obj
     * @param level
     * @private
     */
    _rename_header = function (opts, header_obj, level) {
        if (opts._headerLevel.length > level) {
            opts._headerLevel = opts._headerLevel.slice(0, level);
            opts._headerLevel[level - 1] ++;
        } else if (opts._headerLevel.length === level) {
            opts._headerLevel[level - 1]++;
        } else {
            opts._headerLevel.push(1);
        }

        if (opts._autoNumber) {
            // 另存为的文件里会有编号，所以有编号的就不再重新替换
            if($(header_obj).text().indexOf( opts._headerLevel.join('.') ) != -1){

            }else{
                $(header_obj).text(opts._headerLevel.join('.') + '. ' + $(header_obj).text());
            }
        }
    }

    /**
     * 解析md的header
     * 1.设置header的id，锚点，跳转定位用
     * 2.修改header的名称，主要是加编号前缀
     * 3.生成目录的节点（数据源）
     * @param opts
     * @private
     */
    _md_header = function (opts) {
        // 选择所有标题元素（h1 - h6）
        opts._header_offsets = []
        $('#' + opts._mdContentId).find(':header').each(function() {
            var level = parseInt(this.nodeName.substring(1), 10);

            _rename_header(opts, this, level);

            _header_node(opts, $(this));
        });
    }

    /*
     * 根据滚动确定当前位置，并更新ztree，不考虑上限和下限问题，即如果最末尾已经超出ztree最后一个节点的覆盖范围，仍然最后一个节点高亮，首个节点类似
     * @param opts
     * @private
     */
    function _bind_scroll_event_and_update_postion(opts) {
        var timeout;
        var highlight_on_scroll = function(e) {
            if (timeout) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(function() {
                // 保持10px的偏移量，效果更好
                var top = $(window).scrollTop() + 10;
                var p = 0;
                for (var i = 0, c = opts._header_offsets.length; i < c; i++) {
                    if (opts._header_offsets[0] > top) {
                        p = 0;
                        break;
                    }
                    if (opts._header_offsets[opts._header_offsets.length - 1] < top) {
                        p = opts._header_offsets.length - 1;
                        break;
                    }
                    if (opts._header_offsets[i] > top && opts._header_offsets[i - 1] < top) {
                        p = i - 1;
                        break;
                    }
                }
                // 当前内容位置
                _log(opts, 'opts._header_offsets['+ p +'] = '+ opts._header_offsets[p]);
                $('a').removeClass('curSelectedNode');
                // 这里利用了ztree的节点id是从1到N这样的顺序下来的设定
                var obj = $('#md_tree_' + (p + 1) + '_a').addClass('curSelectedNode');
            }, opts._refresh_scroll_time);
        };

        if (opts._highlight_on_scroll) {
            $(window).bind('scroll', highlight_on_scroll);
            highlight_on_scroll();
        }
    }

    $.fn.md_handle = function(options) {
        // 将defaults 和 options 参数合并到{}
        $.fn.md_handle.defaults = $.extend({}, $.fn.md_handle.defaults, options);

        var opts = $.fn.md_handle.defaults

        _img_handle(opts);

        _md_header(opts);

        // 初始化ztree
        $.fn.zTree.init($('#' + opts._zTreeId), opts.ztreeSetting, opts._zTree_nodes).expandAll(opts._ztree_expandAll);

        _bind_scroll_event_and_update_postion(opts);
    }

    //定义默认
    $.fn.md_handle.defaults = {
        /**
         * 是否打印日志
         */
        debug: false,
        /**
         * ztree id
         */
        _zTreeId: 'md_tree',
        /**
         * 目录树数据源
         */
        _zTree_nodes: [],
        /**
         * md id
         */
        _mdContentId: 'md_content',
        /**
         * header级别
         */
        _headerLevel: [],
        /**
         * 1 = 0*100 +1
         * 1.1.1 = 1*100*100 + 1*100 + 1
         */
        _headerStep: 100,
        /**
         * 标题加编号
         */
        _autoNumber: true,
        /**
         * 默认展开全部节点
         */
        _ztree_expandAll: true,
        /**
         * 内容各级标题对应的位置
         */
        _header_offsets: [],
        /**
         * 滚动是否节点高亮
         */
        _highlight_on_scroll: true,
        /*
         * 计算滚动判断当前位置的时间，默认是50毫秒
         */
        _refresh_scroll_time: 50,
        /**
         * 选中节点时对应的内容标题有动画效果
         */
        _is_highlight_selected_line: true,
        /**
         * ztree配置，具体参考ztreeAPI
         */
        ztreeSetting: {
            view: {
                dblClickExpand: false,
                showLine: true,
                showIcon: false,
                selectedMulti: false
            },
            data: {
                simpleData: {
                    enable: true,
                    idKey : "id",
                    pIdKey: "pId",
                    rootPId: null
                }
            },
            callback: {
                beforeClick: function(treeId, treeNode) {
                    $('a').removeClass('curSelectedNode');
                    if($.fn.md_handle.defaults._is_highlight_selected_line) {
                        $('#' + treeNode.id).css('color' ,'red').fadeOut("slow" ,function() {
                            $(this).show().css('color','black');
                        });
                    }
                }
            }
        }
    };

})(jQuery);