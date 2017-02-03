function keywordsLayer(options) {
        var _this = this;
        _this.values = options['values'];
        _this.container = options['container'];
        _this.result = options['result'];
        _this.lang_opt = options["lang"] || "CN";
        _this.selectTexts = options["selectTexts"] || "";
        _this.selectArr = options["selectArr"] || [];
        _this.callBack = options["callback"];
        _this.parent_layer = new Date().getTime();
        _this.child_layer = new Date().getTime() + 999;
        _this.maxKeywords = options["maxKeywords"] || 20;
        _this.html = "";
        _this.layer_init();
    }
    keywordsLayer.prototype.layer_init = function () {
        var _this = this;
        _this.renderHtml();
        // _this.selectArr && _this.setSelected();
    };
    keywordsLayer.prototype.forTree = function (o) {
        var _this = this;
        var lang = "";//_this.lang_opt=="CN"?"":"_en";
        var length =o.length<_this.maxKeywords?o.length:_this.maxKeywords;
        for (var i=0;i<length;i++) {
            var url, str = "";
            var id=o[i]["keywords_id"] || "";
            try {
                urlstr = "<li><span id='" + id + "' title='" + o[i]["name" + lang] + "'>&nbsp;" + o[i]["name" + lang] + "</span><label class='delete'><img src='/images/btn_del.png'></label></li>";

                _this.html += urlstr;

            } catch (e) {
            }
        }
        //console.log(_this.html);
        return _this.html;
    }
    keywordsLayer.prototype.functionBind = function () {
        var _this = this;

        $(_this.container).on("keydown", ".keywords_search", function (event) {
            event = event || window.event;
            if (event.keyCode == 13) {
                $(this).find(".add_button").click();
            }
        }),
        $(_this.container).on("paste", ".keywords_input", function (event) {
            event = event || window.event;
            var input = $(this).val();
            var pastedText = undefined;
            if (window.clipboardData && window.clipboardData.getData) { // IE
                pastedText = window.clipboardData.getData('Text');
            } else {
                pastedText = event.originalEvent.clipboardData.getData('Text');//e.clipboardData.getData('text/plain');
            }
            var texts = pastedText.split(/[\s\t\n]/);
            var limit = _this.maxKeywords - _this.selectArr.length;
            var totalAdd = 0;
            for (var i = 0; i < texts.length; i++) {
                if (totalAdd < limit) {
                    if (_this.addTextHtml(texts[i])) {
                        totalAdd++;
                    }
                }
                ;
            }
            ;
            $(this).val("");
            _this.sum();
            return false;
        });
        $(".keywords_search", _this.container).on("click", ".add_button", function () {
            var $input = $(this).parents().find(".keywords_input");
            var text = $.trim($input.val());
            _this.addTextHtml(text);
            $input.val("");
            _this.sum();

        })
        $(".button_layer", _this.container).on("click", "a", function () {
            if (_this.selectArr.length > 0) {
                if (true){
                    $("#" + _this.child_layer, _this.container).html('<div style="background: url(/images/pre-loading_CN.gif) 50% 50% no-repeat transparent;width:95%;height:100px;top:30%;position:absolute;z-index:9999999"></div>');
                }else{
                    $("#" + _this.child_layer, _this.container).html('<div style="background: url(/images/shared/components/pre-loading_EN.gif) 50% 50% no-repeat transparent;width:95%;height:100px;top:30%;position:absolute;z-index:9999999"></div>');
                }
                //console.log("=======selectArr", _this.selectArr);
                var audience_keywords = _this.selectArr;
                var audience_id = 
                        $.ajax({
                            type: 'post',
                            data: {audience_id: audience_id, audience_keywords: audience_keywords},
                            url: "/zh-cn/presale_tools/get_keywords_suggest",
                            success: function (data) {
                                //console.log("============data", data)
                                var keywords_suggest =  data.keywords_suggest
                                //var example = ["这", "是", "一个", "例子"];
                                //$("#" + _this.child_layer, _this.container).html('<div style="background: url(/images/pre-loading_CN.gif) 50% 50% no-repeat transparent;width:95%;height:100px;top:30%;position:absolute;z-index:9999999"></div>');
                                $("#" + _this.child_layer, _this.container).html('');
                                $("#" + _this.child_layer, _this.container).empty();
                                if (keywords_suggest.length > 0){
                                    for (var i = 0; i < keywords_suggest.length; i++) {
                                        var liDom = $('<li><i class="transform-ico">&lt;&lt;</i><span title="' + keywords_suggest[i] + '">&nbsp;' + keywords_suggest[i] + '</span></li>');
                                        $("#" + _this.child_layer, _this.container).append(liDom);
                                    };
                                }else{
                                    $("#" + _this.child_layer, _this.container).append('<li>没有数据</li>');
                                }
                            },
                            error: function (data) {
                                $("#" + _this.child_layer, _this.container).append('<li>没有数据</li>');
                            }
                        });
            } else {
                $(".keywords_search", _this.container).find(".keywords_input").focus();
            }
        });

        $(_this.container).on("click", ".delete", function () {
            $("div.audience_save").attr('style','display: inline');
            $(this).parent().remove();
            _this.sum();
        });

        $(_this.container).on("click", ".transform-ico", function () {
            var text = $(this).next().attr("title");
            var $childLayer = $("#" + _this.child_layer, _this.container);
            if (_this.addTextHtml(text)) {
                $(this).parent().remove();
            }

            if ($childLayer.find("li").length == 0) {
                $childLayer.append('<li>No result(s)</li>');
            }
            ;
            _this.sum();
        });

        $(_this.container).on("click",".clearAll",function(){
            _this.clearAll();
        });
    }
    keywordsLayer.prototype.addTextHtml = function (text) {
        $("div.parent_layer ul.tree").removeClass("have_error");
        $("div.audience_save").attr('style','display: inline');
        $(".error").addClass("hide");
        var _this = this;
        var liDom = $('<li><span title="' + text + '">&nbsp;' + text + '</span><label class="delete"><img src="/images/btn_del.png"></label></li>');
        if (text && $.inArray(text, _this.selectArr) == -1 && _this.selectArr.length < _this.maxKeywords) {
            $("#" + _this.parent_layer, _this.container).append(liDom);
            return true;
        }
        return false;
    }

    keywordsLayer.prototype.renderHtml = function () {
        var _this = this;
        var label_lang = _this.lang[_this.lang_opt]["pLabel"];
        var $parentHtml = $("<div class='parent_layer'><ul class='pannel'><span>" + label_lang[0] + " (<b style='color:red'>0/" + _this.maxKeywords + "</b>) </span><span class='clearAll'><a href='javascript:;' style='color:#333;'>"+label_lang[5]+"</a></span></ul><div class='keywords_search'><input type='text' class='keywords_input' placeholder='" + label_lang[4] + "'><i class='add_button'></i></div><ul id='" + _this.parent_layer + "' class='tree'></ul></div>");
        var $childHtml = $("<div class='child_layer'><ul class='pannel'><span>" + label_lang[1] + "</span></ul><ul id='" + _this.child_layer + "' class='tree'><li>" + label_lang[3] + "</li></ul></div>");
        var $button = $('<div class="button_layer" ><label ><a href="javascript:;"><div style="border:2px solid #DADAD5;height: 26px;width: 27px;margin-left: 26px;margin-top: 20px;-moz-border-radius: 3px; -webkit-border-radius: 3px;"><i class="icon-getideas-to-nc"></i></div></a></label></div>');
        $('<div id="keywords_layer" class="clearfloat"  style="width: 450px;"></div>').append($parentHtml).append($button).append($childHtml).appendTo(_this.container);
        var str = _this.forTree(_this.values);
        $("#" + _this.parent_layer, _this.container).append(str);
        _this.functionBind();
        _this.sum();
    }

    keywordsLayer.prototype.sum = function () {
        var _this = this, length = 0;
        _this.selectArr = [];
        var $span = $(_this.container).find("#" + _this.parent_layer).find("span");
        $span.each(function () {
            length++;
            _this.selectArr.push($(this).attr("title"));

        })
        _this.selectTexts = _this.selectArr.join(",");
        $(_this.result).val(_this.selectTexts);
        $(_this.container).find("b").text(length + "/" + _this.maxKeywords);
        //回调
        _this.callBack && typeof(_this.callBack) === "function" && _this.callBack(_this.selectTexts);
    }
    keywordsLayer.prototype.setSelected = function () {
        var _this = this;
        for (var i = 0; i < _this.values.length; i++) {
            _this.addTextHtml(_this.values[i]);
        }
        ;
        _this.sum();
    }
    keywordsLayer.prototype.clearAll = function(){
        var _this = this;
        $("#"+_this.parent_layer,_this.container).empty();
        _this.sum();
    }
    keywordsLayer.prototype.lang = {
        'CN' : {
                pLabel : ["关键词","建议", "联想关键词","没有结果","请输入关键词","清空"]
            },
        'EN' : {
            pLabel : ["keywords","Suggestions", "Suggest Keywords","No result(s)","Please enter keywords","Clear All"]
            
        }
    }