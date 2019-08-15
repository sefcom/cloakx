(function (root) {
	var d = document,
		Tagger = function (element) {
			var self = this,
				input_listen = function (e) {
					if (e.keyCode === 8 && !e.target.value) {
						self.pop_item();
					}
					if (~self.key_codes.indexOf(e.keyCode) && e.target.value) {
						self.add_item(e.target.value);
						e.preventDefault();
					}
					return false;
				},
				x_listen = function (e) {
					self.pop_item(e.target.parentElement.id);
				},
				focus = function () {
					self.input.focus();
				};

			this.key_codes = [9, 13];

			this.add_ext = function () {
				this.ext = d.createElement('div');
				this.ext.setAttribute('class', 'tagger-ext');
				this.parent.insertBefore(this.ext, element.nextSibling);
				this.ext.addEventListener('click', focus);
			};

			this.add_input = function () {
				this.input = d.createElement('input');
				this.input.addEventListener('keydown', input_listen);
				this.ext.appendChild(this.input);
				this.input = this.ext.firstChild;
			};

			this.add_item = function (item) {
				var id = 'tgr_' + (+new Date),
					temp,
					span,
					i,
					x;

				for (i in this.items) {
					if (this.items[i].value === item) {
						return;
					}
				}

				x = d.createElement('div');
				x.textContent = ' ';
				x.setAttribute('class', 'tagger-x')
				x.addEventListener('click', x_listen);

				span = d.createElement('span');
				span.setAttribute('class', 'tagger-item');
				span.setAttribute('title', item);
				span.setAttribute('id', id);
				span.value = item;
				temp = item.substring(0, 45);
				span.textContent = temp.length === 45? temp + '...' : temp;
				span.appendChild(x);
				this.ext.insertBefore(span, this.input);
				this.input.value = '';

				this.items[id] = span;
				this.update_value();
			};

			this.pop_item = function (_key) {
				var keys = Object.keys(this.items),
					key;

				if (!keys.length) {
					return;
				}

				key = _key || keys[keys.length - 1];
				this.ext.removeChild(this.items[key]);
				delete this.items[key];
				this.input.focus();
				this.update_value();
			};

			this.set_item = function (_key) {
				var key;

				for (key in this.items) {
					this.ext.removeChild(this.items[key]);
				}

				this.items = {};
				if (_key) {
					this.add_item(_key);
				}
				else {
					this.update_value();
				}
			};

			this.update_value = function () {
				var temp = [],
					i;

				for (i in this.items) {
					temp.push(this.items[i].value);
				}

				this.main.value = temp.join('|');

				if ('createEvent' in document) {
				    var evt = document.createEvent('HTMLEvents');
				    evt.initEvent('change', false, true);
				    this.main.dispatchEvent(evt);
				}
				else
				    this.main.fireEvent('onchange');
			};

			this.items = {};

			this.main = element;
			this.parent = element.parentElement;
			this.add_ext();
			element.style.display = 'none';
			this.add_input();
		};

	root.Tagger = Tagger;
}(this));
