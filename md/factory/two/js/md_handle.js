/**
 * 对原生md文件生成的html做结构解析，
 * 1.生成对应目录结构
 * 2.相应特效，例如滚动，跳转
 */


;(function($) {

    /**
     * 解析md的header
     * @param opts
     * @private
     */
    _md_header = function (opts) {
        // 选择所有标题元素（h1 - h6）
        $(opts._mdContent).find(':header').each(function() {
            var level = parseInt(this.nodeName.substring(1), 10);

            _rename_header_content(opts,this,level);

            _add_header_node(opts,$(this));
        });//end each
    }

    $.fn.md_handle = function(options) {
        // 将defaults 和 options 参数合并到{}
        var opts = $.extend({},$.fn.md_handle.defaults,options);

        return this.each(function() {
            opts._zTree = $(this);

            _md_header(opts);

        });
    }

    //定义默认
    $.fn.md_handle.defaults = {
        /**
         * 目录树
         */
        _zTree: null,
        _mdContent: 'md_content'
    };

})(jQuery);