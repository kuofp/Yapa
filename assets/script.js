function checkScript(){}

function _gettext(str){
	// see lang.php
	var i18n = {};
	
	return i18n[str] || str;
}

function customAlert(arr){
	var code = arr.code || 0;
	var text = arr.text || '';
	var info = ['<i class="fa fa-check-circle"></i> ', '<i class="fa fa-times-circle"></i> ', '<i class="fa fa-exclamation-circle"></i> '];
	var type = ['success', 'danger', 'warning'];
	
	if(text){
		var alert = $('<div style="height: 1px; width: 100%; position: fixed; top: 0px; z-index: 1500;"><div class="alert alert-' + type[code] + '" style="width: 320px; position: relative; margin: auto;"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><p><strong>' + info[code] + '</strong>' + text + '</p></div></div>');
		setTimeout(function(){
			$(alert).fadeOut(function(){
				$(this).remove();
			});
		}, 3000);
		$('body').append(alert);
	}
}

function open(verb, url, data, target){
	var f = $('<form>').attr('action', url).attr('method', verb).attr('target', target || '_self');
	for(var i in data){
		var t = $('<textarea>').attr('name', i).val(data[i]);
		$(f).append(t);
	}
	$('body').append(f);
	$(f).submit();
	$(f).remove();
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
	_text: function(init){
		$(this)._input('<input type="text"/>');
	},
	_password: function(init){
		$(this)._input('<input type="password"/>');
	},
	_textarea: function(init){
		$(this)._input('<textarea type="text" rows="7" style="resize: vertical"></textarea>');
	},
	
	_input: function(str){
		var tar = this;
		var box = $(str);
		
		$(box).attr('class', $(tar).attr('class'));
		$(tar).before(box);
		$(tar).attr('class', 'hidden');
		
		$(box).on('input', function(){
			$(tar).val($(box).val());
		});
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			$(box).val($(tar).val()).prop('disabled', $(tar).prop('disabled'));
		});
	}
});

jQuery.fn.extend({
	_select: function(init){
		
		var tar = this;
		var box = $('<select><option value="0"></option></select>');
		var tpl = JSON.parse(init.tpl || '[]');
		
		$(box).attr('class', $(tar).attr('class'));
		$(tar).before(box);
		$(tar).attr('class', 'hidden');
		
		for(var i in tpl){
			var opt = $('<option></option>');
			opt.val(tpl[i][0]).text(tpl[i][1]);
			$(box).append(opt);
		}
		
		$(box).change(function(){
			$(tar).val($(box).val()).trigger('preset');
		});
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			$(box).val($(tar).val()).prop('disabled', $(tar).prop('disabled'));
		});
	}
});

jQuery.fn.extend({
	_radiobox: function(init){
		
		var tar = this;
		var box = $('<div></div>');
		var tpl = JSON.parse(init.tpl || '[]');
		
		$(tar).before(box);
		$(tar).attr('class', 'hidden');
		
		for(var i in tpl){
			var opt = $('<div class="radio"><label><input type="radio"/></label></div>');
			opt.find('input').val(tpl[i][0]).after(tpl[i][1]);
			opt.find('input').click(function(){
				if(!$(tar).prop('disabled')){
					$(tar).val($(this).val()).trigger('preset');
				}
			});
			$(box).append(opt);
		}
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			
			var val = $(tar).val();
			
			$(box).find('input').prop('disabled', $(tar).prop('disabled')).each(function(){
				$(this).prop('checked', ($(this).val() == val)? true: false);
			});
		});
	}
});

jQuery.fn.extend({
	_checkbox: function(init){
		
		var tar = this;
		var box = $('<div></div>');
		var tpl = JSON.parse(init.tpl || '[]');
		
		$(tar).before(box);
		$(tar).attr('class', 'hidden');
		
		for(var i in tpl){
			var opt = $('<div class="checkbox"><label><input type="checkbox"/></label></div>');
			opt.find('input').val(tpl[i][0]).after(tpl[i][1]);
			opt.find('input').click(function(){
				if(!$(tar).prop('disabled')){
					var arr = [];
					$(box).find('input:checked').each(function(){
						arr.push($(this).val());
					});
					$(tar).val(arr.join(',')).trigger('preset');
				}
			});
			$(box).append(opt);
		}
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			
			var str = $(tar).val();
			var arr = {};
			
			if(str){
				var tmp = str.split(',');
				for(var i in tmp){
					arr[tmp[i]] = 1;
				}
			}
			// prop('checked', false) v.s. attr('checked', false): attr() would remove `checked` completely, and `checked` cant be added while form is reset
			$(box).find('input').prop('disabled', $(tar).prop('disabled')).prop('checked', false).each(function(){
				if(arr[$(this).val()] || 0)
					$(this).prop('checked', true);
			});
		});
	}
});

