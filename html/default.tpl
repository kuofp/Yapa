<!-- @main -->
<div id="{unique_id}" style="height: 100%">
	<input id="{unique_id}_item_cnt"        type="hidden" value="">
	<input id="{unique_id}_target_id"       type="hidden" value="">
	<input id="{unique_id}_review_complete" type="hidden" value="trigger change when review table complete">
	<input id="{unique_id}_checked_list"    type="hidden" value="">
	<input id="{unique_id}_change_complete" type="hidden" value="trigger change when modal fetch data complete">
		
	<div class="panel panel-default" id="{unique_id}_panel" style="height: 100%">
		<div class="panel-body" style="height: 100%">
			<!-- toolist area -->
			<div class="btn-group toollist">
				<button type="button" class="btn btn-default main">操作</button>
				<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					<span class="caret"></span>
					<span class="sr-only">Toggle Dropdown</span>
				</button>
				<ul class="dropdown-menu toollist"></ul>
			</div>
			
			<!-- search and advance search option which can filter more keywords -->
			<div class="btn-group">
				<input class="form-control search" type="{style_effect}" placeholder="搜尋" style="width: 160px"/>
				<input class="form-control search_adv" type="hidden" value="{query}" />
			</div>
			
			<!-- form text and info area has hidden-xs class attribute -->
			<div class="btn-group">
				<span class="hidden-xs">目前顯示</span>&nbsp;<div class="badge"><span class="item_cnt"></span></div><span class="hidden-xs"> 項結果</span>
			</div>
			
			<!-- main content area -->
			<div style="padding-right: 16px;">
				<table class="table" style="margin: 0px;">
					<thead class="form_title">
						<th class="chkall" style="width: 30px; cursor: pointer">
							<i class="fa fa-square-o"></i>
						</th>
						<!-- @th-->
						<th class="{class} order" name="{name}" style="cursor: pointer">{text}<i class="fa"></i></th>
						<!-- @th-->
					</thead>
				</table>
			</div>
			
			<div class="table_wrap sub" style="overflow-y: scroll; height: calc(100% - 70px);">
				<table class="table table-hover review" style="cursor: pointer;">
					<tbody class="last">
						<!-- @tr-->
						<tr class="newdatalist">
							<!-- @td-->
							<td class="{class}" name="{name}">{text}</td>
							<!-- @td-->
						</tr>
						<!-- @tr-->
					</tbody>
				</table>
				<p class="hidden empty_text" align="center">資料底端，沒有找到更多</p>
				<button class="btn btn-default btn-block review">顯示更多50筆+</button>
			</div>
		</div>
	</div>
</div>

<script>
	bindFormViewComplete('{unique_id}');
	bindFormAjaxOnRefresh('{unique_id}', '{url}', '{table}');

</script>
<!-- @main -->


<!-- @mail -->
<div class="modal fade" id="{unique_id}_Mail_Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
	<!--div class="modal-dialog"><div class="modal-content"-->
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
		<h4 class="modal-title">寄送通知</h4>
	</div>
	<div class="modal-body">
		<form>
			<table class="table">
				<thead>
					<tr>
						<th class="col-xs-1 col-sm-1 col-md-1"></th>
						<th class="col-xs-2 col-sm-2 col-md-2"></th>
					</tr>
				</thead>
				<tr>
					<td align="center">收件者(必填)</td>
					<td><input class="form-control input-sm" name="mailto" type="text" value=""/></td>
				</tr>
				<tr>
					<td align="center">副本</td>
					<td><input class="form-control input-sm" name="mailcc" type="text" value=""/></td>
				</tr>
				<tr>
					<td align="center">標題</td>
					<td><input class="form-control input-sm" name="title" type="text" value=""/></td>
				</tr>
				<tr>
					<td align="center">內文</td>
					<td><textarea class="form-control" name="content" type="text" rows="7"></textarea></td>
				</tr>
				<tr>
					<td align="center">附檔</td>
					<td><p class="attach_label"></p><p class="attach_link"></p><input name="attach" type="hidden"/></td>
				</tr>
				<tr>
					<td colspan="2" align="center">
						<div name="report" style="overflow-x: auto"></div>
					</td>
				</tr>			
			</table>
		</form>
	</div>
	<div class="modal-footer">
		<div class="mail"></div>
	</div>
	<!--/div></div-->
</div>

<script>
	bindFormMailTool('{unique_id}', '{url}', '{table}', {source});
</script>
<!-- @mail -->


<!-- @create -->
<script>
	bindFormCreateTool('{unique_id}', '{url}');
</script>
<!-- @create -->

<!-- @modify -->
<script>
	bindFormModifyTool('{unique_id}', '{url}');
</script>
<!-- @modify -->

<!-- @delete -->
<script>
	bindFormDeleteTool('{unique_id}', '{url}');
</script>
<!-- @delete -->

<!-- @export -->
<script>
	bindFormExportTool('{unique_id}', '{url}', '{table}');
</script>
<!-- @export -->

<!-- @change -->
<script>
	bindInputAjaxOnChange('{unique_id}', '{url}', {type}, {col});
</script>
<!-- @change -->

