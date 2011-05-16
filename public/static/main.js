!function($, window) { try {


var resources = {
	'Wood'           : { tab: 1 },
	'Plank'          : { },
	'Stone'          : { },
	'Fish'           : { },
	'EventResource'  : { name: 'Easter egg' },
	'Coal'           : { tab: 2 },
	'BronzeOre'      : { },
	'Bronze'         : { },
	'Tool'           : { },
	'Water'          : { },
	'Corn'           : { },
	'Beer'           : { },
	'Flour'          : { },
	'Bread'          : { },
	'BronzeSword'    : { },
	'Bow'            : { },
	'RealWood'       : { tab: 3 },
	'RealPlank'      : { },
	'IronOre'        : { },
	'Iron'           : { },
	'Steel'          : { },
	'GoldOre'        : { },
	'Gold'           : { },
	'Coin'           : { },
	'Marble'         : { },
	'Meat'           : { },
	'Sausage'        : { },
	'Horse'          : { },
	'IronSword'      : { },
	'SteelSword'     : { },
	'Longbow'        : { },
	'ExoticWood'     : { tab: 4 },
	'ExoticPlank'    : { },
	'TitaniumOre'    : { },
	'Titanium'       : { },
	'Salpeter'       : { },
	'Gunpowder'      : { },
	'Granite'        : { },
	'Wheel'          : { },
	'Carriage'       : { },
	'TitaniumSword'  : { },
	'Crossbow'       : { },
	'Cannon'         : { },
};

var id, res, tab = 1;
for (id in resources) {
	res = resources[id];
	tab = res.tab || (res.tab = tab);
	res.name || (res.name = id.replace(/([a-z])([A-Z]+)/g, function($0, $1, $2) { return $1 + ' ' + $2.toLowerCase() }));
	res.icon = '/images/' + id.toLowerCase() + '.png';
};


$.browser.storage = 'localStorage' in window && window['localStorage'] !== null;
if ($.browser.storage) {
	$.storage = {
		set : function(key, val) {
			window.localStorage.setItem(key, JSON.stringify(val));
			return this;
		},
		get : function(key, def) {
			var val = window.localStorage.getItem(key);
			return val == null ? def : JSON.parse(val);
		},
		del : function(key) {
			window.localStorage.removeItem(key);
			return this;
		}
	};
};

// Заменяет стандартный select удобной плюшкой с картинками ресурсов
function resourceSelector(elems) {
	
	return $(elems).each(function() {
		
		var $select = $(this), $wrap, $icon, $name, $pane, tab;
		
		var $wrap = $(
			'<div class="select-wrap">' + 
				'<div class="select-selected">' +
					'<img src="" />' +
					'<span></span>' +
				'</div>' +
				'<div class="select-pane"></div>' +
			'</div>'
		);
		$icon = $wrap.find('.select-selected > img');
		$name = $wrap.find('.select-selected > span');
		$pane = $wrap.find('.select-pane');
		
		// заполняем всплывающую панельку картинками ресурсов
		$.each(resources, function(resourceId, resource) {
			if (tab && resource.tab !== tab) {
				$pane.append('<hr>'); // разделяем ресурсы с разных табов
			};
			tab = resource.tab;
			$('<img />').prop({
				src: resource.icon,
				title: resource.name
			}).appendTo($pane).click(function() {
				$select.val(resourceId).trigger('change'); // меняем значение в стандартном элементе и дёргаем onchange (см. ниже)
				$pane.hide();
			});
		});
		
		$select.after($wrap).hide().bind('change', function() { // это чтобы из других плюшек можно было делать trigger('change')
			var resource = resources[this.value];
			$icon.prop('src', resource.icon); // меняем иконку на иконку выбранного ресурса
			$name.text(resource.name); // и имя
		}).trigger('change'); // обновляем плюшку текущим значением
		
		$wrap.hover(
			function() { $pane.show(); },
			function() { $pane.hide(); }
		);
	});
	
};

// добавляет на страницу торговли шаблоны
function tradeTemplates() {
	
	if (!$.browser.storage) return false;
	var $form = $('form:first'), form = $form.get(0);
	if (!$form.length) return false;
	var $fields = $form.find('*[name]');
	if (!$fields.length) return false;
	var storeName = 'tradeTemplates';
	var lastUsedName = 'Последний использованный';
	var templates = $.storage.get(storeName, {});
	
	var $select, select, $options = {}, $saveButton, $removeButton, $submitButton, $lastUsed = null;

	var $table = $form.find('table:first');
	if (!$table.length) return false;
	
	var $row = $('<tr />');
	
	$row.append('<td>Шаблон:</td>');
	
	var $select = $('<select />'), select = $select.get(0), $option;
	for (var name in templates) {
		$option = addOption(name, name == lastUsedName);
		if (name == lastUsedName) {
			$lastUsed = $option;
		};
	};
	if ($lastUsed) {
		select.selectedIndex = $lastUsed.prop('index');
	};
	$row.append($('<td />').append($select));
	$select.bind('change', function() {
		if (select.selectedIndex > -1) {
			setTemplate(templates[select.value]);
		};
		availability();
	});
	
	var $td = $('<td />');
	$saveButton = $('<input type="button" value="Сохранить" />').click(function() {
		var name = $form.find('[name=recepient] :selected').text() + ': ' + $form.find('[name=offer_c]').val() + ' ' + resources[$form.find('[name=offer_s]').val()].name + ' / ' + $form.find('[name=cost_c]').val() + ' ' + resources[$form.find('[name=cost_s]').val()].name;
		name = prompt('Наименование шаблона', name);
		if (!name) return;
		templates[name] = getTemplate();
		var $option = $options[name] || addOption(name);
		select.selectedIndex = $option.prop('index');
		update();
		availability();
	}).appendTo($td);
	
	$removeButton = $('<input type="button" value="Удалить" />').click(function() {
		if (select.selectedIndex < 0) return;
		if (!confirm('Подтверждаете удаление "' + select.value + '"?')) return;
		delete templates[select.value];
		removeOption(select.value);
		update();
		availability();
	}).appendTo($td);
	$td.appendTo($row);
	
	$form.find('input[type=submit]').click(function() {
		templates[lastUsedName] = getTemplate();
		update();
	});
	
	$select.trigger('change');
	$table.prepend($row);
	
	return true;


	function addOption(name, prepend) {
		return $options[name] = $('<option>' + name + '</option>')[prepend ? 'prependTo' : 'appendTo']($select);
	};
	
	function removeOption(name) {
		$options[name].remove();
		delete $options[name];
	};
	
	// получает текущие значения полей формы как шаблон { field_name : field_value, ... }
	function getTemplate() {
		var temp = {};
		$fields.each(function() {
			temp[this.name] = this.value;
		});
		return temp;
	};
	
	// устанавливает шаблон в значения полей формы
	function setTemplate(temp) {
		$fields.each(function() {
			if (temp.hasOwnProperty(this.name)) {
				this.value = temp[this.name];
				$(this).trigger('change');
			};
		});
	};
	
	// сохранить текущие шаблоны в хранилище
	function update() {
		$.storage.set(storeName, templates);
	};
	
	// доступность элементов управления
	function availability() {
		$removeButton.prop('disabled', select.selectedIndex == -1);
	};

};

function ready() {
	if (/\/trade(\?.+)?$/.test(window.location)) { // we better use <body id="trade-page"> or smth and test it instead
		resourceSelector('#offer_s, #cost_s');
		tradeTemplates();
	};
};


if (typeof chrome !== 'undefined' && chrome.extension) { // debugging as chrome extension
	ready();
} else if (!/\?debug[^\/]*$/.test(window.location)) { // do not run script in debug mode
	$(document).ready(ready);
};



} catch (err) {

	if ('console' in window && window.console != null) {
		console.error(err);
	};

};

}(jQuery, window);
