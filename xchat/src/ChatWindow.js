function GroupChatWindow(roomId, roomName, self) {
	this._eventsListener = {};
	this.roomId = roomId;
	this.roomName = roomName;
	this.self = self;
	this.init();
	this.isShow = true;
}


GroupChatWindow.prototype.init = function () {
	var me = this;

	var tpl = __inline('./xmeet-chatWindow.tpl');
	var nodes = _.dom.create(tpl);
	document.body.appendChild(nodes[0]);
	me.node = nodes[0];
	
	_.dom.get('.xmeet-chat-window .window-body')[0].style.height = (window.screen.availHeight -110) + 'px';

	setTimeout(function () {
		me.setupEmotion();
	}, 2000);

	_.dom.get('.xmeet-chat-window .title')[0].innerHTML = me.roomName;
	_.dom.get('.setting-panel .nickName')[0].value = me.self.name;

	_.dom.on('.window-title .exit', 'click', function (e) {
		me.isShow = false;
		me.hide();
	});

	_.dom.on('.icon-emotion', 'click', function (e) {
		_.dom.toggle('.emotion-panel');
	});

	_.dom.on('.chat-send', 'click', function (e) {
		me.sendMessage();
	});

	_.dom.on('.chat-input', 'keydown', function (e) {
		if (e.which == 13) {
			me.sendMessage();
			e.stopPropagation();
			e.preventDefault();
		}
		// me.startTyping();
	});

	_.dom.on('.nickName', 'change', function (e) {
		if (e.target.value) {
			me.self.name = e.target.value;
			me.dispatch('changeName', {
				message: '@changename:' + me.self.name,
				from: me.self
			});
			_.cookies.setItem('xmeetName', me.self.name, Infinity);
		}
	});

	var setPanel = _.dom.get('.setting-panel')[0];
	var userPanel = _.dom.get('.userList-panel')[0];
	var setIcon = _.dom.get('.window-title .setting')[0];
	var userIcon = _.dom.get('.window-title .userList')[0];
	var setClose = _.dom.get('.setting-panel .close-panel')[0];
	var userClose = _.dom.get('.userList-panel .close-panel')[0];

	_.dom.on(setIcon, 'click', function (e) {
		if (!me.settingPanelShow) {
			TweenMax.to(
				setPanel, 0.4, {
					top: 0,
					ease: Quad.easeInOut,
					onComplete: function () {
						me.settingPanelShow = true;
					}
				}
			);
			_.dom.addClass(setIcon, 'active');
		} else {
			setClose.click();
		}
		me.usersPanelShow && userClose.click();
	});

	_.dom.on(userIcon, 'click', function (e) {
		if (!me.usersPanelShow) {
			TweenMax.to(
				userPanel, 0.4, {
					top: 0,
					ease: Quad.easeInOut,
					onComplete: function () {
						me.usersPanelShow = true;
					}
				}
			);
			_.dom.addClass(userIcon, 'active');
		} else {
			userClose.click();
		}
		me.settingPanelShow && setClose.click();
	});

	_.dom.on(setClose, 'click', function (e) {
		TweenMax.to(
			setPanel, 0.4, {
				top: -120,
				ease: Quad.easeInOut,
				onComplete: function () {
					me.settingPanelShow = false;
				}
			}
		);
		_.dom.removeClass(setIcon, 'active');
	});

	_.dom.on(userClose, 'click', function (e) {
		TweenMax.to(
			userPanel, 0.4, {
				top: -320,
				ease: Quad.easeInOut,
				onComplete: function () {
					me.usersPanelShow = false;
				}
			}
		);
		_.dom.removeClass(userIcon, 'active');
	});
};


