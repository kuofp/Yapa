<?php

class Yapa{
	
	public $unique_id;
	
	public $url;
	private $table;
	public $col_en = [];
	public $col_ch = [];
	private $join = [];
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
	
	public function __construct($url, $table, $col_en, $col_ch, $join, $show, $type, $auth, $medoo, $config = []){
		
		$this->unique_id = 'form' . uniqid();
		
		$this->url = $url;
		$this->table = $table;
		
		// separate label and info
		$label = [];
		foreach($col_ch as $v){
			$tmp = $this->split($v, 'label');
			$label[0][] = $tmp[0] ?? '';
			$label[1][] = $tmp[1] ?? '';
		}
		
		// join
		$chain = [];
		$tree = ['col' => null];
		foreach($join as $k=>$v){
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
			$tmp = $v? $this->split($v, 'space'): '';
			$hide[] = (in_array('hidden', $tmp) && $col_en[$k] != 'id')? 1: 0;
			
			foreach(array_intersect(['disabled', 'disabled-create', 'disabled-modify'], $tmp) as $w){
				$attr[1][$k][$w] = 1;
			}
		}
		
		$this->col_en = $col_en;
		$this->col_ch = $label[0];
		$this->info = $label[1];
		$this->join = $chain;
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
		
		$this->col_num = $this->count($col_en);
		$this->uid = 0;
		
		$this->tpl = new Yatp(__DIR__ . '/assets/view.html');
		
		$this->decodeJson();
	}
	
	public function script(){
		
		$lang = new Yatp(__DIR__ . '/assets/lang.php');
		echo file_get_contents(__DIR__ . '/assets/script.js') . $lang->render(false);
	}
	
	public function css(){
		
		$this->tpl->block('css')->render();
	}
	
	public function decodeJson(){
		
		$pdata = $_REQUEST;
		
		if(isset($pdata['jdata'])){
			$jdata = json_decode($pdata['jdata'], true);
			
			//must keep keys 'data' and 'where', but remove empty array in where key
			//array( 'data' => array())                   got error
			//array( 'where' => array())                  got error
			//array( 'where' => array( 'AND' => array())) got error
			//do not remove empty array in data key
			//array( 'data' => array(name=>''))           will be removed
			
			$method = $jdata['method'] ?? '';
			$pdata = [
				'data' => $jdata['pdata']['data'] ?? [],
				'where' => array_filter($jdata['pdata']['where'] ?? []),
			];
			
			if(in_array($method, ['create', 'modify', 'delete'])){
				// decode serialize() from js
				$arr_tmp = explode('&', $pdata['data']);
				$arr_tmp2 = [];
				foreach($arr_tmp as $v){
					$s = explode('=', $v);
					$arr_tmp2[$s[0]][] = urldecode($s[1]);
				}
				$data = [];
				foreach($arr_tmp2 as $k=>$v){
					$data[$k] = implode(',', $v);
				}
				$pdata['data'] = $data;
				// unset disabled cols when create and modify
				for($i = 0; $i < $this->col_num; $i++){
					if(($this->attr[$i]['disabled'] ?? 0) || ($this->attr[$i]['disabled-' . $method] ?? 0)){
						unset($pdata['data'][$this->col_en[$i]]);
					}
				}
			}
			
			$this->act = $method;
			$this->arg = $pdata;
		}else{
			$this->act = $_REQUEST['method'] ?? '';
			$this->arg = '';
		}
	}
	
	public function reviewTool(){
		
		if(!$this->auth[0]){ return;}
		
		$th = [];
		for($i = 0; $i < $this->col_num; $i++){
			// order settings
			if($this->hide[$i]) continue;
			$th[] = [
				'class' => $this->show[$i] . (($this->type[$i] != 'value')? ' yb-order': ''),
				'name'  => $this->col_en[$i],
				'text'  => $this->col_ch[$i],
			];
		}
		
		$this->tpl->block('main')->assign([
			'unique_id' => $this->unique_id,
			'url'       => $this->url,
			'tr'        => '',
			'th'        => $this->tpl->block('main.th')->nest($th),
			'search'    => $this->config['search'] ?? $this->tpl->block('main.search')->render(false),
			'modal'     => $this->genFormModal(),
			'config'    => json_encode([
				'create_more' => $this->config['create_more'] ?? false,
				'module' => $this->config['module'] ?? [],
				'search_adv' => $_REQUEST['query'] ?? [],
				'admin' => $this->config['admin'] ?? '',
				'tree' => $this->col_en[$this->tree['col']] ?? '',
				'type' => $this->type,
				'max' => $this->config['perpage'] ?? 50,
				'col' => $this->col_en,
				'auth' => $this->auth,
			], JSON_UNESCAPED_UNICODE),
		])->render();
	}
	
