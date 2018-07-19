<!-- @main -->
<script>
if(typeof checkScript == 'undefined'){
	$.ajax({
		url: '{url}',
		async: false,
		data: {method: 'script'},
		dataType: "script"
	});
	$.ajax({
		url: '{url}',
		async: false,
		data: {method: 'css'},
		success: function(r){
			$('body').prepend(r);
		}
	});
}
</script>
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
	<div class="panel panel-default" id="{unique_id}_panel" style="height: 100%; margin: 0px; box-shadow: 0 3px 6px rgba(0,0,0,.175);">
		<div class="panel-body" style="height: 100%">
			<!-- toolist area -->
			<form id="{unique_id}_search_area">
			<!-- @search -->
			<div class="btn-group toollist">
				<button type="button" class="btn btn-default main"><i class="fa fa-cog" aria-hidden="true"></i></button>
				<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					<span class="caret"></span>
					<span class="sr-only">Toggle Dropdown</span>
				</button>
				<ul class="dropdown-menu toollist"></ul>
			</div>
			
			<!-- search and advance search option which accept more keywords -->
			<div class="btn-group">
				<input class="form-control w160" name="search" auto>
			</div>
			
			<!-- info area -->
			<div class="btn-group">
				<div class="badge item-cnt"></div>
			</div>
			
			<!-- refresh -->
			<div class="btn btn-default pull-right" refresh>
				<i class="fa fa-repeat"></i>
			</div>
			<!-- @search -->
			</form>
			<!-- main content area -->
			<div style="padding-right: 16px; overflow: hidden">
				<table class="table table-alter" style="margin: 0px;">
					<thead>
						<th class="check w40" style="cursor: pointer"><i class="fa fa-square-o"></i></th>
						<!-- @th-->
						<th class="{class}" name="{name}" style="cursor: pointer">{text}<i class="fa"></i></th>
						<!-- @th-->
						<th></th>
					</thead>
				</table>
			</div>
			
			<div style="overflow-y: scroll; height: calc(100% - 90px);">
				<table class="table table-hover table-alter review" style="cursor: pointer;">
					<tbody class="last">
						<!-- @tr-->
						<tr {attr}>
							<td class="check w40 func"><i class="fa fa-square-o"></i></td>
							<!-- @td-->
							<td class="{class}" name="{name}">{text}</td>
							<!-- @td-->
							<td></td>
						</tr>
						<!-- @tr-->
					</tbody>
				</table>
				<p class="end text-center col-xs-12"></p>
				<button class="btn btn-default btn-block review"></button>
			</div>
			
			<div class="info" style="overflow: hidden"></div>
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
				<li class="active"><a data-toggle="tab" href="#{unique_id}_home"></a></li>
			</ul>
		</div>
		<div class="modal-body">
			<div class="tab-content">
				<div id="{unique_id}_home" class="tab-pane fade in active" style="min-height: 700px">
			<form>
				<div style="max-width: 500px; float: left;">
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
							<input name="{name}" value="{value}">
						</td>
						<!-- @hidden -->
						<!-- @struct -->
						<td align="center" style="font-weight: bold; vertical-align: middle">{meta} <i class="fa fa-question-circle-o" data-content="{info}"></i></td>
						<td>
							<textarea class="form-control input-sm" name="{name}" id="{uid}">{value}</textarea>
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
				</div>
				<div id="{unique_id}_sub" style="max-width: 500px; float: left; overflow: hidden; margin-bottom: 20px;">
					{html}
				</div>
			</form>
			<div style="clear: both"></div>
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
<!-- @css -->
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
.w20{width: 20px}.w40{width: 40px}.w60{width: 60px}.w80{width: 80px}
.w100{width: 100px}.w120{width: 120px}.w140{width: 140px}.w160{width: 160px}.w180{width: 180px}
.w200{width: 200px}.w220{width: 220px}.w240{width: 240px}.w260{width: 260px}.w280{width: 280px}
.w300{width: 300px}.w320{width: 320px}.w340{width: 340px}.w360{width: 360px}.w380{width: 380px}
.w400{width: 400px}.w420{width: 420px}.w440{width: 440px}.w460{width: 460px}.w480{width: 480px}
.w500{width: 500px}
</style>
<!-- @css -->