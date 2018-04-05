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
.table-alter{
	table-layout:fixed;
}
.table-alter td, .table-alter th{
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.table-less>tbody>tr>td{
	border: none;
}
.table-less>tbody>tr>th{
	border: none;
	padding: 0px;
}
.table-less .form-control{
	max-width: 350px;
}
.ui-autocomplete{
	z-index: 1200;
}
.datalist.highlight{
	background-color: #4285f4 !important;
	color: #fff;
}
</style>
<div id="{unique_id}" style="height: 100%">
	<div class="hidden">
		<input id="{unique_id}_item_cnt">
		<input id="{unique_id}_target_id">
		<input id="{unique_id}_checked_list">
		<input id="{unique_id}_review_complete" value="trigger change when review table complete">
		<input id="{unique_id}_tree_view_complete" value="trigger change when tree review table complete">
		<input id="{unique_id}_change_complete" value="trigger change when modal fetch data complete">
		<input id="{unique_id}_search_adv" value="{query}">
	</div>
	<div class="panel panel-default" id="{unique_id}_panel" style="height: 100%; margin: 0px; -webkit-box-shadow: 0 3px 6px rgba(0,0,0,.175); box-shadow: 0 3px 6px rgba(0,0,0,.175);">
		<div class="panel-body" style="height: 100%">
			<!-- toolist area -->
			<form id="{unique_id}_search_area">
			<!-- @search -->
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
				<input class="form-control" name="search" placeholder="搜尋" style="width: 160px" auto/>
			</div>
			
			<!-- info area -->
			<div class="btn-group">
				<div class="badge item-cnt"></div>
			</div>
			<!-- @search -->
			</form>
			<!-- main content area -->
			<div style="padding-right: 16px;">
				<table class="table table-alter" style="margin: 0px;">
					<thead>
						<th class="check" style="width: 30px; cursor: pointer"><i class="fa fa-square-o"></i></th>
						<!-- @th-->
						<th class="{class}" name="{name}" style="cursor: pointer">{text}<i class="fa"></i></th>
						<!-- @th-->
					</thead>
				</table>
			</div>
			
			<div style="overflow-y: scroll; height: calc(100% - 90px);">
				<table class="table table-hover table-alter review" style="cursor: pointer;">
					<tbody class="last">
						<!-- @tr-->
						<tr class="newdatalist" {attr}>
							<td class="check func" style="width: 30px;"><i class="fa fa-square-o"></i></td>
							<!-- @td-->
							<td class="{class}" name="{name}">{text}</td>
							<!-- @td-->
						</tr>
						<!-- @tr-->
					</tbody>
				</table>
				<p class="end" align="center">資料底端，沒有找到更多</p>
				<button class="btn btn-default btn-block review" data-loading-text="<i class='fa fa-circle-o-notch fa-spin'></i> 載入中">顯示更多{max}筆+</button>
			</div>
			
			<div class="info"></div>
		</div>
	</div>
</div>

<script>
	bindFormViewComplete('{unique_id}', '{max}', '{back}', '{col}', '{admin}');
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
		<meta charset="utf-8">
		<style>br{ mso-data-placement: same-cell;}</style>
		<table style="border: 3px #000 solid; width: 1500px; table-layout: fixed; text-align: center; word-wrap: break-word;" rules="all">
			<tr>
				<!-- @th -->
				<th style="text-align: center;">{text}</th>
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
	<!-- @print -->
<!-- @table -->

<!-- @crop-img -->
<div class="thumbnail" style="position: relative; display: inline-block; margin: 0px;">
	<span style="position: absolute; top: 0px; right: 6px; color: black; font-size: 11px;">.{ext}</span>
	<table style="width: 100px; height: 100px;">
		<tr>
			<td class="text-center">
				<img src="{url}" class="img-responsive {img}" style="max-width: 100px; max-height: 100px; margin: 0 auto;"/>
				<i class="fa fa-file {icon}" style="position: relative; color: brown; font-size: 45px"></i>
			</td>
		</tr>
	</table>
</div>
<!-- @crop-img -->

<!-- @modal-detail -->
<div class="modal fade" id="{unique_id}_Modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" data-width="{width}">
	<div class="modal-dialog"><div class="modal-content">
		<div class="modal-header" style="border: none">
			<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span>&times;</span></button>
			<ul class="nav nav-tabs">
				<li class="active"><a data-toggle="tab" href="#{unique_id}_home">詳細資訊</a></li>
			</ul>
		</div>
		<div class="modal-body">
			<div class="tab-content">
				<div id="{unique_id}_home" class="tab-pane fade in active" style="min-height: 700px">
			<form>
				<table class="table table-alter table-less">
					<tr>
						<th class="col-xs-1 col-sm-1 col-md-1"></th>
						<th class="col-xs-2 col-sm-3 col-md-3"></th>
					</tr>
				<!-- @tr -->
					<tr class="{class}">
					<!-- @td -->
						<!-- @hidden -->
						<td class="hidden" colspan="10">
							<input name="{name}" value="{value}"/>
						</td>
						<!-- @hidden -->
						<!-- @struct -->
						<td align="center" style="font-weight: bold; vertical-align: middle">{meta} <i class="fa fa-question-circle-o" data-content="{info}"></i></td>
						<td>
							<textarea class="hidden" name="{name}" id="{uid}" {disabled}>{value}</textarea>
							<script>
								$('#{uid}').{func}({url: '{url}', max: '{max}', tpl: '{tpl}'});
							</script>
						</td>
						<!-- @struct -->
						<!-- @module -->
						<td class="hidden" colspan="10">
							<input class="hidden" id="{uid}">
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
			<script>
				// popover
				$('[data-content]').hide().not('[data-content=""]').show().popover({trigger: 'hover', html: true});
			</script>
			<div class="modal-footer"></div>
				</div>
			</div>
		</div>
	</div></div>
</div>
<!-- @modal-detail -->