(function (window) {

	var sock, win, members;

	function GroupChat(roomId, roomName, encryption) {
		this.roomId = roomId;
		this.roomName = roomName;
		this.encryption = encryption;
		this.msgCount = 0;
		this.initialize();
	}

	GroupChat.prototype.initialize = function () {
		var me = this;
		//_.loadCss('http://meet.xpro.im/xchat/xchat.css');
		_.loadCss('xchat.css');
		
		var name = me.name = _.cookies.getItem('xmeetName') || generateName();
		if (win) {
			win.show();
		} else {
			me.createChatWindow(name);
		}

		me.originTitle = document.title;
	};

	GroupChat.prototype.startShine = function (count) {
		var me = this;
		var nos = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑩+'];
		_.dom.css('.xmeet-chat-logo', 'background', '#32C8F6');
		me.shineTimer && clearTimeout(me.shineTimer);
		me.shineTimer = setTimeout(function () {
			_.dom.css('.xmeet-chat-logo', 'background', '#e0e0e0');
			me.shineTimer && clearTimeout(me.shineTimer);
			me.shineTimer = setTimeout(function () {
				me.startShine();
			}, 500);
		}, 500);
		if (count) {
			me.msgCount += 1;
			me.msgCount > 10 && (me.msgCount = 10);
			shineTitle();
		}

		function shineTitle() {
			document.title = '●' + nos[me.msgCount] + ' ' + me.originTitle;
			me.titleTimer && clearTimeout(me.titleTimer);
			me.titleTimer = setTimeout(function () {
				document.title = '○' + nos[me.msgCount] + ' ' + me.originTitle;
				me.titleTimer && clearTimeout(me.titleTimer);
				me.titleTimer = setTimeout(function () {
					shineTitle();
				}, 1000);
			}, 1000);
		}
	};
	GroupChat.prototype.stopShine = function () {
		this.shineTimer && clearTimeout(this.shineTimer);
		this.titleTimer && clearTimeout(this.titleTimer);
		document.title = this.originTitle;
		this.msgCount = 0;
	};

	GroupChat.prototype.createChatWindow = function (name) {
		var me = this;
		if (!sock) {
			sock = new SocketChat(me.name, me.roomId, me.roomName, me.encryption);
			sock.on('connected', function (data) {
				win = new GroupChatWindow(data.roomId, me.roomName, {
					uid: data.from,
					name: name
				});
				me.bindChatEvent();
			});

			sock.on('members', function (data) {
				members = {};
				for (var i = data.content.length; i > 0; i--) {
					var u = data.content[i - 1];
					members[u.pid] = {
						uid: u.pid,
						name: u.nickname
					};
				}
				win && win.updateUsers(members);
			});

			sock.on('joined', function (data) {
				members[data.from] = {
					uid: data.from,
					name: data.content
				};
				var u = members[data.from];
				win && win.receiveMessage('notice', u.name + '&nbsp;&nbsp;轻轻的来了', u);
				win && win.updateUsers(members);
				win && !win.isShow && me.startShine(true);
			});

			sock.on('leaved', function (data) {
				var user = members[data.from];
				win && win.receiveMessage('notice', user.name + '&nbsp;&nbsp;悄悄的走了', user);
				delete members[data.from];
				win && win.updateUsers(members);
				win && !win.isShow && me.startShine(true);
			});

			sock.on('changeName', function (data) {
				var user = members[data.from];
				win && win.receiveMessage('notice', user.name + '&nbsp;&nbsp;使用了新名字&nbsp;&nbsp;' + data.content, user);
				members[data.from] = {
					uid: data.from,
					name: data.content
				};
				win && win.updateUsers(members);
				win && !win.isShow && me.startShine(true);
			});

			sock.on('history', function (data) {
				data.content.forEach(function (msg) {
					var u = members[msg.from];
					if (!u) {
						u = {
							uid: msg.from,
							name: generateName()
						}
					}
					win && win.receiveMessage('history', new FilterChain(msg.payload).filter('emotionIn'), u, msg.send_time);
				});
				if (data.content.length > 0) {
					win && win.receiveMessage('system', "以上是历史消息", {
						uid: ''
					});
				}
			});

			sock.on('receive', function (data) {
				var u = members[data.from];
				if (u) {
					win && win.receiveMessage('message', new FilterChain(data.content).filter('emotionIn'), u, data.time);
					win && !win.isShow && me.startShine(true);
				}
			});
		}
	};

	GroupChat.prototype.bindChatEvent = function () {
		win.on('send', function (data) {
			sock.send(new FilterChain(data.message).filter('emotionOut'));
		});

		win.on('changeName', function (data) {
			sock.send(data.message);
		});

		win.on('hide', function (data) {
			_.dom.show('.xmeet-chat-logo');
		});
	};

	function generateName() {
		var names = {
			'Cat': '凯特',
			'Dog': '多格',
			'Zebra': '泽布拉',
			'Rihno': '蕾哈娜',
			'Elephant': '爱丽芬',
			'Hippo': '黑普',
			'Giraffe': '格拉菲',
			'Duck': '达克',
			'Leopard': '莱昂帕多',
			'Goose': '古斯',
			'Lion': '莱恩',
			'Fox': '福克斯',
			'Wolf': '沃尔夫',
			'Tigger': '泰格',
			'Beatles': '比特斯', //甲壳虫
			'Eagle': '伊格',
			'Goat': '勾特',
			'Python': '派森',
			'Cobra': '科波拉',
			'Monkey': '芒可',
			'Octopus': '奥克托帕斯', //章鱼
			'Tortoise': '托特斯',
			'Horse': '霍斯',
			'Panda': '胖达',
			'Kaola': '考拉',
			'Boar': '伯恩', //野猪
			'Squirrel': '斯奎尔',
			'Rabbit': '拉比特',
			'Sardine': '沙丁', //沙丁鱼
			'Salmon': '莎尔蒙', //鲑鱼
			'Sloth': '斯洛兹', //树懒
			'buffalo': '巴伐罗', //水牛
			'gnu': '格鲁', //角马
			'jellyfish': '杰丽菲诗',
			'shark': '沙奎尔',
			'crocodile': '克拉克戴尔', //
			'penguin': '平格温',
			'pigeon': '匹金',
			'bat': '波特', //蝙蝠
			'lizard': '李札特', //蜥蜴
			'mosquito': '马斯奎特', //蚊子
			'frog': '弗洛格', //蚊子
			'squid': '斯奎德', //乌贼
			'lobster': '罗伯斯特', //龙虾
			'ant': '安特',
			'butterfly': '巴特弗莱',
			'flamingo': '弗拉明戈', //火烈鸟
			'peacock': '皮科克', //孔雀
			'swan': '斯万', //天鹅
			'spider': '斯派德尔', //蜘蛛
			'owl': '欧尔',
			'ostrich': '奥斯纯齐', //鸵鸟
			'camel': '凯梅尔',
			'crab': '克拉伯',
			'mongoose': '芒古斯', //猫鼬
			'deer': '迪尔',
			'antelope': '艾迪路普', //羚羊
			'mustang': '木斯唐', //野马
		};
		var keys = Object.keys(names);
		var nn = names[keys[Math.floor(keys.length * Math.random())]];
		_.cookies.setItem('xmeetName', nn, Infinity);
		return nn;
	}

	function getTemplate(name, fn) {
		_.ajax.get('/api/' + name, null, function (text) {
			fn(text);
		});
	}

	var xmeet = {
		Chat: function (roomId, roomName, encryption) {
			var groupChat = new GroupChat(roomId, roomName, encryption);
		}
	};

	window.XMeet = xmeet;

	//boot
	window.onload = function () {
		var params = location.href.split('/');
		var roomId = '';
		if(params.length > 3){
			roomId = params[params.length-1];
		}
		var roomName = '';
		var encryption = false;
		new XMeet.Chat(roomId, roomName, encryption);
	}

})(window);