jQuery.fn.extend({
	_editor: function(init){
		
		var tar = this;
		$(tar).wrap('<div style="white-space: normal; max-width: 350px">');
		$(tar).attr('class', 'hidden');
		$(tar).summernote({
			height: 250,
			fontSizes: ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'],
			toolbar: [
				['full', ['fullscreen', 'codeview']],
				['style', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
				['para', ['ul', 'ol', 'paragraph']],
				['insert', ['table', 'picture', 'link', 'video']],
				['fontsize', ['color', 'fontsize', 'height']],
			]
		});
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			$(tar).summernote('code', $(tar).val());
		});
	}
});

jQuery.fn.extend({
	_colorpicker: function() {
		
		var tar = this;
		var box = $('<input type="text"/>');
		var pnl = $('<div style="display: none; border-radius: 3px; border: 1px solid #c5c5c5; width: 190px; background: white; position: absolute; z-index: 1200"></div>');
		var cvs = $('<canvas width="100" height="100" style="border: 1px solid #c5c5c5; margin: 10px; float: left; cursor: crosshair;"></canvas>');
		var cur = $('<div style="border: 1px solid #c5c5c5; margin: 10px; float: left; height: 40px; width: 40px"></div>');
		var pre = $('<div style="border: 1px solid #c5c5c5; margin: 5px 10px; float: left; height: 20px; width: 20px"></div>');
		var hex = $('<p style="float: left"></p>');
		
		$(box).attr('class', $(tar).attr('class'));
		$(tar).before(box);
		$(tar).attr('class', 'hidden');
		$('body').append(pnl);
		$(pnl).append(cvs, cur, pre, hex);
		
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
		
		$(box).focus(function(){
			var pos = $(this).offset();
			$(pnl).css('left', pos.left).css('top', pos.top + $(this).outerHeight());
			$(pnl).fadeIn(200);
			$(box).trigger('input');
		});
		
		$(document).click(function(e){
			// keep colorpicker
			var keep = $(e.target).is(box) || $(e.target).is(pnl) || pnl.has(e.target).length;
			if(!keep){
				$(pnl).fadeOut(200);
			}
		});
		
		$(box).on('input', function(){
			var str = $(this).val().toLowerCase().replace(/[^#\da-f]/g, '');
			var color = '#fff';
			
			if(str.match(/^#?[\da-f]{6}/, str)){
				if(str.substr(0, 1) != '#') str = '#' + str;
				str = str.substr(0, 7);
				color = str;
			}
			$(cur).css('background', color);
			$(tar).val(str).trigger('preset');
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
			
			$(tar).val(str).trigger('preset');
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
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			$(box).val($(tar).val()).prop('disabled', $(tar).prop('disabled'));
		});
	}
});

jQuery.fn.extend({
	_datepicker: function(init){
		
		var tar = this;
		var col = $('<input type="text">');
		var tpl = '';
		var func = '';
		// date/time/datetime
		if(init.tpl.match(/[Ymd]/)){
			tpl += 'Y-m-d';
			func += 'date';
		}
		if(init.tpl.match(/[His]/)){
			tpl += (func? ' ': '') + 'H:i:s';
			func += 'time';
		}
		
		$(col).attr('class', $(tar).attr('class'));
		$(tar).attr('class', 'hidden');
		$(tar).before(col);
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(col)[func + 'picker']({
			dateFormat: 'yy-mm-dd',
			timeFormat: 'HH:mm:ss',
			changeYear: true,
			changeMonth: true,
			onSelect: function(date){
				if(func == 'time'){
					date = '2000-01-01 ' + date;
				}
				var unixtime = Date.parse(date)/1000;
				$(tar).val(unixtime);
			}
		});
		
		$(tar).on('preset', function(){
			
			var val = $(tar).val();
			
			$(col).prop('disabled', $(tar).prop('disabled'));
			
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
		var max = parseInt(init.max || 1);
		var col = $('<input class="form-control input-sm" type="text" placeholder="&#x1F50D;"/>');
		var box = $('<div></div>');
		var timer = 0;// delay loading
		
		$(col).attr('class', $(tar).attr('class'));
		$(tar).before(col);
		$(tar).attr('class', 'hidden');
		$(tar).before(box);
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		// generate checkbox list
		function set(val, txt){
			var tmp = $(tar).val()? $(tar).val().split(','): [];
			var idx = tmp.indexOf(Math.abs(val) + '');
			
			if(val > 0 && idx == -1){
				
				if(max <= tmp.length){
					$(box).find('[value=' + tmp[0] + ']').closest('.checkbox').remove();
					tmp.splice(0, 1);
				}
				
				tmp.push(val);
				$(tar).val(tmp.join(','));
				var btn = $('<div class="checkbox"><label><input type="checkbox" value="' + val + '" checked>' + txt + '</label></div>');
				
				$(box).append(btn);
				// disabled prop
				if($(tar).prop('disabled')){
					$(btn).find('input').prop('disabled', $(tar).prop('disabled'));
				}else{
					$(btn).find('label').click(function(){
						set(-val, '');
						$(btn).remove();
					});
				}
				
			}else if(val < 0 && idx != -1){
				tmp.splice(idx, 1);
				$(tar).val(tmp.join(','));
			}
		}
		
		$(col).blur(function(){
			$(this).val('');
		});
		
		// fetch data
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
									set(ui.item.val, ui.item.label);
								}
							}).autocomplete('search');
						}
						customAlert(jdata);
					}
				});
			}, 1000);
		}).trigger('input'); //init autocomplete or words will be cut at first input
		
		$(tar).on('preset', function(){
			
			var id = $(tar).val().split(',');
			var pdata = {data: {autocomplete: $(tar).attr('name')}, where: {'[=]': id}};
			
			$(col).prop('disabled', $(tar).prop('disabled'));
			$(box).empty();
			
			if(parseInt(id[0])){ // prevent string '0' == true
				$.ajax({
					url: url,
					type: 'POST',
					data: { jdata: JSON.stringify({ pdata: pdata, method: 'getJson' }) },
					success: function(re){
						
						var jdata = JSON.parse(re);
						if(jdata['code']){
							// fail
						}else{
							$(tar).val('');
							for(var i in jdata['data']){
								set(jdata['data'][i]['val'], jdata['data'][i]['label']);
							}
						}
						customAlert(jdata);
					}
				});
			}
		});
	}
});