GroupChatWindow.prototype.sendMessage = function () {
	var me = this;
	var input = _.dom.get('.chat-input')[0];
	var message = input.innerHTML;
	if (message == "") return;
	var effectContainer = _.dom.get(".chat-effect-container")[0];
	var sendButton = _.dom.get(".chat-send")[0];
	var messageElements = me.addMessage('message', message, me.self, me.getTime(), true);
	var messageContainer = messageElements.container;
	var messagesContainer = _.dom.get(".chat-messages")[0];
	var messageBubble = messageElements.bubble;

	var oldInputHeight = 48;
	input.innerHTML = '';

	var newInputHeight = 48;
	var inputHeightDiff = newInputHeight - oldInputHeight;

	var messageEffect = _.dom.create('<div class="chat-message-effect"></div>')[0];
	messageEffect.appendChild(messageBubble.cloneNode(true));
	effectContainer.appendChild(messageEffect);
	_.dom.css(effectContainer, {
		left: 0,
		top: 0
	});

	var messagePos = _.dom.offset(messageBubble);
	var effectPos = _.dom.offset(messageEffect);
	var pos = {
		x: messagePos.left - effectPos.left,
		y: messagePos.top - effectPos.top
	}

	var startingScroll = messagesContainer.scrollTop;
	var curScrollDiff = 0;
	var effectYTransition;
	var setEffectYTransition = function (dest, dur, ease) {
		return TweenMax.to(
			messageEffect, dur, {
				y: dest,
				ease: ease,
				onUpdate: function () {
					var curScroll = messagesContainer.scrollTop;
					var scrollDiff = curScroll - startingScroll;
					if (scrollDiff > 0) {
						curScrollDiff += scrollDiff;
						startingScroll = curScroll;

						var time = effectYTransition.time();
						effectYTransition.kill();
						effectYTransition = setEffectYTransition(pos.y - curScrollDiff, 0.8 - time, Power2.easeOut);
					}
				}
			}
		);
	}

	effectYTransition = setEffectYTransition(pos.y, 0.8, Power2.easeInOut);

	TweenMax.to(
		messageEffect, 0.6, {
			delay: 0.2,
			x: pos.x,
			ease: Quad.easeInOut,
			onComplete: function () {}
		}
	);

	TweenMax.from(
		messageBubble, 0.2, {
			delay: 0.65,
			opacity: 0,
			ease: Quad.easeInOut,
			onComplete: function () {
				TweenMax.killTweensOf(messageEffect);
				effectContainer.removeChild(messageEffect);

				me.dispatch('send', {
					message: message,
					from: me.self
				});
				// me.receiveMessage("hello,Ok", {name: "路人甲"});
			}
		}
	);
}

GroupChatWindow.prototype.addMessage = function (type, message, user, time, isSelf) {
	var me = this;
	var messagesContainer = _.dom.get(".chat-messages")[0]
	var msgList = _.dom.get('.chat-messages-list')[0];

	var className = '';
	var msgTpl = '';
	switch (type) {
		case 'message':
			if (user.uid == me.self.uid) {
				className = 'message-self';
			} else {
				className = 'message-other';
			}
			msgTpl = '<p class="user">' + user.name + '<i></i>' + time + '</p><div class="msg">' + message + '</div>';
			break;
		case 'notice':
			className = 'notice';
			msgTpl = '<div class="msg">' + message + '</div>'
			break;
		case 'history':
			if (user.uid == me.self.uid) {
				className = 'hsitory-self';
			} else {
				className = 'hsitory-other';
			}
			msgTpl = '<p class="user">' + user.name + '<i></i>' + time + '</p><div class="msg">' + message + '</div>';
			break;
		case 'system':
			className = 'system';
			msgTpl = '<div class="msg">' + message + '</div>'
			break;
	}

	var messageContainer = _.dom.create('<li class="chat-message ' + className + '"></li>')[0];
	msgList.appendChild(messageContainer);

	var messageBubble = _.dom.create('<div class="chat-message-bubble"></div>')[0];
	messageBubble.innerHTML = msgTpl;
	messageContainer.appendChild(messageBubble);

	var oldScroll = msgList.scrollTop;
	msgList.scrollTop = 9999999;

	var newScroll = msgList.scrollTop;
	var scrollDiff = newScroll - oldScroll;
	TweenMax.fromTo(
		msgList, 0.4, {
			y: scrollDiff
		}, {
			y: 0,
			ease: Quint.easeOut
		}
	);
	return {
		container: messageContainer,
		bubble: messageBubble
	};
};


GroupChatWindow.prototype.receiveMessage = function (type, message, user, time) {
	var me = this;
	if (user.uid == me.self.uid && type != 'history') return;
	var messageElements = me.addMessage(type, message, user, time, false),
		messageContainer = messageElements.container,
		messageBubble = messageElements.bubble;

	TweenMax.set(messageBubble, {
		transformOrigin: "60px 50%"
	});
	TweenMax.from(messageBubble, 0.4, {
		scale: 0,
		ease: Back.easeOut
	});
	TweenMax.from(messageBubble, 0.4, {
		x: -100,
		ease: Quint.easeOut
	});
}

