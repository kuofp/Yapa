
function _gettext(str){
	var i18n = {
		'Reload the page and try again': '<?=_('Reload the page and try again')?>',
		'Are you sure to DELETE this?': '<?=_('Are you sure to DELETE this?')?>',
		'Search': '<?=_('Search')?>',
		'Add': '<?=_('Add')?>',
		'Save': '<?=_('Save')?>',
		'Save and continue': '<?=_('Save and continue')?>',
		'Delete': '<?=_('Delete')?>',
		'Print': '<?=_('Print')?>',
		'Export to xls': '<?=_('Export to xls')?>',
		'Back to previous level': '<?=_('Back to previous level')?>',
		'Reach the bottom of list': '<?=_('Reach the bottom of list')?>',
		'Show more items +': '<?=_('Show more items +')?>',
		'Loading': '<?=_('Loading')?>',
		'Detail': '<?=_('Detail')?>',
	};
	
	return i18n[str] || str;
}
