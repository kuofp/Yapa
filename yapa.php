<?php

class Yapa{
	
	public $unique_id;
	
	public $file;
	private $db_name;
	private $table_name;
	public $col_en = array();
	public $col_ch = array();
	private $empty_chk = array();
	private $exist_chk = array();
	private $chain_chk = array();
	private $route_chk = array();
	public $show = array();
	public $type = array();
	private $auth = array();
	private $database;
	private $mail;
	
	public $col_num;
	private $uid;
	
	public $arg;
	public $act;
	
	private $tpl;

	public function __construct($file, $db_name, $table_name, $col_en, $col_ch, $empty_chk, $exist_chk, $chain_chk, $route_chk, $show, $type, $auth, $medoo, $phpmailer){
		
		$this->unique_id = 'form_' . uniqid();
		
		$this->file = $file;
		$this->db_name = $db_name;
		$this->table_name = $table_name;
		
		$this->col_en = $col_en;
		$this->col_ch = $col_ch;
		$this->empty_chk = $empty_chk;
		$this->exist_chk = $exist_chk;
		$this->chain_chk = $chain_chk;
		$this->route_chk = $route_chk;
		$this->show = $show;
		$this->type = $type;
		$this->auth = $auth;
		$this->database = $medoo;
		$this->mail = $phpmailer;
		
		$this->col_num = count($col_en);
		$this->uid = 0;
		
		$this->tpl = new Yatp(__DIR__ . '/assets/html.tpl');
	}
	
	public function __destruct(){
		
	}
	
	public function getDB(){
		return $this->db_name;
	}
	
	public function getTable(){
		return $this->table_name;
	}
	
	public function authCheck($mode){
		
		switch($mode){
			case 'review':
				if($this->auth[0] ?? 0) return 0;
				break;
			case 'create':
				if($this->auth[1] ?? 0) return 0;
				break;
			case 'modify':
				if($this->auth[2] ?? 0) return 0;
				break;
			case 'delete':
				if($this->auth[3] ?? 0) return 0;
				break;
		}
		
		return 1;
	}
	
	public function decodeJson($pdata){
		
		$result = array('pdata' => array());
		
		if(isset($pdata['jdata'])){
			$jdata = json_decode($pdata['jdata'], true);
			
			$result['method'] = isset($jdata['method'])? $jdata['method']: '';
			
			//must keep keys 'data' and 'where', but remove empty array in where key
			//array( 'data' => array())                   got error
			//array( 'where' => array())                  got error
			//array( 'where' => array( 'AND' => array())) got error
			//do not remove empty array in data key
			//array( 'data' => array(name=>''))           will be removed
			
			if(isset($jdata['pdata']['data'])){
				if(is_array($jdata['pdata']['data'])){
					$data = $jdata['pdata']['data'];
				}else{
					$str = isset($jdata['pdata']['data'])? $jdata['pdata']['data']: '';
					$arr_tmp = explode('&', $str);
					$arr_tmp2 = array();
					$data = array();
					foreach($arr_tmp as $arr){
						$s = explode('=', $arr);
						$arr_tmp2[$s[0]][] = urldecode($s[1]);
					}
					foreach($arr_tmp2 as $key=>$arr){
						$data[$key] = implode(',', $arr);
					}
				}
			}else{
				$data = array();
			}
			
			$result['pdata']['data'] = $data;
			$result['pdata']['where'] = isset($jdata['pdata']['where'])? array_filter($jdata['pdata']['where']): array();
			
			//$result['pdata']['data'] = isset($jdata['pdata']['data'])? $jdata['pdata']['data']: array();
			//$result['pdata']['where'] = isset($jdata['pdata']['where'])? array_filter($jdata['pdata']['where']): array();
			
			
			$this->act = $result['method'];
			$this->arg = $result['pdata'];
		}else{
			$this->act = $_REQUEST['method'] ?? '';
			$this->arg = '';
		}
		
		return $result;
	}
	