jQuery.fn.extend({
	_json: function(init){
		
		var tar = this;
		var box = $('<div></div>');
		var tpl = JSON.parse(init.tpl || '[]');
		var cls = $(tar).attr('class');
		
		$(tar).before(box);
		$(tar).attr('class', 'hidden');
		
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			
			$(box).empty();
			
			var str = ($(this).val() || '[]');
			try{
				var obj = JSON.parse(str);
				var tmp = {};
				for(var i in obj){
					var arr = i.split(/[,]+/, 2);
					var k = arr[0];
					tmp[k] = obj[i] || '';
				}
				obj = tmp;
			}catch(e){
				var obj = [];
			}
			var ctl = [];
			var txt = [];
			
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
				
				// prevernt xss
				ctl[i] = $('<span class="label label-default"></span><input>');
				ctl[i].eq(0).text(txt[i] || i);
				ctl[i].eq(1).attr('class', cls).val(obj[i]);
				
				$(ctl[i]).prop('disabled', $(tar).prop('disabled'));
				box.append(ctl[i]);
				
				ctl[i].on('input', '', i, function(e){
					obj[e.data] = $(this).val();
					$(tar).val(JSON.stringify(obj));
				});
			}
		});
	}
});

// require jquery/bootstrap
jQuery.fn.extend({
	_uploadfile: function(init){
		
		var tar = this;
		var url = init.url;
		var max = parseInt(init.max || 1);
		
		var bar = $('<div style="background-color: aquamarine; height: 3px; width: 0px; margin: 1px"></div>');
		var ctl = $('<input type="file" multiple>');
		var box = $('<div></div>');
		var style = '<style>.icon-set{ white-space: nowrap; text-overflow: ellipsis; overflow: hidden; position: absolute; bottom: 20px; width: 100%; padding: 5px; background-color: rgba(0,0,0,0.8); color: white} .icon-set a{color: white}</style>';
		
		$(tar).before(bar);
		$(tar).before(ctl);
		$(tar).before(style);
		$(tar).after(box);
		$(tar).attr('class', 'hidden');
		
		$(ctl).change(function(e){
			var upload = this;
			var cnt = $(box).children().length;
			
			if(max == 1){
				cnt = 0;
				$(tar).val('');
			}else if(cnt >= max){
				//customAlert({code: 1, text: 'exceed limit ' + max});
				$(upload).val('');
				return false;
			}
			
			var data = new FormData();
			var files = $(this).get(0).files;
			
			for(var i in files){
				if(cnt < max) cnt++;
				else break;
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
					};
					// set the onload event handler
					xhr.upload.onload = function(){
						$(bar).stop().animate({width: '0%'}, 10);
					};
					return xhr;
				}
			});
			return false;
		});
		
		// bind form reset event
		$(tar).closest('form').on('reset', function(){
			setTimeout(function(){
				$(tar).trigger('preset');
			}, 300);
		});
		
		$(tar).on('preset', function(){
			
			var val = $(this).val() || '[]';
			var tpl = 100;
			
			// init
			$(ctl).prop('disabled', $(tar).prop('disabled'));
			$(box).empty();
			try{
				var arr = JSON.parse(val);
			}catch(e){
				var arr = [];
				$(tar).val('[]');
			}
			if(!arr.length) return;
			
			var html = '';
			for(var i in arr){
				
				arr[i]['ext'] = (arr[i]['name'].split('.')[1] || 'na').toLowerCase();
				
				var dl = '<a href="' + arr[i]['url'] + '" download="' + arr[i]['name'] + '" target="_blank"><i class="fa fa-download" aria-hidden="true"></i></a>';
				var rm = ($(tar).prop('disabled'))? '': ' | <a href="#" class="delete"><i class="fa fa-trash" aria-hidden="true"></i></a>';
				
				html += '<div style="position: relative; float: left; margin: 10px;"><a class="thumbnail" href="#"><span style="position: absolute; top: 0px; right: 6px; color: black; font-size: 11px;">.' + arr[i]['ext'] + '</span><table style="width: ' + tpl + 'px; height: ' + tpl + 'px;"><tr><td style="padding: 0; text-align: center"><img src="' + arr[i]['url'] + '" class="img-responsive" style="max-width: ' + tpl + 'px; max-height: ' + tpl + 'px; margin: 0 auto;"/></td></tr></table></a>         <div class="icon-set" title="' + arr[i]['name'] + '">' + dl + rm + arr[i]['name'] + '</div></div>';
			}
			
			// start loading
			$(box).append(html);
			$(box).find('.thumbnail').each(function(){
				
				$(this).imgEvent($(tar));
				
				$(this).find('img').on('error', function(){
					// when image not found
					$(this).hide().after('<i class="fa fa-file" aria-hidden="true" style="position: relative; color: brown; font-size: 45px"></i>');
				});
			});
		});
	},
	// delete event
	imgEvent: function(input){
		
		var tar = this;
		var img = $(tar).find('img');
		
		$(tar).click(function(){
			var max = [];
			$(this).toggleClass('active');
			if($(this).hasClass('active')){
				$(this).attr('style', 'position: fixed; left: 0; right: 0; top: 0; bottom: 0; z-index: 1051; margin: 0');
				max = ['calc(100vw - 10px)', 'calc(100vh - 10px)'];
			}else{
				$(this).attr('style', '');
				max = ['100px', '100px'];
			}
			$(this).find('table').css('width', max[0]).css('height', max[1]);
			$(this).find('img').css('max-width', max[0]).css('max-height', max[1]);
		});
		
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
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var l = aio.data('checked_list');
	p.find('th.check').click(function(){
		if($(this).find('.fa-check-square-o').length){
			$(this).children().removeClass('fa-check-square-o').addClass('fa-square-o');
			l.val('');
		}else{
			$(this).children().removeClass('fa-square-o').addClass('fa-check-square-o');
			var check = [];
			p.find('.datalist').not('.hidden').each(function(i){ check[i] = $(this).attr('data-id');});
			l.val(check.join());
		}
		l.trigger('change');
	});
	
	l.change(function(){
		var str = l.val();
		var arr = str.split(',').filter(Boolean);
		
		p.find('.datalist').removeClass('highlight');
		p.find('td.check').children().removeClass('fa-check-square-o').addClass('fa-square-o');
		
		for(var i in arr){
			p.find('.datalist[data-id=' + arr[i] + ']').addClass('highlight').find('td.check').children().removeClass('fa-square-o').addClass('fa-check-square-o');
		}
	});
}
function bindFormSort(uid){
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var a = aio.data('search_adv');
	p.find('th.order').click(function(){
		
		var plus = '';
		var t = $(this).children();
		var n = $(this).attr('name');
		var tmp = JSON.parse(a.val()); //json in input
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
		
		var q = JSON.stringify(obj);  //json in input
		a.val(q).trigger('change');
		t.attr('class', plus);
	});
}