	public function review($pdata, $callback = ''){
		
		$datas = $this->getData($pdata);
		
		// apply outer data
		$this->apply($datas);
		
		// tree view
		$this->tree($datas);
		
		foreach($datas['data'] as $k=>$v){
			for($i = 0; $i < $this->col_num; $i++){
				if($this->attr[$i]['i18n'] ?? 0){
					$text = $v[$this->col_en[$i]] ?? '';
					$text = $text? _($text): '';
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
			return ['text' => $v];
		}, $this->col_ch);
		
		$block = $style? 'table.print': 'main';
		
		$tr = [];
		
		foreach($datas['data'] as $k=>$v){
			$td = [];
			for($i = 0; $i < $this->col_num; $i++){
				if($style == '' && $this->hide[$i]) continue;
				$tree = (($this->tree['col'] === $i)? ' yb-tree func': '');
				$td[] = [
					'class' => $this->show[$i] . $tree,
					'name'  => $this->col_en[$i],
					'text'  => ($tree? '<a href="#">': '') . $this->e($v[$this->col_en[$i]] ?? '') . ($tree? '</a>': ''),
				];
			}
			
			$tree = $this->tree['col']? ($this->tree['sub'][2][$v['id']] ?? ''): '';
			$tr[] = [
				'td' => $this->tpl->block($block . '.td')->nest($td)->render(false),
				'attr' => 'data-id="' . $v['id'] . '" class="yb-row ' . $tree . '"',
			];
		}
		
		switch($style){
			case 'print':
			case 'excel':
				$html = $this->tpl->block($block)->assign([
					'th' => $this->tpl->block($block . '.th')->nest($th),
					'tr' => $this->tpl->block($block . '.tr')->nest($tr),
				]);
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
			$result = ['code' => 0, 'data' => $html, 'cnt' => $this->count($datas['data'])];
			$result = json_encode($result, JSON_UNESCAPED_UNICODE);
		}
		
		return $result;
	}
	
	public function create($pdata){
		
		if(!$this->auth[1]){ return;}
		
		$pdata['data']['id'] = 0; //clear id, create don't need id
		$data = $this->database->insert($this->table, $pdata['data']);
		
		if($data->rowCount()){
			$result = ['code' => 0, 'data' => $this->database->id(), 'text' => '新增成功'];
		}else{
			$result = ['code' => 1, 'text' => '操作失敗'];
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function modify($pdata){
		
		if(!$this->auth[2]){ return;}
		
		$pdata['where']['AND']['id'] = $pdata['data']['id'];
		$data = $this->database->update($this->table, $pdata['data'], $pdata['where']);
		
		if($data->rowCount()){
			$result = ['code' => 0, 'data' => $pdata['where']['AND']['id'], 'text' => '已儲存'];
		}else{
			$result = ['code' => 0, 'data' => $pdata['where']['AND']['id'], 'text' => '已儲存, 無任何變更'];
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function delete($pdata){
		
		if(!$this->auth[3]){ return;}
		
		$pdata['where']['AND']['id'] = $pdata['data']['id'];
		$data = $this->database->delete($this->table, $pdata['where']);
		
		if($data->rowCount()){
			$result = ['code' => 0, 'data' => $pdata['where']['AND']['id'], 'text' => '已刪除'];
		}else{
			$result = ['code' => 1, 'text' => '操作失敗'];
		}
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function upload(){
		
		if(!$this->auth[1] && !$this->auth[2]){ return;}
		
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
		
		return json_encode($result, JSON_UNESCAPED_UNICODE);
	}
	
	public function genFormModal(){
		
		$preset = array_replace_recursive(($this->config['preset'] ?? []), ($_REQUEST['preset'] ?? []));
		
		$tr = [];
		for($i = 0; $i < $this->col_num; $i++){
			
			$tpl = '';
			$pre = $preset[$this->col_en[$i]] ?? ''; //靜態預設值(Preset)用於載入子分頁, 點擊新增時Reset可回復到預設值
			
			if(in_array($this->type[$i], ['value'])){
				continue;
			}
			
			if(in_array($this->type[$i], ['select', 'radiobox', 'checkbox'])){
				$arr_tmp = $this->join[$i];
				$datas = $this->database->select($arr_tmp[0], '*', $arr_tmp[3]);
				
				$tpl = [];
				foreach($datas as $arr){
					$text = $arr[$arr_tmp[1]];
					if($this->attr[$i]['i18n'] ?? 0){
						$text = $text? _($text): '';
					}
					if(!$text){ continue;}
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
				'value' => $pre,
				'meta'  => $this->col_ch[$i],
				'name'  => $this->col_en[$i],
				'func'  => '_' . $this->type[$i],
				'info'  => $this->info[$i],
				'uid'   => $this->getUid(),
				'arg' => json_encode([
					'tpl' => $tpl,
					'max' => $this->attr[$i]['max'] ?? 1,
					'url' => $this->url,
				], JSON_UNESCAPED_UNICODE),
			]);
			
			$tmp = $this->split($this->show[$i], 'space');
			$arr = [];
			foreach($tmp as $v){
				if(in_array($v, [$this->type[$i], 'hidden-create', 'hidden-modify', 'disabled', 'disabled-create', 'disabled-modify'])){
					$arr[] = $v;
				}
			}
			
			$tr[] = [
				'class' => implode(' ', $arr),
				'td' => array($td),
			];
		}
		
		$tpl = $this->tpl->block('modal-detail')->assign([
			'unique_id' => $this->unique_id,
			'html' => $this->config['modal']['html'] ?? '',
			'tr' => $this->tpl->block('modal-detail.tr')->nest($tr),
		]);
		
		return $tpl;
	}
	
	public function getJson($pdata){
		
		if(!$this->auth[0]){ return;}
		
		if($pdata['data']['autocomplete'] ?? 0){
			
			for($i = 0; $i < $this->col_num; $i++){
				if($this->col_en[$i] == $pdata['data']['autocomplete']){
					$arr_tmp = $this->join[$i];
					$table = $arr_tmp[0];
					$arr_col = [
						$arr_tmp[1] . '(label)',
						$arr_tmp[2] . '(val)', // 'value' will be inserted into the input automatically, 'val' won't
					];
					
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
	
	public function getData($pdata){
		
		if(!$this->auth[0]){ return;}
		
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
			if($this->join[$i]){
				if(!in_array($this->type[$i], ['checkbox', 'autocomplete'])){
					$arr_tmp = $this->join[$i];
					$arr_col[$i] = 't' . $i . '.' . $arr_tmp[1] . '(' . $this->col_en[$i] . ')';
					$arr_chain['[>]' . $arr_tmp[0] . '(t' . $i . ')'] = [$this->col_en[$i] => $arr_tmp[2]];
				}
			}
			// keep original id
			$arr_col[$i + $this->col_num] = $this->table . '.' . $this->col_en[$i] . '(__' . $this->col_en[$i] . ')';
		}
		
		if($this->tree['col'] !== null){
			$col = $this->col_en[$this->tree['col']];
			$arr_tmp = $this->join[$this->tree['col']];
			$datas = $this->database->select($arr_tmp[0], [$arr_tmp[1], $arr_tmp[2], $col]);
			
			$tmp = [];
			foreach($datas as $v){
				$tmp[$v['id']] = $v[$col];
			}
			
			$sub = $this->treeSub($tmp);
			$order = $this->flatten($this->toTree($tmp));
			
			$offset = [];
			foreach($order as $k=>$v){
				$offset[$v] = explode(',', $k)[1];
			}
			
			$this->tree['offset'] = $offset;
			$this->tree['sub'] = $sub;
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
				if($this->count(array_diff($id, $ids)) != 0){
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
			
			foreach($keyword as $k=>$word){
				if($word){
					for($i = 0; $i < $this->col_num; $i++){
						// skip
						if(in_array($this->type[$i], ['value', 'password', 'uploadfile', 'datepicker'])) continue;
						if($this->tree['col'] === $i) continue;
						
						if(in_array($this->type[$i], ['checkbox', 'autocomplete'])){
							$arr_tmp = $this->join[$i];
							$ids = $this->database->select($arr_tmp[0], $arr_tmp[2], [$arr_tmp[1] . '[~]' => $word, 'LIMIT' => 1000]);
							if($ids){
								// find in a comma separated string (not a precise approach yet)
								$arr_search[$this->table . '.' . $this->col_en[$i] . '[~]'] = $ids;
							}
							
						}else if($this->join[$i]){
							$arr_tmp = $this->join[$i];
							$arr_search['t' . $i . '.' . $arr_tmp[1] . '[~]'] = $word;
						}else{
							$arr_search[$this->table . '.' . $this->col_en[$i] . '[~]'] = $word;
						}
					}
					$pdata['where']['AND']['OR #muti keyword' . $k] = $arr_search;
				}
			}
			unset($pdata['where']['SEARCH']);
		}
		
		//search advance
		if($pdata['where']['SEARCH_ADV'] ?? 0){
			
			$adv = $pdata['where']['SEARCH_ADV'];
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
		
		$where = $pdata['where'] ?? '';
		if($arr_chain){
			$datas = $this->database->select($this->table, $arr_chain, $arr_col, $where);
		}else{
			$datas = $this->database->select($this->table, '*', $where);
		}
		
		if($datas){
			$arr_mark = [];
			$cnt_datas = $this->count($datas);
			
			for($j = 0; $j < $this->col_num; $j++){
				switch($this->type[$j]){
					case 'checkbox':
						$arr_mark[$j] = [];
						$arr_tmp = $this->join[$j];
						$datas_checkbox = $this->database->select($arr_tmp[0], [$arr_tmp[1], $arr_tmp[2]]);
						
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
						$arr_tmp = $this->join[$j];
						$datas_checkbox = $this->database->select($arr_tmp[0], [$arr_tmp[1], $arr_tmp[2]], [$arr_tmp[2] => $ids]);
						
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
		
		$result = ['data' => $datas, 'cnt' => $this->count($datas)];
		
		return $result;
	}
	
	public function getUid(){//get unique id for html tags for this file
		return $this->unique_id . '_uid_' . $this->uid++;
	}
	
	public function render($option = []){
		$this->config = array_merge($this->config, $option);
		$this->reviewTool();
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
			$arr[$k] = 'p_' . ((in_array($k, $this->config['root']) || !isset($tree[$v]))? '0': $v);
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
	
	protected function flatten($arr, $l = 0){
		$result = [];
		foreach($arr as $key=>$val){
			$result[$key . ',' . $l] = $key;
			if(is_array($val) && $this->count($val)){
				$result = array_merge($result, $this->flatten($val, $l+1));
			}
		}
		return $result;
	}
	
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
			$col = $this->col_en[$this->tree['col']];
			
			foreach($data['data'] as $k=>$v){
				foreach($this->config['sum'] ?? [] as $key){
					$this->data[$key][$v['id']] = $v[$key] ?? 0;
				}
			}
			
			foreach($data['data'] as $k=>$v){
				foreach($this->config['sum'] ?? [] as $key){
					$sum = 0;
					$sum += (float)($this->data[$key][$v['id']] ?? 0);
					foreach($sub[$v['id']] as $c){
						$sum += (float)($this->data[$key][$c] ?? 0);
					}
					$data['data'][$k][$key] = $sum;
				}
				
				if($this->config['level'] ?? 0){
					$data['data'][$k][$col] = ($offset[$v['id']] < ($this->config['level'] ?? 0) -1)? '(' . $this->count($dsub[$v['id']]) . ')': '';
				}else{
					$data['data'][$k][$col] = $this->count($dsub[$v['id']])? '(' . $this->count($dsub[$v['id']]) . ')': '';
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
	
	protected function count($tmp){
		// php 7.2 issue
		return count((array)$tmp);
	}
}
