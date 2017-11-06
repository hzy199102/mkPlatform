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
     * 根据header生成ztree的node的id
     * @param headerLevel
     * @param headerStep
     * @param type id类型，false：自身id；true：父id;
     * @returns {number}
     * @private
     */
    _ztree_node_id = function (headerLevel, headerStep, type) {
        var result = 0;
        var _type = type ? 1 : 0;
        if (headerLevel.length === type) {
            return result;
        }
        for (var i = _type; i < headerLevel.length; i++ ) {
            result += headerLevel[i] * Math.pow(headerStep, headerLevel.length - i - 1);
        }
        return result;
    }

    /**
     * 生成ztree的源数据，给header绑定id，绑定锚点
     * @param opts
     * @param header_obj
     * @private
     */
    _header_node = function (opts, header_obj) {
        var id  = _ztree_node_id(opts._headerLevel, opts._headerStep);
        var pId = _ztree_node_id(opts._headerLevel, opts._headerStep, true);
        // 设置锚点id
        $(header_obj).attr('id', id);
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
            opts._headers[level - 1] ++;
        } else if (opts._headerLevel.length === level) {
            opts._headerLevel[level - 1]++;
        } else {
            opts._headerLevel.push(1);
        }

        if (opts._autoNumber) {
            // 另存为的文件里会有编号，所以有编号的就不再重新替换
            if($(header_obj).text().indexOf( opts._headers.join('.') ) != -1){

            }else{
                $(header_obj).text(opts._headers.join('.') + '. ' + $(header_obj).text());
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
        $(opts._mdContent).find(':header').each(function() {
            var level = parseInt(this.nodeName.substring(1), 10);

            _rename_header(opts, this, level);

            _header_node(opts, $(this));
        });
    }

    $.fn.md_handle = function(options) {
        // 将defaults 和 options 参数合并到{}
        var opts = $.extend({},_defaults,options);

        return this.each(function() {
            opts._zTree = $(this);

            _md_header(opts);

            // 初始化ztree
            $.fn.zTree.init(t,opts.ztreeSetting,opts._header_nodes).expandAll(opts.is_expand_all);
        });
    }

    //定义默认
    _defaults = {
        /**
         * 目录树
         */
        _zTree: null,
        /**
         * 目录树数据源
         */
        _zTree_nodes: [],
        /**
         * md内容
         */
        _mdContent: 'md_content',
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
    };

})(jQuery);