function bindFormCheck2(uid){
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var l = aio.data('checked_list');
	
	p.find('.newdatalist').find('td.check').click(function(){
		var id = $(this).closest('.datalist').attr('data-id');
		var arr = l.val().split(',').filter(Boolean);
		var idx = $.inArray(id, arr);
		
		if(idx != -1){
			arr.splice(idx, 1);
		}else{
			arr.push(id);
		}
		l.val(arr.join()).trigger('change');
	});
}

function bindFormTreeView(uid, tree, admin){
	
	if(!tree) return;
	
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var f = aio.data('form');
	var s = aio.data('search_area');
	var t = aio.data('tree_view_complete');
	var btn = $('<button class="btn btn-default btn-block prev" show=".p_0" prev="">' + _gettext('Back to previous level') + '</button>');
	var box = {};
	
	f.on('reset', function(){
		setTimeout(function(){
			var tmp = btn.attr('show').match(/p_([\w]+)/)[1];
			f.find('[name=' + tree + ']').val(tmp);
		}, 0);
	});
	
	// before scrollable div
	p.find('table.review').parent('div').css('height', 'calc(100% - 124px)').before(btn);
	
	$(btn).click(function(){
		var prev = $(btn).attr('prev');
		if(prev){
			$(btn).attr('show', prev);
			tag = prev.match(/p_([\w]+)/)[1];
			if(tag != '0'){
				tmp = p.find('.s_' + tag).attr('class');
				prev = '.' + tmp.match(/p_[\w]+/)[0];
			}else{
				prev = '';
			}
			$(btn).attr('prev', prev);
		}
		p.find('table.review').trigger('tree');
	});
	
	p.find('table.review').on('tree', function(){
		// detach and gather td's
		$(this).children('tbody').children().not('.hidden').each(function(){
			box[$(this).attr('data-id')] = $(this).children().detach();
		});
		
		if(s.find('[name=search]').val()){
			$(btn).prop('disabled', true);
		}else{
			$(this).children('tbody').children().addClass('hidden');
			$(this).children('tbody').find($(btn).attr('show')).removeClass('hidden');
			$(btn).prop('disabled', !p.find('.prev').attr('prev'));
		}
		
		// detach or append
		$(this).children('tbody').children().each(function(){
			if($(this).hasClass('hidden')){
				$(this).children().detach();
			}else{
				$(this).append(box[$(this).attr('data-id')]);
			}
		});
		
		if(!admin){
			p.find('div.toollist').find('button.create').prop('disabled', $(btn).prop('disabled'));
		}
		
		setTimeout(function(){
			t.trigger('change');
		}, 300);
	});
}