	//review
	public function reviewTool(){
		
		$style  = $_REQUEST['style']  ?? '';
		$query  = $_REQUEST['query']  ?? [];
		$preset = $_REQUEST['preset'] ?? '';
		
		$result = 'success';
		if($this->authCheck('review')){
			$result = 'err_auth';
		}else{
			
			$style_effect = $style == 'sub'? 'hidden': 'text';
			
			$th = [];
			for($i = 0; $i < $this->col_num; $i++){
				$th[] = array(
					'class' => $this->show[$i],
					'name'  => $this->col_en[$i],
					'text'  => $this->col_ch[$i],
				);
			}
			
			$this->tpl->block('main')->assign(array(
				'unique_id'   => $this->unique_id,
				'style_effect'=> $style_effect,
				'query'       => str_replace('"', '\'', json_encode($query)),
				'url'         => $this->file,
				'table'       => $this->table_name,
				'tr'          => '',
				'th'          => $this->tpl->block('main.th')->nest($th),
			))->render();
		
			$this->genFormModal($preset);
			
			
			$this->ajaxOnChange();
			$this->createTool();
			$this->modifyTool();
			$this->deleteTool();
			
			
			$this->mailTool();
			$this->exportTool();
		}
		
		return $result;
	}
	
	public function review($pdata){
		
		$datas = $this->getData($pdata);
		
		$style = $_REQUEST['style'] ?? '';
		
		$th = array_map(function($v){
				return array('text' => $v);
			}, $this->col_ch);
		
		// produce tr
		$block = $style? 'table.' . $style: 'main';
		
		$tr = [];
		for($i = 0; $i < count($datas['data']); $i++){
			$td = [];
			for($j = 0; $j < $this->col_num; $j++){
				$td[] = array(
					'class' => $this->show[$j],
					'name'  => $this->col_en[$j],
					'text'  => $this->e($datas['data'][$i][$this->col_en[$j]]),
				);
			}
			
			$tr[] = array(
				'td' => $this->tpl->block($block . '.td')->nest($td)
			);
		}
		
		// produce th
		switch($style){
			case 'print':
			case 'excel':
				$html = $this->tpl->block($block)->assign(array(
					'th' => $this->tpl->block($block . '.th')->nest($th),
					'tr' => $this->tpl->block($block . '.tr')->nest($tr)
				));
				break;
				
			default:
				$html = $this->tpl->block($block . '.tr')->nest($tr);
				break;
		}
		$html = $html->render(false);
		
		$result = array('cnt'=>count($datas['data']), 'data'=>$html, 'err'=>$datas['err']);
		return json_encode($result, JSON_UNESCAPED_UNICODE);
		
	}
	
	//create
	public function createTool(){
		
		$result = 'success';
		
		if($this->authCheck('create')){
			$result = 'err_auth';
		}else{
			$this->tpl->block('create')->assign(array(
				'unique_id'   => $this->unique_id,
				'url'         => $this->file,
			))->render();
		}
		
		return $result;
	}
	
