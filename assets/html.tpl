<!-- @main -->
<script>
if(typeof checkScript == 'undefined'){
	$.ajax({
		url: '{url}',
		async: false,
		data: {method: 'script'},
		dataType: "script"
    });
}
</script>
<style>
.table-alter {
	table-layout:fixed;
}
.table-alter td, .table-alter th {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.ui-autocomplete {
	z-index: 1200;
}
</style>
<div id="{unique_id}" style="height: 100%">
	<div class="hidden">
		<input id="{unique_id}_item_cnt">
		<input id="{unique_id}_target_id">
		<input id="{unique_id}_checked_list">
		<input id="{unique_id}_review_complete" value="trigger change when review table complete">
		<input id="{unique_id}_change_complete" value="trigger change when modal fetch data complete">
	</div>
	<div class="panel panel-default" id="{unique_id}_panel" style="height: 100%; margin: 0px">
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
			
			<!-- search and advance search option which accept more keywords -->
			<div class="btn-group">
				<input class="form-control search" placeholder="搜尋" style="width: 160px"/>
				<input class="form-control search_adv" type="hidden" value="{query}" />
			</div>
			
			<!-- info area -->
			<div class="btn-group">
				<div class="badge item-cnt"></div>
			</div>
			
			<!-- main content area -->
			<div style="padding-right: 16px;">
				<table class="table table-alter" style="margin: 0px;">
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
			
			<div style="overflow-y: scroll; height: calc(100% - 70px);">
				<table class="table table-hover table-alter review" style="cursor: pointer;">
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
				<button class="btn btn-default btn-block review">顯示更多{max}筆+</button>
			</div>
		</div>
	</div>
</div>

<script>
	bindFormViewComplete('{unique_id}', '{max}');
	bindFormAjaxOnRefresh('{unique_id}', '{url}', '{max}');
</script>
<!-- @main -->


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
	bindFormExportTool('{unique_id}', '{url}');
</script>
<!-- @export -->

<!-- @change -->
<script>
	bindInputAjaxOnChange('{unique_id}', '{url}', {type}, {col});
</script>
<!-- @change -->

<!-- @table -->
	<!-- @print -->
		<table style="border:3px #000 solid; width:1500px; table-layout:fixed; text-align: center;" rules="all">
			<tr>
				<!-- @th -->
				<th style="text-align: center">{text}</th>
				<!-- @th -->
			</tr>
			<!-- @tr -->
			<tr>
				<!-- @td -->
				<td style="white-space: normal; overflow: visible; word-wrap: break-word;">{text}</td>
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
<div class="thumbnail" style="position: relative; display: inline-block; margin: 0px;">
	<span style="position: absolute; top: 0px; right: 6px; color: black; font-size: 11px;">.{ext}</span>
	<table style="width: 100px; height: 100px;">
		<tr>
			<td class="text-center">
				<img src="{url}" class="img-responsive {img}" style="max-width: 100px; max-height: 100px; margin: 0 auto;"/>
				<span class="glyphicon glyphicon-duplicate {icon}" style="position: relative; color: brown; font-size: 45px"></span>
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
				<table class="table table-alter">
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
							<textarea class="form-control input-sm" name="{name}" type="text" rows="7" style="resize: vertical">{value}</textarea>
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
							<input class="hidden" name="{name}" value="{value}" id="{uid}"/>
							<script>
								$('#{uid}')._autocomplete({url: '{url}'});
							</script>
						</td>
						<!-- @autocomplete -->
						<!-- @datepicker -->
						<td align="center">{meta}</td>
						<td>
							<input class="hidden" name="{name}" value="{value}" id="{uid}"/>
							<script>
								$('#{uid}')._datepicker();
							</script>
						</td>
						<!-- @datepicker -->
						<!-- @colorpicker -->
						<td align="center">{meta}</td>
						<td>
							<input class="form-control input-sm" type="text" name="{name}" value="{value}" id="{uid}"/>
							<script>
								$('#{uid}').colorpicker();
							</script>
						</td>
						<!-- @colorpicker -->
						<!-- @uploadfile -->
						<td align="center">{meta}</td>
						<td>
							<input class="hidden" name="{name}" value="{value}" id="{uid}"/>
							<script>
								$('#{uid}').uploadfile({url: '{url}'});
							</script>
						</td>
						<!-- @uploadfile -->
						<!-- @json -->
						<td align="center">{meta}</td>
						<td>
							<input class="hidden" name="{name}" value="{value}" id="{uid}"/>
							<script>
								$('#{uid}').json({tpl: "{value}"});
							</script>
						</td>
						<!-- @json -->
						<!-- @module -->
						<td align="center">{meta}</td>
						<td>
							<select class="form-control input-sm module" name="{name}" id="{uid}"></select>
							<script>
								$('#{uid}').module({tpl: {value}});
							</script>
						</td>
						<!-- @module -->
					<!-- @td -->
					</tr>
				<!-- @tr -->
				</table>
			</form>
		</div>
		<div class="modal-footer"></div>
	<!--/div></div-->
</div>
<!-- @modal-detail -->