function bindFormTreeView2(uid, tree){
	
	if(!tree) return;
	
	var aio = $('#' + uid);
	var p = aio.data('panel');
	
	p.find('.newdatalist').find('td.tree').each(function(){
		$(this).html('<a href="#">' + $(this).text() + '</a>');
	});
	
	p.find('.newdatalist').find('td.tree').click(function(){
		var tag = $(this).closest('.datalist').attr('class');
		tag = tag.match(/s_([\w]+)/)[1];
		if($(this).text() != ''){
			p.find('.prev').attr('prev', p.find('.prev').attr('show'));
			p.find('.prev').attr('show', '.p_' + tag);
			p.find('table.review').trigger('tree');
		}
	});
	
	p.find('table.review').trigger('tree');
}

function bindFormViewComplete(uid, max, tree, admin){
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var c = aio.data('item_cnt');
	var r = aio.data('review_complete');
	var t = aio.data('target_id');
	var m = aio.data('modal');
	var a = aio.data('search_adv');
	var s = aio.data('search_area');
	var l = aio.data('checked_list');
	var timer = 0;// delay loading
	
	s.find('[name=search][auto]').attr('placeholder', _gettext('Search'));
	
	s.find('[name=search][auto]').on('input', function(){
		if(timer){ clearTimeout(timer);}
		timer = setTimeout(function(){
			p.find('table.review').trigger('refresh', {type: 'review'});
		}, 1000);
	});
	
	// prevent submit
	s.on('submit', function(){
		return false;
	});
	
	s.find('[refresh]').click(function(){
		p.find('table.review').trigger('refresh', {type: 'review'});
	});
	
	p.find('table.review').parent().scroll(function(){
		// safari issue
		var left = Math.min($(this).scrollLeft(), $(this).get(0).scrollWidth - $(this).get(0).clientWidth);
		p.find('.table-alter').eq(0).css('margin-left', -left);
		p.find('.end').css('margin-left', left);
		p.find('button.review').css('margin-left', left);
	});
	
	a.on('change', function(){ p.find('table.review').trigger('refresh', {type: 'review'}); });
	c.change(function(){ p.find('.item-cnt').text($(this).val()); });
	bindFormSort( uid );
	bindFormCheck( uid );
	bindFormTreeView(uid, tree, admin);
	
	p.find('button.review').click(function(e){
		// prevent sending post
		e.preventDefault();
		$(this).addClass('buttonLoading').button('loading');
		p.find('table.review').trigger('refresh',{type: 'append', max: max});
	});
	
	r.change(function(){
		// var t0 = performance.now();
		//set newdatalist js events
		p.find('table.review').find('.newdatalist').children().not('.func').click(function(){
			// select text
			if(!getSelection().toString()){
				t.val( $(this).closest('.datalist').attr('data-id')).trigger('change');
				m.find('.hidden-create').show();
				m.find('.hidden-modify').hide();
				m.find('.disabled, .disabled-modify').find('textarea[name]').prop('disabled', 1);
				m.find('.disabled-create').not('.disabled, .disabled-modify').find('textarea[name]').prop('disabled', 0);
				toggleModal(uid);
			}
		});
		
		bindFormCheck2( uid );
		bindFormTreeView2(uid, tree);
		
		p.find('.buttonLoading').button('reset');
		p.find('table.review').find('.newdatalist').addClass('datalist').removeClass('newdatalist');
		
		l.trigger('change');
		
		//item count
		c.val( p.find('table.review').find('.datalist').length ).trigger('change');
		console.log('Info: total ' + c.val() + ' items');
		// var t1 = performance.now();
		// console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
	});
}