	public function create($pdata){
		
		$result = array('err'=>'success', 'id'=>0);
		
		if($this->authCheck('create')){
			$result['err'] = 'err_auth';
		}else{
			$pdata['data']['id'] = 0; //clear id, create don't need id
			$err = $this->dataCheck($pdata['data']);
			if($err == 'success'){//pass dataCheck
				$this->database->insert($this->table_name, $pdata['data']);
				$result['id'] = $this->database->id();
			}else{
				$result['err'] = $err;
			}
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	//modify
	public function modifyTool(){
		
		$result = 'success';
		
		if($this->authCheck('modify')){
			$result = 'err_auth';
		}else{
			$this->tpl->block('modify')->assign(array(
				'unique_id'   => $this->unique_id,
				'url'         => $this->file,
			))->render();
		}
		
		return $result;
	}
	
	public function modify($pdata){
		
		$result = array('err'=>'success', 'id'=>'');
		
		if($this->authCheck('modify')){
			$result['err'] = 'err_auth';
		}else{
			if(isset($pdata['where']['muti'])){
				unset($pdata['where']['muti']);
				$modify_num = $this->database->update($this->table_name, $pdata['data'], $pdata['where']);
				if($modify_num>0){ $result['id'] = implode(',', $pdata['where']['OR']['id']); }
			}else{
				$err = $this->dataCheck($pdata['data']);
				if($err == 'success'){//pass dataCheck
					$pdata['where']['AND']['id'] = $pdata['data']['id'];
					$modify_num = $this->database->update($this->table_name, $pdata['data'], $pdata['where']);
					if($modify_num>0){ $result['id'] = $pdata['data']['id'];}
				}else{
					$result['err'] = $err;
				}
			}
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	//delete
	public function deleteTool(){
		
		$result = 'success';
		
		if($this->authCheck('delete')){
			$result = 'err_auth';
		}else{
			$this->tpl->block('delete')->assign(array(
				'unique_id'   => $this->unique_id,
				'url'         => $this->file,
			))->render();
		}
		
		return $result;
	}
	
	public function delete($pdata){
		
		$result = array('err'=>'success', 'id'=>0);
		
		if($this->authCheck('delete')){
			$result['err'] = 'err_auth';
		}else{
			$delete_num = $this->database->delete($this->table_name, $pdata['where']);
			if($delete_num != 1){
				$result['err'] = 'err_delete';
			}else{
				$result['id'] = $pdata['where']['AND']['id'];
			}
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function mailto($pdata){
		//base64 encoding http://reader.roodo.com/linpapa/archives/10000107.html
		$result = '';
		
		//The message
		$title = "=?UTF-8?B?". base64_encode($pdata['data']['title'])."?=";
		$msg = str_replace("\n", "<br>", $pdata['data']['content']);
		if(!empty($pdata['data']['report'])) $msg .= "<br><br>------------以下內容由系統產生------------<br>" . $pdata['data']['report'];
		

		$this->mail->From = $pdata['data']['from']; //fail
		$this->mail->addAddress($pdata['data']['mailto']);
		$this->mail->addReplyTo($pdata['data']['from']);
		if(!empty($pdata['data']['mailcc'])) $this->mail->addCC($pdata['data']['mailcc']);
		//$this->mail->addBCC('bcc@example.com');

		//Add attachments
		if(!empty($pdata['data']['attach'])){
			if(!empty($pdata['data']['attach_name'])){
				$str = "=?UTF-8?B?". base64_encode($pdata['data']['attach_name'])."?=";
				$this->mail->addAttachment($pdata['data']['attach'], $str);
			}
			else $this->mail->addAttachment($pdata['data']['attach']);
		}
		
		$this->mail->Subject = $title;
		$this->mail->Body    = $msg;
		
		if(!$this->mail->send()) {
			$result = 'err_mailer';
		} else {
			$result = 'success';
		}
		
		return $result;
	}
	
	public function mailTool(){
		
		$result = 'success';
		
		if($this->authCheck('review')){
			$result = 'err_auth';
		}else{
			$this->tpl->block('mail')->assign(array(
				'unique_id'   => $this->unique_id,
				'url'         => $this->file,
				'table'       => $this->table_name,
			))->render();
		}
		
		return $result;
	}
	
	public function exportTool(){
		
		$result = 'success';
		
		if($this->authCheck('review')){
			$result = 'err_auth';
		}else{
			$this->tpl->block('export')->assign(array(
				'unique_id'   => $this->unique_id,
				'url'         => $this->file,
				'table'       => $this->table_name,
			))->render();
		}
		
		return $result;
	}
	
	public function excel(){
		
		$result = array();
		
		if($this->authCheck('review')){
			$result['err'] = 'err_auth';
			return json_encode($result, JSON_UNESCAPED_UNICODE);
			
		}else{
			header('Content-type:application/vnd.ms-excel;');
			header('Content-Disposition:filename=' . 'Export_' . date('YmdHis') . '.xls');
			return $_REQUEST['data'] ?? '';
			
		}
	}
	
	public function upload(){
		
		$result = array();
		
		if($this->authCheck('create')){
			$result['err'] = 'err_auth';
			
		}else{
			$files = $_FILES ?? array();
		
			foreach($files as $file){
				// {"name":"new 2.txt","type":"text\/plain","tmp_name":"\/tmp\/phpRJ91Ks","error":0,"size":1295}
				$url = 'upload/' . md5(time() . rand());
				$result[] = array('url' => $url, 'name' => $file['name'], 'size' => $file['size']);
				move_uploaded_file($file['tmp_name'], $url);
			}
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function script(){
		
		echo file_get_contents(__DIR__ . '/assets/script.js');
	}
	
	public function genFormModal($preset){
		
		$result = 'success';
		
		$tr = [];
		for($i = 0; $i < $this->col_num; $i++){
			$star = '';
			if($this->empty_chk[$i]){
				$star .= '(必填)';
			}
			if($this->exist_chk[$i]){
				$star .= '(唯一)';
			}
			
			$pre = $preset[$this->col_en[$i]] ?? ''; //靜態預設值(Preset)用於載入子分頁, 點擊新增時Reset可回復到預設值
			$tag = ''; //select: selected, radio/checkbox: checked, autocomplete: label
			
			switch($this->type[$i]){
				case 'hidden':
					$td = $this->tpl->block('modal-detail.td.hidden')->assign(array(
						'meta' => $this->col_ch[$i] . $star,
						'name' => $this->col_en[$i],
						'value' => $pre,
					));
					break;
				case 'text';
					$td = $this->tpl->block('modal-detail.td.text')->assign(array(
						'meta'  => $this->col_ch[$i] . $star,
						'name'  => $this->col_en[$i],
						'value' => $pre,
					));
					break;
				case 'password';
					$td = $this->tpl->block('modal-detail.td.password')->assign(array(
						'meta'  => $this->col_ch[$i] . $star,
						'name'  => $this->col_en[$i],
						'value' => $pre,
					));
					break;
				case 'textarea':
					$td = $this->tpl->block('modal-detail.td.textarea')->assign(array(
						'meta'  => $this->col_ch[$i] . $star,
						'name'  => $this->col_en[$i],
						'value' => $pre,
					));
					break;
				case 'select':
					$arr_tmp = preg_split('/[\s,]+/', $this->chain_chk[$i]);
					$datas = $this->database->select($arr_tmp[0], '*');
					
					$tmp = [];
					foreach($datas as $arr){
						$tmp[] = array(
							'value'    => $arr[$arr_tmp[2]],
							'selected' => ($pre==$arr[$arr_tmp[2]])? 'selected': '',
							'text'     => $arr[$arr_tmp[1]],
						);
					}
					
					$td = $this->tpl->block('modal-detail.td.select')->assign(array(
						'meta'   => $this->col_ch[$i] . $star,
						'name'   => $this->col_en[$i],
						'option' => $this->tpl->block('modal-detail.td.select.option')->nest($tmp),
					));
					
					break;
				/*case 'chainselect':
					$uid = $this->getUid();
					$arr_tmp = preg_split('/[\s,]+/', $this->chain_chk[$i]);
					$html .= "<td><select class='form-control input-sm' name='" . $this->col_en[$i] . "' id='" . $uid . "'>";
					$html .= "</td></select>";
					$html .= "<script>
					
					$('#" . $this->unique_id . "_Modal').find('.modal-body').find('[name=\'" . $this->col_en[$i-1] . "\']').on('change', function(){
						$('#" . $uid . "').trigger('preset', [$(this).val(), '*']).trigger('change');
					});
					
					$('#" . $uid . "').on('click', function(){
						
						//if there is only one option, then send ajax! (preset has only one option ) I can't find one for dropdown and another for click option
						if($('#" . $uid . "').children().length == 1){
							$('#" . $this->unique_id . "_Modal').find('.modal-body').find('[name=\'" . $this->col_en[$i-1] . "\']').trigger('change');
						}
					});
					
					$('#" . $uid . "').on('preset', function(e, v, t){
						$('#" . $uid . "').empty();
						
						var pdata = {data: { 0: '" . $arr_tmp[2] . "(id)', 1: '" . $arr_tmp[1] . "(name)' }, where: { }};
						if(t == '*'){
							$('#" . $uid . "').append('<option value=\'0\'>-請選擇-</option>');
							pdata['where'] = {'" . $arr_tmp[3] . "': v};
							if(v == 0 || v === null){
								return;
							}
						}else{
							pdata['where'] = {id: v};
							if(v == 0 || v === null){
								$('#" . $uid . "').append('<option value=\'0\'>-請選擇-</option>');
								return;
							}
						}
						
						$.ajax({
							url: '" . $this->route_chk[$i] . "',
							type: 'POST',
							data: { jdata: JSON.stringify({ pdata: pdata, method: 'getJson' }) },
							success: function(re) {
								var jdata = JSON.parse(re);
								
								for(var i = 0; i < jdata.length; i++){
									$('#" . $uid . "').append('<option value=\'' + jdata[i]['id'] + '\'>' + jdata[i]['name'] + '</option>');
								}
							}
						});
					});
					
					</script>";
					break;*/
				case 'radiobox':
					$arr_tmp = preg_split('/[\s,]+/', $this->chain_chk[$i]);
					
					$datas = $this->database->select($arr_tmp[0], '*');
					
					$tmp = [];
					foreach($datas as $arr){
						$tmp[] = array(
							'value'   => $arr[$arr_tmp[2]],
							'checked' => ($pre==$arr[$arr_tmp[2]])? 'checked': '',
							'text'    => $arr[$arr_tmp[1]],
							'name'    => $this->col_en[$i],
						);
					}
					
					$td = $this->tpl->block('modal-detail.td.radiobox')->assign(array(
						'meta'   => $this->col_ch[$i] . $star,
						'option' => $this->tpl->block('modal-detail.td.radiobox.option')->nest($tmp),
					));
					break;
				case 'checkbox':
					$arr_tmp = preg_split('/[\s,]+/', $this->chain_chk[$i]);
					
					$datas = $this->database->select($arr_tmp[0], '*');
					
					$chk = is_array($pre)? $pre: explode(',', $pre);
					
					$tmp = [];
					foreach($datas as $arr){
						$tmp[] = array(
							'value'   => $arr[$arr_tmp[2]],
							'checked' => (in_array($arr[$arr_tmp[2]], $chk))? 'checked': '',
							'text'    => $arr[$arr_tmp[1]],
							'name'    => $this->col_en[$i],
						);
					}
					
					$td = $this->tpl->block('modal-detail.td.checkbox')->assign(array(
						'meta'   => $this->col_ch[$i] . $star,
						'option' => $this->tpl->block('modal-detail.td.checkbox.option')->nest($tmp),
					));
					break;
				case 'autocomplete':
					$arr_tmp = preg_split('/[\s,]+/', $this->chain_chk[$i]);
					if($pre){
						$datas = $this->database->select($arr_tmp[0], $arr_tmp[1], array($arr_tmp[2]=>$pre));
						$tag = $datas[0];
					}
					$uid = $this->getUid();
					
					$td = $this->tpl->block('modal-detail.td.autocomplete')->assign(array(
						'meta'  => $this->col_ch[$i] . $star,
						'text'  => $tag,
						'value' => $pre,
						'name'  => $this->col_en[$i],
						'uid'   => $uid,
						'url'   => $this->route_chk[$i],
						'label' => $arr_tmp[2],
						'val'   => $arr_tmp[1],
					));
					
					break;
				case 'datepicker':
					$uid = $this->getUid();
					$pre = $pre != ''? date('Y-m-d', $pre) :date('Y-m-d');
					
					$td = $this->tpl->block('modal-detail.td.datepicker')->assign(array(
						'meta'  => $this->col_ch[$i] . $star,
						'value' => $pre,
						'name'  => $this->col_en[$i],
						'uid'   => $uid,
					));
					break;
				case 'uploadfile':
					$uid = $this->getUid();
					
					$td = $this->tpl->block('modal-detail.td.uploadfile')->assign(array(
						'meta'  => $this->col_ch[$i] . $star,
						'value' => $pre,
						'name'  => $this->col_en[$i],
						'uid'   => $uid,
						'url'   => $this->file,
					));
					break;
				default:
					break;
			}
			
			$tr[] = array(
				'td' => array($td)
			);
		}
		
		$this->tpl->block('modal-detail')->assign(array(
			'unique_id' => $this->unique_id,
			'tr' => $this->tpl->block('modal-detail.tr')->nest($tr)
		))->render();
		
		return $result;
	}
	
	public function getJson($pdata){//get raw data
		
		$arr_col = $pdata['data']?$pdata['data']:'*';
		$datas = $this->database->select($this->table_name, $arr_col, $pdata['where']);
		
		return json_encode($datas, JSON_UNESCAPED_UNICODE);
	}
	
	public function getData($pdata){//translate all data
		
		$err = array();
		$result = '';
		if($this->authCheck('review')){
			$result = 'err_auth';
		}else{
			$arr_search = array();
			$arr_chain = array();
			$arr_col = array();
			for($i = 0; $i < $this->col_num; $i++){
				$arr_col[$i] = $this->table_name . '.' . $this->col_en[$i];
			}
			for($i = 0; $i < $this->col_num; $i++){
				if($this->type[$i] == 'checkbox') continue;
				if($this->chain_chk[$i] != ''){
					$arr_tmp = preg_split('/[\s,]+/', $this->chain_chk[$i]);
					$arr_col[$i] = 't' . $i . '.' . $arr_tmp[1] . '(' . $this->col_en[$i] . ')';
					
					$arr_chain['[>]' . $arr_tmp[0] . '(t' . $i . ')'] = array($this->col_en[$i] => $arr_tmp[2]);
				}
			}
			
			//for search
			if(isset($pdata['where']['SEARCH'])){
				$keyword = preg_split('/[\s,]+/', $pdata['where']['SEARCH']);
				
				for($j = 0; $j < count($keyword); $j++){
					if(!empty($keyword[$j])){
						for($i = 0; $i < $this->col_num; $i++){
							if($this->type[$i] == 'checkbox'){

								continue;
							}
							if($this->chain_chk[$i] != ''){
								$arr_tmp = preg_split('/[\s,]+/', $this->chain_chk[$i]);
								$arr_search['t' . $i . '.' . $arr_tmp[1] . '[~]'] = $keyword[$j];
							}else{
								$arr_search[$this->table_name . '.' . $this->col_en[$i] . '[~]'] = $keyword[$j];
							}
						}
						$pdata['where']['AND']['OR #muti keyword' . $j] = $arr_search;
					}
				}
				unset($pdata['where']['SEARCH']);
			}
			
			//search advance
			if($pdata['where']['SEARCH_ADV'] ?? 0){
				
				$adv = json_decode(str_replace('\'', '"', $pdata['where']['SEARCH_ADV']), true);
				foreach($adv['AND'] ?? [] as $k=>$v){
					//table.id (join)
					$adv['AND'][$this->table_name . '.' . $k] = $v;
					unset($adv['AND'][$k]);
				}
				unset($pdata['where']['SEARCH_ADV']);
				
				if(is_array($adv)){
					$pdata['where'] = array_merge_recursive($pdata['where'], $adv);
				}
			}
			
			if(!($pdata['where']['ORDER'] ?? 0)){
				// default order
				$pdata['where']['ORDER'] = ['id' => 'DESC'];
			}
			
			$where = isset($pdata['where'])?$pdata['where']:'';
			if(empty($arr_chain)){ $datas = $this->database->select($this->table_name, '*', $where);}
			else{ $datas = $this->database->select($this->table_name, $arr_chain, $arr_col, $where);}
			
			if($datas != ''){
				$arr_checkbox_list = array();
				$arr_uploadfile_list = array();
				for($j = 0; $j < $this->col_num; $j++){
					
					//mark checkbox
					if($this->type[$j] == 'checkbox'){
						
						$arr_tmp = preg_split('/[\s,]+/', $this->chain_chk[$j]);
						$datas_checkbox = $this->database->select($arr_tmp[0], array($arr_tmp[1], $arr_tmp[2]));
						
						foreach($datas_checkbox as $arr){
							$arr_checkbox_list[$this->col_en[$j]][$arr[$arr_tmp[2]]] = $arr[$arr_tmp[1]];
						}
					}
					
					//mark uploadfile
					if($this->type[$j] == 'uploadfile'){
						$arr_uploadfile_list[$this->col_en[$j]] = 1;
					}
				}
				
				$cnt_datas = count($datas);
				for($i = 0; $i < $cnt_datas; $i++){
					
					//translate checkbox
					foreach($arr_checkbox_list as $key=>$arr){
						if($datas[$i][$key] != ''){
							$arr_vtmp = preg_split('/[\s,]+/', $datas[$i][$key]);
							$arr_result = array();
							
							foreach($arr_vtmp as $val){
								$arr_result[] = $arr[$val];
							}
							
							$datas[$i][$key] = $this->e(implode(',', $arr_result));
						}
					}
					
					//translate uploadfile
					foreach($arr_uploadfile_list as $key=>$val){
						
						$arr = json_decode($datas[$i][$key], true);
						
						if(is_array($arr)){
							// check file
							foreach($arr as $k=>$v){
								
								$ext = strtolower(explode('.', $v['name'])[1] ?? 'na');
								
								if(file_exists($v['url']) && explode('/', mime_content_type($v['url']))[0] == 'image'){
									$arr[$k]['icon'] = 'hidden';
								}else{
									$arr[$k]['img'] = 'hidden';
									$arr[$k]['ext'] = $ext;
								}
							}
							$datas[$i][$key] = $this->raw($this->tpl->block('crop-img')->nest($arr)->render(false));
						}
					}
				}
			}
		
			$result = array('cnt'=>count($datas), 'data'=>$datas, 'err'=>$err);
		}
		
		return $result;
	}
	
	public function getUid(){//get unique id for html tags for this file
		return $this->unique_id . '_uid_' . $this->uid++;
	}
	
	public function ajaxOnChange(){
		
		$result = 'success';
		
		$this->tpl->block('change')->assign(array(
			'unique_id' => $this->unique_id,
			'url'       => $this->file,
			'type'      => json_encode($this->type, JSON_UNESCAPED_UNICODE),
			'col'       => json_encode($this->col_en, JSON_UNESCAPED_UNICODE),
		))->render();
		
		return $result;
	}

	public function dataCheck(&$data){
		
		$result = 'success';
		
		for($i = 0; $i < $this->col_num; $i++){
			if($this->col_en[$i] == 'id') continue; //skip id
			
			if($this->empty_chk[$i] == 1){
				switch($this->type[$i]){
					case 'autocomplete':
					case 'select':
					case 'radiobox':
					case 'chainselect':
						if(!isset($data[$this->col_en[$i]]) || $data[$this->col_en[$i]] == 0){
							$result = 'err_empty';
						}
						break;
					default:
						if(!isset($data[$this->col_en[$i]]) || $data[$this->col_en[$i]] == ''){
							$result = 'err_empty';
						}
						break;
				}
			}
			
			if($this->exist_chk[$i] == 1){
				
				if(isset($data[$this->col_en[$i]]) && $data[$this->col_en[$i]] != ''){
					$count = 0;
					if($data['id']){
						$count = $this->database->count($this->table_name, array('AND'=>array($this->col_en[$i] => $data[$this->col_en[$i]], 'id[!]'=>$data['id']) ));
					}else{
						$count = $this->database->count($this->table_name, array($this->col_en[$i] => $data[$this->col_en[$i]]));
					}
					if($count > 0){
						$result = 'err_exist';
					}
				}
			}
		}
		return $result;
	}
	
	public function searchTool(){
		//search adv
		
	}
	
	public function optionTool(){
		//選擇性加入工具(功能)的控制器
		
	}
	
	public function adjustTool(){
		//調整欄位寬度與隱藏欄位功能
		
	}
	
	public function render(){
		
		$this->reviewTool();
		
	}
	
	public function raw($str){
		return [$str];
	}
	
	protected function e($str){
		return is_array($str)? ($str[0] ?? ''): htmlspecialchars($str);
	}
}