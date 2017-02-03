function multilayer_presale (options) {
	var _this = this;
	_this.values=options['values'];
	_this.container=options['container'];
	_this.result=options['result'];
	_this.lang_opt = options["lang"] || "CN";
	_this.selectIds = options["selected"] || "";
	_this.callBack = options["callback"];
	_this.keyword = options["keyword"] || "audience_id";
	_this.parent_layer = new Date().getTime();
	_this.child_layer=new Date().getTime()+999;
	_this.limitCount=options["limit"] || "5";
	_this.html="";
	_this.selectArr=[];
	_this.layer_init();
}
multilayer_presale.prototype.layer_init = function() {
	var _this = this;
	_this.renderHtml();
	_this.selectIds && _this.setSelected();
};
multilayer_presale.prototype.forTree = function(o){
	var _this = this;
	var lang = _this.lang_opt=="CN"?"":"_en";
	for(var i=0;i<o.length;i++){
		var url,str = "";
		var id=o[i][_this.keyword];

		try{
			if(typeof o[i]["url"] == "undefined"){
				urlstr = "<li><span id='"+id+"' title='"+ o[i]["name"+lang] +"'>&nbsp;"+ o[i]["name"+lang] +"</span><ul class='line'>";
			}else{
				urlstr = "<li><span id='"+id+"' title='"+ o[i]["name"+lang] +"'><a href="+ o[i]["url"] +">&nbsp;"+ o[i]["name"+lang] +"</a></span><ul>";	
			}
			_this.html += urlstr;
			if(o[i]["children"] != null && o[i]["children"].length>0){
				_this.forTree(o[i]["children"]);
			}
			_this.html += "</ul></li>";
		}catch(e){}
	}
	return _this.html;
}

multilayer_presale.prototype.menuTree = function(){
	var _this = this;
	//给有子对象的元素加[+-]
	$(".tree ul",_this.container).each(function(index, element) {
		var ulContent = $(element).html();
		var spanContent = $(element).siblings("span").html();
        if(ulContent){
			$(element).siblings("span").before('<i  class="button switch center_close"></i>')	;
		}
    });
	
	$(".tree",_this.container).on("click","li span" , function(){
		var that = this;
		var ul = $(that).siblings("ul");
		var spanStr = $(that).html();
		var noselect=false;
		if($(that).parents(".tree").attr("id")==_this.parent_layer && !$(that).hasClass("selected")){
			//不同级不能同时出现
			//父节点被选或者所属子节点被选，那么该不能被选
			var parent_select = [];
			//找到所有父节点
			$(that).parent().parent().parents("li").each(function(){
				var ti=this;
				$(ti).find("span").first().each(function(){
					parent_select.push($(this).attr("id"));
					$(this).hasClass("selected") && (noselect=true);
				})
			});
			if (!noselect) {
				if(ul.html() != null){
					ul.find("span.selected").length>0 && (noselect=true);
				}
			};
			//不同级互斥选中
			if (!noselect && !$(that).hasClass("select")) {
				//所有父节点取消选中
				for (var i = 0; i < parent_select.length; i++) {
					var $parentSelectDom=$(_this.container).find("#"+_this.parent_layer).find("#"+parent_select[i]);
					$parentSelectDom.removeClass("select");
				}
				//所有子节点取消选中
				if (ul.html()!= null) {
					ul.find("span.select").removeClass("select");
				};
			};
			if(!noselect){
				$(this).toggleClass("select");
			}
		}

	})

	$(".tree",_this.container).on("click","li i" , function(){
		var ul = $(this).siblings("ul");
		if(ul.find("li").html() != null){
			if(ul.css("display") == "none" ){
				ul.show(300);
				$(this).removeClass('center_close');
				$(this).addClass('center_open');
			}else{
				ul.hide(300);
				$(this).removeClass('center_open');
				$(this).addClass('center_close');
			}
		}
	})

	$(".button_layer",_this.container).on("click","a",function(){
		var nowCount = _this.selectArr.length;
		$(".select",_this.container).each(function(){
			if (_this.limitCount) {
				nowCount++;
				if (_this.limitCount<nowCount) {
					$(_this.container).find("#"+_this.child_layer).addClass("have_error");
					return false;
				};
			};
			_this.addChild($(this).attr("id"));
		});
		//统计
		_this.sum();
		//回调
		_this.callBack && typeof(_this.callBack)==="function" && _this.callBack(_this.selectIds);
	});
	$(_this.container).on("click",".delete",function(){
		var that = this;
		var id = $(that).siblings("span").attr("id");
		var oldClass=[];
		$(_this.container).find("#"+_this.parent_layer).find("#"+id).removeClass("selected");
		
		$(that).parent().remove();
		$(_this.container).find("#"+_this.child_layer).removeClass("have_error");

		_this.sum();
		//回调
		_this.callBack && typeof(_this.callBack)==="function" && _this.callBack(_this.selectIds);
	});

}
multilayer_presale.prototype.addChild = function(id){
	var _this = this;
	$(_this.container).find("#"+_this.parent_layer).find("#"+id).removeClass("select").addClass("selected");

	_this.showChild(id);
}
multilayer_presale.prototype.showChild = function(id){
	var _this = this;
	var $html = $(_this.container).find("#"+_this.parent_layer).find("#"+id);
	var title = $html.attr("title");
	var name = $html.html();
	var html= "<li><span id='"+id+"' title='"+title+"'>"+name+"</span><label class='delete'><img src='/images/shared/components/btn_del.png' /></label></li>";
	$(_this.container).find("#"+_this.child_layer).append(html);

}
multilayer_presale.prototype.removeAll = function(){
	var _this = this;
	$(_this.container).find("#"+_this.child_layer).find(".delete").each(function(){
		$(this).click();
	})
}

