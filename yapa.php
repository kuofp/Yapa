<?php

class Yapa{
	
	public $unique_id;
	
	public $file;
	private $table;
	public $col_en = [];
	public $col_ch = [];
	private $chain_chk = [];
	public $show = [];
	public $type = [];
	private $auth = [];
	private $database;
	private $data;
	private $tree;
	private $config;
	
	public $col_num;
	private $uid;
	
	public $arg;
	public $act;
	
	private $tpl;
	
	public function __construct($file, $table, $col_en, $col_ch, $chain_chk, $show, $type, $auth, $medoo, $config = []){
		
		$this->unique_id = 'form' . uniqid();
		
		$this->file = $file;
		$this->table = $table;
		
		// separate label and info
		$label = [];
		foreach($col_ch as $v){
			$tmp = $this->split($v, 'label');
			$label[0][] = $tmp[0] ?? '';
			$label[1][] = $tmp[1] ?? '';
		}
		
		// join chain
		$chain = [];
		$tree = ['col' => null];
		foreach($chain_chk as $k=>$v){
			$chain[] = $v? $this->split($v, 'chain'): '';
			// tree view check
			if($config['tree'] ?? 0){
				$tree['col'] = $config['tree'];
			}else{
				if(($chain[$k][0] ?? '') == $this->table){
					$tree['col'] = $k;
				}
			}
		}
		
		// type with attr
		$attr = [];
		foreach($type as $k=>$v){
			$tmp = $v? $this->split($v, 'label'): '';
			$attr[0][] = $tmp[0] ?? '';
			$attr[1][] = json_decode($tmp[1] ?? '[]', true);
		}
		
		// show and hide
		$hide = [];
		foreach($show as $k=>$v){
			$tmp = $v? $this->split($v): '';
			$hide[] = (in_array('hidden', $tmp) && $col_en[$k] != 'id')? 1: 0;
		}
		//dd($attr);
		$this->col_en = $col_en;
		$this->col_ch = $label[0];
		$this->info = $label[1];
		$this->chain_chk = $chain;
		$this->show = $show;
		$this->hide = $hide;
		$this->type = $attr[0];
		$this->attr = $attr[1];
		$this->auth = $auth;
		$this->database = $medoo;
		$this->data = [];
		$this->tree = $tree;
		$this->config = $config;
		
		$this->config['root'] = $this->split($this->config['root'] ?? '');
		
		$this->col_num = count($col_en);
		$this->uid = 0;
		
		$this->path_html = $this->config['path_html'] ?? (__DIR__ . '/assets/html.tpl');
		$this->path_js   = $this->config['path_js']   ?? (__DIR__ . '/assets/script.js');
		
		$this->tpl = new Yatp($this->path_html);
		
		$this->decodeJson();
	}
	
	public function script(){
		
		$lang = new Yatp(__DIR__ . '/assets/lang.php');
		echo file_get_contents($this->path_js) . $lang->render(false);
	}
	
	public function authCheck($mode){
		
		$result = ['code' => 1, 'text' => '權限不足'];
		$meta = ['review', 'create', 'modify', 'delete'];
		
		if(in_array($mode, $meta)){
			if($this->auth[array_search($mode, $meta)] ?? $this->auth[$mode] ?? 0) $result = ['code' => 0, 'text' => ''];
		}else{
			if($this->auth[$mode] ?? 0) $result = ['code' => 0, 'text' => ''];
		}
		
		return $result;
	}
	
	public function decodeJson(){
		
		$pdata = $_REQUEST;
		
		$result = ['pdata' => []];
		
		if(isset($pdata['jdata'])){
			$jdata = json_decode($pdata['jdata'], true);
			
			$result['method'] = $jdata['method'] ?? '';
			
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
					$str = $jdata['pdata']['data'] ?? '';
					$arr_tmp = explode('&', $str);
					$arr_tmp2 = [];
					$data = [];
					foreach($arr_tmp as $arr){
						$s = explode('=', $arr);
						$arr_tmp2[$s[0]][] = urldecode($s[1]);
					}
					foreach($arr_tmp2 as $key=>$arr){
						$data[$key] = implode(',', $arr);
					}
				}
			}else{
				$data = [];
			}
			