function bindFormAjaxOnRefresh(uid, max){
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var c = aio.data('item_cnt');
	var r = aio.data('review_complete');
	var s = aio.data('search_area');
	var a = aio.data('search_adv');
	var url = aio.data('url');
	
	p.find('button.review').attr('data-loading-text', '<i class="fa fa-circle-o-notch fa-spin"></i> ' + _gettext('Loading'));
	p.find('button.review').text(_gettext('Show more items +') + max);
	p.find('p.end').text(_gettext('Reach the bottom of list'));
	
	p.find('table.review').on('refresh', function (e,obj){
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
				p.find('table.review').children('tbody').empty();
			case 'append':
				p.find('button.review').show().addClass('buttonLoading').button('loading');
				p.find('p.end').hide();
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
							p.find('table.review').children('tbody').empty();
						case 'append':
							if(jdata['cnt'] > 0){
								p.find('table.review').children('tbody').append(jdata['data']);
							}
							if(max_ > 0 && jdata['cnt'] == max_){
								p.find('button.review').show();
								p.find('p.end').hide();
							}else{
								p.find('button.review').hide();
								p.find('p.end').show();
							}
							break;
						case 'create':
							p.find('table.review').children('tbody').prepend(jdata['data']);
							break;
						case 'modify':
							var tmp = $(jdata['data']);
							for(var i in arr_id){
								p.find('table.review').find('[data-id=' + arr_id[i] + ']').replaceWith(tmp.filter('[data-id=' + arr_id[i] + ']'));
							}
							break;
						case 'delete':
							for(var i in arr_id){
								p.find('table.review').find('[data-id=' + arr_id[i] + ']').remove();
							}
							break;
						default:
							break;
					}
				}
				customAlert(jdata);
				
				p.find('button.review').find('.buttonLoading').button('reset');
				r.trigger('change');
			},
			error: function(){
				alert(_gettext('Reload the page and try again'));
			}
		});
	}).trigger('refresh',{type: 'review'});
}

