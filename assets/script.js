function checkScript(){}

function customAlert(arr){
	var code = arr.code || 0;
	var text = arr.text || '';
	var info = ['<i class="fa fa-check-circle"></i> 成功', '<i class="fa fa-times-circle"></i> 錯誤', '<i class="fa fa-exclamation-circle"></i> 警告'];
	var type = ['success', 'danger', 'warning'];
	
	if(text){
		var alert = $('<div style="height: 1px; width: 100%; position: fixed; top: 0px; z-index: 1500;"><div class="alert alert-' + type[code] + '" style="width: 320px; position: relative; margin: auto;"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><p><strong>' + info[code] + ': </strong>' + text + '</p></div></div>');
		setTimeout(function(){
			$(alert).fadeOut(function(){
				$(this).remove();
			});
		}, 3000);
		$('body').append(alert);
	}
}

function open(verb, url, data, target) {
	var form = document.createElement('form');
	form.action = url;
	form.method = verb;
	form.target = target || '_self';
	if (data) {
		for (var key in data) {
			var input = document.createElement('textarea');
			input.name = key;
			input.value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
			form.appendChild(input);
		}
	}
	document.body.appendChild(form);
	form.submit();
	form.remove();
}

function serializeJSON(obj){
	var arr = {};
	$(obj).each(function(i, o){
		if(o.name in arr){
			arr[o.name] += ',' + o.value;
		}else{
			arr[o.name] = o.value;
		}
	});
	
	return arr;
}

jQuery.fn.extend({
	editor: function(init){
		
		var tar = this;
		var col = $('<textarea></textarea>');
		
		$(tar).before(col);
		$(col).ckeditor();
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			
			if($(col).ckeditor().editor){
				$(col).ckeditor().editor.destroy();
				$(col).val($(tar).val());
			}
			$(col).ckeditor({
				// Define the toolbar groups as it is a more accessible solution.
				toolbarGroups: [
					{'name':'tools'},
					{'name':'document', 'groups':['mode']},
					{'name':'basicstyles', 'groups':['basicstyles']},
					{'name':'links', 'groups':['links']},
					{'name':'paragraph', 'groups':['list', 'indent', 'align']},
					{'name':'colors'},
					{'name':'insert', 'groups':['insert']},
					{'name':'styles', 'groups':['styles']},
				],
				// Remove the redundant buttons from toolbar groups defined above.
				removeButtons: 'Flash,HorizontalRule,PageBreak,Iframe,Anchor,NewPage,Preview,Save,Print',
				readOnly: $(tar).prop('disabled'),
			}, function(){
				$(col).ckeditor().editor.on('change', function(event){
					// Sync textarea
					$(tar).val($(col).val());
				});
			});
		});
	}
});