			$result['pdata']['data'] = $data;
			$result['pdata']['where'] = isset($jdata['pdata']['where'])? array_filter($jdata['pdata']['where']): [];
			
			// unset disabled cols when create and modify
			if(in_array($result['method'], ['create', 'modify'])){
				for($i = 0; $i < $this->col_num; $i++){
					if($this->attr[$i]['disabled'] ?? 0){
						unset($result['pdata']['data'][$this->col_en[$i]]);
					}
				}
			}
			
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
	public function reviewTool($option = []){
		
		$style  = $_REQUEST['style'] ?? '';
		$query  = json_decode($_REQUEST['query'] ?? '{}');
		$preset = array_replace_recursive(($this->config['preset'] ?? []), ($_REQUEST['preset'] ?? []));
		
		$result = $this->authCheck('review');
		
		if($result['code']){
			// fail
		}else{
			
			$th = [];
			for($i = 0; $i < $this->col_num; $i++){
				// order settings
				if($style == '' && $this->hide[$i]) continue;
				$th[] = array(
					'class' => $this->show[$i] . (($this->type[$i] != 'value')? ' order': ''),
					'name'  => $this->col_en[$i],
					'text'  => $this->col_ch[$i],
				);
			}
			
			$this->tpl->block('main')->assign(array(
				'unique_id' => $this->unique_id,
				'query'     => $this->e(json_encode($query)),
				'url'       => $this->file,
				'tr'        => '',
				'th'        => $this->tpl->block('main.th')->nest($th),
				'max'       => $this->config['perpage'] ?? 50,
				'back'      => ($this->tree['col'] !== null),
				'search'    => $option['search'] ?? $this->tpl->block('main.search')->render(false),
				'col'       => $this->col_en[$this->tree['col']] ?? '',
				'admin'     => $this->config['admin'] ?? '',
			))->render();
		
			$this->genFormModal($preset);
			$this->ajaxOnChange();
			
			foreach(['create', 'modify', 'delete', 'export'] as $v){
				$auth = ($v == 'export')? 'review': $v;
				$result = $this->authCheck($auth);
				if($result['code']){
					// fail
				}else{
					$this->tpl->block($v)->assign(array(
						'unique_id' => $this->unique_id,
						'url' => $this->file,
					))->render();
				}
			}
		}
		
		return $result;
	}
	
	public function review($pdata, $callback=''){
		
		$datas = $this->getData($pdata);
		
		// apply outer data
		$this->apply($datas);
		
		// tree view
		$this->tree($datas);
		
		foreach($datas['data'] as $k=>$v){
			for($i = 0; $i < $this->col_num; $i++){
				if($this->attr[$i]['i18n'] ?? 0){
					$text = $v[$this->col_en[$i]] ?? '';
					$text = _($text);
					$datas['data'][$k][$this->col_en[$i]] = $text;
				}
			}
		}
		
		// custom callback before rendering
		if($callback){
			$datas = call_user_func($callback, $datas);
		}
		
		$style = $_REQUEST['style'] ?? '';
		
		$th = array_map(function($v){
			return array('text' => $v);
		}, $this->col_ch);
		
		// produce tr
		$block = $style? 'table.print': 'main';
		
		$tr = [];
		
		foreach($datas['data'] as $k=>$v){
			$td = [];
			for($i = 0; $i < $this->col_num; $i++){
				if($style == '' && $this->hide[$i]) continue;
				$tree = (($this->tree['col'] === $i)? ' tree func': '');
				$td[] = array(
					'class' => $this->show[$i] . $tree,
					'name'  => $this->col_en[$i],
					'text'  => $this->e($v[$this->col_en[$i]] ?? ''),
				);
			}
			
			$tree = $this->tree['col']? ($this->tree['sub'][2][$v['id']] ?? ''): '';
			$tr[] = array(
				'td' => $this->tpl->block($block . '.td')->nest($td)->render(false),
				'attr' => 'data-id="' . $v['id'] . '" class="newdatalist ' . $tree . '"',
			);
		}
		
		// produce th
		switch($style){
			case 'print':
			case 'excel':
				$html = $this->tpl->block($block)->assign(array(
					'th' => $this->tpl->block($block . '.th')->nest($th),
					'tr' => $this->tpl->block($block . '.tr')->nest($tr),
				));
				break;
				
			default:
				$html = $this->tpl->block($block . '.tr')->nest($tr);
				break;
		}
		$html = $html->render(false);
		
		if($style == 'excel'){
			
			header('Content-type:application/vnd.ms-excel;');
			header('Content-Disposition:filename=' . 'Export_' . date('YmdHis') . '.xls');
			$result = $html;
		}else{
			$result = ['code' => 0, 'data' => $html, 'cnt' => count($datas['data'])];
			$result = json_encode($result, JSON_UNESCAPED_UNICODE);
		}
		
		return $result;
	}
	