function bindFormAjaxByMethod(uid, method){
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var m = aio.data('modal');
	var f = aio.data('form');
	var url = aio.data('url');
	
	m.find('button.' + method).click(function(){
		var btn = $(this).addClass('buttonLoading').button('loading');
		var pdata={data:{},where:{AND:{}}};
		pdata['data'] = f.serialize();
		
		$.ajax({
			url: url,
			type: 'POST',
			data: { jdata: JSON.stringify({ pdata: pdata, method: method }) },
			success: function(re){
				var jdata = JSON.parse(re);
				if(jdata['code']){
					// fail
				}else{
					p.find('table.review').trigger('refresh',{type: method, id: jdata['data']});
					toggleModal(uid);
				}
				customAlert(jdata);
				$('.buttonLoading').button('reset');
			},
			error: function(){
				alert(_gettext('Reload the page and try again'));
			}
		});
	});
}

function init(uid, url, query, max, tree, admin, type, col, module){
	
	var aio = $('#' + uid);
	aio.data('url', url);
	aio.data('item_cnt', $('<input>'));
	aio.data('target_id', $('<input>'));
	aio.data('checked_list', $('<input>'));
	aio.data('review_complete', $('<input>'));
	aio.data('tree_view_complete', $('<input>'));
	aio.data('change_complete', $('<input>'));
	aio.data('search_adv', $('<input value="' + query + '">'));
	
	aio.data('panel', aio.find('.panel-body').eq(0));
	aio.data('modal', aio.find('.panel-body').eq(1));
	aio.data('search_area', aio.data('panel').find('form'));
	aio.data('form', aio.data('modal').find('.tab-pane').eq(0).find('form'));
	aio.data('sub', aio.data('form').find('div').eq(1));
	
	bindFormViewComplete(uid, max, tree, admin);
	bindFormAjaxOnRefresh(uid, max);
	bindInputAjaxOnChange(uid, type, col);
	bindModuleOnChange(uid, module);
}

function bindFormCreateTool(uid){
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var m = aio.data('modal');
	var f = aio.data('form');
	
	p.find('div.toollist').find('button.main').text(_gettext('Add')).addClass('create');
	m.find('.modal-footer').eq(0).append('<button class="btn btn-primary create hidden-modify">' + _gettext('Save') + '</button>');
	p.find('div.toollist').find('button.create').click(function(){
		// http://stackoverflow.com/questions/2559616/javascript-true-form-reset-for-hidden-fields
		f.get(0).reset();
		m.find('.hidden-create').hide();
		m.find('.hidden-modify').show();
		m.find('.disabled, .disabled-create').find('textarea[name]').prop('disabled', 1);
		m.find('.disabled-modify').not('.disabled, .disabled-create').find('textarea[name]').prop('disabled', 0);
		toggleModal(uid);
	});
	
	bindFormAjaxByMethod(uid, 'create');
}


function bindFormModifyTool(uid){
	var aio = $('#' + uid);
	var m = aio.data('modal');
	
	m.find('.modal-footer').eq(0).append('<button class="btn btn-primary modify hidden-create">' + _gettext('Save') + '</button>');
	bindFormAjaxByMethod(uid, 'modify');
}

function toggleModal(uid){
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var m = aio.data('modal');
	m.toggle();
	p.toggle();
}