jQuery.fn.extend({
	colorpicker: function() {
		
		var tar = this;
		var box = $('<div style="display: none; border-radius: 3px; border: 1px solid #c5c5c5; width: 190px; background: white; position: fixed; z-index: 1"></div>');
		var cvs = $('<canvas width="100" height="100" style="border: 1px solid #c5c5c5; margin: 10px; float: left; cursor: crosshair;"></canvas>');
		var cur = $('<div style="border: 1px solid #c5c5c5; margin: 10px; float: left; height: 40px; width: 40px"></div>');
		var pre = $('<div style="border: 1px solid #c5c5c5; margin: 5px 10px; float: left; height: 20px; width: 20px"></div>');
		var hex = $('<p style="float: left"></p>');
		
		$(tar).after(box);
		$(box).append(cvs, cur, pre, hex);
		
		var ctx = $(cvs).get(0).getContext('2d');
		var w = 100;
		var h = 100;
		
		var hGrad = ctx.createLinearGradient(0, 0, w, 0);
		var arr = ['F00', 'FF0', '0F0', '0FF', '00F', 'F0F', 'F00'];
		for(var i in arr){
			hGrad.addColorStop(i/6, '#' + arr[i]);
		}
		ctx.fillStyle = hGrad;
		ctx.fillRect(0, 0, w, h);
		
		var vGrad = ctx.createLinearGradient(0, 0, 0, (h/2-3));
		vGrad.addColorStop(0, 'rgba(255,255,255,1)');
		vGrad.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = vGrad;
		ctx.fillRect(0, 0, w, (h/2-3));
		
		var vGrad = ctx.createLinearGradient(0, (h/2+3), 0, h);
		vGrad.addColorStop(0, 'rgba(0,0,0,0)');
		vGrad.addColorStop(1, 'rgba(0,0,0,1)');
		ctx.fillStyle = vGrad;
		ctx.fillRect(0, (h/2+3), w, h);
		
		$(tar).focus(function(){
			// init position
			var left = $(tar).offset().left;
			var top = $(tar).offset().top + $(tar).outerHeight() - $(document).scrollTop();
			$(box).css('left', left).css('top', top).fadeIn(200);
			
			$(tar).trigger('input');
		});
		
		$(document).click(function(e){
			// keep colorpicker
			var keep = $(e.target).is(box) || $(e.target).parent().is(box) || $(e.target).is(tar);
			if(!keep){
				$(box).fadeOut(200);
			}
		});
		
		$(tar).on('input', function(){
			var str = $(this).val().toLowerCase().replace(/[^#\da-f]/g, '');
			var color = '#fff';
			
			if(str.match(/^#?[\da-f]{6}/, str)){
				if(str.substr(0, 1) != '#') str = '#' + str;
				str = str.substr(0, 7);
				color = str;
			}
			$(cur).css('background', color);
			$(this).val(str);
		});
		
		$(cvs).mousemove(function(e){
			var x = e.pageX - $(this).offset().left;
			var y = e.pageY - $(this).offset().top;
			
			// HEX color
			var str = getHex(x, y);
			
			$(pre).css('background', str);
			$(hex).text(str);
		});
		
		$(cvs).click(function(e){
			// getting user coordinates
			var x = e.pageX - $(this).offset().left;
			var y = e.pageY - $(this).offset().top;
			
			// HEX color
			var str = getHex(x, y);
			
			$(tar).val(str);
			$(cur).css('background', str);
		});
		
		function getHex(x, y){
			// getting image data and RGB values
			var rgb = ctx.getImageData(x, y, 1, 1).data;
			var R = rgb[0];
			var G = rgb[1];
			var B = rgb[2];
			
			// convert RGB to HEX
			return '#' + rgbToHex(R,G,B);
		}
		
		function rgbToHex(R, G, B){
			return toHex(R) + toHex(G) + toHex(B);
		}
		
		function toHex(n){
			n = parseInt(n, 10);
			if(isNaN(n)) return '00';
			n = Math.max(0, Math.min(n, 255));
			var ch = '0123456789abcdef';
			return ch.charAt(Math.floor(n/16)) + ch.charAt(n%16);
		}
	}
});

jQuery.fn.extend({
	_datepicker: function(init){
		
		var tar = this;
		var col = $('<input class="form-control input-sm" type="text">');
		var tpl = init.tpl || 'Y-m-d';
		
		$(col).prop('disabled', $(tar).prop('disabled'));
		
		$(tar).before(col);
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(col).datepicker({
			dateFormat: 'yy-mm-dd',
			closeText: 'Close',
			changeYear: true,
			changeMonth: true,
			beforeShow: function(){
				setTimeout(function(){
					$('.ui-datepicker').css('z-index', 9527);
				}, 100);
			},
			onSelect: function(date) {
				var unixtime = Date.parse(date)/1000;
				$(tar).val(unixtime);
			}
		});
		
		$(tar).on('preset', function(){
			var val = $(tar).val();
			if(val.match(/^-?[\d]+$/)){ // unix timestamp
				var d = new Date(val * 1000);
				var arr = {
					'Y': d.getFullYear(),
					'm': ('0'+(d.getMonth()+1)).slice(-2),
					'd': ('0'+d.getDate()).slice(-2),
					'H': ('0'+d.getHours()).slice(-2),
					'i': ('0'+d.getMinutes()).slice(-2),
					's': ('0'+d.getSeconds()).slice(-2),
				};
				
				var res = tpl;
				for(var i in arr){
					res = res.replace(i, arr[i]);
				}
				$(col).val(res);
				
			}else{
				// invalid or null
				$(col).val('');
			}
		});
	}
});

jQuery.fn.extend({
	_autocomplete: function(init){
		
		var tar = this;
		var url = init.url || '';
		var col = $('<input class="form-control input-sm" type="text"/>');
		var timer = 0;// delay loading
		
		$(col).prop('disabled', $(tar).prop('disabled'));
		
		$(tar).before(col);
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		//id 'label' compare with the id 'label_h' to determine if the id 'autocomplete_id' should be reset
		//use keypress to overcome type tool problem (keyup/keydown failed)
		//use 'input' instead of the 'change' event for rapid effect
		$(col).on('input', function(){
			
			var pdata = {data: {autocomplete: $(tar).attr('name')}, where: {'[~]': $(this).val()}};
			
			if(timer){ clearTimeout(timer);}
			timer = setTimeout(function(){
				$.ajax({
					url: url,
					type: 'POST',
					data: { jdata: JSON.stringify({ pdata: pdata, method: 'getJson' }) },
					success: function(re){
						
						var jdata = JSON.parse(re);
						if(jdata['code']){
							// fail
						}else{
							pdata = jdata['data'];
							var arr = Object.keys(pdata).map(function(key){return pdata[key]});
							$(col).autocomplete({
								source: arr,
								select: function(event, ui){
									$(tar).val(ui.item.val);
								}
							}).autocomplete('search');
						}
						customAlert(jdata);
					}
				});
			}, 1000);
		}).trigger('input'); //init autocomplete or words will be cut at first input
		
		$(tar).on('preset', function(){
			
			var id = parseInt($(tar).val()); // prevent string '0' problem
			var pdata = {data: {autocomplete: $(tar).attr('name')}, where: {'[=]': id}};
			
			if(id){
				$.ajax({
					url: url,
					type: 'POST',
					data: { jdata: JSON.stringify({ pdata: pdata, method: 'getJson' }) },
					success: function(re){
						
						var jdata = JSON.parse(re);
						if(jdata['code']){
							// fail
						}else{
							pdata = jdata['data'];
							if(pdata[0]){
								$(col).val(pdata[0]['label']);
							}else{
								$(col).val('');
							}
						}
						customAlert(jdata);
					}
				});
			}else{
				$(col).val('');
			}
		});
	}
});

jQuery.fn.extend({
	json: function(init){
		
		var tar = this;
		var tpl = (init.tpl || '[]').replace(/'/g, '"');
		tpl = JSON.parse(tpl);
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			
			$(tar).siblings('div.box').remove();
			
			var str = ($(this).val() || '[]').replace(/'/g, '"');
			try{
				var obj = JSON.parse(str);
			}catch(e){
				var obj = [];
			}
			var ctl = [];
			var txt = [];
			
			var box = $('<div class="box"></div>');
			
			// init
			if(tpl){
				var tmp = {};
				for(var i in tpl){
					var arr = i.split(/[,]+/, 2);
					var k = arr[0];
					tmp[k] = obj[k] || '';
					txt[k] = arr[1] || k;
				}
				obj = tmp;
			}
			$(tar).val(JSON.stringify(obj));
			
			for(var i in obj){
				
				ctl[i] = $('<span class="label label-default">' + (txt[i] || i) + '</span><input class="form-control input-sm" value="' + obj[i] + '">');
				$(ctl[i]).prop('disabled', $(tar).prop('disabled'));
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


// require jquery/bootstrap
jQuery.fn.extend({
	uploadfile: function(init){
		
		var tar = this;
		var url = init.url;
		var col = init.col || 'col-sm-6';
		
		var bar = $('<div class="p" style="background-color: aquamarine; height: 3px; width: 0px; margin: 1px"></div>');
		var ctl = $('<input type="file" multiple>');
		
		$(ctl).prop('disabled', $(tar).prop('disabled'));
		
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
					
					var jdata = JSON.parse(re);
					if(jdata['code']){
						// fail
					}else{
						var add = jdata['data'];
						var val = $(tar).val() || '[]';
						var arr = JSON.parse(val);
						for(var i in add){
							arr.push(add[i]);
						}
						// render gallery
						$(tar).val(JSON.stringify(arr)).trigger('preset');
					}
					customAlert(jdata);
					
					// clear selected files
					$(upload).val('');
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
			var tpl = 100;
			
			// init
			$(this).siblings('div.gallery').remove();
			try{
				var arr = JSON.parse(val);
			}catch(e){
				var arr = [];
				$(tar).val('[]');
			}
			if(!arr.length) return;
			
			var gallery = $('<div class="gallery"><style>.icon-set{ white-space: nowrap; text-overflow: ellipsis; overflow: hidden; position: absolute; bottom: 20px; width: 100%; padding: 5px; background-color: rgba(0,0,0,0.8); color: white} .icon-set a{color: white}</style></div>');
			
			$(this).after(gallery);
			
			// bind form reset event
			$(gallery).closest('form').on('reset', function(){
				$(gallery).remove();
			});
			
			var html = '';
			for(var i in arr){
				
				arr[i]['ext'] = (arr[i]['name'].split('.')[1] || 'na').toLowerCase();
				
				var dl = '<a href="' + arr[i]['url'] + '" download="' + arr[i]['name'] + '" target="_blank"><span class="glyphicon glyphicon-download-alt"></span></a>';
				var rm = ($(tar).prop('disabled'))? '': ' | <a href="#" class="delete"><span class="glyphicon glyphicon-trash"></span></a>';
				
				html += '<div style="position: relative; float: left; margin: 10px;"><a class="thumbnail" href="#"><span style="position: absolute; top: 0px; right: 6px; color: black; font-size: 11px;">.' + arr[i]['ext'] + '</span><table style="width: ' + tpl + 'px; height: ' + tpl + 'px;"><tr><td style="padding: 0; text-align: center"><img src="' + arr[i]['url'] + '" class="img-responsive" style="max-width: ' + tpl + 'px; max-height: ' + tpl + 'px; margin: 0 auto;"/></td></tr></table></a>         <div class="icon-set" title="' + arr[i]['name'] + '">' + dl + rm + arr[i]['name'] + '</div></div>';
			}
			
			// start loading
			$(gallery).append(html);
			
			$(gallery).find('.thumbnail').each(function(i){
				
				$(this).imgEvent($(tar));
				
				$(this).find('img').on('load', function(){
					
				}).on('error', function(){
					$(this).addClass('hidden').after('<span class="glyphicon glyphicon-duplicate" style="position: relative; color: brown; font-size: 45px"></span>');
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

function bindFormCheck(uid){
	var f = $('#' + uid + '_panel');
	var l = $('#' + uid + '_checked_list');
	f.find('th.check').click(function(){
		if($(this).find('.fa-check-square-o').length){
			$(this).children().removeClass('fa-check-square-o').addClass('fa-square-o');
			f.find('td.check').children().removeClass('fa-check-square-o').addClass('fa-square-o');
			f.find('.datalist').removeClass('highlight');
			l.val('');
		}else{
			$(this).children().removeClass('fa-square-o').addClass('fa-check-square-o');
			var check = [];
			f.find('.datalist').not('.hidden').find('[name=id]').each(function(i){ check[i] = $(this).text();});
			f.find('.datalist').addClass('highlight').find('td.check').children().removeClass('fa-square-o').addClass('fa-check-square-o');// #slow
			l.val(check.join());
		}
	});
}
function bindFormSort(uid){
	var f = $('#' + uid + '_panel');
	f.find('th.order').click(function(){
		
		var s = $('#' + uid + '_search_adv');
		
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

function bindFormCheck2(uid){
	var f = $('#' + uid + '_panel');
	var l = $('#' + uid + '_checked_list');
	
	f.find('.newdatalist').find('td.check').click(function(){
		var id = $(this).closest('.datalist').find('[name=id]').text();
		var str = l.val();
		
		if($(this).find('.fa-check-square-o').length){
			
			$(this).find('.fa').removeClass('fa-check-square-o').addClass('fa-square-o');
			$(this).closest('.datalist').removeClass('highlight');
			
			var arr = str.split(',');
			var idx = $.inArray( id, arr );
			
			//if found in array
			if(idx != -1){
				arr.splice(idx, 1);
				l.val(arr.join());
			}
			
		}else{
			$(this).find('.fa').removeClass('fa-square-o').addClass('fa-check-square-o');
			$(this).closest('.datalist').addClass('highlight');
			
			l.val( (str? str + ',': '') + id );
		}
		//console.log('Info: checked list ' + l.val());
	});
	
	var str = l.val();
	var arr = str.split(',');

	//clear select and select again
	f.find('table.review').find('.newdatalist').find('[name=id]').each(function(){
		if($.inArray( $(this).text(), arr ) != -1){
			$(this).closest('.newdatalist').addClass('highlight').find('td.check').find('.fa').removeClass('fa-square-o').addClass('fa-check-square-o');
		}
	});
}

function bindFormTreeView(uid, back){
	
	if(!back) return;
	
	var f = $('#' + uid + '_panel');
	var s = $('#' + uid + '_search_area');
	var t = $('#' + uid + '_tree_view_complete');
	var btn = $('<button class="btn btn-default btn-block prev" show=".p_0" prev="">' + back + '</button>');
	
	// before scrollable div
	f.find('table.review').parent('div').css('height', 'calc(100% - 124px)').before(btn);
	
	$(btn).click(function(){
		var prev = $(btn).attr('prev');
		if(prev){
			$(btn).attr('show', prev);
			tag = prev.match(/p_([\d]+)/)[1];
			if(tag != '0'){
				tmp = f.find('.s_' + tag).attr('class');
				prev = '.' + tmp.match(/p_[\d]+/)[0];
			}else{
				prev = '';
			}
			$(btn).attr('prev', prev);
		}
		f.find('.last').trigger('tree');
	});

	f.find('.last').on('tree', function(){
		if(s.find('[name=search]').val()){
			$(btn).prop('disabled', true);
		}else{
			$(this).children().addClass('hidden');
			$(this).find($(btn).attr('show')).parent().removeClass('hidden');
			$(btn).prop('disabled', !f.find('.prev').attr('prev'));
		}
		
		setTimeout(function(){
			t.trigger('change');
		}, 300);
	});
}

function bindFormTreeView2(uid, back){
	
	if(!back) return;
	
	var f = $('#' + uid + '_panel');
	
	f.find('.newdatalist').find('td.tree').each(function(){
		$(this).html('<a href="#">' + $(this).text() + '</a>');
	});
	
	f.find('.newdatalist').find('td.tree').click(function(){
		var tag = $(this).attr('class');
		tag = tag.match(/s_([\d]+)/)[1];
		if(f.find('.p_' + tag).length){
			f.find('.prev').attr('prev', f.find('.prev').attr('show'));
			f.find('.prev').attr('show', '.p_' + tag);
			f.find('.last').trigger('tree');
		}
	});
	
	f.find('.last').trigger('tree');
}

function bindFormViewComplete(uid, max, back){
	var f = $('#' + uid + '_panel');
	var c = $('#' + uid + '_item_cnt');
	var r = $('#' + uid + '_review_complete');
	var t = $('#' + uid + '_target_id');
	var m = $('#' + uid + '_Modal');
	var a = $('#' + uid + '_search_adv');
	var s = $('#' + uid + '_search_area');
	var timer = 0;// delay loading
	
	s.find('[name=search][auto]').on('input', function(){
		if(timer){ clearTimeout(timer);}
		timer = setTimeout(function(){
			f.find('table.review').trigger('refresh',{type: 'review'});
		}, 1000);
	});
	
	// prevent submit
	s.on('submit', function(){
		return false;
	});
	
	a.on('change', function(){ f.find('table.review').trigger('refresh',{type: 'review'}); });
	c.change(function(){ f.find('.item-cnt').text($(this).val()); });
	bindFormSort( uid );
	bindFormCheck( uid );
	bindFormTreeView(uid, back);
	
	f.find('button.review').click(function(e){
		// prevent sending post
		e.preventDefault();
		$(this).addClass('buttonLoading').button('loading');
		f.find('table.review').trigger('refresh',{type: 'append', max: max});
	});
	
	r.change(function(){
		// var t0 = performance.now();
		//set newdatalist js events
		f.find('table.review').find('.newdatalist').children().not('.func').click(function(){
			// select text
			if(!getSelection().toString()){
				t.val( $(this).parent().find('[name=id]').text()).trigger('change');
				m.find('.hidden-create').show();
				m.find('.hidden-modify').hide();
				m.modal('show');
			}
		});
		
		bindFormCheck2( uid );
		bindFormTreeView2(uid, back);
		
		f.find('.buttonLoading').button('reset');
		f.find('table.review').find('.newdatalist').addClass('datalist').removeClass('newdatalist');
		//f.find('table.review').find('.last').sortable();
		
		//item count
		c.val( f.find('table.review').find('.datalist').length ).trigger('change');
		console.log('Info: total ' + c.val() + ' items');
		// var t1 = performance.now();
		// console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
	});
}


function bindFormAjaxOnRefresh(uid, url, max){
	var f = $('#' + uid + '_panel');
	var c = $('#' + uid + '_item_cnt');
	var r = $('#' + uid + '_review_complete');
	var s = $('#' + uid + '_search_area');
	var a = $('#' + uid + '_search_adv');
	
	f.find('table.review').on('refresh', function (e,obj){
		var str_id = (typeof obj.id === 'undefined') ? '' : obj.id + ''; // to str by default
		var arr_id = str_id.split(',');
		var pdata = {data:{},where:{ AND: {}}};
		var max_ = parseInt((typeof obj.max === 'undefined') ? max : obj.max);
		var keyword = s.find('[name=search]').val();
		var keyword_adv = a.val();
		var keyword_cus = serializeJSON(s.serializeArray());

		switch(obj.type){
			case 'review':
				c.val(0);
			case 'append':
				if(max_){ // skip zero case
					pdata['where']['LIMIT'] = [c.val(), max_];
				}
				pdata['where']['SEARCH'] = keyword;
				pdata['where']['SEARCH_ADV'] = keyword_adv;
				pdata['where']['SEARCH_CUS'] = keyword_cus;
				break;
			case 'create':
			case 'modify':
			case 'delete':
				pdata['where']['AND']['id'] = arr_id;
				pdata['where']['SEARCH'] = keyword;
				pdata['where']['SEARCH_ADV'] = keyword_adv;
				pdata['where']['SEARCH_CUS'] = keyword_cus;
				break;
			default:
				break;
		}
		
		// loading
		switch(obj.type){
			case 'review':
				f.find('table.review').find('.last').empty();
			case 'append':
				f.find('button.review').show().addClass('buttonLoading').button('loading');
				f.find('p.end').hide();
				break;
		}
		
		$.ajax({
			url: url,
			type: 'POST',
			data: {jdata: JSON.stringify({ pdata: pdata, method: 'review' })},
			success: function(re){
				
				var jdata = JSON.parse(re);
				if(jdata['code']){
					// fail
				}else{
					switch(obj.type){
						case 'review':
							// prevent multi ajax result
							c.val(0);
							f.find('table.review').find('.last').empty();
						case 'append':
							if(jdata['cnt'] > 0){
								f.find('table.review').find('.last').append(jdata['data']);
							}
							if(max_ > 0 && jdata['cnt'] == max_){
								f.find('button.review').show();
								f.find('p.end').hide();
							}else{
								f.find('button.review').hide();
								f.find('p.end').show();
							}
							break;
						case 'create':
							f.find('table.review').find('.last').prepend(jdata['data']);
							break;
						case 'modify':
							var tmp = [];
							$(jdata['data']).wrap('<tmp></tmp>').parent().find('.newdatalist').each(function(){
								tmp[$(this).find('[name=id]').text()] = $(this);
							});
							f.find('table.review').find('[name=id]').filter(function(){
								if($.inArray($(this).text(), arr_id) != -1){
									$(this).parent('.datalist').replaceWith(tmp[$(this).text()]);
								}
							});
							break;
						case 'delete':
							f.find('table.review').find('[name=id]').each(function(){
								if($.inArray($(this).text(), arr_id) != -1){
									$(this).parent('.datalist').remove();
								}
							});
							break;
						default:
							break;
					}
				}
				customAlert(jdata);
				
				f.find('button.review').find('.buttonLoading').button('reset');
				r.trigger('change');
			},
			error: function(){
				alert('請重新整理畫面後再嘗試');
			}
		});
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
			success: function(re){
				var jdata = JSON.parse(re);
				if(jdata['code']){
					// fail
				}else{
					f.find('table.review').trigger('refresh',{type: method, id: jdata['data']});
					m.modal('hide');
				}
				customAlert(jdata);
				$('.buttonLoading').button('reset');
			},
			error: function(){
				alert('請重新整理畫面後再嘗試');
			}
		});
	});
}

function bindFormCreateTool(uid, url){
	var f = $('#' + uid + '_panel');
	var m = $('#' + uid + '_Modal');
	
	f.find('div.toollist').find('button.main').text('新增').addClass('create');
	m.find('.modal-footer').append('<button class="btn btn-primary create hidden-modify">新增</button>');
	f.find('div.toollist').find('button.create').click(function(){
		// http://stackoverflow.com/questions/2559616/javascript-true-form-reset-for-hidden-fields
		m.find('form')[0].reset();
		m.find('.hidden-create').hide();
		m.find('.hidden-modify').show();
		m.modal('show');
	});
	
	bindFormAjaxByMethod(uid, url, 'create');
}


function bindFormModifyTool(uid, url){
	var m = $('#' + uid + '_Modal');
	
	m.find('.modal-footer').append('<button class="btn btn-primary modify hidden-create">儲存</button>');
	bindFormAjaxByMethod(uid, url, 'modify');
}


function bindFormDeleteTool(uid, url){
	var f = $('#' + uid + '_panel');
	var m = $('#' + uid + '_Modal');
	var t = $('#' + uid + '_target_id');
	
	m.find('.modal-footer').append('<button class="btn btn-danger delete hidden-create"><i class="fa fa-trash-o fa-lg"></i> 刪除</button>');
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
					if(jdata['code']){
						// fail
					}else{
						f.find('table.review').trigger('refresh',{type:'delete', id: jdata['data']});
						m.modal('hide');
					}
					customAlert(jdata);
					$('.buttonLoading').button('reset');
				}
			});
		}
	});
}

function bindFormExportTool(uid, url){
	var f = $('#' + uid + '_panel');
	var t = $('title').text();
	
	var p = $('<li><a href="#">列印表格</a></li>');
	var e = $('<li><a href="#">匯出至Excel表格</a></li>');
	
	f.find('ul.toollist').append(p).append(e);
	
	$(p).click(function(){
		var pdata = genParam(uid);
		$.ajax({
			url: url,
			type: 'POST',
			data: { jdata: JSON.stringify({ pdata: pdata, method: 'review' }), style: 'print' },
			success: function(re) {
				var jdata = JSON.parse(re);
				if(jdata['code']){
					// fail
				}else{
					$('.genPrint').remove();
					$('body').after('<div class="genPrint">' + t + '<br>' + jdata.data + '<style>@media print { body > *:not(.genPrint){ display: none; /*IE workaround, which solves genPrint in <body>*/} } @media screen{ .genPrint{ display: none; }}</style></div>');
					window.print();
				}
				customAlert(jdata);
			}
		});
	});
	
	$(e).click(function(){
		var pdata = genParam(uid);
		open('POST', url, {jdata: JSON.stringify({ pdata: pdata, method: 'excel' }), style: 'print'}, '_blank');
	});
}

function genParam(uid){
	
	var l = $('#' + uid + '_checked_list');
	var a = $('#' + uid + '_search_adv');
	var s = $('#' + uid + '_search_area');
	
	var str_id = l.val();
	var arr_id = str_id.split(',');
	var adv = a.val();
	var cus = serializeJSON(s.serializeArray());
	
	var arr = arr_id;
	
	var pdata = {
		where: {
			SEARCH_ADV: adv,
			SEARCH_CUS: cus,
		}
	};
	
	if(arr[0]){
		pdata['where']['ORDER'] = {id: arr};
		pdata['where']['AND'] = {id: arr};
	}
	
	return pdata;
}

function bindInputAjaxOnChange(uid, url, type, col){
	
	var t = $('#' + uid + '_target_id');
	var c = $('#' + uid + '_change_complete');
	var f = $('#' + uid + '_Modal').find('form').eq(0);
	
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
			success: function(re){
				
				var jdata = JSON.parse(re);
				if(jdata['code']){
					// fail
				}else{
					pdata = jdata['data'][0];
					for(var i in col){
						
						switch(type[i]){
							case 'radiobox':
								f.find('[name=' + col[i] + ']').each(function(){
									this.checked = (this.value == pdata[col[i]])? true: false;
								});
								break;
							case 'checkbox':
								var arr = [];
								if(pdata[col[i]]){
									arr = pdata[col[i]].split(',');
								}
								//prop('checked', false) v.s. attr('checked', false) attr會使checked完全移除, form reset時預設值的checked不會勾選
								f.find('[name=' + col[i] + ']').prop('checked', false).each(function(){
									for(var j=0; j<arr.length; j++){
										if(arr[j] == this.value) this.checked = true;
									}
								});
								break;
							case 'json':
							case 'editor':
							case 'datepicker':
							case 'uploadfile':
							case 'autocomplete':
								// put value and trigger preset
								f.find('[name=' + col[i] + ']').val(pdata[col[i]]).trigger('preset');
								break;
							default:
								f.find('[name=' + col[i] + ']').val(pdata[col[i]]);
								break;
						}
					}
					// module
					f.find('#' + uid + '_module').trigger('preset');
					c.trigger('change');
				}
				customAlert(jdata);
			},
			error: function(){
				alert('請重新整理畫面後再嘗試');
			}
		}); 
	});
}

jQuery.fn.extend({
	module: function(init){
		
		var tar = this;
		var tpl = init.tpl || [];
		
		// var in search_adv
		var uid = tar.closest('.modal').attr('id').split('_')[0];
		var m = $('#' + uid + '_Modal');
		var f = $('#' + uid + '_Modal').find('form').eq(0);
		var s = $('#' + uid + '_search_area');
		
		for(var i in tpl){
			var t = uid + '_menu_' + i;
			m.find('.nav-tabs').append('<li><a data-toggle="tab" href="#' + t + '">' + tpl[i]['tag'] + '</a></li>');
			m.find('#' + uid + '_home').after('<div id="' + t + '" class="tab-pane fade"></div>');
		}
		
		f.on('reset', function(){
			// hide tabs
			m.find('.nav-tabs a:first').tab('show');
			m.find('.nav-tabs a').not(':first').addClass('hidden');
		});
		
		$(tar).on('preset', function(e, obj){
			// hide tabs
			m.find('.nav-tabs a:first').tab('show');
			m.find('.nav-tabs a').not(':first').removeClass('hidden');
			
			for(var i in tpl){
				var arr = {};
				var sql = JSON.parse(tpl[i]['sql'].replace(/'/g, '"'));
				var url = tpl[i]['url'];
				var css = tpl[i]['css'] || 'height: 700px';
				var str = $('#' + uid + '_search_adv').val();
				var adv = JSON.parse(str.replace(/'/g, '"'))['AND'] || [];
				
				for(var j in sql){
					arr[j] = f.find('[name="' + sql[j] + '"]').val() || adv[j] || s.find('[name="' + sql[j] + '"]').val() || sql[j];
				}
				
				var col = $('#' + uid + '_menu_' + i);
				$(col).attr('style', css).empty();
				$(col).load(url, {
					preset: arr,
					query: JSON.stringify({
						AND: arr
					})
				});
			}
		});
	}
});