	public function create($pdata){
		
		$result = $this->authCheck('create');
		
		if($result['code']){
			// fail
		}else{
			$pdata['data']['id'] = 0; //clear id, create don't need id
			$this->database->insert($this->table, $pdata['data']);
			$result['data'] = $this->database->id();
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function modify($pdata){
		
		$result = $this->authCheck('modify');
		
		if($result['code']){
			// fail
		}else{
			$pdata['where']['AND']['id'] = $pdata['data']['id'];
			$this->database->update($this->table, $pdata['data'], $pdata['where']);
			$result['data'] = $pdata['data']['id'];
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function delete($pdata){
		
		$result = $this->authCheck('delete');
		
		if($result['code']){
			// fail
		}else{
			$delete = $this->database->delete($this->table, $pdata['where']);
			if($delete->rowCount() == 0){
				$result = ['code' => 1, 'text' => '刪除失敗'];
			}else{
				$result['data'] = $pdata['where']['AND']['id'];
			}
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function upload(){
		
		//$result = $this->authCheck('create');
		
		//if($result['code']){
			// fail
		//}else{
			
			$tmp = [];
			
			if(!file_exists('upload')){
				mkdir('upload', 0755);
			}
		
			foreach($_FILES ?? [] as $file){
				// {"name":"new 2.txt","type":"text\/plain","tmp_name":"\/tmp\/phpRJ91Ks","error":0,"size":1295}
				$url = 'upload/' . time() . md5(rand());
				$tmp[] = ['url' => $url, 'name' => $file['name'], 'size' => $file['size']];
				move_uploaded_file($file['tmp_name'], $url);
			}
			
			$result['data'] = $tmp;
		//}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function genFormModal($preset){
		
		$result = [];
		
		$tr = [];
		for($i = 0; $i < $this->col_num; $i++){
			
			$info = $this->info[$i];
			
			$td = '';
			$tpl = '';
			$pre = $preset[$this->col_en[$i]] ?? ''; //靜態預設值(Preset)用於載入子分頁, 點擊新增時Reset可回復到預設值
			$uid = $this->getUid();
			$disabled = ($this->attr[$i]['disabled'] ?? 0)? 'disabled': '';
			
			switch($this->type[$i]){
				case 'hidden':
					$td = $this->tpl->block('modal-detail.td.hidden')->assign([
						'value' => $pre,
						'name'  => $this->col_en[$i],
					]);
					break;
				case 'text':
				case 'json':
				case 'editor':
				case 'select':
				case 'password':
				case 'textarea':
				case 'radiobox':
				case 'checkbox':
				case 'uploadfile':
				case 'datepicker':
				case 'colorpicker':
				case 'autocomplete':
					
					if(in_array($this->type[$i], ['select', 'radiobox', 'checkbox'])){
						$arr_tmp = $this->chain_chk[$i];
						$datas = $this->database->select($arr_tmp[0], '*', $arr_tmp[3]);
						
						$tpl = [];
						foreach($datas as $arr){
							$text = $arr[$arr_tmp[1]];
							if($this->attr[$i]['i18n'] ?? 0){
								$text = _($text);
							}
							$tpl[] = [$arr[$arr_tmp[2]], $text]; // JS won't ensure the order of numeric keys
						}
						$tpl = json_encode($tpl);
					}
					
					if(in_array($this->type[$i], ['datepicker'])){
						$tpl = $this->attr[$i]['format'] ?? 'Y-m-d';
					}
					
					if(in_array($this->type[$i], ['json'])){
						$tpl = json_encode($pre);
						$pre = $this->e(json_encode($pre));
					}
					
					$td = $this->tpl->block('modal-detail.td.struct')->assign([
						'disabled' => $disabled,
						'value' => $pre,
						'meta'  => $this->col_ch[$i],
						'name'  => $this->col_en[$i],
						'func'  => '_' . $this->type[$i],
						'info'  => $info,
						'uid'   => $uid,
						'tpl'   => $tpl,
						'max'   => $this->attr[$i]['max'] ?? 1,
						'url'   => $this->file,
					]);
					break;
				default:
					break;
			}
			
			if($td){
				$tmp = $this->split($this->show[$i], 'space');
				$arr = [];
				foreach($tmp as $v){
					if(in_array($v, ['hidden-create', 'hidden-modify'])){
						$arr[] = $v;
					}
				}
				$class = implode(' ', $arr);
				$tr[] = array(
					'class' => $class,
					'td' => array($td)
				);	
			}
		}
		
		// module
		if($this->config['module'] ?? []){
			$uid = $this->unique_id . '_module';
			
			$pre = [];
			foreach($this->config['module'] ?? [] as $k=>$v){
				$pre[$k] = [];
				$pre[$k]['sql'] = $v['sql'];
				$pre[$k]['url'] = $v['url'];
				$pre[$k]['tag'] = $v['tag'];
				$pre[$k]['css'] = $v['css'] ?? '';
			}
			
			$td = $this->tpl->block('modal-detail.td.module')->assign(array(
				'value' => json_encode($pre),
				'uid'   => $uid,
			));
			$tr[] = array(
				'class' => $class,
				'td' => array($td)
			);
		}
		
		$this->tpl->block('modal-detail')->assign(array(
			'unique_id' => $this->unique_id,
			'width' => $this->config['modal-width'] ?? '760px',
			'tr' => $this->tpl->block('modal-detail.tr')->nest($tr),
		))->render();
		
		return $result;
	}
	
	public function getJson($pdata){//get raw data
		
		$result = $this->authCheck('review');
		
		if($result['code']){
			// fail
		}else if($pdata['data']['autocomplete'] ?? 0){
			
			for($i = 0; $i < $this->col_num; $i++){
				if($this->col_en[$i] == $pdata['data']['autocomplete']){
					$arr_tmp = $this->chain_chk[$i];
					$table = $arr_tmp[0];
					$arr_col = array(
						$arr_tmp[1] . '(label)',
						$arr_tmp[2] . '(val)', // 'value' will be inserted into the input automatically, 'val' won't
					);
					
					$where = ['LIMIT' => 10];
					if($pdata['where']['[~]'] ?? 0){
						$match = [$arr_tmp[1] => $pdata['where']['[~]']];
						$fuzzy = [$arr_tmp[1] . '[~]' => $pdata['where']['[~]']];
						
						$pdata['where'] = array_replace_recursive($where, $match, $arr_tmp[3]);
						$arr1 = $this->database->select($table, $arr_col, $pdata['where']);
						$pdata['where'] = array_replace_recursive($where, $fuzzy, $arr_tmp[3]);
						$arr2 = $this->database->select($table, $arr_col, $pdata['where']);
						
						$tmp = [];
						foreach($arr1 as $k=>$v){
							$tmp[$v['val']] = $v['label'];
						}
						foreach($arr2 as $k=>$v){
							if($tmp[$v['val']] ?? 0){
								// duplicate
							}else{
								$arr1[] = $v;
							}
						}
						
						$result['data'] = array_slice($arr1, 0, 10);
						
					}else if($pdata['where']['[=]'] ?? 0){
						$where[$arr_tmp[2]] = $pdata['where']['[=]'];
					}
					
					$pdata['where'] = array_replace_recursive($where, $arr_tmp[3]);
					break;
				}
			}
			
		}else{
			$table = $this->table;
			$arr_col = $pdata['data']?: '*';
		}
		
		if($result['code']){
			// fail
		}else{
			$result['data'] = $result['data'] ?? $this->database->select($table, $arr_col, $pdata['where']);
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function getData($pdata){//translate all data
		
		$result = $this->authCheck('review');
		
		if($result['code']){
			// fail
		}else{
			$arr_search = [];
			$arr_chain = [];
			$arr_col = [];
			
			for($i = 0; $i < $this->col_num; $i++){
				// skip
				if($this->type[$i] == 'value') continue;
				$arr_col[$i] = $this->table . '.' . $this->col_en[$i];
			}
			for($i = 0; $i < $this->col_num; $i++){
				// skip
				if($this->type[$i] == 'value') continue;
				if($this->chain_chk[$i]){
					if(!in_array($this->type[$i], ['checkbox', 'autocomplete'])){
						$arr_tmp = $this->chain_chk[$i];
						$arr_col[$i] = 't' . $i . '.' . $arr_tmp[1] . '(' . $this->col_en[$i] . ')';
						$arr_chain['[>]' . $arr_tmp[0] . '(t' . $i . ')'] = array($this->col_en[$i] => $arr_tmp[2]);
					}
					// keep original id
					$arr_col[$i + $this->col_num] = $this->table . '.' . $this->col_en[$i] . '(__' . $this->col_en[$i] . ')';
				}
			}
			
			if($this->tree['col'] !== null){
				$col = $this->col_en[$this->tree['col']];
				$arr_tmp = $this->chain_chk[$this->tree['col']];
				$datas = $this->database->select($arr_tmp[0], array($arr_tmp[1], $arr_tmp[2], $col));
				
				$tmp = [];
				$alias = [];
				foreach($datas as $v){
					$tmp[$v['id']] = $v[$col];
					$alias[$v['id']] = $v[$arr_tmp[1]];
				}
				
				$sub = $this->treeSub($tmp);
				$order = $this->flatten($this->toTree($tmp));
				
				$offset = [];
				foreach($order as $k=>$v){
					$offset[$v] = explode(',', $k)[1];
				}
				
				$this->tree['offset'] = $offset;
				$this->tree['sub'] = $sub;
				$this->tree['alias'] = $alias;
			}
			
			// select only descendant
			if($this->config['root'][0]){
				$arr = [];
				foreach($this->config['root'] as $v){
					$arr = array_merge($arr, $this->tree['sub'][1][$v] ?? []);
				}
				// include self
				$id = $pdata['where']['AND']['id'] ?? 0;
				$ids = array_merge($arr, $this->config['root']);
				
				if($id){
					if(!is_array($id)){
						$id = [$id];
					}
					if(count(array_diff($id, $ids)) != 0){
						// invalid user
						exit;
					}
				}else{
					$pdata['where']['AND']['id'] = $ids;
				}
			}
			
			// add table name
			foreach($pdata['where']['AND'] ?? [] as $k=>$v){
				$pdata['where']['AND'][$this->table . '.' . $k] = $v;
				unset($pdata['where']['AND'][$k]);
			}
			
			//for search
			if(isset($pdata['where']['SEARCH'])){
				$keyword = $this->split($pdata['where']['SEARCH'], 'space');
				
				for($j = 0; $j < count($keyword); $j++){
					if(!empty($keyword[$j])){
						for($i = 0; $i < $this->col_num; $i++){
							// skip
							if($this->type[$i] == 'value') continue;
							if($this->type[$i] == 'uploadfile') continue;
							if($this->type[$i] == 'datepicker') continue;
							if($this->type[$i] == 'password') continue;
							if($this->tree['col'] === $i) continue;
							if($this->type[$i] == 'autocomplete' || $this->type[$i] == 'checkbox'){
								$arr_tmp = $this->chain_chk[$i];
								$ids = $this->database->select($arr_tmp[0], $arr_tmp[2], [$arr_tmp[1] . '[~]' => $keyword[$j], 'LIMIT' => 1000]);
								if($ids){
									// find in a comma separated string (not a precise approach yet)
									$arr_search[$this->table . '.' . $this->col_en[$i] . '[~]'] = $ids;
								}
								
							}else if($this->chain_chk[$i]){
								$arr_tmp = $this->chain_chk[$i];
								$arr_search['t' . $i . '.' . $arr_tmp[1] . '[~]'] = $keyword[$j];
							}else{
								$arr_search[$this->table . '.' . $this->col_en[$i] . '[~]'] = $keyword[$j];
							}
						}
						$pdata['where']['AND']['OR #muti keyword' . $j] = $arr_search;
					}
				}
				unset($pdata['where']['SEARCH']);
			}
			
			//search advance
			if($pdata['where']['SEARCH_ADV'] ?? 0){
				
				$adv = json_decode($pdata['where']['SEARCH_ADV'], true);
				foreach($adv['AND'] ?? [] as $k=>$v){
					//table.id (join)
					$adv['AND'][$this->table . '.' . $k] = $v;
					unset($adv['AND'][$k]);
				}
				unset($pdata['where']['SEARCH_ADV']);
				
				if(is_array($adv)){
					$pdata['where'] = array_merge_recursive($pdata['where'], $adv);
				}
			}
			unset($pdata['where']['SEARCH_CUS']);
			
			// order
			if(!($pdata['where']['ORDER'] ?? 0)){
				// default order
				$pdata['where']['ORDER'] = ['id' => 'DESC'];
			}
			
			// add table name
			foreach($pdata['where']['ORDER'] ?? [] as $k=>$v){
				$pdata['where']['ORDER'][$this->table . '.' . $k] = $v;
				unset($pdata['where']['ORDER'][$k]);
			}
			
			//dd($pdata['where']);
			
			$where = $pdata['where'] ?? '';
			if(empty($arr_chain)){ $datas = $this->database->select($this->table, '*', $where);}
			else{ $datas = $this->database->select($this->table, $arr_chain, $arr_col, $where);}
			
			if($datas != ''){
				$arr_mark = [];
				$cnt_datas = count($datas);
				
				for($j = 0; $j < $this->col_num; $j++){
					
					switch($this->type[$j]){
						case 'checkbox':
							$arr_mark[$j] = [];
							$arr_tmp = $this->chain_chk[$j];
							$datas_checkbox = $this->database->select($arr_tmp[0], array($arr_tmp[1], $arr_tmp[2]));
							
							foreach($datas_checkbox as $arr){
								$arr_mark[$j][$arr[$arr_tmp[2]]] = $arr[$arr_tmp[1]];
							}
							break;
						case 'autocomplete':
							// collect ids in data list for preventing too much results
							$ids = [];
							for($i = 0; $i < $cnt_datas; $i++){
								$tmp = explode(',', $datas[$i][$this->col_en[$j]]);
								foreach($tmp as $v){
									$ids[$v] = $v;
								}
							}
							
							$arr_mark[$j] = [];
							$arr_tmp = $this->chain_chk[$j];
							$datas_checkbox = $this->database->select($arr_tmp[0], array($arr_tmp[1], $arr_tmp[2]), array($arr_tmp[2] => $ids));
							
							foreach($datas_checkbox as $arr){
								$arr_mark[$j][$arr[$arr_tmp[2]]] = $arr[$arr_tmp[1]];
							}
							break;
						case 'uploadfile':
						case 'datepicker':
						case 'value':
							$arr_mark[$j] = 1;
							break;
						case 'json':
							$arr_tmp = $this->config['preset'][$this->col_en[$j]] ?? [];
							$tmp = [];
							foreach($arr_tmp as $k=>$v){
								$txt = explode(',', $k);
								$tmp[($txt[0] ?? '')] = ($txt[1] ?? '')?: ($txt[0] ?? '');
							}
							$arr_mark[$j] = $tmp;
							break;
					}
				}
				
				for($i = 0; $i < $cnt_datas; $i++){
					
					//translate
					foreach($arr_mark as $key=>$arr){
						
						$idx = $key;
						$key = $this->col_en[$idx];
						
						switch($this->type[$idx]){
							case 'checkbox':
							case 'autocomplete':
								if($datas[$i][$key]){
									$arr_vtmp = $this->split($datas[$i][$key]);
									$arr_result = [];
									
									foreach($arr_vtmp as $val){
										$arr_result[] = $arr[$val] ?? 0;
									}
									
									$datas[$i][$key] = $this->raw(implode('<br>', $arr_result));
								}
								break;
							
							case 'uploadfile':
								$arr = json_decode($datas[$i][$key], true);
								if(is_array($arr)){
									// check file
									foreach($arr as $k=>$v){
										
										$ext = strtolower(explode('.', $v['name'])[1] ?? 'na');
										$arr[$k]['ext'] = $ext;
										
										if(file_exists($v['url']) && explode('/', mime_content_type($v['url']))[0] == 'image'){
											$arr[$k]['icon'] = 'hidden';
										}else{
											$arr[$k]['img'] = 'hidden';
										}
									}
									$datas[$i][$key] = $this->raw($this->tpl->block('crop-img')->nest($arr)->render(false));
								}
								break;
								
							case 'json':
								$tmp = [];
								foreach($arr as $k=>$v){
									$arr = json_decode($datas[$i][$key], true);
									$tmp[] = $this->e($v) . ': ' . $this->e($arr[$k] ?? '');
								}
								$datas[$i][$key] = $this->raw(implode('<br>', $tmp));
								break;
								
							case 'datepicker':
								if($datas[$i][$key]){
									$datas[$i][$key] = date($this->attr[$idx]['format'] ?? 'Y-m-d', (int)$datas[$i][$key]);
								}
								break;
								
							case 'value':
								$datas[$i][$key] = '';
								break;
						}
					}
				}
			}
		
			$result = ['data' => $datas, 'cnt' => count($datas)];
		}
		
		return $result;
	}
	
	public function getUid(){//get unique id for html tags for this file
		return $this->unique_id . '_uid_' . $this->uid++;
	}
	
	public function ajaxOnChange(){
		
		$result = $this->authCheck('review');
		
		if($result['code']){
			// fail
		}else{
			$this->tpl->block('change')->assign(array(
				'unique_id' => $this->unique_id,
				'url'       => $this->file,
				'type'      => json_encode($this->type, JSON_UNESCAPED_UNICODE),
				'col'       => json_encode($this->col_en, JSON_UNESCAPED_UNICODE),
			))->render();
		}
		
		return $result;
	}
	
	public function render($option = []){
		$this->reviewTool($option);
	}
	
	public function raw($str){
		return [$str];
	}
	
	protected function e($str){
		return is_array($str)? ($str[0] ?? ''): htmlspecialchars($str);
	}
	
	protected function treeSub($tree){
		
		$result = [];
		$arr = [];
		// unique pid list
		$p = [];
		
		foreach($tree as $k=>$v){
			if(empty($tree[$k])){
				$tree[$k] = '0';
			}
			
			$p[$v] = $v;
			
			// init
			$arr[$k] = [];
		}
		
		// direct children count
		foreach($tree as $k=>$v){
			$arr[$v][$k] = $k;
		}
		$result[] = $arr;
		
		// all children count
		foreach($p as $parent){
			foreach($arr as $k => $children){
				if($children[$parent] ?? 0){
					$arr[$k] = $children + $arr[$parent];
				}
			}
		}
		$result[] = $arr;
		
		// tree view class
		$arr = [];
		foreach($tree as $k => $v){
			$arr[$k] = 's_' . $k . ' p_' . ((in_array($k, $this->config['root']) || !isset($tree[$v]))? '0': $v);
		}
		$result[] = $arr;
		
		return $result;
	}
	
	protected function toTree($array){
		$flat = [];
		$tree = [];
		foreach($array as $child => $parent){
			if(!isset($flat[$child])){
				$flat[$child] = [];
			}
			if(isset($array[$parent])){
				$flat[$parent][$child] = &$flat[$child];
			}else{
				$tree[$child] = &$flat[$child];
			}
		}
		return $tree;
	}
	
	protected function flatten($arr, $l = 0) {
		$result = [];
		foreach($arr as $key=>$val) {
			$result[$key . ',' . $l] = $key;
			if(is_array($val) && count($val)){
				$result = array_merge($result, $this->flatten($val, $l+1));
			}
		}
		return $result;
	}
	
	// array(
		// array('id' => 1, '#tag' => 7),
		// array('id' => 2, '#tag' => 8),
		// ...
	// )
	public function bind($data){
		
		foreach($data as $arr){
			foreach($arr as $k=>$v){
				if($k != 'id'){
					$this->data[$k][$arr['id']] = $v;
				}
			}
		}
	}
	
	protected function apply(&$data){
		
		foreach($data['data'] as $k=>$v){
			foreach($this->data as $key=>$arr){
				$data['data'][$k][$key] = $this->data[$key][$v['id']] ?? '';
			}
		}
	}
	
	protected function tree(&$data){
		
		if($this->tree['col'] !== null){
			$offset = $this->tree['offset'];
			$sub = $this->tree['sub'][1];
			$dsub = $this->tree['sub'][0];
			$alias = $this->tree['alias'];
			$col = $this->col_en[$this->tree['col']];
			
			foreach($data['data'] as $k=>$v){
				foreach($this->config['sum'] ?? [] as $key){
					$this->data[$key][$v['id']] = $v[$key] ?? 0;
				}
			}
			
			foreach($data['data'] as $k=>$v){
				foreach($this->config['sum'] ?? [] as $key){
					$sum = 0;
					$sum += ($this->data[$key][$v['id']] ?? 0);
					foreach($sub[$v['id']] as $c){
						$sum += $this->data[$key][$c] ?? 0;
					}
					$data['data'][$k][$key] = $sum;
				}
				
				if($this->config['level'] ?? 0){
					$data['data'][$k][$col] = ($offset[$v['id']] < ($this->config['level'] ?? 0) -1)? '(' . count($dsub[$v['id']]) . ')': '';
				}else{
					$data['data'][$k][$col] = count($dsub[$v['id']])? '(' . count($dsub[$v['id']]) . ')': '';
				}
			}
		}
	}
	
	protected function split($str, $case = ''){
		
		$result = [];
		$regex = [
			'/,[\s]*/', // with a leading comma
			'/[\s]+/',  // at least one space
		];
		switch($case){
			case 'chain':
				$arr = preg_split($regex[0], $str, 4);
				$arr[3] = json_decode($arr[3] ?? '[]', true);
				$result = $arr;
				break;
			case 'label':
				$result = preg_split($regex[0], $str, 2);
				break;
			case 'space':
				$result = preg_split($regex[1], trim($str));
				break;
			default:
				$result = preg_split($regex[0], $str);
				break;
		}
		
		return $result;
	}
}