<!-- @table -->
	<!-- @print -->
		<table style="border:3px #000 solid; width:1500px; table-layout:fixed; text-align: center;" rules="all" class="pure-table">
			<tr>
				<!-- @th -->
				<th style="text-align: center">{text}</th>
				<!-- @th -->
			</tr>
			<!-- @tr -->
			<tr>
				<!-- @td -->
				<td style="white-space: normal; overflow: visible; word-wrap: break-word;" name="{name}">{text}</td>
				<!-- @td -->
			</tr>
			<!-- @tr -->
		</table>
	<!-- @print -->
	<!-- @excel -->
		<table>
			<tr>
				<!-- @th -->
				<th>{text}</th>
				<!-- @th -->
			</tr>
			<!-- @tr -->
			<tr>
				<!-- @td -->
				<td>{text}</td>
				<!-- @td -->
			</tr>
			<!-- @tr -->
		</table>
	<!-- @excel -->
<!-- @table -->

<!-- @crop-img -->
<div class="thumbnail" style="display: inline-block; margin: 0px;">
	<table style="width: 100px; height: 100px;">
		<tr>
			<td class="text-center">
				<img src="{url}" class="img-responsive {img}" style="max-width: 100px; max-height: 100px; margin: 0 auto;"/>
				<i class="fa fa-file {icon}" style="position: relative; color: brown; font-size: 45px"><span style="position: absolute; top: 25px; left: 6px; color: white; font-size: 11px;">{ext}</span></i>
			</td>
		</tr>
	</table>
</div>
<!-- @crop-img -->

<!-- @modal-detail -->
<div class="modal fade" id="{unique_id}_Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" >
	<!--div class="modal-dialog"><div class="modal-content"-->
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
			<h4 class="modal-title">詳細資訊</h4>
		</div>
		<div class="modal-body">
			<form>
				<table class="table">
					<tr>
						<th class="col-xs-1 col-sm-1 col-md-1">項目</th>
						<th class="col-xs-2 col-sm-2 col-md-2">內容</th>
					</tr>
				<!-- @tr -->
					<tr>
					<!-- @td -->
						<!-- @hidden -->
						<td class="hidden"></td>
						<td class="hidden">
							<input name="{name}" value="{value}"/>
						</td>
						<!-- @hidden -->
						<!-- @text -->
						<td align="center">{meta}</td>
						<td>
							<input class="form-control input-sm" name="{name}" type="text" value="{value}"/>
						</td>
						<!-- @text -->
						<!-- @password -->
						<td align="center">{meta}</td>
						<td>
							<input class="form-control input-sm" name="{name}" type="password" value="{value}"/>
						</td>
						<!-- @password -->
						<!-- @textarea -->
						<td align="center">{meta}</td>
						<td>
							<textarea class="form-control input-sm" name="{name}" type="text" rows="7">{value}</textarea>
						</td>
						<!-- @textarea -->
						<!-- @select -->
						<td align="center">{meta}</td>
						<td>
							<select class="form-control input-sm" name="{name}">
								<option value="0">請選擇</option>
							<!-- @option -->
								<option value="{value}" {selected}>{text}</option>
							<!-- @option -->
							</select>
						</td>
						<!-- @select -->
						<!-- @radiobox -->
						<td align="center">{meta}</td>
						<td>
							<!-- @option -->
							<div class="radio">
								<label><input type="radio" name="{name}" value="{value}" {checked}/>{text}</label>
							</div>
							<!-- @option -->
						</td>
						<!-- @radiobox -->
						<!-- @checkbox -->
						<td align="center">{meta}</td>
						<td>
							<!-- @option -->
							<div class="checkbox">
								<label><input type="checkbox" name="{name}" value="{value}" {checked}/>{text}</label>
							</div>
							<!-- @option -->
						</td>
						<!-- @checkbox -->
						<!-- @autocomplete -->
						<td align="center">{meta}</td>
						<td>
							<input class="form-control input-sm" type="text" value="{text}" id="{uid}_label"/>
							<input class="hidden" name="{name}" value="{value}" id="{uid}"/>
							<script>
								bindInputAutoComplete('{uid}', '{url}', '{label}', '{val}');
							</script>
						</td>
						<!-- @autocomplete -->
						<!-- @datepicker -->
						<td align="center">{meta}</td>
						<td>
							<input class="form-control input-sm" name="{name}" type="text" value="{value}" id="{uid}"/>
							<script>
								$('#{uid}').datepicker({dateFormat: 'yy-mm-dd', closeText: 'Close', changeYear: true, changeMonth: true, beforeShow: function() {setTimeout(function(){ $('.ui-datepicker').css('z-index', 1070);}, 0);}});
							</script>
						</td>
						<!-- @datepicker -->
						<!-- @uploadfile -->
						<td align="center">{meta}</td>
						<td>
							<input class="hidden" name="{name}" value="{value}" id="{uid}"/>
							<script>
								$('#{uid}').uploadfile({url: '{url}'});
							</script>
						</td>
						<!-- @uploadfile -->
					<!-- @td -->
					</tr>
				<!-- @tr -->
				</table>
			</form>
		</div>
		<div class="modal-footer">
			<div class="create"></div>
			<div class="modify"></div>
		</div>
	<!--/div></div-->
	<div class="modal-area-label"></div>
	<div class="modal-area"></div>
</div>
<!-- @modal-detail -->