multilayer_presale.prototype.renderHtml = function(){
	var _this = this;
	var label_lang = _this.lang[_this.lang_opt]["pLabel"];
	var $parentHtml = $("<div class='parent_layer'><ul class='pannel'><span>"+label_lang[0]+"</span></ul><ul id='"+_this.parent_layer+"' class='tree'></ul></div>");
	var $childHtml = $("<div class='child_layer'><ul class='pannel'><span>"+label_lang[1]+"<b style='color:red'>0</b>"+label_lang[2]+"</span></ul><ul id='"+_this.child_layer+"' class='tree'></ul></div>");
	var $button = $('<div class="button_layer"><label ><a href="javascript:;">'+label_lang[3]+' > </a></label></div>');
	$('<div id="multi_layer_presale" class="clearfloat"></div>').append($parentHtml).append($button).append($childHtml).appendTo(_this.container);
	var str= _this.forTree(_this.values);
	$("#"+_this.parent_layer,_this.container).append(str);
	_this.menuTree();

	$(".selected",_this.container).each(function(){
		_this.addChild($(this).attr("id"));
	});
	// $('.tree',_this.container).hover(
 //    function(){
 //        $('body').css('overflow', 'hidden');
 //    },
 //    function(){
 //        $('body').css('overflow', 'auto');
 //    })
	
}
multilayer_presale.prototype.sum = function(){
	var _this = this,lenspan=0,leni=0;
	_this.selectArr=[];
	var $span = $(_this.container).find("#"+_this.child_layer).find("span");
	$span.each(function(){
		if ($(_this.container).find("#"+_this.parent_layer).find("#"+$(this).attr("id")).hasClass("selected")) {
			lenspan++;
			_this.selectArr.push($(this).attr("id"));
		};
	})
	_this.selectIds = _this.selectArr.join(",");
	$(_this.result).val(_this.selectIds);
	$(_this.container).find("b").text(lenspan);
	
}
multilayer_presale.prototype.setSelected = function(){
	var _this = this,l=_this.selectIds.length,selected = _this.selectIds,length=0;
	for (var i = 0,j = l; i < j; i++) {
		_this.addChild(selected[i]);
	};
	//统计
	_this.sum();
	
	//回调
	_this.callBack && typeof(_this.callBack)==="function" && _this.callBack(_this.selectIds);
}
multilayer_presale.prototype.lang = {
	'CN' : {
			pLabel : ["兴趣标签","已选择 ", " 个兴趣标签","添加"]
		},
	'EN' : {
		pLabel : ["Interests","Selected ", " Interests","Add"]
		
	}
}