GroupChatWindow.prototype.startTyping = function () {
	var me = this;
	if (me.isTyping) return;

	me.isTyping = true;
	var effectContainer = _.dom.get(".chat-effect-container")[0],
		infoContainer = _.dom.get(".chat-info-container")[0];

	var dots = _.dom.create('<div class="chat-effect-dots"></div>')[0];
	_.dom.css(dots, {
		top: -30,
		left: 10
	});
	effectContainer.appendChild(dots);

	me.setFilter('url(#goo)');
	for (var i = 0; i < 3; i++) {
		var dot = _.dom.create('<div class="chat-effect-dot">')[0];
		_.dom.css(dot, {
			left: i * 20
		});
		dots.appendChild(dot);
		TweenMax.to(dot, 0.3, {
			delay: -i * 0.1,
			y: 30,
			yoyo: true,
			repeat: -1,
			ease: Quad.easeInOut
		});
	}

	var info = _.dom.create('<div class="chat-info-typing">')[0];
	info.innerHTML = "正在输入";
	_.dom.css(info, {
		transform: "translate3d(0, 30px, 0)"
	});
	infoContainer.appendChild(info);
	TweenMax.to(info, 0.3, {
		y: 0
	});
};

GroupChatWindow.prototype.StoppedTyping = function () {
	var me = this;
	if (!me.isTyping) return;

	me.isTyping = false;
	var effectContainer = _.dom.get(".chat-effect-container")[0],
		infoContainer = _.dom.get(".chat-info-container")[0];

	var dots = _.dom.get(".chat-effect-dots")[0];
	TweenMax.to(dots, 0.3, {
		y: 40,
		ease: Quad.easeIn,
	});

	var info = _.dom.get(".chat-info-typing")[0];
	TweenMax.to(info, 0.3, {
		y: 30,
		ease: Quad.easeIn,
		onComplete: function () {
			effectContainer.removeChild(dots);
			infoContainer.removeChild(info);
			me.setFilter('none');
		}
	});
};

GroupChatWindow.prototype.updateUsers = function (members) {
	var me = this;
	var users = _.dom.get('.userList-panel .users')[0];
	users.innerHTML = '';
	for (var k in members) {
		var item = members[k];
		var u = _.dom.create('<li>' + item.name + '</li>')[0];
		users.appendChild(u);
	}
};

GroupChatWindow.prototype.show = function () {
	var me = this;
	me.node.style.display = "block";
	me.isShow = true;
	_.dom.get('.chat-messages-list')[0].scrollTop = 9999999;
};

GroupChatWindow.prototype.hide = function () {
	var me = this;
	me.isShow = false;
	me.node.style.display = "none";
	me.dispatch('hide');
};

GroupChatWindow.prototype.setFilter = function (value) {
	var effectContainer = _.dom.get(".chat-effect-container")[0];
	_.dom.css(effectContainer, {
		"-webkit-filter": value
	});
};


GroupChatWindow.prototype.on = function (eventType, fn) {
	var me = this;
	me._eventsListener[eventType] = fn;
};

GroupChatWindow.prototype.dispatch = function (eventType, param) {
	var me = this;
	var fn = me._eventsListener[eventType];
	fn && fn(param);
};

GroupChatWindow.prototype.getTime = function () {
	var d = new Date();
	var arr = [],
		ti = [];
	arr.push(d.getFullYear());
	arr.push(d.getMonth() + 1);
	arr.push(d.getDate());
	ti.push(d.getHours());
	ti.push(d.getMinutes());
	ti.push(d.getSeconds());
	return arr.join('-') + ' ' + ti.join(':');
};

GroupChatWindow.prototype.setupEmotion = function () {
	var me = this;
	var panel = _.dom.get('.emotion-panel')[0];
	var input = _.dom.get('.chat-input')[0];
	var ems = [];
	for (var i = 1; i < 133; i++) {
		ems.push('<img src="http://meet.xpro.im/v2/api/img/emotion/' + i + '.gif" width="24px" height="24px"/>');
	}
	panel.innerHTML = ems.join('');
	ems.length = 0;

	_.dom.on(panel, 'click', function (e) {
		var tar = e.target;
		if (tar.tagName.toLowerCase() == 'img') {
			input.innerHTML += tar.outerHTML;
			_.dom.hide(panel);
			input.focus();
		}
	});

	_.dom.on(input, 'focus', function (e) {
		focusEnd();
	});

	function focusEnd() {
		var node = document.createElement('span'),
			range = null,
			sel = null;

		input.appendChild(node);
		if (document.selection) {
			range = document.body.createTextRange();
			range.moveToElementText(node);
			range.select();
		} else if (window.getSelection) {
			range = document.createRange();
			range.selectNode(node);
			sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
		input.removeChild(node);
	}

};

window.GroupChatWindow = GroupChatWindow;