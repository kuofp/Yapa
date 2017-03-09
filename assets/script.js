function checkScript(){}

function open(verb, url, data, target) {
	var form = document.createElement("form");
	form.action = url;
	form.method = verb;
	form.target = target || "_self";
	if (data) {
		for (var key in data) {
			var input = document.createElement("textarea");
			input.name = key;
			input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
			form.appendChild(input);
		}
	}
	form.style.display = 'none';
	document.body.appendChild(form);
	form.submit();
}

jQuery.fn.extend({
	_autocomplete: function(init = ''){
		
		var tar = this;
		var url = init.url || '';
		var col = $('<input class="form-control input-sm" type="text"/>');
		
		$(tar).before(col);
		
		$(tar).parents('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		//id 'label' compare with the id 'label_h' to determine if the id 'autocomplete_id' should be reset
		//use keypress to overcome type tool problem (keyup/keydown failed)
		//use 'input' instead of the 'change' event for rapid effect
		$(col).on('keypress input', function(){
			
			var pdata = {data: {autocomplete: $(tar).attr('name')}, where: {'[~]': $(this).val()}};
			
			$.ajax({
				url: url,
				type: 'POST',
				data: { jdata: JSON.stringify({ pdata: pdata, method: 'getJson' }) },
				success: function(re) {
					
					var jdata = JSON.parse(re);
					var arr = Object.keys(jdata).map(function (key) {return jdata[key]});
					$(col).autocomplete({
						source: arr,
						select: function(event, ui){
							$(col).val(ui.item.label);
							$(tar).val(ui.item.val).trigger('change');
						}
					});
				}
			});
		}).trigger('keypress'); //init autocomplete or words will be cut at first input
		
		$(tar).on('preset', function(){
			
			var id = $(tar).val();
			var pdata = {data: {autocomplete: $(tar).attr('name')}, where: {AND: id}};
			
			if(id){
				$.ajax({
					url: url,
					type: 'POST',
					data: { jdata: JSON.stringify({ pdata: pdata, method: 'getJson' }) },
					success: function(re) {
						
						var jdata = JSON.parse(re);
						if(jdata[0]){
							$(col).val(jdata[0]['label']);
						}else{
							$(col).val('');
						}
					}
				});
			}else{
				$(col).val('');
			}
		});
	}
});

jQuery.fn.extend({
	json: function(init = ''){
		
		var tar = this;
		var tpl = (init.tpl || '[]').replace(/'/g, '"');
		tpl = JSON.parse(tpl);
		
		$(tar).parents('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			
			$(tar).siblings('div.box').remove();
			
			var str = ($(this).val() || '[]').replace(/'/g, '"');
			var obj = JSON.parse(str);
			var ctl = [];
			
			var box = $('<div class="box"></div>');
			
			if(tpl){
				for(var i in tpl){
					tpl[i] = obj[i] || '';
				}
				obj = tpl;
			}
			
			for(var i in obj){
				
				ctl[i] = $('<span class="label label-default">' + i + '</span><input class="form-control input-sm" value="' + obj[i] + '">');
				box.append(ctl[i]);
				
				ctl[i].on('input', '', i, function(e){
					obj[e.data] = $(this).val();
					$(tar).val(JSON.stringify(obj));
				});
			}
			
			$(this).before(box);
		});
	}
});


// require jquery/bootstrap/font-awesome
jQuery.fn.extend({
	uploadfile: function(init){
		
		var tar = this;
		var url = init.url;
		var col = init.col || 'col-sm-6';
		
		var bar = $('<div class="p" style="background-color: aquamarine; height: 3px; width: 0px; margin: 1px"></div>');
		var ctl = $('<input type="file" multiple>');
		
		$(tar).before(bar);
		$(tar).before(ctl);
		
		$(ctl).change(function(e){
			
			var upload = this;
			var data = new FormData();
			var files = $(this).get(0).files;
			
			for(var i in files){
				data.append(i, files[i]);
			}
			data.append('method', 'upload');
			
			$.ajax({
				url:  url,
				type: 'POST',
				data: data,
				processData: false, // Don't process the files
				contentType: false, // Set content type to false as jQuery will tell the server its a query string request
				success: function(re){
					
					var add = JSON.parse(re);
					var val = $(tar).val() || '[]';
					var arr = JSON.parse(val);
					for(var i in add){
						arr.push(add[i]);
					}
					
					// clear selected files, render gallery
					$(upload).val('');
					$(tar).val(JSON.stringify(arr)).trigger('preset');
				},
				error: function(){
					console.log('err: ajax file upload');
				},
				xhr: function(){
					var xhr = $.ajaxSettings.xhr() ;
					// set the onprogress event handler
					xhr.upload.onprogress = function(evt){
						$(bar).animate({width: (evt.loaded/evt.total*100) + '%'}, 100);
					} ;
					// set the onload event handler
					xhr.upload.onload = function(){
						$(bar).stop().animate({width: '0%'}, 10);
					} ;
					return xhr ;
				}
			});
			return false;
		});
		
		$(tar).on('preset', function(){
			
			var val = $(this).val() || '[]';
			var arr = JSON.parse(val);
			
			$(this).siblings('div.gallery').remove();
			
			// init
			if(!arr.length) return;
			
			var gallery = $('<div class="gallery"><style>.icon-set{ white-space: nowrap; text-overflow: ellipsis; overflow: hidden; position: absolute; bottom: 20px; width: 100%; padding: 5px; background-color: rgba(0,0,0,0.8); color: white}</style></div>');
			
			$(this).after(gallery);
			
			// bind form reset event
			$(gallery).parents('form').on('reset', function(){
				$(gallery).remove();
			});
			
			var html = '';
			for(var i in arr){
				
				arr[i]['ext'] = (arr[i]['name'].split('.')[1] || 'na').toLowerCase();
				
				var dl = '<a href="' + arr[i]['url'] + '" download="' + arr[i]['name'] + '" target="_blank"><i class="fa fa-download"></i></a>';
				var rm = ' | <a href="#" class="delete"><i class="fa fa-trash"></i></a> ';
				
				html += '<div style="position: relative; float: left; margin: 10px;"><a class="thumbnail" href="#"><table style="width: 100px; height: 100px;"><tr><td style="text-align: center"><img src="' + arr[i]['url'] + '" class="img-responsive" style="max-width: 100px; max-height: 100px; margin: 0 auto;"/></td></tr></table></a>         <div class="icon-set" title="' + arr[i]['name'] + '">' + dl + rm + arr[i]['name'] + '</div></div>';
			}
			
			// start loading
			$(gallery).append(html);
			
			$(gallery).find('.thumbnail').each(function(i){
				
				$(this).imgEvent($(tar));
				
				$(this).find('img').on('load', function(){
					
				}).on('error', function(){
					$(this).addClass('hidden').after('<i class="fa fa-file" style="position: relative; color: brown; font-size: 45px"><span style="position: absolute; top: 25px; left: 6px; color: white; font-size: 11px;">' + arr[i]['ext'] + '</span></i>');
				});
			});
		});
	},
	// delete event
	imgEvent: function(input){
		
		var tar = this;
		var img = $(tar).find('img');
		
		$(tar).siblings('.icon-set').find('.delete').click(function(){
			var url = $(img).attr('src');
			
			var arr = JSON.parse($(input).val());
			for(var i in arr){
				if(arr[i]['url'] == url){
					arr.splice(i, 1);
					break;
				}
			}
			
			$(input).val(JSON.stringify(arr));
			$(tar).parent('div').remove();
		});
		return this;
	}
});

function customAlert(msg, arg){
	var arg = arg | 0;
	var info = ['<i class="fa fa-times-circle"></i> 錯誤', '<i class="fa fa-check-circle"></i> 成功', '<i class="fa fa-exclamation-circle"></i> 警告'];
	var type = ['danger', 'success', 'warning'];
	$('body').find('.err-msg-wrap').remove();
	$('body').append("<div class='err-msg-wrap' style='width: 100%;position: fixed;top: 0px;z-index: 1500;'><script>setTimeout(function(){ $('body').find('.err-msg-wrap').fadeOut(); }, 3000);</script><div class='alert alert-" + type[arg] + "' role='alert' style='width: 320px;position: relative;margin: auto;'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button><p><strong>" + info[arg] + ": </strong>" + msg + "</p></div></div>");
}

function bindFormChkall(uid){
	var f = $('#' + uid + '_panel');
	var l = $('#' + uid + '_checked_list');
	f.find('.chkall').click(function(){
		if($(this).children().hasClass('fa-check-square-o')){
			$(this).children().removeClass('fa-check-square-o').addClass('fa-square-o');
			l.val('');
			
			f.find('.chklist').children().removeClass('fa-check-square-o').addClass('fa-square-o');
			f.find('.chklist').parent('.datalist').removeAttr('style');
		}else if($(this).children().hasClass('fa-square-o')){
			$(this).children().removeClass('fa-square-o').addClass('fa-check-square-o');
			var chkall = [];
			f.find('.chklist').parent().find('[name=id]').each(function(i){ chkall[i] = $(this).text();});
			f.find('.chklist').parent().css('background-color', '#4285f4').css('color', '#fff').find('.chklist').children().removeClass('fa-square-o').addClass('fa-check-square-o');
			l.val(chkall.join());
		}
	});
}
function bindFormSort(uid){
	var f = $('#' + uid + '_panel');
	f.find('th.order').click(function(){
		
		var s = f.find('input.search_adv');
		
		var plus = '';
		var t = $(this).children();
		var n = $(this).attr('name');
		var tmp = JSON.parse(s.val().replace(/'/g, '"')); //json in input
		var obj = {};
		
		for(var i in tmp){
			obj[i] = tmp[i];
		}
		
		if(!('ORDER' in obj)){
			obj['ORDER'] = {};
		}
		
		if(t.hasClass('fa-sort-alpha-asc')){
			obj['ORDER'][n] = 'DESC';
			plus = 'fa fa-sort-alpha-desc';
		}else if(t.hasClass('fa-sort-alpha-desc')){
			delete  obj['ORDER'][n];
			plus = '';
		}else{
			obj['ORDER'][n] = 'ASC';
			plus = 'fa fa-sort-alpha-asc';
		}
		
		var q = JSON.stringify(obj).replace(/"/g, '\'');  //json in input
		
		s.val(q).trigger('change');
		t.attr('class', plus);
	});
}

function bindFormChkall2(uid){
	var f = $('#' + uid + '_panel');
	var l = $('#' + uid + '_checked_list');
	
	
	f.find('table.review').find('.newdatalist').prepend('<td class="chklist" style="width: 30px;"><i class="fa fa-square-o"></i></td>');
	f.find('.newdatalist').find('.chklist').click(function() {
		if($(this).children().hasClass('fa-check-square-o')){
			$(this).children().removeClass('fa-check-square-o').addClass('fa-square-o');
			$(this).parent('.datalist').removeAttr('style');
			
			var str = l.val();
			var arr = str.split(',');
			
			var val = $(this).parent().find('[name=id]').text();
			var idx = jQuery.inArray( val, arr );
			
			//if found in array
			if(idx != -1){
				delete arr[idx];
				l.val($.grep(arr,function(n){ return(n) }));
			}
			
		}else{
			$(this).children().removeClass('fa-square-o').addClass('fa-check-square-o');
			$(this).parent('.datalist').css('background-color', '#4285f4').css('color', '#fff');
			
			if(l.val() == ''){
				l.val( $(this).parent().find('[name=id]').text() );
			}else{
				l.val( l.val() + ',' + $(this).parent().find('[name=id]').text() );
			}
		}
		//console.log('Info: checked list ' + l.val());
	});
	
	var str = l.val();
	var arr = str.split(',');
	
	//clear select and select again, filter is better than map contain values
	for(var i = 0; i < arr.length; i++){
		f.find('table.review').find('.newdatalist').find('[name=id]').filter(function() {
			return $(this).text() === arr[i];
		}).parent('.newdatalist').css('background-color', '#4285f4').css('color', '#fff').find('.chklist').children().removeClass('fa-square-o').addClass('fa-check-square-o');
	}
}


function bindFormViewComplete(uid, max){
	var f = $('#' + uid + '_panel');
	var c = $('#' + uid + '_item_cnt');
	var r = $('#' + uid + '_review_complete');
	var t = $('#' + uid + '_target_id');
	var m = $('#' + uid + '_Modal');
	
	f.find('input.search').on('input', function (){ f.find('table.review').trigger('refresh',{type: 'review'}); });
	f.find('input.search_adv').on('keyup keydown change', function (){ f.find('table.review').trigger('refresh',{type: 'review'}); });
	c.change(function(){ f.find('.item_cnt').text($(this).val()); });
	bindFormSort( uid );
	bindFormChkall( uid );
	f.find('button.review').click(function(){ $(this).addClass('buttonLoading').button('loading'); f.find('table.review').trigger('refresh',{type: 'append', max: max});});


	r.change(function(){
		
		
		//set newdatalist js events
		f.find('table.review').find('.newdatalist').children().not('.chklist').click(function(){
			t.val( $(this).parent().find(' [name=id] ').text());
			t.trigger('change');
			m.find('.modal-footer').children('div').hide();
			m.find('.modal-footer').find('div.modify').show();
			m.modal('show');
		});
		
		
		bindFormChkall2( uid );
		
		
		$('.buttonLoading').button('reset');
		f.find('table.review').find('.newdatalist').addClass('datalist').removeClass('newdatalist');
		//f.find('table.review').find('.last').sortable();
		
		
		//item count
		c.val( f.find('table.review').find('.datalist').length ).trigger('change');
		console.log('Info: total ' + c.val() + ' items');
	});
}


function bindFormAjaxOnRefresh(uid, url, table, max){
	var f = $('#' + uid + '_panel');
	var c = $('#' + uid + '_item_cnt');
	var r = $('#' + uid + '_review_complete');
	
	f.find('table.review').on('refresh', function (e,obj){
		var str_id = (typeof obj.id === 'undefined') ? '' : obj.id;
		var arr_id = str_id.split(',');
		for(var i = 0; i < arr_id.length; i++){
			var int_id = parseInt(arr_id[i]);
			var pdata = {data:{},where:{ AND: {}}};
			var arr_like = {};
			var arr_or = {};
			var max_ = parseInt((typeof obj.max === 'undefined') ? max : obj.max);
			var keyword = f.find('input.search').val();
			var keyword_adv = f.find('input.search_adv').val();
	
			switch(obj.type){
				case 'review':
					c.val(0);
				case 'append':
					if(max_){ // skip zero case
						pdata['where']['LIMIT'] = [c.val(), max_];
					}
					pdata['where']['SEARCH'] = keyword;
					pdata['where']['SEARCH_ADV'] = keyword_adv;
					break;
				case 'create':
				case 'modify':
				case 'delete':
					pdata['where']['AND'][table + '.id'] = int_id;
					pdata['where']['SEARCH'] = keyword;
					pdata['where']['SEARCH_ADV'] = keyword_adv;
					break;
				default:
					break;
			}
		
		
			$.ajax({
				url: url,
				idx: i,
				type: 'POST',
				data: {jdata: JSON.stringify({ pdata: pdata, method: 'review' })},
				success: function(re) {
					var int_id = parseInt(arr_id[this.idx]);
					
					var jdata = JSON.parse(re);
					//console.log('Info: refresh err ' + jdata['err'].join(', '));
					
					//debug for search_adv 
					//console.log(jdata['err']);
					
					switch(obj.type){
						
						case 'review':
							c.val(0);
						case 'append':
							
							if(c.val() == 0){
								f.find('table.review').find('.datalist').remove();
							}
							if(jdata['cnt'] > 0){
								f.find('table.review').find('.last').append(jdata['data']);
							}
							if(jdata['cnt'] == max_){
								f.find('button.review').show();
								f.find('p.empty_text').addClass('hidden');
							}else{
								f.find('button.review').hide();
								f.find('p.empty_text').removeClass('hidden');
							}
							break;
						case 'create':
							f.find('table.review').find('.last').prepend(jdata['data']);
							break;
						case 'modify':
							f.find('table.review').find('[name=id]').filter(function() {
								return $(this).text() == int_id;
							}).parent('.datalist').replaceWith(jdata['data']);
							break;
						case 'delete':
							f.find('table.review').find('[name=id]').filter(function() {
								return $(this).text() == int_id;
							}).parent('.datalist').remove();
							break;
						default:
							break;
					}
					
					
					r.trigger('change');
				},
				error: function() {
					alert('ajax ERROR!!!');
				}
			});
		}
	}).trigger('refresh',{type: 'review'});
}

function bindFormAjaxByMethod(uid, url, method){
	var f = $('#' + uid + '_panel');
	var m = $('#' + uid + '_Modal');
	
	m.find('button.' + method).click(function(){
		var btn = $(this).addClass('buttonLoading').button('loading');
		var pdata={data:{},where:{AND:{}}};
		pdata['data'] = m.find('form:first').serialize();
		
		$.ajax({
			url: url,
			type: 'POST',
			data: { jdata: JSON.stringify({ pdata: pdata, method: method }) },
			success: function(re) {
				var jdata = JSON.parse(re);
				if(jdata['err'] == 'success'){
					f.find('table.review').trigger('refresh',{type: method, id: jdata['id']});
					m.modal('hide');
				}else if(jdata['err'] == 'err_empty'){
					customAlert('請檢查必填欄位');
				}else if(jdata['err'] == 'err_exist'){
					customAlert('請檢查重複值');
				}else console.log(re);
				$('.buttonLoading').button('reset');
			},
			error: function() {alert('ajax ERROR!!!');}
		});
	});
}

function bindFormCreateTool(uid, url){
	var f = $('#' + uid + '_panel');
	var m = $('#' + uid + '_Modal');
	
	f.find('div.toollist').find('button.main').text('新增').addClass('create');
	m.find('.modal-footer').find('div.create').append('<button class="btn btn-default create">新增</button>');
	f.find('div.toollist').find('button.create').click(function(){
		// http://stackoverflow.com/questions/2559616/javascript-true-form-reset-for-hidden-fields
		m.find('form')[0].reset();
		m.find('.modal-footer').children('div').hide();
		m.find('.modal-footer').find('div.create').show();
		m.modal('show');
	});
	
	bindFormAjaxByMethod(uid, url, 'create');
}


function bindFormModifyTool(uid, url){
	var m = $('#' + uid + '_Modal');
	
	m.find('.modal-footer').find('div.modify').append('<button class="btn btn-default modify">儲存</button>');
	bindFormAjaxByMethod(uid, url, 'modify');
}


function bindFormDeleteTool(uid, url){
	var f = $('#' + uid + '_panel');
	var m = $('#' + uid + '_Modal');
	var t = $('#' + uid + '_target_id');
	
	m.find('.modal-footer').find('div.modify').append('<button class="btn btn-danger delete"><i class="fa fa-trash-o fa-lg"></i> 刪除</button>');
	m.find('button.delete').click(function(){
		if(confirm('確定要刪除?')){
			var btn = $(this).addClass('buttonLoading').button('loading');
			var pdata={data:{},where:{ AND:{}}};
			
			pdata['where']['AND']['id'] = t.val();
			$.ajax({
				url: url,
				type: 'POST',
				data: { jdata: JSON.stringify({ pdata: pdata, method: 'delete' }) },
				success: function(re) {
					var jdata = JSON.parse(re);
					if(jdata['err'] == 'success'){
						f.find('table.review').trigger('refresh',{type:'delete', id: jdata['id']});
						m.modal('hide');
					}else if(jdata['err'] == 'err_delete'){
						customAlert('刪除失敗');
						$('.buttonLoading').button('reset');
						m.modal('hide');
					}
					else console.log(re);}
			});
		}
	});
}

function bindFormMailTool(uid, url, table){
	var mm = $('#' + uid + '_Mail_Modal');
	
	
	var f = $('#' + uid + '_panel');
	var l = $('#' + uid + '_checked_list');
	
	f.find('ul.toollist').append('<li><a href="#" class="mail">從郵件寄送</a></li>');
	f.find('ul.toollist').find('a.mail').click(function(){
		mm.find('form')[0].reset();
		mm.find('[name=title]').val('【通知】資料報表通知: ' + $.datepicker.formatDate('yy-mm-dd', new Date()));
		mm.find('[name=report]').empty().css('padding', 0);
		
		
		mm.modal('show');
		
		var str = l.val();
		var arr = str.split(',');
		var pdata={data:{},where:{ ORDER:{}}};
		pdata['where'][table + '.id'] = arr;
		pdata['where']['ORDER'][table + '.id'] = arr; //last choose at last
		
		$.ajax({
			url: url,
			type: 'POST',
			data: { jdata: JSON.stringify({ pdata: pdata, method: 'review' }), style: 'print' },
			success: function(re) {
				var jdata = JSON.parse(re);
				
				if(jdata.cnt == 0){
					mm.find('[name=report]').append('<p>未勾選資料表項目</p>');
				}else{
					mm.find('[name=report]').css('padding', '50px 0').append(jdata.data);
				}
			}
		});
	});
	
	mm.find('div.mail').append('<button class="btn btn-primary mail">寄送</button>');
	
	
	mm.find('button.mail').click(function(){
		$(this).addClass('buttonLoading').button('loading');
		var pdata = {
			data: {
				from: mm.find('[name=mailfrom]').val(),
				mailto: mm.find('[name=mailto]').val(),
				mailcc: mm.find('[name=mailcc]').val(),
				title: mm.find('[name=title]').val(),
				content: mm.find('[name=content]').val(),
				report: mm.find('[name=report]').html(),
				attach: mm.find('[name=attach]').val(),
				attach_name: mm.find('.attach_label').text()
			}
		};
		
		$.ajax({
			url: url,
			type: 'POST',
			data: { jdata: JSON.stringify({ pdata: pdata, method: 'mailto' }) },
			success: function(re) {
				if(re == 'success'){
					customAlert('寄送成功!', 1);
					mm.modal('hide');
				}
				else if(re == 'err_mailer') customAlert('請檢查收件者等欄位');
				
				$('.buttonLoading').button('reset');
			}
		});
	});
}

function bindFormExportTool(uid, url, table){
	var f = $('#' + uid + '_panel');
	var l = $('#' + uid + '_checked_list');
	
	f.find('ul.toollist').append('<li><a href="#" class="print">列印表格</a></li>');
	f.find('ul.toollist').append('<li><a href="#" class="excel">匯出至Excel表格</a></li>');
	
	f.find('ul.toollist').find('a.print').click(function(){
		
		var str = l.val();
		var arr = str.split(',');
		var pdata={data:{},where:{ ORDER:{}, OR:{}}};
		pdata['where'][table + '.id'] = arr;
		pdata['where']['ORDER'][table + '.id'] = arr; //last choose at last
		
		$.ajax({
			url: url,
			type: 'POST',
			data: { jdata: JSON.stringify({ pdata: pdata, method: 'review' }), style: 'print' },
			success: function(re) {
				var jdata = JSON.parse(re);
				
				$('.genPrint').remove();
				$('body').after('<div class="genPrint">' + $('title').text() + '<br>' + jdata.data + '</div>');
				window.print();
				
				
			}
		});
	});
	f.find('ul.toollist').find('a.excel').click(function(){
		var str = l.val();
		var arr = str.split(',');
		var pdata={data:{},where:{ ORDER:{}, OR:{}}};
		pdata['where'][table + '.id'] = arr;
		pdata['where']['ORDER'][table + '.id'] = arr; //last choose at last
		
		$.ajax({
			url: url,
			type: 'POST',
			data: { jdata: JSON.stringify({ pdata: pdata, method: 'review' }), style: 'print' },
			success: function(re) {
				var jdata = JSON.parse(re);
				
				open('POST', url, {data: jdata.data, method: 'excel'}, '_blank');
			}
		});
	});
}

function bindInputAjaxOnChange(uid, url, type, col){
	
	var t = $('#' + uid + '_target_id');
	var c = $('#' + uid + '_change_complete');
	var m = $('#' + uid + '_Modal');
	
	t.change(function(){
		var pdata={
			data: {},
			where:{
				AND:{ id: $(this).val() }
			}
		};
		$.ajax({
			url:  url,
			type: 'POST',
			data: { jdata: JSON.stringify({ pdata: pdata, method: 'getJson' }) },
			success: function(re) {
				
				var jdata = JSON.parse(re);
				pdata = jdata[0];
				for(var i in col){
					
					switch(type[i]){
						case 'radiobox':
							m.find('[name=' + col[i] + ']').each(function(i){
								this.checked = (this.value == pdata[col[i]])? true: false;
							});
							break;
						case 'checkbox':
							var arr=[];
							if(pdata[col[i]]){
								arr = pdata[col[i]].split(',');
							}
							//prop('checked', false) v.s. attr('checked', false) attr會使checked完全移除, form reset時預設值的checked不會勾選
							m.find('[name=' + col[i] + ']').prop('checked', false).each(function(i){
								for(var j=0; j<arr.length; j++){
									if(arr[j] == this.value) this.checked = true;
								}
							});
							break;
						case 'json':
						case 'uploadfile':
						case 'autocomplete':
							// put value and trigger preset
							m.find('[name=' + col[i] + ']').val(pdata[col[i]]).trigger('preset');
							break;
						default:
							m.find('[name=' + col[i] + ']').val(pdata[col[i]]);
							break;
					}
				}
				c.trigger('change');
			},
			error: function(){
				alert('ajax ERROR!!!');
			}
		}); 
	});
}