function bindFormDeleteTool(uid){
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var m = aio.data('modal');
	var t = aio.data('target_id');
	var url = aio.data('url');
	
	m.find('.modal-footer').eq(0).append('<button class="btn btn-danger delete hidden-create"><i class="fa fa-trash-o fa-lg"></i> ' + _gettext('Delete') + '</button>');
	m.find('button.delete').click(function(){
		if(confirm(_gettext('Are you sure to DELETE this?'))){
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
						p.find('table.review').trigger('refresh',{type:'delete', id: jdata['data']});
						toggleModal(uid);
					}
					customAlert(jdata);
					$('.buttonLoading').button('reset');
				}
			});
		}
	});
}

function bindFormExportTool(uid){
	var aio = $('#' + uid);
	var p = aio.data('panel');
	var url = aio.data('url');
	
	var b1 = $('<li><a href="#">' + _gettext('Print') + '</a></li>');
	var b2 = $('<li><a href="#">' + _gettext('Export to xls') + '</a></li>');
	
	p.find('ul.toollist').append(b1).append(b2);
	
	$(b1).click(function(){
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
					$('body').after('<div class="genPrint">' + ($('title').text()) + '<br>' + jdata.data + '<style>@media print { body > *:not(.genPrint){ display: none; /*IE workaround, which solves genPrint in <body>*/} } @media screen{ .genPrint{ display: none; }}</style></div>');
					window.print();
				}
				customAlert(jdata);
			}
		});
	});
	
	$(b2).click(function(){
		var pdata = genParam(uid);
		open('POST', url, {jdata: JSON.stringify({ pdata: pdata, method: 'review' }), style: 'excel'}, '_blank');
	});
}

function genParam(uid){
	
	var aio = $('#' + uid);
	var l = aio.data('checked_list');
	var a = aio.data('search_adv');
	var s = aio.data('search_area');
	
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

function bindInputAjaxOnChange(uid, type, col){
	
	var aio = $('#' + uid);
	var t = aio.data('target_id');
	var c = aio.data('change_complete');
	var f = aio.data('form');
	var m = aio.data('modal');
	var url = aio.data('url');
	
	m.find('.nav-tabs').find('a').eq(0).text(_gettext('Detail'));
	m.find('[data-content]').hide().not('[data-content=""]').show().popover({trigger: 'hover', html: true});
	
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
							case 'hidden':
								f.find('[name=' + col[i] + ']').val(pdata[col[i]]);
								break;
							default:
								// put value and trigger preset
								f.find('[name=' + col[i] + ']').val(pdata[col[i]]).trigger('preset');
								break;
						}
					}
					c.trigger('change');
				}
				customAlert(jdata);
			},
			error: function(){
				alert(_gettext('Reload the page and try again'));
			}
		}); 
	});
}

function bindModuleOnChange(uid, tpl){
	
	var aio = $('#' + uid);
	var m = aio.data('modal');
	var f = aio.data('form');
	var s = aio.data('search_area');
	var c = aio.data('change_complete');
	var a = aio.data('search_adv');
	
	for(var i in tpl){
		var t = uid + '_menu_' + i;
		m.find('.nav-tabs').append('<li><a data-toggle="tab" href="#' + t + '" style="padding: 0 15px 0 6px">' + tpl[i]['tag'] + '</a></li>');
		m.find('#' + uid + '_menu').after('<div id="' + t + '" class="tab-pane fade" style="height: 100%"></div>');
	}
	
	f.on('reset', function(){
		// hide tabs
		m.find('.nav-tabs a:first').tab('show');
		m.find('.nav-tabs a').not(':first').addClass('hidden');
	});
	
	c.on('change', function(){
		// hide tabs
		m.find('.nav-tabs a:first').tab('show');
		m.find('.nav-tabs a').not(':first').removeClass('hidden');
		
		for(var i in tpl){
			var arr = {};
			var sql = tpl[i]['sql'];
			var url = tpl[i]['url'];
			var str = a.val();
			var adv = JSON.parse(str)['AND'] || [];
			
			for(var j in sql){
				arr[j] = f.find('[name="' + sql[j] + '"]').val() || adv[j] || s.find('[name="' + sql[j] + '"]').val() || sql[j];
			}
			
			var col = $('#' + uid + '_menu_' + i);
			$(col).empty();
			$(col).load(url, {
				preset: arr,
				query: JSON.stringify({
					AND: arr
				})
			});
		}
	});
}
