/*--------------------------------------------------------*/
	var _uid = 0;
	var _ = function(obj) {
	};
	//isFunction
	if (typeof (/./) !== 'function') {
		_.isFunction = function(obj) {
			return typeof obj === 'function';
		};
	}
	//isObject
	_.isObject = function(obj) {
    	return obj === Object(obj);
  	};
  	 //isArray
    _.isArray = function(obj) {
    	if(obj.length !== undefined){
    		return true;
    	}else{
    		return toString.call(obj) == '[object Array]';
    	}
  	};
  	_.isEmptyObject = function(obj) {
    	if (obj == null) return true;
    	for (var key in obj) if (_.has(obj, key)) return false;
    	return true;
  	};
	//trim
	_.trim = function(str){
		if (!str) return '';
		return str.replace(/^\s*|\s*$/g, '');
    };
    _.has = function(obj, key) {
    	return obj != null && Object.prototype.hasOwnProperty.call(obj, key);
  	};
    _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (Object.keys) return Object.keys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    return keys;
  	};
  	//each
    _.each = function(obj, iterator, context) {
    	if (obj == null) return obj;
	    if (obj.length === +obj.length) {
	      	for (var i = 0, length = obj.length; i < length; i++) {
	        	if (iterator.call(context, i, obj[i], obj)) return;
	      	}
	    } else {
	      	var keys = _.keys(obj);
	      	for (var i = 0, length = keys.length; i < length; i++) {
	        	if (iterator.call(context, keys[i], obj[keys[i]], obj)) return;
	      	}
	    }
    	return obj;
  	};
  	//extend
  	_.extend = function(obj) {
    	if (!_.isObject(obj)) return obj;
	    _.each(Array.prototype.slice.call(arguments, 1), function(i, source) {
	      	for (var prop in source) {
	        	obj[prop] = source[prop];
	      	}
	    });
    	return obj;
  	};
  	_.copy = function(obj){
  		if (!_.isObject(obj)) return obj;
	    _.each(Array.prototype.slice.call(arguments, 1), function(i, source) {
	      	for (var prop in source) {
	        	obj.prototype[prop] = source[prop];
	      	}
	    });
    	return obj;
  	};
  	//clone
  	_.clone = function(obj) {
    	if (!_.isObject(obj)) return obj;
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  	};
  	_.param = function(obj) {
  		var temp = [];
  		_.each(obj, function(key, item){
  			temp.push(key+'='+ encodeURIComponent(item));
  		});
  		return temp.join('&');
  	};
  	_.md5 = function(n){
  		var nc = n || 3, i=0;
    	var v = (+new Date()).toString(32);
    	for ( ; i < 5; i++ ) {
            v += Math.floor( Math.random() * 65535 ).toString(32);
        }
    	return v;
	};
	_.uuid = function(){
		return ++_uid;
	};
	_.render = function(template, data, func){
		return template.replace(/\{\{(.*?)\}\}/g, function(s0, s1){
			if(_.isFunction(func)){
				return func(s1, data);
			}else{
				var key, val, filter;
				if(s1.indexOf('|')>0){
		    		var parts = s1.split('|');
		    		key = _.trim(parts[0]),
	    			filter = _.trim(parts[1]);
		    	}else{
		    		key = _.trim(s1);
		    	}
		    	var ks;
		    	if(key.indexOf('.') != -1){
		    		var ks = key.split('.');
		    		var val = data[ks[0]];
		    		_.each(ks, function(i, k){
		    			i>0 && val && (val = val[k]);
		    		});
		    	}else{
		    		val = data[key];
		    	}
				if(filter){
					var mat = filter.match(/\s*in(\{.*?\})/);
					if(mat && mat.length > 1){
						var json =(new Function("", "return "+mat[1]))();
						json && (val = json[val] ? json[val] : '');
					}else{
						if(func.filter && func.filter[filter]){
							val = func.filter[filter](val);
						}else{
							console.error('filter['+ filter +'] not exist');
						}
					}
				}
				return val;
			}
		});
	};
	_.loadCss = function(path) {
        if (path) {
        	var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.href = path;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            head.appendChild(link);
        }
    };
    _.loadJs = function(path, fn) {
    	var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.onreadystatechange = function() {
            if (this.readyState == 'complete') {
                fn && fn();
            }
        }
        script.type = 'text/javascript';
        script.src = url;
        head.appendChild(script);
        return script;
    };
    _.ajax = (function(){
        function send(url, method, params, postData, cb, type) {
            var xhr = null;
			if (window.XMLHttpRequest){
	  			xhr = new XMLHttpRequest();
	  		} else if (window.ActiveXObject){
		  		xhr = new ActiveXObject("Microsoft.XMLHTTP");
		  	}
		  	if (xhr != null){
		  		var fullUrl = url, urlParam = _.param(params);
		  		if(urlParam){
		  			fullUrl = url + '?' + urlParam;
		  		}
		  		// '', arraybuffer, blob, document, json, text
		  		if(type){
		  			xhr.responseType = type;
		  		}
	            xhr.open(method, fullUrl, true);
	            xhr.onreadystatechange = function() {
	                if (xhr.readyState == 4) {
	                	if (xhr.status==200){
		                    var data = xhr.responseText;
		                    cb && cb(data);
		                }
	                }
	            }
	        }
            var body;
            if (postData) {
                var bodies = [];
                for (var name in postData) {
                    bodies.push(name + '=' + encodeURIComponent(postData[name]));
                }
                body = bodies.join('&');
                if (body.length) {
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
                }        
            }
            xhr.send(body);
        }
        return {
	        get: function(url, params, cb, type) {
	            send(url, 'GET', params, null, cb, type);
	        },
	        post: function(url, params, postData, cb) {
	            send(url, 'POST', params, postData, cb);
	        }
	    };
    })();
  	/*--------------------------------------------------------*/
  	_.dom = {};
  	_.dom.create = function(htmlString){
  		var div = document.createElement('div');
  		div.innerHTML = htmlString;
  		return Array.prototype.slice.call(div.children);
  	};
  	_.dom.get = function(queryString){
  		if(typeof(queryString) == 'string'){
  			return document.querySelectorAll(queryString);
  		} else {
  			return [queryString];
  		}
  	};
  	_.dom.hasClass = function(dom, name){
  		var d = _.dom.get(dom);
  		var reg = new RegExp(name + '\\b', 'g');
  		return d[0].className.match(reg);
  	};
  	_.dom.addClass = function(dom, name){
  		if(!_.hasClass(dom, name)){
  			dom.className += ' '+name;
  		}
  		return dom;
  	};
  	_.dom.removeClass = function(dom, name){
  		var cname = dom.ClassName;
  		if(_.hasClass(dom, name)){
  			dom.className.replace(name, '');
  		}
  		return dom;
  	};
  	_.dom.css = function(queryString, property, value){
  		var doms = _.dom.get(queryString);
      	if (arguments.length < 3) {
        	var computedStyle, element = doms[0]
        	if(!element) return;
        	computedStyle = getComputedStyle(element, '')
	        if (typeof property == 'string')
	          	return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
	        else if (_.isArray(property)) {
	          	var props = {}
	          	_.each(property, function(i, prop){
	            	props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
	          	})
	          	return props
	        }
      	}
      	var css = ''
      	if (typeof(property) == 'string') {
        	if (!value && value !== 0)
	          	_.each(doms, function(i, ele){
	          		ele.style.removeProperty(dasherize(property));
	          	});
	        else
	          	css = dasherize(property) + ":" + maybeAddPx(property, value)
      	} else {
        	for (key in property)
          		if (!property[key] && property[key] !== 0)
            		_.each(doms, function(i, ele){
            			ele.style.removeProperty(dasherize(key));
            		});
          		else
            		css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      	}
      	_.each(doms, function(i, ele){
      		ele.style.cssText += (';' + css);
      	});

      	function dasherize(str) {
	    	return str.replace(/::/g, '/')
	           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
	           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
	           .replace(/_/g, '-')
	           .toLowerCase()
	 	}
	 	function camelize(str){
	 		return str.replace(/-+(.)?/g, function(match, chr){
	 			return chr ? chr.toUpperCase() : ''
	 		});
	 	}
		function maybeAddPx(name, value) {
			var cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 };
	    	return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
	  	}
  	};
  	_.dom.offset = function(queryString){
  		var doms = _.dom.get(queryString);
      	if (!doms) return
      	var obj = doms[0].getBoundingClientRect()
		return {
			left: obj.left + window.pageXOffset,
			top: obj.top + window.pageYOffset,
			width: Math.round(obj.width),
			height: Math.round(obj.height)
		}
    },
  	_.dom.position = function(queryString) {
  		var doms = _.dom.get(queryString);
      	if (!doms) return

      	var elem = doms[0],
        	// Get *real* offsetParent
        	offsetParent = _.dom.offsetParent(),
        	// Get correct offsets
        	offset       = _.dom.offset(elem),
        	parentOffset = _.dom.offset(offsetParent[0]);
		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( _.dom.css(elem, 'margin-top')) || 0
  		offset.left -= parseFloat( _.dom.css(elem, 'margin-left')) || 0
  		// Add offsetParent borders
  		parentOffset.top  += parseFloat( _.dom.css(offsetParent[0], 'border-top-width')) || 0
  		parentOffset.left += parseFloat( _.dom.css(offsetParent[0], 'border-left-width')) || 0
  		// Subtract the two offsets
  		return {
    		top:  offset.top  - parentOffset.top,
    		left: offset.left - parentOffset.left
  		}
	};
    _.dom.offsetParent = function(queryString) {
    	var doms = _.dom.get(queryString);
      	return doms.map(function(){
        	var parent = this.offsetParent || document.body;
        	while (parent && !/^(?:body|html)$/i.test(parent.nodeName) && _.dom.css(parent, "position") == "static")
          		parent = parent.offsetParent
        	return parent
      	});
    };
  	_.dom.on = function(target, eventType, fn){
		var eles = _.dom.get(target);
		_.each(eles, function(index, item){
			DomEvent.on(eventType, item, fn);
		});
		return eles;
  	};
  	_.dom.off = function(target, eventType, fn){
  		if(typeof(target) == 'string'){
  			var eles = _.dom.get(target);
  			eles && _.each(eles, function(index, item){
  				DomEvent.off(eventType, item, fn);
  			});
  			return eles;
  		}else{
  			DomEvent.off(eventType, target, fn);
  			return target;
  		}
  	};
  	_.dom.show = function(target){
  		_.each(_.dom.get(target), function(index, item){
			item.style.display = "block";
  		});
  	};
  	_.dom.hide = function(target){
  		_.each(_.dom.get(target), function(index, item){
			item.style.display = "none";
  		});
  	};
  	_.dom.toggle = function(target){
  		var dis = _.dom.css(target, 'display');
  		dis == 'none' ? _.dom.show(target) : _.dom.hide(target);
  	};
  	/*--------------------------------------------------------*/
  	var DomEvent = {
	    on: function (evtName, element, listener, capture) {
	        var evt         = '',
	            useCapture  = (capture === undefined) ? true : capture,
	            handler     = null;
	        if (window.addEventListener === undefined) {
	            evt = 'on' + evtName;
	            handler = function (evt, listener) {
	                element.attachEvent(evt, listener);
	                return listener;
	            };
	        } else {
	            evt = evtName;
	            handler = function (evt, listener, useCapture) {
	                element.addEventListener(evt, listener, useCapture);
	                return listener;
	            };
	        }
	        return handler.apply(element, [evt, function (ev) {
	            var e   = ev || event,
	                src = e.srcElement || e.target;
	            listener(e, src);
	        }, useCapture]);
	    },
	    off: function (evtName, element, listener, capture) {
	        var evt = '',
	            useCapture  = (capture === undefined) ? true : capture;
	        if (window.removeEventListener === undefined) {
	            evt = 'on' + evtName;
        		// element.detachEvent(evt, listener);
            	element[evt] = null;
	        } else {
	            evt = evtName;
	            element.removeEventListener(evt, listener, useCapture);
	        }
	    },
	    stopPropagation: function (evt) {
	        evt.cancelBubble = true;
	        if (evt.stopPropagation) {
	            evt.stopPropagation();
	        }
	    },
	    preventDefault: function (evt) {
	        if (evt.preventDefault) {
	            evt.preventDefault();
	        } else {
	            evt.returnValue = false;
	        }
	    }
	};
	var Event = {
		on: function(eventType, func){
			if(!this._events){
				this._events = {};
			}
			this._events[eventType] = func;
		},
		off: function(eventType){
			delete this._events[eventType];
		},
		dispatchEvent: function(){
			var args = Array.prototype.slice.call(arguments, 1);
			var eventType = arguments[0];
			if(eventType && this._events){
				var handler = this._events[eventType];
				handler && handler.apply(this, _.isArray(args)? args : [args]);
			}
		}
	};
  	/*--------------------------------------------------------*/(function (window) {
	

	function Chat(){

	}



	var xmeet = {
		Chat: Chat
	};

	window.XMeet = xmeet;
})(window);

















/*!
 * VERSION: 1.16.1
 * DATE: 2015-03-13
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2015, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(function(t,e){"use strict";var i=t.GreenSockGlobals=t.GreenSockGlobals||t;if(!i.TweenLite){var s,r,n,a,o,l=function(t){var e,s=t.split("."),r=i;for(e=0;s.length>e;e++)r[s[e]]=r=r[s[e]]||{};return r},h=l("com.greensock"),_=1e-10,u=function(t){var e,i=[],s=t.length;for(e=0;e!==s;i.push(t[e++]));return i},m=function(){},f=function(){var t=Object.prototype.toString,e=t.call([]);return function(i){return null!=i&&(i instanceof Array||"object"==typeof i&&!!i.push&&t.call(i)===e)}}(),c={},p=function(s,r,n,a){this.sc=c[s]?c[s].sc:[],c[s]=this,this.gsClass=null,this.func=n;var o=[];this.check=function(h){for(var _,u,m,f,d=r.length,v=d;--d>-1;)(_=c[r[d]]||new p(r[d],[])).gsClass?(o[d]=_.gsClass,v--):h&&_.sc.push(this);if(0===v&&n)for(u=("com.greensock."+s).split("."),m=u.pop(),f=l(u.join("."))[m]=this.gsClass=n.apply(n,o),a&&(i[m]=f,"function"==typeof define&&define.amd?define((t.GreenSockAMDPath?t.GreenSockAMDPath+"/":"")+s.split(".").pop(),[],function(){return f}):s===e&&"undefined"!=typeof module&&module.exports&&(module.exports=f)),d=0;this.sc.length>d;d++)this.sc[d].check()},this.check(!0)},d=t._gsDefine=function(t,e,i,s){return new p(t,e,i,s)},v=h._class=function(t,e,i){return e=e||function(){},d(t,[],function(){return e},i),e};d.globals=i;var g=[0,0,1,1],T=[],y=v("easing.Ease",function(t,e,i,s){this._func=t,this._type=i||0,this._power=s||0,this._params=e?g.concat(e):g},!0),w=y.map={},P=y.register=function(t,e,i,s){for(var r,n,a,o,l=e.split(","),_=l.length,u=(i||"easeIn,easeOut,easeInOut").split(",");--_>-1;)for(n=l[_],r=s?v("easing."+n,null,!0):h.easing[n]||{},a=u.length;--a>-1;)o=u[a],w[n+"."+o]=w[o+n]=r[o]=t.getRatio?t:t[o]||new t};for(n=y.prototype,n._calcEnd=!1,n.getRatio=function(t){if(this._func)return this._params[0]=t,this._func.apply(null,this._params);var e=this._type,i=this._power,s=1===e?1-t:2===e?t:.5>t?2*t:2*(1-t);return 1===i?s*=s:2===i?s*=s*s:3===i?s*=s*s*s:4===i&&(s*=s*s*s*s),1===e?1-s:2===e?s:.5>t?s/2:1-s/2},s=["Linear","Quad","Cubic","Quart","Quint,Strong"],r=s.length;--r>-1;)n=s[r]+",Power"+r,P(new y(null,null,1,r),n,"easeOut",!0),P(new y(null,null,2,r),n,"easeIn"+(0===r?",easeNone":"")),P(new y(null,null,3,r),n,"easeInOut");w.linear=h.easing.Linear.easeIn,w.swing=h.easing.Quad.easeInOut;var b=v("events.EventDispatcher",function(t){this._listeners={},this._eventTarget=t||this});n=b.prototype,n.addEventListener=function(t,e,i,s,r){r=r||0;var n,l,h=this._listeners[t],_=0;for(null==h&&(this._listeners[t]=h=[]),l=h.length;--l>-1;)n=h[l],n.c===e&&n.s===i?h.splice(l,1):0===_&&r>n.pr&&(_=l+1);h.splice(_,0,{c:e,s:i,up:s,pr:r}),this!==a||o||a.wake()},n.removeEventListener=function(t,e){var i,s=this._listeners[t];if(s)for(i=s.length;--i>-1;)if(s[i].c===e)return s.splice(i,1),void 0},n.dispatchEvent=function(t){var e,i,s,r=this._listeners[t];if(r)for(e=r.length,i=this._eventTarget;--e>-1;)s=r[e],s&&(s.up?s.c.call(s.s||i,{type:t,target:i}):s.c.call(s.s||i))};var k=t.requestAnimationFrame,S=t.cancelAnimationFrame,A=Date.now||function(){return(new Date).getTime()},x=A();for(s=["ms","moz","webkit","o"],r=s.length;--r>-1&&!k;)k=t[s[r]+"RequestAnimationFrame"],S=t[s[r]+"CancelAnimationFrame"]||t[s[r]+"CancelRequestAnimationFrame"];v("Ticker",function(t,e){var i,s,r,n,l,h=this,u=A(),f=e!==!1&&k,c=500,p=33,d="tick",v=function(t){var e,a,o=A()-x;o>c&&(u+=o-p),x+=o,h.time=(x-u)/1e3,e=h.time-l,(!i||e>0||t===!0)&&(h.frame++,l+=e+(e>=n?.004:n-e),a=!0),t!==!0&&(r=s(v)),a&&h.dispatchEvent(d)};b.call(h),h.time=h.frame=0,h.tick=function(){v(!0)},h.lagSmoothing=function(t,e){c=t||1/_,p=Math.min(e,c,0)},h.sleep=function(){null!=r&&(f&&S?S(r):clearTimeout(r),s=m,r=null,h===a&&(o=!1))},h.wake=function(){null!==r?h.sleep():h.frame>10&&(x=A()-c+5),s=0===i?m:f&&k?k:function(t){return setTimeout(t,0|1e3*(l-h.time)+1)},h===a&&(o=!0),v(2)},h.fps=function(t){return arguments.length?(i=t,n=1/(i||60),l=this.time+n,h.wake(),void 0):i},h.useRAF=function(t){return arguments.length?(h.sleep(),f=t,h.fps(i),void 0):f},h.fps(t),setTimeout(function(){f&&5>h.frame&&h.useRAF(!1)},1500)}),n=h.Ticker.prototype=new h.events.EventDispatcher,n.constructor=h.Ticker;var R=v("core.Animation",function(t,e){if(this.vars=e=e||{},this._duration=this._totalDuration=t||0,this._delay=Number(e.delay)||0,this._timeScale=1,this._active=e.immediateRender===!0,this.data=e.data,this._reversed=e.reversed===!0,B){o||a.wake();var i=this.vars.useFrames?q:B;i.add(this,i._time),this.vars.paused&&this.paused(!0)}});a=R.ticker=new h.Ticker,n=R.prototype,n._dirty=n._gc=n._initted=n._paused=!1,n._totalTime=n._time=0,n._rawPrevTime=-1,n._next=n._last=n._onUpdate=n._timeline=n.timeline=null,n._paused=!1;var C=function(){o&&A()-x>2e3&&a.wake(),setTimeout(C,2e3)};C(),n.play=function(t,e){return null!=t&&this.seek(t,e),this.reversed(!1).paused(!1)},n.pause=function(t,e){return null!=t&&this.seek(t,e),this.paused(!0)},n.resume=function(t,e){return null!=t&&this.seek(t,e),this.paused(!1)},n.seek=function(t,e){return this.totalTime(Number(t),e!==!1)},n.restart=function(t,e){return this.reversed(!1).paused(!1).totalTime(t?-this._delay:0,e!==!1,!0)},n.reverse=function(t,e){return null!=t&&this.seek(t||this.totalDuration(),e),this.reversed(!0).paused(!1)},n.render=function(){},n.invalidate=function(){return this._time=this._totalTime=0,this._initted=this._gc=!1,this._rawPrevTime=-1,(this._gc||!this.timeline)&&this._enabled(!0),this},n.isActive=function(){var t,e=this._timeline,i=this._startTime;return!e||!this._gc&&!this._paused&&e.isActive()&&(t=e.rawTime())>=i&&i+this.totalDuration()/this._timeScale>t},n._enabled=function(t,e){return o||a.wake(),this._gc=!t,this._active=this.isActive(),e!==!0&&(t&&!this.timeline?this._timeline.add(this,this._startTime-this._delay):!t&&this.timeline&&this._timeline._remove(this,!0)),!1},n._kill=function(){return this._enabled(!1,!1)},n.kill=function(t,e){return this._kill(t,e),this},n._uncache=function(t){for(var e=t?this:this.timeline;e;)e._dirty=!0,e=e.timeline;return this},n._swapSelfInParams=function(t){for(var e=t.length,i=t.concat();--e>-1;)"{self}"===t[e]&&(i[e]=this);return i},n.eventCallback=function(t,e,i,s){if("on"===(t||"").substr(0,2)){var r=this.vars;if(1===arguments.length)return r[t];null==e?delete r[t]:(r[t]=e,r[t+"Params"]=f(i)&&-1!==i.join("").indexOf("{self}")?this._swapSelfInParams(i):i,r[t+"Scope"]=s),"onUpdate"===t&&(this._onUpdate=e)}return this},n.delay=function(t){return arguments.length?(this._timeline.smoothChildTiming&&this.startTime(this._startTime+t-this._delay),this._delay=t,this):this._delay},n.duration=function(t){return arguments.length?(this._duration=this._totalDuration=t,this._uncache(!0),this._timeline.smoothChildTiming&&this._time>0&&this._time<this._duration&&0!==t&&this.totalTime(this._totalTime*(t/this._duration),!0),this):(this._dirty=!1,this._duration)},n.totalDuration=function(t){return this._dirty=!1,arguments.length?this.duration(t):this._totalDuration},n.time=function(t,e){return arguments.length?(this._dirty&&this.totalDuration(),this.totalTime(t>this._duration?this._duration:t,e)):this._time},n.totalTime=function(t,e,i){if(o||a.wake(),!arguments.length)return this._totalTime;if(this._timeline){if(0>t&&!i&&(t+=this.totalDuration()),this._timeline.smoothChildTiming){this._dirty&&this.totalDuration();var s=this._totalDuration,r=this._timeline;if(t>s&&!i&&(t=s),this._startTime=(this._paused?this._pauseTime:r._time)-(this._reversed?s-t:t)/this._timeScale,r._dirty||this._uncache(!1),r._timeline)for(;r._timeline;)r._timeline._time!==(r._startTime+r._totalTime)/r._timeScale&&r.totalTime(r._totalTime,!0),r=r._timeline}this._gc&&this._enabled(!0,!1),(this._totalTime!==t||0===this._duration)&&(this.render(t,e,!1),z.length&&$())}return this},n.progress=n.totalProgress=function(t,e){return arguments.length?this.totalTime(this.duration()*t,e):this._time/this.duration()},n.startTime=function(t){return arguments.length?(t!==this._startTime&&(this._startTime=t,this.timeline&&this.timeline._sortChildren&&this.timeline.add(this,t-this._delay)),this):this._startTime},n.endTime=function(t){return this._startTime+(0!=t?this.totalDuration():this.duration())/this._timeScale},n.timeScale=function(t){if(!arguments.length)return this._timeScale;if(t=t||_,this._timeline&&this._timeline.smoothChildTiming){var e=this._pauseTime,i=e||0===e?e:this._timeline.totalTime();this._startTime=i-(i-this._startTime)*this._timeScale/t}return this._timeScale=t,this._uncache(!1)},n.reversed=function(t){return arguments.length?(t!=this._reversed&&(this._reversed=t,this.totalTime(this._timeline&&!this._timeline.smoothChildTiming?this.totalDuration()-this._totalTime:this._totalTime,!0)),this):this._reversed},n.paused=function(t){if(!arguments.length)return this._paused;var e,i,s=this._timeline;return t!=this._paused&&s&&(o||t||a.wake(),e=s.rawTime(),i=e-this._pauseTime,!t&&s.smoothChildTiming&&(this._startTime+=i,this._uncache(!1)),this._pauseTime=t?e:null,this._paused=t,this._active=this.isActive(),!t&&0!==i&&this._initted&&this.duration()&&this.render(s.smoothChildTiming?this._totalTime:(e-this._startTime)/this._timeScale,!0,!0)),this._gc&&!t&&this._enabled(!0,!1),this};var D=v("core.SimpleTimeline",function(t){R.call(this,0,t),this.autoRemoveChildren=this.smoothChildTiming=!0});n=D.prototype=new R,n.constructor=D,n.kill()._gc=!1,n._first=n._last=n._recent=null,n._sortChildren=!1,n.add=n.insert=function(t,e){var i,s;if(t._startTime=Number(e||0)+t._delay,t._paused&&this!==t._timeline&&(t._pauseTime=t._startTime+(this.rawTime()-t._startTime)/t._timeScale),t.timeline&&t.timeline._remove(t,!0),t.timeline=t._timeline=this,t._gc&&t._enabled(!0,!0),i=this._last,this._sortChildren)for(s=t._startTime;i&&i._startTime>s;)i=i._prev;return i?(t._next=i._next,i._next=t):(t._next=this._first,this._first=t),t._next?t._next._prev=t:this._last=t,t._prev=i,this._recent=t,this._timeline&&this._uncache(!0),this},n._remove=function(t,e){return t.timeline===this&&(e||t._enabled(!1,!0),t._prev?t._prev._next=t._next:this._first===t&&(this._first=t._next),t._next?t._next._prev=t._prev:this._last===t&&(this._last=t._prev),t._next=t._prev=t.timeline=null,t===this._recent&&(this._recent=this._last),this._timeline&&this._uncache(!0)),this},n.render=function(t,e,i){var s,r=this._first;for(this._totalTime=this._time=this._rawPrevTime=t;r;)s=r._next,(r._active||t>=r._startTime&&!r._paused)&&(r._reversed?r.render((r._dirty?r.totalDuration():r._totalDuration)-(t-r._startTime)*r._timeScale,e,i):r.render((t-r._startTime)*r._timeScale,e,i)),r=s},n.rawTime=function(){return o||a.wake(),this._totalTime};var I=v("TweenLite",function(e,i,s){if(R.call(this,i,s),this.render=I.prototype.render,null==e)throw"Cannot tween a null target.";this.target=e="string"!=typeof e?e:I.selector(e)||e;var r,n,a,o=e.jquery||e.length&&e!==t&&e[0]&&(e[0]===t||e[0].nodeType&&e[0].style&&!e.nodeType),l=this.vars.overwrite;if(this._overwrite=l=null==l?Q[I.defaultOverwrite]:"number"==typeof l?l>>0:Q[l],(o||e instanceof Array||e.push&&f(e))&&"number"!=typeof e[0])for(this._targets=a=u(e),this._propLookup=[],this._siblings=[],r=0;a.length>r;r++)n=a[r],n?"string"!=typeof n?n.length&&n!==t&&n[0]&&(n[0]===t||n[0].nodeType&&n[0].style&&!n.nodeType)?(a.splice(r--,1),this._targets=a=a.concat(u(n))):(this._siblings[r]=K(n,this,!1),1===l&&this._siblings[r].length>1&&J(n,this,null,1,this._siblings[r])):(n=a[r--]=I.selector(n),"string"==typeof n&&a.splice(r+1,1)):a.splice(r--,1);else this._propLookup={},this._siblings=K(e,this,!1),1===l&&this._siblings.length>1&&J(e,this,null,1,this._siblings);(this.vars.immediateRender||0===i&&0===this._delay&&this.vars.immediateRender!==!1)&&(this._time=-_,this.render(-this._delay))},!0),E=function(e){return e&&e.length&&e!==t&&e[0]&&(e[0]===t||e[0].nodeType&&e[0].style&&!e.nodeType)},O=function(t,e){var i,s={};for(i in t)G[i]||i in e&&"transform"!==i&&"x"!==i&&"y"!==i&&"width"!==i&&"height"!==i&&"className"!==i&&"border"!==i||!(!U[i]||U[i]&&U[i]._autoCSS)||(s[i]=t[i],delete t[i]);t.css=s};n=I.prototype=new R,n.constructor=I,n.kill()._gc=!1,n.ratio=0,n._firstPT=n._targets=n._overwrittenProps=n._startAt=null,n._notifyPluginsOfEnabled=n._lazy=!1,I.version="1.16.1",I.defaultEase=n._ease=new y(null,null,1,1),I.defaultOverwrite="auto",I.ticker=a,I.autoSleep=120,I.lagSmoothing=function(t,e){a.lagSmoothing(t,e)},I.selector=t.$||t.jQuery||function(e){var i=t.$||t.jQuery;return i?(I.selector=i,i(e)):"undefined"==typeof document?e:document.querySelectorAll?document.querySelectorAll(e):document.getElementById("#"===e.charAt(0)?e.substr(1):e)};var z=[],L={},N=I._internals={isArray:f,isSelector:E,lazyTweens:z},U=I._plugins={},F=N.tweenLookup={},j=0,G=N.reservedProps={ease:1,delay:1,overwrite:1,onComplete:1,onCompleteParams:1,onCompleteScope:1,useFrames:1,runBackwards:1,startAt:1,onUpdate:1,onUpdateParams:1,onUpdateScope:1,onStart:1,onStartParams:1,onStartScope:1,onReverseComplete:1,onReverseCompleteParams:1,onReverseCompleteScope:1,onRepeat:1,onRepeatParams:1,onRepeatScope:1,easeParams:1,yoyo:1,immediateRender:1,repeat:1,repeatDelay:1,data:1,paused:1,reversed:1,autoCSS:1,lazy:1,onOverwrite:1},Q={none:0,all:1,auto:2,concurrent:3,allOnStart:4,preexisting:5,"true":1,"false":0},q=R._rootFramesTimeline=new D,B=R._rootTimeline=new D,M=30,$=N.lazyRender=function(){var t,e=z.length;for(L={};--e>-1;)t=z[e],t&&t._lazy!==!1&&(t.render(t._lazy[0],t._lazy[1],!0),t._lazy=!1);z.length=0};B._startTime=a.time,q._startTime=a.frame,B._active=q._active=!0,setTimeout($,1),R._updateRoot=I.render=function(){var t,e,i;if(z.length&&$(),B.render((a.time-B._startTime)*B._timeScale,!1,!1),q.render((a.frame-q._startTime)*q._timeScale,!1,!1),z.length&&$(),a.frame>=M){M=a.frame+(parseInt(I.autoSleep,10)||120);for(i in F){for(e=F[i].tweens,t=e.length;--t>-1;)e[t]._gc&&e.splice(t,1);0===e.length&&delete F[i]}if(i=B._first,(!i||i._paused)&&I.autoSleep&&!q._first&&1===a._listeners.tick.length){for(;i&&i._paused;)i=i._next;i||a.sleep()}}},a.addEventListener("tick",R._updateRoot);var K=function(t,e,i){var s,r,n=t._gsTweenID;if(F[n||(t._gsTweenID=n="t"+j++)]||(F[n]={target:t,tweens:[]}),e&&(s=F[n].tweens,s[r=s.length]=e,i))for(;--r>-1;)s[r]===e&&s.splice(r,1);return F[n].tweens},H=function(t,e,i,s){var r,n,a=t.vars.onOverwrite;return a&&(r=a(t,e,i,s)),a=I.onOverwrite,a&&(n=a(t,e,i,s)),r!==!1&&n!==!1},J=function(t,e,i,s,r){var n,a,o,l;if(1===s||s>=4){for(l=r.length,n=0;l>n;n++)if((o=r[n])!==e)o._gc||H(o,e)&&o._enabled(!1,!1)&&(a=!0);else if(5===s)break;return a}var h,u=e._startTime+_,m=[],f=0,c=0===e._duration;for(n=r.length;--n>-1;)(o=r[n])===e||o._gc||o._paused||(o._timeline!==e._timeline?(h=h||V(e,0,c),0===V(o,h,c)&&(m[f++]=o)):u>=o._startTime&&o._startTime+o.totalDuration()/o._timeScale>u&&((c||!o._initted)&&2e-10>=u-o._startTime||(m[f++]=o)));for(n=f;--n>-1;)if(o=m[n],2===s&&o._kill(i,t,e)&&(a=!0),2!==s||!o._firstPT&&o._initted){if(2!==s&&!H(o,e))continue;o._enabled(!1,!1)&&(a=!0)}return a},V=function(t,e,i){for(var s=t._timeline,r=s._timeScale,n=t._startTime;s._timeline;){if(n+=s._startTime,r*=s._timeScale,s._paused)return-100;s=s._timeline}return n/=r,n>e?n-e:i&&n===e||!t._initted&&2*_>n-e?_:(n+=t.totalDuration()/t._timeScale/r)>e+_?0:n-e-_};n._init=function(){var t,e,i,s,r,n=this.vars,a=this._overwrittenProps,o=this._duration,l=!!n.immediateRender,h=n.ease;if(n.startAt){this._startAt&&(this._startAt.render(-1,!0),this._startAt.kill()),r={};for(s in n.startAt)r[s]=n.startAt[s];if(r.overwrite=!1,r.immediateRender=!0,r.lazy=l&&n.lazy!==!1,r.startAt=r.delay=null,this._startAt=I.to(this.target,0,r),l)if(this._time>0)this._startAt=null;else if(0!==o)return}else if(n.runBackwards&&0!==o)if(this._startAt)this._startAt.render(-1,!0),this._startAt.kill(),this._startAt=null;else{0!==this._time&&(l=!1),i={};for(s in n)G[s]&&"autoCSS"!==s||(i[s]=n[s]);if(i.overwrite=0,i.data="isFromStart",i.lazy=l&&n.lazy!==!1,i.immediateRender=l,this._startAt=I.to(this.target,0,i),l){if(0===this._time)return}else this._startAt._init(),this._startAt._enabled(!1),this.vars.immediateRender&&(this._startAt=null)}if(this._ease=h=h?h instanceof y?h:"function"==typeof h?new y(h,n.easeParams):w[h]||I.defaultEase:I.defaultEase,n.easeParams instanceof Array&&h.config&&(this._ease=h.config.apply(h,n.easeParams)),this._easeType=this._ease._type,this._easePower=this._ease._power,this._firstPT=null,this._targets)for(t=this._targets.length;--t>-1;)this._initProps(this._targets[t],this._propLookup[t]={},this._siblings[t],a?a[t]:null)&&(e=!0);else e=this._initProps(this.target,this._propLookup,this._siblings,a);if(e&&I._onPluginEvent("_onInitAllProps",this),a&&(this._firstPT||"function"!=typeof this.target&&this._enabled(!1,!1)),n.runBackwards)for(i=this._firstPT;i;)i.s+=i.c,i.c=-i.c,i=i._next;this._onUpdate=n.onUpdate,this._initted=!0},n._initProps=function(e,i,s,r){var n,a,o,l,h,_;if(null==e)return!1;L[e._gsTweenID]&&$(),this.vars.css||e.style&&e!==t&&e.nodeType&&U.css&&this.vars.autoCSS!==!1&&O(this.vars,e);for(n in this.vars){if(_=this.vars[n],G[n])_&&(_ instanceof Array||_.push&&f(_))&&-1!==_.join("").indexOf("{self}")&&(this.vars[n]=_=this._swapSelfInParams(_,this));else if(U[n]&&(l=new U[n])._onInitTween(e,this.vars[n],this)){for(this._firstPT=h={_next:this._firstPT,t:l,p:"setRatio",s:0,c:1,f:!0,n:n,pg:!0,pr:l._priority},a=l._overwriteProps.length;--a>-1;)i[l._overwriteProps[a]]=this._firstPT;(l._priority||l._onInitAllProps)&&(o=!0),(l._onDisable||l._onEnable)&&(this._notifyPluginsOfEnabled=!0)}else this._firstPT=i[n]=h={_next:this._firstPT,t:e,p:n,f:"function"==typeof e[n],n:n,pg:!1,pr:0},h.s=h.f?e[n.indexOf("set")||"function"!=typeof e["get"+n.substr(3)]?n:"get"+n.substr(3)]():parseFloat(e[n]),h.c="string"==typeof _&&"="===_.charAt(1)?parseInt(_.charAt(0)+"1",10)*Number(_.substr(2)):Number(_)-h.s||0;h&&h._next&&(h._next._prev=h)}return r&&this._kill(r,e)?this._initProps(e,i,s,r):this._overwrite>1&&this._firstPT&&s.length>1&&J(e,this,i,this._overwrite,s)?(this._kill(i,e),this._initProps(e,i,s,r)):(this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration)&&(L[e._gsTweenID]=!0),o)},n.render=function(t,e,i){var s,r,n,a,o=this._time,l=this._duration,h=this._rawPrevTime;if(t>=l)this._totalTime=this._time=l,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1,this._reversed||(s=!0,r="onComplete",i=i||this._timeline.autoRemoveChildren),0===l&&(this._initted||!this.vars.lazy||i)&&(this._startTime===this._timeline._duration&&(t=0),(0===t||0>h||h===_&&"isPause"!==this.data)&&h!==t&&(i=!0,h>_&&(r="onReverseComplete")),this._rawPrevTime=a=!e||t||h===t?t:_);else if(1e-7>t)this._totalTime=this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==o||0===l&&h>0)&&(r="onReverseComplete",s=this._reversed),0>t&&(this._active=!1,0===l&&(this._initted||!this.vars.lazy||i)&&(h>=0&&(h!==_||"isPause"!==this.data)&&(i=!0),this._rawPrevTime=a=!e||t||h===t?t:_)),this._initted||(i=!0);else if(this._totalTime=this._time=t,this._easeType){var u=t/l,m=this._easeType,f=this._easePower;(1===m||3===m&&u>=.5)&&(u=1-u),3===m&&(u*=2),1===f?u*=u:2===f?u*=u*u:3===f?u*=u*u*u:4===f&&(u*=u*u*u*u),this.ratio=1===m?1-u:2===m?u:.5>t/l?u/2:1-u/2}else this.ratio=this._ease.getRatio(t/l);if(this._time!==o||i){if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!i&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=this._totalTime=o,this._rawPrevTime=h,z.push(this),this._lazy=[t,e],void 0;this._time&&!s?this.ratio=this._ease.getRatio(this._time/l):s&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==o&&t>=0&&(this._active=!0),0===o&&(this._startAt&&(t>=0?this._startAt.render(t,e,i):r||(r="_dummyGS")),this.vars.onStart&&(0!==this._time||0===l)&&(e||this.vars.onStart.apply(this.vars.onStartScope||this,this.vars.onStartParams||T))),n=this._firstPT;n;)n.f?n.t[n.p](n.c*this.ratio+n.s):n.t[n.p]=n.c*this.ratio+n.s,n=n._next;this._onUpdate&&(0>t&&this._startAt&&t!==-1e-4&&this._startAt.render(t,e,i),e||(this._time!==o||s)&&this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||T)),r&&(!this._gc||i)&&(0>t&&this._startAt&&!this._onUpdate&&t!==-1e-4&&this._startAt.render(t,e,i),s&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!e&&this.vars[r]&&this.vars[r].apply(this.vars[r+"Scope"]||this,this.vars[r+"Params"]||T),0===l&&this._rawPrevTime===_&&a!==_&&(this._rawPrevTime=0))}},n._kill=function(t,e,i){if("all"===t&&(t=null),null==t&&(null==e||e===this.target))return this._lazy=!1,this._enabled(!1,!1);e="string"!=typeof e?e||this._targets||this.target:I.selector(e)||e;var s,r,n,a,o,l,h,_,u;if((f(e)||E(e))&&"number"!=typeof e[0])for(s=e.length;--s>-1;)this._kill(t,e[s])&&(l=!0);else{if(this._targets){for(s=this._targets.length;--s>-1;)if(e===this._targets[s]){o=this._propLookup[s]||{},this._overwrittenProps=this._overwrittenProps||[],r=this._overwrittenProps[s]=t?this._overwrittenProps[s]||{}:"all";break}}else{if(e!==this.target)return!1;o=this._propLookup,r=this._overwrittenProps=t?this._overwrittenProps||{}:"all"}if(o){if(h=t||o,_=t!==r&&"all"!==r&&t!==o&&("object"!=typeof t||!t._tempKill),i&&(I.onOverwrite||this.vars.onOverwrite)){for(n in h)o[n]&&(u||(u=[]),u.push(n));if(!H(this,i,e,u))return!1}for(n in h)(a=o[n])&&(a.pg&&a.t._kill(h)&&(l=!0),a.pg&&0!==a.t._overwriteProps.length||(a._prev?a._prev._next=a._next:a===this._firstPT&&(this._firstPT=a._next),a._next&&(a._next._prev=a._prev),a._next=a._prev=null),delete o[n]),_&&(r[n]=1);!this._firstPT&&this._initted&&this._enabled(!1,!1)}}return l},n.invalidate=function(){return this._notifyPluginsOfEnabled&&I._onPluginEvent("_onDisable",this),this._firstPT=this._overwrittenProps=this._startAt=this._onUpdate=null,this._notifyPluginsOfEnabled=this._active=this._lazy=!1,this._propLookup=this._targets?{}:[],R.prototype.invalidate.call(this),this.vars.immediateRender&&(this._time=-_,this.render(-this._delay)),this},n._enabled=function(t,e){if(o||a.wake(),t&&this._gc){var i,s=this._targets;if(s)for(i=s.length;--i>-1;)this._siblings[i]=K(s[i],this,!0);else this._siblings=K(this.target,this,!0)}return R.prototype._enabled.call(this,t,e),this._notifyPluginsOfEnabled&&this._firstPT?I._onPluginEvent(t?"_onEnable":"_onDisable",this):!1},I.to=function(t,e,i){return new I(t,e,i)},I.from=function(t,e,i){return i.runBackwards=!0,i.immediateRender=0!=i.immediateRender,new I(t,e,i)},I.fromTo=function(t,e,i,s){return s.startAt=i,s.immediateRender=0!=s.immediateRender&&0!=i.immediateRender,new I(t,e,s)},I.delayedCall=function(t,e,i,s,r){return new I(e,0,{delay:t,onComplete:e,onCompleteParams:i,onCompleteScope:s,onReverseComplete:e,onReverseCompleteParams:i,onReverseCompleteScope:s,immediateRender:!1,lazy:!1,useFrames:r,overwrite:0})},I.set=function(t,e){return new I(t,0,e)},I.getTweensOf=function(t,e){if(null==t)return[];t="string"!=typeof t?t:I.selector(t)||t;var i,s,r,n;if((f(t)||E(t))&&"number"!=typeof t[0]){for(i=t.length,s=[];--i>-1;)s=s.concat(I.getTweensOf(t[i],e));for(i=s.length;--i>-1;)for(n=s[i],r=i;--r>-1;)n===s[r]&&s.splice(i,1)}else for(s=K(t).concat(),i=s.length;--i>-1;)(s[i]._gc||e&&!s[i].isActive())&&s.splice(i,1);return s},I.killTweensOf=I.killDelayedCallsTo=function(t,e,i){"object"==typeof e&&(i=e,e=!1);for(var s=I.getTweensOf(t,e),r=s.length;--r>-1;)s[r]._kill(i,t)};var W=v("plugins.TweenPlugin",function(t,e){this._overwriteProps=(t||"").split(","),this._propName=this._overwriteProps[0],this._priority=e||0,this._super=W.prototype},!0);if(n=W.prototype,W.version="1.10.1",W.API=2,n._firstPT=null,n._addTween=function(t,e,i,s,r,n){var a,o;return null!=s&&(a="number"==typeof s||"="!==s.charAt(1)?Number(s)-i:parseInt(s.charAt(0)+"1",10)*Number(s.substr(2)))?(this._firstPT=o={_next:this._firstPT,t:t,p:e,s:i,c:a,f:"function"==typeof t[e],n:r||e,r:n},o._next&&(o._next._prev=o),o):void 0},n.setRatio=function(t){for(var e,i=this._firstPT,s=1e-6;i;)e=i.c*t+i.s,i.r?e=Math.round(e):s>e&&e>-s&&(e=0),i.f?i.t[i.p](e):i.t[i.p]=e,i=i._next},n._kill=function(t){var e,i=this._overwriteProps,s=this._firstPT;if(null!=t[this._propName])this._overwriteProps=[];else for(e=i.length;--e>-1;)null!=t[i[e]]&&i.splice(e,1);for(;s;)null!=t[s.n]&&(s._next&&(s._next._prev=s._prev),s._prev?(s._prev._next=s._next,s._prev=null):this._firstPT===s&&(this._firstPT=s._next)),s=s._next;return!1},n._roundProps=function(t,e){for(var i=this._firstPT;i;)(t[this._propName]||null!=i.n&&t[i.n.split(this._propName+"_").join("")])&&(i.r=e),i=i._next},I._onPluginEvent=function(t,e){var i,s,r,n,a,o=e._firstPT;if("_onInitAllProps"===t){for(;o;){for(a=o._next,s=r;s&&s.pr>o.pr;)s=s._next;(o._prev=s?s._prev:n)?o._prev._next=o:r=o,(o._next=s)?s._prev=o:n=o,o=a}o=e._firstPT=r}for(;o;)o.pg&&"function"==typeof o.t[t]&&o.t[t]()&&(i=!0),o=o._next;return i},W.activate=function(t){for(var e=t.length;--e>-1;)t[e].API===W.API&&(U[(new t[e])._propName]=t[e]);return!0},d.plugin=function(t){if(!(t&&t.propName&&t.init&&t.API))throw"illegal plugin definition.";var e,i=t.propName,s=t.priority||0,r=t.overwriteProps,n={init:"_onInitTween",set:"setRatio",kill:"_kill",round:"_roundProps",initAll:"_onInitAllProps"},a=v("plugins."+i.charAt(0).toUpperCase()+i.substr(1)+"Plugin",function(){W.call(this,i,s),this._overwriteProps=r||[]},t.global===!0),o=a.prototype=new W(i);o.constructor=a,a.API=t.API;for(e in n)"function"==typeof t[e]&&(o[n[e]]=t[e]);return a.version=t.version,W.activate([a]),a},s=t._gsQueue){for(r=0;s.length>r;r++)s[r]();for(n in c)c[n].func||t.console.log("GSAP encountered missing dependency: com.greensock."+n)}o=!1}})("undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window,"TweenLite");


var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("easing.Back",["easing.Ease"],function(t){var e,i,s,r=_gsScope.GreenSockGlobals||_gsScope,n=r.com.greensock,a=2*Math.PI,o=Math.PI/2,h=n._class,l=function(e,i){var s=h("easing."+e,function(){},!0),r=s.prototype=new t;return r.constructor=s,r.getRatio=i,s},_=t.register||function(){},u=function(t,e,i,s){var r=h("easing."+t,{easeOut:new e,easeIn:new i,easeInOut:new s},!0);return _(r,t),r},c=function(t,e,i){this.t=t,this.v=e,i&&(this.next=i,i.prev=this,this.c=i.v-e,this.gap=i.t-t)},p=function(e,i){var s=h("easing."+e,function(t){this._p1=t||0===t?t:1.70158,this._p2=1.525*this._p1},!0),r=s.prototype=new t;return r.constructor=s,r.getRatio=i,r.config=function(t){return new s(t)},s},f=u("Back",p("BackOut",function(t){return(t-=1)*t*((this._p1+1)*t+this._p1)+1}),p("BackIn",function(t){return t*t*((this._p1+1)*t-this._p1)}),p("BackInOut",function(t){return 1>(t*=2)?.5*t*t*((this._p2+1)*t-this._p2):.5*((t-=2)*t*((this._p2+1)*t+this._p2)+2)})),m=h("easing.SlowMo",function(t,e,i){e=e||0===e?e:.7,null==t?t=.7:t>1&&(t=1),this._p=1!==t?e:0,this._p1=(1-t)/2,this._p2=t,this._p3=this._p1+this._p2,this._calcEnd=i===!0},!0),d=m.prototype=new t;return d.constructor=m,d.getRatio=function(t){var e=t+(.5-t)*this._p;return this._p1>t?this._calcEnd?1-(t=1-t/this._p1)*t:e-(t=1-t/this._p1)*t*t*t*e:t>this._p3?this._calcEnd?1-(t=(t-this._p3)/this._p1)*t:e+(t-e)*(t=(t-this._p3)/this._p1)*t*t*t:this._calcEnd?1:e},m.ease=new m(.7,.7),d.config=m.config=function(t,e,i){return new m(t,e,i)},e=h("easing.SteppedEase",function(t){t=t||1,this._p1=1/t,this._p2=t+1},!0),d=e.prototype=new t,d.constructor=e,d.getRatio=function(t){return 0>t?t=0:t>=1&&(t=.999999999),(this._p2*t>>0)*this._p1},d.config=e.config=function(t){return new e(t)},i=h("easing.RoughEase",function(e){e=e||{};for(var i,s,r,n,a,o,h=e.taper||"none",l=[],_=0,u=0|(e.points||20),p=u,f=e.randomize!==!1,m=e.clamp===!0,d=e.template instanceof t?e.template:null,g="number"==typeof e.strength?.4*e.strength:.4;--p>-1;)i=f?Math.random():1/u*p,s=d?d.getRatio(i):i,"none"===h?r=g:"out"===h?(n=1-i,r=n*n*g):"in"===h?r=i*i*g:.5>i?(n=2*i,r=.5*n*n*g):(n=2*(1-i),r=.5*n*n*g),f?s+=Math.random()*r-.5*r:p%2?s+=.5*r:s-=.5*r,m&&(s>1?s=1:0>s&&(s=0)),l[_++]={x:i,y:s};for(l.sort(function(t,e){return t.x-e.x}),o=new c(1,1,null),p=u;--p>-1;)a=l[p],o=new c(a.x,a.y,o);this._prev=new c(0,0,0!==o.t?o:o.next)},!0),d=i.prototype=new t,d.constructor=i,d.getRatio=function(t){var e=this._prev;if(t>e.t){for(;e.next&&t>=e.t;)e=e.next;e=e.prev}else for(;e.prev&&e.t>=t;)e=e.prev;return this._prev=e,e.v+(t-e.t)/e.gap*e.c},d.config=function(t){return new i(t)},i.ease=new i,u("Bounce",l("BounceOut",function(t){return 1/2.75>t?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}),l("BounceIn",function(t){return 1/2.75>(t=1-t)?1-7.5625*t*t:2/2.75>t?1-(7.5625*(t-=1.5/2.75)*t+.75):2.5/2.75>t?1-(7.5625*(t-=2.25/2.75)*t+.9375):1-(7.5625*(t-=2.625/2.75)*t+.984375)}),l("BounceInOut",function(t){var e=.5>t;return t=e?1-2*t:2*t-1,t=1/2.75>t?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375,e?.5*(1-t):.5*t+.5})),u("Circ",l("CircOut",function(t){return Math.sqrt(1-(t-=1)*t)}),l("CircIn",function(t){return-(Math.sqrt(1-t*t)-1)}),l("CircInOut",function(t){return 1>(t*=2)?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)})),s=function(e,i,s){var r=h("easing."+e,function(t,e){this._p1=t>=1?t:1,this._p2=(e||s)/(1>t?t:1),this._p3=this._p2/a*(Math.asin(1/this._p1)||0),this._p2=a/this._p2},!0),n=r.prototype=new t;return n.constructor=r,n.getRatio=i,n.config=function(t,e){return new r(t,e)},r},u("Elastic",s("ElasticOut",function(t){return this._p1*Math.pow(2,-10*t)*Math.sin((t-this._p3)*this._p2)+1},.3),s("ElasticIn",function(t){return-(this._p1*Math.pow(2,10*(t-=1))*Math.sin((t-this._p3)*this._p2))},.3),s("ElasticInOut",function(t){return 1>(t*=2)?-.5*this._p1*Math.pow(2,10*(t-=1))*Math.sin((t-this._p3)*this._p2):.5*this._p1*Math.pow(2,-10*(t-=1))*Math.sin((t-this._p3)*this._p2)+1},.45)),u("Expo",l("ExpoOut",function(t){return 1-Math.pow(2,-10*t)}),l("ExpoIn",function(t){return Math.pow(2,10*(t-1))-.001}),l("ExpoInOut",function(t){return 1>(t*=2)?.5*Math.pow(2,10*(t-1)):.5*(2-Math.pow(2,-10*(t-1)))})),u("Sine",l("SineOut",function(t){return Math.sin(t*o)}),l("SineIn",function(t){return-Math.cos(t*o)+1}),l("SineInOut",function(t){return-.5*(Math.cos(Math.PI*t)-1)})),h("easing.EaseLookup",{find:function(e){return t.map[e]}},!0),_(r.SlowMo,"SlowMo","ease,"),_(i,"RoughEase","ease,"),_(e,"SteppedEase","ease,"),f},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()();


var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("plugins.CSSPlugin",["plugins.TweenPlugin","TweenLite"],function(t,e){var i,r,s,n,a=function(){t.call(this,"css"),this._overwriteProps.length=0,this.setRatio=a.prototype.setRatio},o=_gsScope._gsDefine.globals,l={},h=a.prototype=new t("css");h.constructor=a,a.version="1.16.1",a.API=2,a.defaultTransformPerspective=0,a.defaultSkewType="compensated",h="px",a.suffixMap={top:h,right:h,bottom:h,left:h,width:h,height:h,fontSize:h,padding:h,margin:h,perspective:h,lineHeight:""};var u,f,p,c,_,d,m=/(?:\d|\-\d|\.\d|\-\.\d)+/g,g=/(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,v=/(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,y=/(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,x=/(?:\d|\-|\+|=|#|\.)*/g,T=/opacity *= *([^)]*)/i,w=/opacity:([^;]*)/i,b=/alpha\(opacity *=.+?\)/i,P=/^(rgb|hsl)/,S=/([A-Z])/g,C=/-([a-z])/gi,O=/(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,k=function(t,e){return e.toUpperCase()},R=/(?:Left|Right|Width)/i,A=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,M=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,D=/,(?=[^\)]*(?:\(|$))/gi,N=Math.PI/180,L=180/Math.PI,X={},z=document,E=function(t){return z.createElementNS?z.createElementNS("http://www.w3.org/1999/xhtml",t):z.createElement(t)},F=E("div"),I=E("img"),Y=a._internals={_specialProps:l},B=navigator.userAgent,U=function(){var t=B.indexOf("Android"),e=E("a");return p=-1!==B.indexOf("Safari")&&-1===B.indexOf("Chrome")&&(-1===t||Number(B.substr(t+8,1))>3),_=p&&6>Number(B.substr(B.indexOf("Version/")+8,1)),c=-1!==B.indexOf("Firefox"),(/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(B)||/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(B))&&(d=parseFloat(RegExp.$1)),e?(e.style.cssText="top:1px;opacity:.55;",/^0.55/.test(e.style.opacity)):!1}(),j=function(t){return T.test("string"==typeof t?t:(t.currentStyle?t.currentStyle.filter:t.style.filter)||"")?parseFloat(RegExp.$1)/100:1},V=function(t){window.console&&console.log(t)},W="",q="",G=function(t,e){e=e||F;var i,r,s=e.style;if(void 0!==s[t])return t;for(t=t.charAt(0).toUpperCase()+t.substr(1),i=["O","Moz","ms","Ms","Webkit"],r=5;--r>-1&&void 0===s[i[r]+t];);return r>=0?(q=3===r?"ms":i[r],W="-"+q.toLowerCase()+"-",q+t):null},H=z.defaultView?z.defaultView.getComputedStyle:function(){},Q=a.getStyle=function(t,e,i,r,s){var n;return U||"opacity"!==e?(!r&&t.style[e]?n=t.style[e]:(i=i||H(t))?n=i[e]||i.getPropertyValue(e)||i.getPropertyValue(e.replace(S,"-$1").toLowerCase()):t.currentStyle&&(n=t.currentStyle[e]),null==s||n&&"none"!==n&&"auto"!==n&&"auto auto"!==n?n:s):j(t)},Z=Y.convertToPixels=function(t,i,r,s,n){if("px"===s||!s)return r;if("auto"===s||!r)return 0;var o,l,h,u=R.test(i),f=t,p=F.style,c=0>r;if(c&&(r=-r),"%"===s&&-1!==i.indexOf("border"))o=r/100*(u?t.clientWidth:t.clientHeight);else{if(p.cssText="border:0 solid red;position:"+Q(t,"position")+";line-height:0;","%"!==s&&f.appendChild)p[u?"borderLeftWidth":"borderTopWidth"]=r+s;else{if(f=t.parentNode||z.body,l=f._gsCache,h=e.ticker.frame,l&&u&&l.time===h)return l.width*r/100;p[u?"width":"height"]=r+s}f.appendChild(F),o=parseFloat(F[u?"offsetWidth":"offsetHeight"]),f.removeChild(F),u&&"%"===s&&a.cacheWidths!==!1&&(l=f._gsCache=f._gsCache||{},l.time=h,l.width=100*(o/r)),0!==o||n||(o=Z(t,i,r,s,!0))}return c?-o:o},$=Y.calculateOffset=function(t,e,i){if("absolute"!==Q(t,"position",i))return 0;var r="left"===e?"Left":"Top",s=Q(t,"margin"+r,i);return t["offset"+r]-(Z(t,e,parseFloat(s),s.replace(x,""))||0)},K=function(t,e){var i,r,s,n={};if(e=e||H(t,null))if(i=e.length)for(;--i>-1;)s=e[i],(-1===s.indexOf("-transform")||be===s)&&(n[s.replace(C,k)]=e.getPropertyValue(s));else for(i in e)(-1===i.indexOf("Transform")||we===i)&&(n[i]=e[i]);else if(e=t.currentStyle||t.style)for(i in e)"string"==typeof i&&void 0===n[i]&&(n[i.replace(C,k)]=e[i]);return U||(n.opacity=j(t)),r=De(t,e,!1),n.rotation=r.rotation,n.skewX=r.skewX,n.scaleX=r.scaleX,n.scaleY=r.scaleY,n.x=r.x,n.y=r.y,Se&&(n.z=r.z,n.rotationX=r.rotationX,n.rotationY=r.rotationY,n.scaleZ=r.scaleZ),n.filters&&delete n.filters,n},J=function(t,e,i,r,s){var n,a,o,l={},h=t.style;for(a in i)"cssText"!==a&&"length"!==a&&isNaN(a)&&(e[a]!==(n=i[a])||s&&s[a])&&-1===a.indexOf("Origin")&&("number"==typeof n||"string"==typeof n)&&(l[a]="auto"!==n||"left"!==a&&"top"!==a?""!==n&&"auto"!==n&&"none"!==n||"string"!=typeof e[a]||""===e[a].replace(y,"")?n:0:$(t,a),void 0!==h[a]&&(o=new ce(h,a,h[a],o)));if(r)for(a in r)"className"!==a&&(l[a]=r[a]);return{difs:l,firstMPT:o}},te={width:["Left","Right"],height:["Top","Bottom"]},ee=["marginLeft","marginRight","marginTop","marginBottom"],ie=function(t,e,i){var r=parseFloat("width"===e?t.offsetWidth:t.offsetHeight),s=te[e],n=s.length;for(i=i||H(t,null);--n>-1;)r-=parseFloat(Q(t,"padding"+s[n],i,!0))||0,r-=parseFloat(Q(t,"border"+s[n]+"Width",i,!0))||0;return r},re=function(t,e){(null==t||""===t||"auto"===t||"auto auto"===t)&&(t="0 0");var i=t.split(" "),r=-1!==t.indexOf("left")?"0%":-1!==t.indexOf("right")?"100%":i[0],s=-1!==t.indexOf("top")?"0%":-1!==t.indexOf("bottom")?"100%":i[1];return null==s?s="center"===r?"50%":"0":"center"===s&&(s="50%"),("center"===r||isNaN(parseFloat(r))&&-1===(r+"").indexOf("="))&&(r="50%"),t=r+" "+s+(i.length>2?" "+i[2]:""),e&&(e.oxp=-1!==r.indexOf("%"),e.oyp=-1!==s.indexOf("%"),e.oxr="="===r.charAt(1),e.oyr="="===s.charAt(1),e.ox=parseFloat(r.replace(y,"")),e.oy=parseFloat(s.replace(y,"")),e.v=t),e||t},se=function(t,e){return"string"==typeof t&&"="===t.charAt(1)?parseInt(t.charAt(0)+"1",10)*parseFloat(t.substr(2)):parseFloat(t)-parseFloat(e)},ne=function(t,e){return null==t?e:"string"==typeof t&&"="===t.charAt(1)?parseInt(t.charAt(0)+"1",10)*parseFloat(t.substr(2))+e:parseFloat(t)},ae=function(t,e,i,r){var s,n,a,o,l,h=1e-6;return null==t?o=e:"number"==typeof t?o=t:(s=360,n=t.split("_"),l="="===t.charAt(1),a=(l?parseInt(t.charAt(0)+"1",10)*parseFloat(n[0].substr(2)):parseFloat(n[0]))*(-1===t.indexOf("rad")?1:L)-(l?0:e),n.length&&(r&&(r[i]=e+a),-1!==t.indexOf("short")&&(a%=s,a!==a%(s/2)&&(a=0>a?a+s:a-s)),-1!==t.indexOf("_cw")&&0>a?a=(a+9999999999*s)%s-(0|a/s)*s:-1!==t.indexOf("ccw")&&a>0&&(a=(a-9999999999*s)%s-(0|a/s)*s)),o=e+a),h>o&&o>-h&&(o=0),o},oe={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]},le=function(t,e,i){return t=0>t?t+1:t>1?t-1:t,0|255*(1>6*t?e+6*(i-e)*t:.5>t?i:2>3*t?e+6*(i-e)*(2/3-t):e)+.5},he=a.parseColor=function(t){var e,i,r,s,n,a;return t&&""!==t?"number"==typeof t?[t>>16,255&t>>8,255&t]:(","===t.charAt(t.length-1)&&(t=t.substr(0,t.length-1)),oe[t]?oe[t]:"#"===t.charAt(0)?(4===t.length&&(e=t.charAt(1),i=t.charAt(2),r=t.charAt(3),t="#"+e+e+i+i+r+r),t=parseInt(t.substr(1),16),[t>>16,255&t>>8,255&t]):"hsl"===t.substr(0,3)?(t=t.match(m),s=Number(t[0])%360/360,n=Number(t[1])/100,a=Number(t[2])/100,i=.5>=a?a*(n+1):a+n-a*n,e=2*a-i,t.length>3&&(t[3]=Number(t[3])),t[0]=le(s+1/3,e,i),t[1]=le(s,e,i),t[2]=le(s-1/3,e,i),t):(t=t.match(m)||oe.transparent,t[0]=Number(t[0]),t[1]=Number(t[1]),t[2]=Number(t[2]),t.length>3&&(t[3]=Number(t[3])),t)):oe.black},ue="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#.+?\\b";for(h in oe)ue+="|"+h+"\\b";ue=RegExp(ue+")","gi");var fe=function(t,e,i,r){if(null==t)return function(t){return t};var s,n=e?(t.match(ue)||[""])[0]:"",a=t.split(n).join("").match(v)||[],o=t.substr(0,t.indexOf(a[0])),l=")"===t.charAt(t.length-1)?")":"",h=-1!==t.indexOf(" ")?" ":",",u=a.length,f=u>0?a[0].replace(m,""):"";return u?s=e?function(t){var e,p,c,_;if("number"==typeof t)t+=f;else if(r&&D.test(t)){for(_=t.replace(D,"|").split("|"),c=0;_.length>c;c++)_[c]=s(_[c]);return _.join(",")}if(e=(t.match(ue)||[n])[0],p=t.split(e).join("").match(v)||[],c=p.length,u>c--)for(;u>++c;)p[c]=i?p[0|(c-1)/2]:a[c];return o+p.join(h)+h+e+l+(-1!==t.indexOf("inset")?" inset":"")}:function(t){var e,n,p;if("number"==typeof t)t+=f;else if(r&&D.test(t)){for(n=t.replace(D,"|").split("|"),p=0;n.length>p;p++)n[p]=s(n[p]);return n.join(",")}if(e=t.match(v)||[],p=e.length,u>p--)for(;u>++p;)e[p]=i?e[0|(p-1)/2]:a[p];return o+e.join(h)+l}:function(t){return t}},pe=function(t){return t=t.split(","),function(e,i,r,s,n,a,o){var l,h=(i+"").split(" ");for(o={},l=0;4>l;l++)o[t[l]]=h[l]=h[l]||h[(l-1)/2>>0];return s.parse(e,o,n,a)}},ce=(Y._setPluginRatio=function(t){this.plugin.setRatio(t);for(var e,i,r,s,n=this.data,a=n.proxy,o=n.firstMPT,l=1e-6;o;)e=a[o.v],o.r?e=Math.round(e):l>e&&e>-l&&(e=0),o.t[o.p]=e,o=o._next;if(n.autoRotate&&(n.autoRotate.rotation=a.rotation),1===t)for(o=n.firstMPT;o;){if(i=o.t,i.type){if(1===i.type){for(s=i.xs0+i.s+i.xs1,r=1;i.l>r;r++)s+=i["xn"+r]+i["xs"+(r+1)];i.e=s}}else i.e=i.s+i.xs0;o=o._next}},function(t,e,i,r,s){this.t=t,this.p=e,this.v=i,this.r=s,r&&(r._prev=this,this._next=r)}),_e=(Y._parseToProxy=function(t,e,i,r,s,n){var a,o,l,h,u,f=r,p={},c={},_=i._transform,d=X;for(i._transform=null,X=e,r=u=i.parse(t,e,r,s),X=d,n&&(i._transform=_,f&&(f._prev=null,f._prev&&(f._prev._next=null)));r&&r!==f;){if(1>=r.type&&(o=r.p,c[o]=r.s+r.c,p[o]=r.s,n||(h=new ce(r,"s",o,h,r.r),r.c=0),1===r.type))for(a=r.l;--a>0;)l="xn"+a,o=r.p+"_"+l,c[o]=r.data[l],p[o]=r[l],n||(h=new ce(r,l,o,h,r.rxp[l]));r=r._next}return{proxy:p,end:c,firstMPT:h,pt:u}},Y.CSSPropTween=function(t,e,r,s,a,o,l,h,u,f,p){this.t=t,this.p=e,this.s=r,this.c=s,this.n=l||e,t instanceof _e||n.push(this.n),this.r=h,this.type=o||0,u&&(this.pr=u,i=!0),this.b=void 0===f?r:f,this.e=void 0===p?r+s:p,a&&(this._next=a,a._prev=this)}),de=a.parseComplex=function(t,e,i,r,s,n,a,o,l,h){i=i||n||"",a=new _e(t,e,0,0,a,h?2:1,null,!1,o,i,r),r+="";var f,p,c,_,d,v,y,x,T,w,b,S,C=i.split(", ").join(",").split(" "),O=r.split(", ").join(",").split(" "),k=C.length,R=u!==!1;for((-1!==r.indexOf(",")||-1!==i.indexOf(","))&&(C=C.join(" ").replace(D,", ").split(" "),O=O.join(" ").replace(D,", ").split(" "),k=C.length),k!==O.length&&(C=(n||"").split(" "),k=C.length),a.plugin=l,a.setRatio=h,f=0;k>f;f++)if(_=C[f],d=O[f],x=parseFloat(_),x||0===x)a.appendXtra("",x,se(d,x),d.replace(g,""),R&&-1!==d.indexOf("px"),!0);else if(s&&("#"===_.charAt(0)||oe[_]||P.test(_)))S=","===d.charAt(d.length-1)?"),":")",_=he(_),d=he(d),T=_.length+d.length>6,T&&!U&&0===d[3]?(a["xs"+a.l]+=a.l?" transparent":"transparent",a.e=a.e.split(O[f]).join("transparent")):(U||(T=!1),a.appendXtra(T?"rgba(":"rgb(",_[0],d[0]-_[0],",",!0,!0).appendXtra("",_[1],d[1]-_[1],",",!0).appendXtra("",_[2],d[2]-_[2],T?",":S,!0),T&&(_=4>_.length?1:_[3],a.appendXtra("",_,(4>d.length?1:d[3])-_,S,!1)));else if(v=_.match(m)){if(y=d.match(g),!y||y.length!==v.length)return a;for(c=0,p=0;v.length>p;p++)b=v[p],w=_.indexOf(b,c),a.appendXtra(_.substr(c,w-c),Number(b),se(y[p],b),"",R&&"px"===_.substr(w+b.length,2),0===p),c=w+b.length;a["xs"+a.l]+=_.substr(c)}else a["xs"+a.l]+=a.l?" "+_:_;if(-1!==r.indexOf("=")&&a.data){for(S=a.xs0+a.data.s,f=1;a.l>f;f++)S+=a["xs"+f]+a.data["xn"+f];a.e=S+a["xs"+f]}return a.l||(a.type=-1,a.xs0=a.e),a.xfirst||a},me=9;for(h=_e.prototype,h.l=h.pr=0;--me>0;)h["xn"+me]=0,h["xs"+me]="";h.xs0="",h._next=h._prev=h.xfirst=h.data=h.plugin=h.setRatio=h.rxp=null,h.appendXtra=function(t,e,i,r,s,n){var a=this,o=a.l;return a["xs"+o]+=n&&o?" "+t:t||"",i||0===o||a.plugin?(a.l++,a.type=a.setRatio?2:1,a["xs"+a.l]=r||"",o>0?(a.data["xn"+o]=e+i,a.rxp["xn"+o]=s,a["xn"+o]=e,a.plugin||(a.xfirst=new _e(a,"xn"+o,e,i,a.xfirst||a,0,a.n,s,a.pr),a.xfirst.xs0=0),a):(a.data={s:e+i},a.rxp={},a.s=e,a.c=i,a.r=s,a)):(a["xs"+o]+=e+(r||""),a)};var ge=function(t,e){e=e||{},this.p=e.prefix?G(t)||t:t,l[t]=l[this.p]=this,this.format=e.formatter||fe(e.defaultValue,e.color,e.collapsible,e.multi),e.parser&&(this.parse=e.parser),this.clrs=e.color,this.multi=e.multi,this.keyword=e.keyword,this.dflt=e.defaultValue,this.pr=e.priority||0},ve=Y._registerComplexSpecialProp=function(t,e,i){"object"!=typeof e&&(e={parser:i});var r,s,n=t.split(","),a=e.defaultValue;for(i=i||[a],r=0;n.length>r;r++)e.prefix=0===r&&e.prefix,e.defaultValue=i[r]||a,s=new ge(n[r],e)},ye=function(t){if(!l[t]){var e=t.charAt(0).toUpperCase()+t.substr(1)+"Plugin";ve(t,{parser:function(t,i,r,s,n,a,h){var u=o.com.greensock.plugins[e];return u?(u._cssRegister(),l[r].parse(t,i,r,s,n,a,h)):(V("Error: "+e+" js file not loaded."),n)}})}};h=ge.prototype,h.parseComplex=function(t,e,i,r,s,n){var a,o,l,h,u,f,p=this.keyword;if(this.multi&&(D.test(i)||D.test(e)?(o=e.replace(D,"|").split("|"),l=i.replace(D,"|").split("|")):p&&(o=[e],l=[i])),l){for(h=l.length>o.length?l.length:o.length,a=0;h>a;a++)e=o[a]=o[a]||this.dflt,i=l[a]=l[a]||this.dflt,p&&(u=e.indexOf(p),f=i.indexOf(p),u!==f&&(-1===f?o[a]=o[a].split(p).join(""):-1===u&&(o[a]+=" "+p)));e=o.join(", "),i=l.join(", ")}return de(t,this.p,e,i,this.clrs,this.dflt,r,this.pr,s,n)},h.parse=function(t,e,i,r,n,a){return this.parseComplex(t.style,this.format(Q(t,this.p,s,!1,this.dflt)),this.format(e),n,a)},a.registerSpecialProp=function(t,e,i){ve(t,{parser:function(t,r,s,n,a,o){var l=new _e(t,s,0,0,a,2,s,!1,i);return l.plugin=o,l.setRatio=e(t,r,n._tween,s),l},priority:i})},a.useSVGTransformAttr=p;var xe,Te="scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),we=G("transform"),be=W+"transform",Pe=G("transformOrigin"),Se=null!==G("perspective"),Ce=Y.Transform=function(){this.perspective=parseFloat(a.defaultTransformPerspective)||0,this.force3D=a.defaultForce3D!==!1&&Se?a.defaultForce3D||"auto":!1},Oe=window.SVGElement,ke=function(t,e,i){var r,s=z.createElementNS("http://www.w3.org/2000/svg",t),n=/([a-z])([A-Z])/g;for(r in i)s.setAttributeNS(null,r.replace(n,"$1-$2").toLowerCase(),i[r]);return e.appendChild(s),s},Re=z.documentElement,Ae=function(){var t,e,i,r=d||/Android/i.test(B)&&!window.chrome;return z.createElementNS&&!r&&(t=ke("svg",Re),e=ke("rect",t,{width:100,height:50,x:100}),i=e.getBoundingClientRect().width,e.style[Pe]="50% 50%",e.style[we]="scaleX(0.5)",r=i===e.getBoundingClientRect().width&&!(c&&Se),Re.removeChild(t)),r}(),Me=function(t,e,i,r){var s,n;r&&(n=r.split(" ")).length||(s=t.getBBox(),e=re(e).split(" "),n=[(-1!==e[0].indexOf("%")?parseFloat(e[0])/100*s.width:parseFloat(e[0]))+s.x,(-1!==e[1].indexOf("%")?parseFloat(e[1])/100*s.height:parseFloat(e[1]))+s.y]),i.xOrigin=parseFloat(n[0]),i.yOrigin=parseFloat(n[1]),t.setAttribute("data-svg-origin",n.join(" "))},De=Y.getTransform=function(t,e,i,r){if(t._gsTransform&&i&&!r)return t._gsTransform;var n,o,l,h,u,f,p,c,_,d,m=i?t._gsTransform||new Ce:new Ce,g=0>m.scaleX,v=2e-5,y=1e5,x=Se?parseFloat(Q(t,Pe,e,!1,"0 0 0").split(" ")[2])||m.zOrigin||0:0,T=parseFloat(a.defaultTransformPerspective)||0;if(we?o=Q(t,be,e,!0):t.currentStyle&&(o=t.currentStyle.filter.match(A),o=o&&4===o.length?[o[0].substr(4),Number(o[2].substr(4)),Number(o[1].substr(4)),o[3].substr(4),m.x||0,m.y||0].join(","):""),n=!o||"none"===o||"matrix(1, 0, 0, 1, 0, 0)"===o,m.svg=!!(Oe&&"function"==typeof t.getBBox&&t.getCTM&&(!t.parentNode||t.parentNode.getBBox&&t.parentNode.getCTM)),m.svg&&(n&&-1!==(t.style[we]+"").indexOf("matrix")&&(o=t.style[we],n=!1),Me(t,Q(t,Pe,s,!1,"50% 50%")+"",m,t.getAttribute("data-svg-origin")),xe=a.useSVGTransformAttr||Ae,l=t.getAttribute("transform"),n&&l&&-1!==l.indexOf("matrix")&&(o=l,n=0)),!n){for(l=(o||"").match(/(?:\-|\b)[\d\-\.e]+\b/gi)||[],h=l.length;--h>-1;)u=Number(l[h]),l[h]=(f=u-(u|=0))?(0|f*y+(0>f?-.5:.5))/y+u:u;if(16===l.length){var w,b,P,S,C,O=l[0],k=l[1],R=l[2],M=l[3],D=l[4],N=l[5],X=l[6],z=l[7],E=l[8],F=l[9],I=l[10],Y=l[12],B=l[13],U=l[14],j=l[11],V=Math.atan2(X,I);m.zOrigin&&(U=-m.zOrigin,Y=E*U-l[12],B=F*U-l[13],U=I*U+m.zOrigin-l[14]),m.rotationX=V*L,V&&(S=Math.cos(-V),C=Math.sin(-V),w=D*S+E*C,b=N*S+F*C,P=X*S+I*C,E=D*-C+E*S,F=N*-C+F*S,I=X*-C+I*S,j=z*-C+j*S,D=w,N=b,X=P),V=Math.atan2(E,I),m.rotationY=V*L,V&&(S=Math.cos(-V),C=Math.sin(-V),w=O*S-E*C,b=k*S-F*C,P=R*S-I*C,F=k*C+F*S,I=R*C+I*S,j=M*C+j*S,O=w,k=b,R=P),V=Math.atan2(k,O),m.rotation=V*L,V&&(S=Math.cos(-V),C=Math.sin(-V),O=O*S+D*C,b=k*S+N*C,N=k*-C+N*S,X=R*-C+X*S,k=b),m.rotationX&&Math.abs(m.rotationX)+Math.abs(m.rotation)>359.9&&(m.rotationX=m.rotation=0,m.rotationY+=180),m.scaleX=(0|Math.sqrt(O*O+k*k)*y+.5)/y,m.scaleY=(0|Math.sqrt(N*N+F*F)*y+.5)/y,m.scaleZ=(0|Math.sqrt(X*X+I*I)*y+.5)/y,m.skewX=0,m.perspective=j?1/(0>j?-j:j):0,m.x=Y,m.y=B,m.z=U,m.svg&&(m.x-=m.xOrigin-(m.xOrigin*O-m.yOrigin*D),m.y-=m.yOrigin-(m.yOrigin*k-m.xOrigin*N))}else if(!(Se&&!r&&l.length&&m.x===l[4]&&m.y===l[5]&&(m.rotationX||m.rotationY)||void 0!==m.x&&"none"===Q(t,"display",e))){var W=l.length>=6,q=W?l[0]:1,G=l[1]||0,H=l[2]||0,Z=W?l[3]:1;m.x=l[4]||0,m.y=l[5]||0,p=Math.sqrt(q*q+G*G),c=Math.sqrt(Z*Z+H*H),_=q||G?Math.atan2(G,q)*L:m.rotation||0,d=H||Z?Math.atan2(H,Z)*L+_:m.skewX||0,Math.abs(d)>90&&270>Math.abs(d)&&(g?(p*=-1,d+=0>=_?180:-180,_+=0>=_?180:-180):(c*=-1,d+=0>=d?180:-180)),m.scaleX=p,m.scaleY=c,m.rotation=_,m.skewX=d,Se&&(m.rotationX=m.rotationY=m.z=0,m.perspective=T,m.scaleZ=1),m.svg&&(m.x-=m.xOrigin-(m.xOrigin*q-m.yOrigin*G),m.y-=m.yOrigin-(m.yOrigin*Z-m.xOrigin*H))}m.zOrigin=x;for(h in m)v>m[h]&&m[h]>-v&&(m[h]=0)}return i&&(t._gsTransform=m,m.svg&&(xe&&t.style[we]?ze(t.style,we):!xe&&t.getAttribute("transform")&&t.removeAttribute("transform"))),m},Ne=function(t){var e,i,r=this.data,s=-r.rotation*N,n=s+r.skewX*N,a=1e5,o=(0|Math.cos(s)*r.scaleX*a)/a,l=(0|Math.sin(s)*r.scaleX*a)/a,h=(0|Math.sin(n)*-r.scaleY*a)/a,u=(0|Math.cos(n)*r.scaleY*a)/a,f=this.t.style,p=this.t.currentStyle;if(p){i=l,l=-h,h=-i,e=p.filter,f.filter="";var c,_,m=this.t.offsetWidth,g=this.t.offsetHeight,v="absolute"!==p.position,y="progid:DXImageTransform.Microsoft.Matrix(M11="+o+", M12="+l+", M21="+h+", M22="+u,w=r.x+m*r.xPercent/100,b=r.y+g*r.yPercent/100;if(null!=r.ox&&(c=(r.oxp?.01*m*r.ox:r.ox)-m/2,_=(r.oyp?.01*g*r.oy:r.oy)-g/2,w+=c-(c*o+_*l),b+=_-(c*h+_*u)),v?(c=m/2,_=g/2,y+=", Dx="+(c-(c*o+_*l)+w)+", Dy="+(_-(c*h+_*u)+b)+")"):y+=", sizingMethod='auto expand')",f.filter=-1!==e.indexOf("DXImageTransform.Microsoft.Matrix(")?e.replace(M,y):y+" "+e,(0===t||1===t)&&1===o&&0===l&&0===h&&1===u&&(v&&-1===y.indexOf("Dx=0, Dy=0")||T.test(e)&&100!==parseFloat(RegExp.$1)||-1===e.indexOf("gradient("&&e.indexOf("Alpha"))&&f.removeAttribute("filter")),!v){var P,S,C,O=8>d?1:-1;for(c=r.ieOffsetX||0,_=r.ieOffsetY||0,r.ieOffsetX=Math.round((m-((0>o?-o:o)*m+(0>l?-l:l)*g))/2+w),r.ieOffsetY=Math.round((g-((0>u?-u:u)*g+(0>h?-h:h)*m))/2+b),me=0;4>me;me++)S=ee[me],P=p[S],i=-1!==P.indexOf("px")?parseFloat(P):Z(this.t,S,parseFloat(P),P.replace(x,""))||0,C=i!==r[S]?2>me?-r.ieOffsetX:-r.ieOffsetY:2>me?c-r.ieOffsetX:_-r.ieOffsetY,f[S]=(r[S]=Math.round(i-C*(0===me||2===me?1:O)))+"px"}}},Le=Y.set3DTransformRatio=Y.setTransformRatio=function(t){var e,i,r,s,n,a,o,l,h,u,f,p,_,d,m,g,v,y,x,T,w,b,P,S=this.data,C=this.t.style,O=S.rotation,k=S.rotationX,R=S.rotationY,A=S.scaleX,M=S.scaleY,D=S.scaleZ,L=S.x,X=S.y,z=S.z,E=S.svg,F=S.perspective,I=S.force3D;if(!(((1!==t&&0!==t||"auto"!==I||this.tween._totalTime!==this.tween._totalDuration&&this.tween._totalTime)&&I||z||F||R||k)&&(!xe||!E)&&Se))return O||S.skewX||E?(O*=N,b=S.skewX*N,P=1e5,e=Math.cos(O)*A,s=Math.sin(O)*A,i=Math.sin(O-b)*-M,n=Math.cos(O-b)*M,b&&"simple"===S.skewType&&(v=Math.tan(b),v=Math.sqrt(1+v*v),i*=v,n*=v,S.skewY&&(e*=v,s*=v)),E&&(L+=S.xOrigin-(S.xOrigin*e+S.yOrigin*i),X+=S.yOrigin-(S.xOrigin*s+S.yOrigin*n),d=1e-6,d>L&&L>-d&&(L=0),d>X&&X>-d&&(X=0)),x=(0|e*P)/P+","+(0|s*P)/P+","+(0|i*P)/P+","+(0|n*P)/P+","+L+","+X+")",E&&xe?this.t.setAttribute("transform","matrix("+x):C[we]=(S.xPercent||S.yPercent?"translate("+S.xPercent+"%,"+S.yPercent+"%) matrix(":"matrix(")+x):C[we]=(S.xPercent||S.yPercent?"translate("+S.xPercent+"%,"+S.yPercent+"%) matrix(":"matrix(")+A+",0,0,"+M+","+L+","+X+")",void 0;if(c&&(d=1e-4,d>A&&A>-d&&(A=D=2e-5),d>M&&M>-d&&(M=D=2e-5),!F||S.z||S.rotationX||S.rotationY||(F=0)),O||S.skewX)O*=N,m=e=Math.cos(O),g=s=Math.sin(O),S.skewX&&(O-=S.skewX*N,m=Math.cos(O),g=Math.sin(O),"simple"===S.skewType&&(v=Math.tan(S.skewX*N),v=Math.sqrt(1+v*v),m*=v,g*=v,S.skewY&&(e*=v,s*=v))),i=-g,n=m;else{if(!(R||k||1!==D||F||E))return C[we]=(S.xPercent||S.yPercent?"translate("+S.xPercent+"%,"+S.yPercent+"%) translate3d(":"translate3d(")+L+"px,"+X+"px,"+z+"px)"+(1!==A||1!==M?" scale("+A+","+M+")":""),void 0;e=n=1,i=s=0}h=1,r=a=o=l=u=f=0,p=F?-1/F:0,_=S.zOrigin,d=1e-6,T=",",w="0",O=R*N,O&&(m=Math.cos(O),g=Math.sin(O),o=-g,u=p*-g,r=e*g,a=s*g,h=m,p*=m,e*=m,s*=m),O=k*N,O&&(m=Math.cos(O),g=Math.sin(O),v=i*m+r*g,y=n*m+a*g,l=h*g,f=p*g,r=i*-g+r*m,a=n*-g+a*m,h*=m,p*=m,i=v,n=y),1!==D&&(r*=D,a*=D,h*=D,p*=D),1!==M&&(i*=M,n*=M,l*=M,f*=M),1!==A&&(e*=A,s*=A,o*=A,u*=A),(_||E)&&(_&&(L+=r*-_,X+=a*-_,z+=h*-_+_),E&&(L+=S.xOrigin-(S.xOrigin*e+S.yOrigin*i),X+=S.yOrigin-(S.xOrigin*s+S.yOrigin*n)),d>L&&L>-d&&(L=w),d>X&&X>-d&&(X=w),d>z&&z>-d&&(z=0)),x=S.xPercent||S.yPercent?"translate("+S.xPercent+"%,"+S.yPercent+"%) matrix3d(":"matrix3d(",x+=(d>e&&e>-d?w:e)+T+(d>s&&s>-d?w:s)+T+(d>o&&o>-d?w:o),x+=T+(d>u&&u>-d?w:u)+T+(d>i&&i>-d?w:i)+T+(d>n&&n>-d?w:n),k||R?(x+=T+(d>l&&l>-d?w:l)+T+(d>f&&f>-d?w:f)+T+(d>r&&r>-d?w:r),x+=T+(d>a&&a>-d?w:a)+T+(d>h&&h>-d?w:h)+T+(d>p&&p>-d?w:p)+T):x+=",0,0,0,0,1,0,",x+=L+T+X+T+z+T+(F?1+-z/F:1)+")",C[we]=x};h=Ce.prototype,h.x=h.y=h.z=h.skewX=h.skewY=h.rotation=h.rotationX=h.rotationY=h.zOrigin=h.xPercent=h.yPercent=0,h.scaleX=h.scaleY=h.scaleZ=1,ve("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent",{parser:function(t,e,i,r,n,o,l){if(r._lastParsedTransform===l)return n;r._lastParsedTransform=l;var h,u,f,p,c,_,d,m=r._transform=De(t,s,!0,l.parseTransform),g=t.style,v=1e-6,y=Te.length,x=l,T={};if("string"==typeof x.transform&&we)f=F.style,f[we]=x.transform,f.display="block",f.position="absolute",z.body.appendChild(F),h=De(F,null,!1),z.body.removeChild(F);else if("object"==typeof x){if(h={scaleX:ne(null!=x.scaleX?x.scaleX:x.scale,m.scaleX),scaleY:ne(null!=x.scaleY?x.scaleY:x.scale,m.scaleY),scaleZ:ne(x.scaleZ,m.scaleZ),x:ne(x.x,m.x),y:ne(x.y,m.y),z:ne(x.z,m.z),xPercent:ne(x.xPercent,m.xPercent),yPercent:ne(x.yPercent,m.yPercent),perspective:ne(x.transformPerspective,m.perspective)},d=x.directionalRotation,null!=d)if("object"==typeof d)for(f in d)x[f]=d[f];else x.rotation=d;"string"==typeof x.x&&-1!==x.x.indexOf("%")&&(h.x=0,h.xPercent=ne(x.x,m.xPercent)),"string"==typeof x.y&&-1!==x.y.indexOf("%")&&(h.y=0,h.yPercent=ne(x.y,m.yPercent)),h.rotation=ae("rotation"in x?x.rotation:"shortRotation"in x?x.shortRotation+"_short":"rotationZ"in x?x.rotationZ:m.rotation,m.rotation,"rotation",T),Se&&(h.rotationX=ae("rotationX"in x?x.rotationX:"shortRotationX"in x?x.shortRotationX+"_short":m.rotationX||0,m.rotationX,"rotationX",T),h.rotationY=ae("rotationY"in x?x.rotationY:"shortRotationY"in x?x.shortRotationY+"_short":m.rotationY||0,m.rotationY,"rotationY",T)),h.skewX=null==x.skewX?m.skewX:ae(x.skewX,m.skewX),h.skewY=null==x.skewY?m.skewY:ae(x.skewY,m.skewY),(u=h.skewY-m.skewY)&&(h.skewX+=u,h.rotation+=u)}for(Se&&null!=x.force3D&&(m.force3D=x.force3D,_=!0),m.skewType=x.skewType||m.skewType||a.defaultSkewType,c=m.force3D||m.z||m.rotationX||m.rotationY||h.z||h.rotationX||h.rotationY||h.perspective,c||null==x.scale||(h.scaleZ=1);--y>-1;)i=Te[y],p=h[i]-m[i],(p>v||-v>p||null!=x[i]||null!=X[i])&&(_=!0,n=new _e(m,i,m[i],p,n),i in T&&(n.e=T[i]),n.xs0=0,n.plugin=o,r._overwriteProps.push(n.n));return p=x.transformOrigin,m.svg&&(p||x.svgOrigin)&&(Me(t,re(p),h,x.svgOrigin),n=new _e(m,"xOrigin",m.xOrigin,h.xOrigin-m.xOrigin,n,-1,"transformOrigin"),n.b=m.xOrigin,n.e=n.xs0=h.xOrigin,n=new _e(m,"yOrigin",m.yOrigin,h.yOrigin-m.yOrigin,n,-1,"transformOrigin"),n.b=m.yOrigin,n.e=n.xs0=h.yOrigin,p=xe?null:"0px 0px"),(p||Se&&c&&m.zOrigin)&&(we?(_=!0,i=Pe,p=(p||Q(t,i,s,!1,"50% 50%"))+"",n=new _e(g,i,0,0,n,-1,"transformOrigin"),n.b=g[i],n.plugin=o,Se?(f=m.zOrigin,p=p.split(" "),m.zOrigin=(p.length>2&&(0===f||"0px"!==p[2])?parseFloat(p[2]):f)||0,n.xs0=n.e=p[0]+" "+(p[1]||"50%")+" 0px",n=new _e(m,"zOrigin",0,0,n,-1,n.n),n.b=f,n.xs0=n.e=m.zOrigin):n.xs0=n.e=p):re(p+"",m)),_&&(r._transformType=m.svg&&xe||!c&&3!==this._transformType?2:3),n},prefix:!0}),ve("boxShadow",{defaultValue:"0px 0px 0px 0px #999",prefix:!0,color:!0,multi:!0,keyword:"inset"}),ve("borderRadius",{defaultValue:"0px",parser:function(t,e,i,n,a){e=this.format(e);var o,l,h,u,f,p,c,_,d,m,g,v,y,x,T,w,b=["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],P=t.style;for(d=parseFloat(t.offsetWidth),m=parseFloat(t.offsetHeight),o=e.split(" "),l=0;b.length>l;l++)this.p.indexOf("border")&&(b[l]=G(b[l])),f=u=Q(t,b[l],s,!1,"0px"),-1!==f.indexOf(" ")&&(u=f.split(" "),f=u[0],u=u[1]),p=h=o[l],c=parseFloat(f),v=f.substr((c+"").length),y="="===p.charAt(1),y?(_=parseInt(p.charAt(0)+"1",10),p=p.substr(2),_*=parseFloat(p),g=p.substr((_+"").length-(0>_?1:0))||""):(_=parseFloat(p),g=p.substr((_+"").length)),""===g&&(g=r[i]||v),g!==v&&(x=Z(t,"borderLeft",c,v),T=Z(t,"borderTop",c,v),"%"===g?(f=100*(x/d)+"%",u=100*(T/m)+"%"):"em"===g?(w=Z(t,"borderLeft",1,"em"),f=x/w+"em",u=T/w+"em"):(f=x+"px",u=T+"px"),y&&(p=parseFloat(f)+_+g,h=parseFloat(u)+_+g)),a=de(P,b[l],f+" "+u,p+" "+h,!1,"0px",a);return a},prefix:!0,formatter:fe("0px 0px 0px 0px",!1,!0)}),ve("backgroundPosition",{defaultValue:"0 0",parser:function(t,e,i,r,n,a){var o,l,h,u,f,p,c="background-position",_=s||H(t,null),m=this.format((_?d?_.getPropertyValue(c+"-x")+" "+_.getPropertyValue(c+"-y"):_.getPropertyValue(c):t.currentStyle.backgroundPositionX+" "+t.currentStyle.backgroundPositionY)||"0 0"),g=this.format(e);if(-1!==m.indexOf("%")!=(-1!==g.indexOf("%"))&&(p=Q(t,"backgroundImage").replace(O,""),p&&"none"!==p)){for(o=m.split(" "),l=g.split(" "),I.setAttribute("src",p),h=2;--h>-1;)m=o[h],u=-1!==m.indexOf("%"),u!==(-1!==l[h].indexOf("%"))&&(f=0===h?t.offsetWidth-I.width:t.offsetHeight-I.height,o[h]=u?parseFloat(m)/100*f+"px":100*(parseFloat(m)/f)+"%");m=o.join(" ")}return this.parseComplex(t.style,m,g,n,a)},formatter:re}),ve("backgroundSize",{defaultValue:"0 0",formatter:re}),ve("perspective",{defaultValue:"0px",prefix:!0}),ve("perspectiveOrigin",{defaultValue:"50% 50%",prefix:!0}),ve("transformStyle",{prefix:!0}),ve("backfaceVisibility",{prefix:!0}),ve("userSelect",{prefix:!0}),ve("margin",{parser:pe("marginTop,marginRight,marginBottom,marginLeft")}),ve("padding",{parser:pe("paddingTop,paddingRight,paddingBottom,paddingLeft")}),ve("clip",{defaultValue:"rect(0px,0px,0px,0px)",parser:function(t,e,i,r,n,a){var o,l,h;return 9>d?(l=t.currentStyle,h=8>d?" ":",",o="rect("+l.clipTop+h+l.clipRight+h+l.clipBottom+h+l.clipLeft+")",e=this.format(e).split(",").join(h)):(o=this.format(Q(t,this.p,s,!1,this.dflt)),e=this.format(e)),this.parseComplex(t.style,o,e,n,a)}}),ve("textShadow",{defaultValue:"0px 0px 0px #999",color:!0,multi:!0}),ve("autoRound,strictUnits",{parser:function(t,e,i,r,s){return s}}),ve("border",{defaultValue:"0px solid #000",parser:function(t,e,i,r,n,a){return this.parseComplex(t.style,this.format(Q(t,"borderTopWidth",s,!1,"0px")+" "+Q(t,"borderTopStyle",s,!1,"solid")+" "+Q(t,"borderTopColor",s,!1,"#000")),this.format(e),n,a)},color:!0,formatter:function(t){var e=t.split(" ");return e[0]+" "+(e[1]||"solid")+" "+(t.match(ue)||["#000"])[0]}}),ve("borderWidth",{parser:pe("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")}),ve("float,cssFloat,styleFloat",{parser:function(t,e,i,r,s){var n=t.style,a="cssFloat"in n?"cssFloat":"styleFloat";return new _e(n,a,0,0,s,-1,i,!1,0,n[a],e)}});var Xe=function(t){var e,i=this.t,r=i.filter||Q(this.data,"filter")||"",s=0|this.s+this.c*t;100===s&&(-1===r.indexOf("atrix(")&&-1===r.indexOf("radient(")&&-1===r.indexOf("oader(")?(i.removeAttribute("filter"),e=!Q(this.data,"filter")):(i.filter=r.replace(b,""),e=!0)),e||(this.xn1&&(i.filter=r=r||"alpha(opacity="+s+")"),-1===r.indexOf("pacity")?0===s&&this.xn1||(i.filter=r+" alpha(opacity="+s+")"):i.filter=r.replace(T,"opacity="+s))};ve("opacity,alpha,autoAlpha",{defaultValue:"1",parser:function(t,e,i,r,n,a){var o=parseFloat(Q(t,"opacity",s,!1,"1")),l=t.style,h="autoAlpha"===i;return"string"==typeof e&&"="===e.charAt(1)&&(e=("-"===e.charAt(0)?-1:1)*parseFloat(e.substr(2))+o),h&&1===o&&"hidden"===Q(t,"visibility",s)&&0!==e&&(o=0),U?n=new _e(l,"opacity",o,e-o,n):(n=new _e(l,"opacity",100*o,100*(e-o),n),n.xn1=h?1:0,l.zoom=1,n.type=2,n.b="alpha(opacity="+n.s+")",n.e="alpha(opacity="+(n.s+n.c)+")",n.data=t,n.plugin=a,n.setRatio=Xe),h&&(n=new _e(l,"visibility",0,0,n,-1,null,!1,0,0!==o?"inherit":"hidden",0===e?"hidden":"inherit"),n.xs0="inherit",r._overwriteProps.push(n.n),r._overwriteProps.push(i)),n}});var ze=function(t,e){e&&(t.removeProperty?(("ms"===e.substr(0,2)||"webkit"===e.substr(0,6))&&(e="-"+e),t.removeProperty(e.replace(S,"-$1").toLowerCase())):t.removeAttribute(e))},Ee=function(t){if(this.t._gsClassPT=this,1===t||0===t){this.t.setAttribute("class",0===t?this.b:this.e);for(var e=this.data,i=this.t.style;e;)e.v?i[e.p]=e.v:ze(i,e.p),e=e._next;1===t&&this.t._gsClassPT===this&&(this.t._gsClassPT=null)}else this.t.getAttribute("class")!==this.e&&this.t.setAttribute("class",this.e)};ve("className",{parser:function(t,e,r,n,a,o,l){var h,u,f,p,c,_=t.getAttribute("class")||"",d=t.style.cssText;if(a=n._classNamePT=new _e(t,r,0,0,a,2),a.setRatio=Ee,a.pr=-11,i=!0,a.b=_,u=K(t,s),f=t._gsClassPT){for(p={},c=f.data;c;)p[c.p]=1,c=c._next;f.setRatio(1)}return t._gsClassPT=a,a.e="="!==e.charAt(1)?e:_.replace(RegExp("\\s*\\b"+e.substr(2)+"\\b"),"")+("+"===e.charAt(0)?" "+e.substr(2):""),t.setAttribute("class",a.e),h=J(t,u,K(t),l,p),t.setAttribute("class",_),a.data=h.firstMPT,t.style.cssText=d,a=a.xfirst=n.parse(t,h.difs,a,o)}});var Fe=function(t){if((1===t||0===t)&&this.data._totalTime===this.data._totalDuration&&"isFromStart"!==this.data.data){var e,i,r,s,n,a=this.t.style,o=l.transform.parse;if("all"===this.e)a.cssText="",s=!0;else for(e=this.e.split(" ").join("").split(","),r=e.length;--r>-1;)i=e[r],l[i]&&(l[i].parse===o?s=!0:i="transformOrigin"===i?Pe:l[i].p),ze(a,i);s&&(ze(a,we),n=this.t._gsTransform,n&&(n.svg&&this.t.removeAttribute("data-svg-origin"),delete this.t._gsTransform))}};for(ve("clearProps",{parser:function(t,e,r,s,n){return n=new _e(t,r,0,0,n,2),n.setRatio=Fe,n.e=e,n.pr=-10,n.data=s._tween,i=!0,n}}),h="bezier,throwProps,physicsProps,physics2D".split(","),me=h.length;me--;)ye(h[me]);h=a.prototype,h._firstPT=h._lastParsedTransform=h._transform=null,h._onInitTween=function(t,e,o){if(!t.nodeType)return!1;this._target=t,this._tween=o,this._vars=e,u=e.autoRound,i=!1,r=e.suffixMap||a.suffixMap,s=H(t,""),n=this._overwriteProps;var h,c,d,m,g,v,y,x,T,b=t.style;if(f&&""===b.zIndex&&(h=Q(t,"zIndex",s),("auto"===h||""===h)&&this._addLazySet(b,"zIndex",0)),"string"==typeof e&&(m=b.cssText,h=K(t,s),b.cssText=m+";"+e,h=J(t,h,K(t)).difs,!U&&w.test(e)&&(h.opacity=parseFloat(RegExp.$1)),e=h,b.cssText=m),this._firstPT=c=e.className?l.className.parse(t,e.className,"className",this,null,null,e):this.parse(t,e,null),this._transformType){for(T=3===this._transformType,we?p&&(f=!0,""===b.zIndex&&(y=Q(t,"zIndex",s),("auto"===y||""===y)&&this._addLazySet(b,"zIndex",0)),_&&this._addLazySet(b,"WebkitBackfaceVisibility",this._vars.WebkitBackfaceVisibility||(T?"visible":"hidden"))):b.zoom=1,d=c;d&&d._next;)d=d._next;x=new _e(t,"transform",0,0,null,2),this._linkCSSP(x,null,d),x.setRatio=we?Le:Ne,x.data=this._transform||De(t,s,!0),x.tween=o,x.pr=-1,n.pop()}if(i){for(;c;){for(v=c._next,d=m;d&&d.pr>c.pr;)d=d._next;(c._prev=d?d._prev:g)?c._prev._next=c:m=c,(c._next=d)?d._prev=c:g=c,c=v}this._firstPT=m}return!0},h.parse=function(t,e,i,n){var a,o,h,f,p,c,_,d,m,g,v=t.style;for(a in e)c=e[a],o=l[a],o?i=o.parse(t,c,a,this,i,n,e):(p=Q(t,a,s)+"",m="string"==typeof c,"color"===a||"fill"===a||"stroke"===a||-1!==a.indexOf("Color")||m&&P.test(c)?(m||(c=he(c),c=(c.length>3?"rgba(":"rgb(")+c.join(",")+")"),i=de(v,a,p,c,!0,"transparent",i,0,n)):!m||-1===c.indexOf(" ")&&-1===c.indexOf(",")?(h=parseFloat(p),_=h||0===h?p.substr((h+"").length):"",(""===p||"auto"===p)&&("width"===a||"height"===a?(h=ie(t,a,s),_="px"):"left"===a||"top"===a?(h=$(t,a,s),_="px"):(h="opacity"!==a?0:1,_="")),g=m&&"="===c.charAt(1),g?(f=parseInt(c.charAt(0)+"1",10),c=c.substr(2),f*=parseFloat(c),d=c.replace(x,"")):(f=parseFloat(c),d=m?c.replace(x,""):""),""===d&&(d=a in r?r[a]:_),c=f||0===f?(g?f+h:f)+d:e[a],_!==d&&""!==d&&(f||0===f)&&h&&(h=Z(t,a,h,_),"%"===d?(h/=Z(t,a,100,"%")/100,e.strictUnits!==!0&&(p=h+"%")):"em"===d?h/=Z(t,a,1,"em"):"px"!==d&&(f=Z(t,a,f,d),d="px"),g&&(f||0===f)&&(c=f+h+d)),g&&(f+=h),!h&&0!==h||!f&&0!==f?void 0!==v[a]&&(c||"NaN"!=c+""&&null!=c)?(i=new _e(v,a,f||h||0,0,i,-1,a,!1,0,p,c),i.xs0="none"!==c||"display"!==a&&-1===a.indexOf("Style")?c:p):V("invalid "+a+" tween value: "+e[a]):(i=new _e(v,a,h,f-h,i,0,a,u!==!1&&("px"===d||"zIndex"===a),0,p,c),i.xs0=d)):i=de(v,a,p,c,!0,null,i,0,n)),n&&i&&!i.plugin&&(i.plugin=n);
return i},h.setRatio=function(t){var e,i,r,s=this._firstPT,n=1e-6;if(1!==t||this._tween._time!==this._tween._duration&&0!==this._tween._time)if(t||this._tween._time!==this._tween._duration&&0!==this._tween._time||this._tween._rawPrevTime===-1e-6)for(;s;){if(e=s.c*t+s.s,s.r?e=Math.round(e):n>e&&e>-n&&(e=0),s.type)if(1===s.type)if(r=s.l,2===r)s.t[s.p]=s.xs0+e+s.xs1+s.xn1+s.xs2;else if(3===r)s.t[s.p]=s.xs0+e+s.xs1+s.xn1+s.xs2+s.xn2+s.xs3;else if(4===r)s.t[s.p]=s.xs0+e+s.xs1+s.xn1+s.xs2+s.xn2+s.xs3+s.xn3+s.xs4;else if(5===r)s.t[s.p]=s.xs0+e+s.xs1+s.xn1+s.xs2+s.xn2+s.xs3+s.xn3+s.xs4+s.xn4+s.xs5;else{for(i=s.xs0+e+s.xs1,r=1;s.l>r;r++)i+=s["xn"+r]+s["xs"+(r+1)];s.t[s.p]=i}else-1===s.type?s.t[s.p]=s.xs0:s.setRatio&&s.setRatio(t);else s.t[s.p]=e+s.xs0;s=s._next}else for(;s;)2!==s.type?s.t[s.p]=s.b:s.setRatio(t),s=s._next;else for(;s;)2!==s.type?s.t[s.p]=s.e:s.setRatio(t),s=s._next},h._enableTransforms=function(t){this._transform=this._transform||De(this._target,s,!0),this._transformType=this._transform.svg&&xe||!t&&3!==this._transformType?2:3};var Ie=function(){this.t[this.p]=this.e,this.data._linkCSSP(this,this._next,null,!0)};h._addLazySet=function(t,e,i){var r=this._firstPT=new _e(t,e,0,0,this._firstPT,2);r.e=i,r.setRatio=Ie,r.data=this},h._linkCSSP=function(t,e,i,r){return t&&(e&&(e._prev=t),t._next&&(t._next._prev=t._prev),t._prev?t._prev._next=t._next:this._firstPT===t&&(this._firstPT=t._next,r=!0),i?i._next=t:r||null!==this._firstPT||(this._firstPT=t),t._next=e,t._prev=i),t},h._kill=function(e){var i,r,s,n=e;if(e.autoAlpha||e.alpha){n={};for(r in e)n[r]=e[r];n.opacity=1,n.autoAlpha&&(n.visibility=1)}return e.className&&(i=this._classNamePT)&&(s=i.xfirst,s&&s._prev?this._linkCSSP(s._prev,i._next,s._prev._prev):s===this._firstPT&&(this._firstPT=i._next),i._next&&this._linkCSSP(i._next,i._next._next,s._prev),this._classNamePT=null),t.prototype._kill.call(this,n)};var Ye=function(t,e,i){var r,s,n,a;if(t.slice)for(s=t.length;--s>-1;)Ye(t[s],e,i);else for(r=t.childNodes,s=r.length;--s>-1;)n=r[s],a=n.type,n.style&&(e.push(K(n)),i&&i.push(n)),1!==a&&9!==a&&11!==a||!n.childNodes.length||Ye(n,e,i)};return a.cascadeTo=function(t,i,r){var s,n,a,o,l=e.to(t,i,r),h=[l],u=[],f=[],p=[],c=e._internals.reservedProps;for(t=l._targets||l.target,Ye(t,u,p),l.render(i,!0,!0),Ye(t,f),l.render(0,!0,!0),l._enabled(!0),s=p.length;--s>-1;)if(n=J(p[s],u[s],f[s]),n.firstMPT){n=n.difs;for(a in r)c[a]&&(n[a]=r[a]);o={};for(a in n)o[a]=u[s][a];h.push(e.fromTo(p[s],i,o,n))}return h},t.activate([a]),a},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()(),function(t){"use strict";var e=function(){return(_gsScope.GreenSockGlobals||_gsScope)[t]};"function"==typeof define&&define.amd?define(["TweenLite"],e):"undefined"!=typeof module&&module.exports&&(require("//TweenLite.js"),module.exports=e())}("CSSPlugin");/*!
 * Joseph Myer's md5() algorithm wrapped in a self-invoked function to prevent
 * global namespace polution, modified to hash unicode characters as UTF-8.
 *  
 * Copyright 1999-2010, Joseph Myers, Paul Johnston, Greg Holt, Will Bond <will@wbond.net>
 * http://www.myersdaily.org/joseph/javascript/md5-text.html
 * http://pajhome.org.uk/crypt/md5
 * 
 * Released under the BSD license
 * http://www.opensource.org/licenses/bsd-license
 */
(function() {
	function md5cycle(x, k) {
		var a = x[0], b = x[1], c = x[2], d = x[3];

		a = ff(a, b, c, d, k[0], 7, -680876936);
		d = ff(d, a, b, c, k[1], 12, -389564586);
		c = ff(c, d, a, b, k[2], 17, 606105819);
		b = ff(b, c, d, a, k[3], 22, -1044525330);
		a = ff(a, b, c, d, k[4], 7, -176418897);
		d = ff(d, a, b, c, k[5], 12, 1200080426);
		c = ff(c, d, a, b, k[6], 17, -1473231341);
		b = ff(b, c, d, a, k[7], 22, -45705983);
		a = ff(a, b, c, d, k[8], 7, 1770035416);
		d = ff(d, a, b, c, k[9], 12, -1958414417);
		c = ff(c, d, a, b, k[10], 17, -42063);
		b = ff(b, c, d, a, k[11], 22, -1990404162);
		a = ff(a, b, c, d, k[12], 7, 1804603682);
		d = ff(d, a, b, c, k[13], 12, -40341101);
		c = ff(c, d, a, b, k[14], 17, -1502002290);
		b = ff(b, c, d, a, k[15], 22, 1236535329);

		a = gg(a, b, c, d, k[1], 5, -165796510);
		d = gg(d, a, b, c, k[6], 9, -1069501632);
		c = gg(c, d, a, b, k[11], 14, 643717713);
		b = gg(b, c, d, a, k[0], 20, -373897302);
		a = gg(a, b, c, d, k[5], 5, -701558691);
		d = gg(d, a, b, c, k[10], 9, 38016083);
		c = gg(c, d, a, b, k[15], 14, -660478335);
		b = gg(b, c, d, a, k[4], 20, -405537848);
		a = gg(a, b, c, d, k[9], 5, 568446438);
		d = gg(d, a, b, c, k[14], 9, -1019803690);
		c = gg(c, d, a, b, k[3], 14, -187363961);
		b = gg(b, c, d, a, k[8], 20, 1163531501);
		a = gg(a, b, c, d, k[13], 5, -1444681467);
		d = gg(d, a, b, c, k[2], 9, -51403784);
		c = gg(c, d, a, b, k[7], 14, 1735328473);
		b = gg(b, c, d, a, k[12], 20, -1926607734);

		a = hh(a, b, c, d, k[5], 4, -378558);
		d = hh(d, a, b, c, k[8], 11, -2022574463);
		c = hh(c, d, a, b, k[11], 16, 1839030562);
		b = hh(b, c, d, a, k[14], 23, -35309556);
		a = hh(a, b, c, d, k[1], 4, -1530992060);
		d = hh(d, a, b, c, k[4], 11, 1272893353);
		c = hh(c, d, a, b, k[7], 16, -155497632);
		b = hh(b, c, d, a, k[10], 23, -1094730640);
		a = hh(a, b, c, d, k[13], 4, 681279174);
		d = hh(d, a, b, c, k[0], 11, -358537222);
		c = hh(c, d, a, b, k[3], 16, -722521979);
		b = hh(b, c, d, a, k[6], 23, 76029189);
		a = hh(a, b, c, d, k[9], 4, -640364487);
		d = hh(d, a, b, c, k[12], 11, -421815835);
		c = hh(c, d, a, b, k[15], 16, 530742520);
		b = hh(b, c, d, a, k[2], 23, -995338651);

		a = ii(a, b, c, d, k[0], 6, -198630844);
		d = ii(d, a, b, c, k[7], 10, 1126891415);
		c = ii(c, d, a, b, k[14], 15, -1416354905);
		b = ii(b, c, d, a, k[5], 21, -57434055);
		a = ii(a, b, c, d, k[12], 6, 1700485571);
		d = ii(d, a, b, c, k[3], 10, -1894986606);
		c = ii(c, d, a, b, k[10], 15, -1051523);
		b = ii(b, c, d, a, k[1], 21, -2054922799);
		a = ii(a, b, c, d, k[8], 6, 1873313359);
		d = ii(d, a, b, c, k[15], 10, -30611744);
		c = ii(c, d, a, b, k[6], 15, -1560198380);
		b = ii(b, c, d, a, k[13], 21, 1309151649);
		a = ii(a, b, c, d, k[4], 6, -145523070);
		d = ii(d, a, b, c, k[11], 10, -1120210379);
		c = ii(c, d, a, b, k[2], 15, 718787259);
		b = ii(b, c, d, a, k[9], 21, -343485551);

		x[0] = add32(a, x[0]);
		x[1] = add32(b, x[1]);
		x[2] = add32(c, x[2]);
		x[3] = add32(d, x[3]);
	}

	function cmn(q, a, b, x, s, t) {
		a = add32(add32(a, q), add32(x, t));
		return add32((a << s) | (a >>> (32 - s)), b);
	}

	function ff(a, b, c, d, x, s, t) {
		return cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}

	function gg(a, b, c, d, x, s, t) {
		return cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}

	function hh(a, b, c, d, x, s, t) {
		return cmn(b ^ c ^ d, a, b, x, s, t);
	}

	function ii(a, b, c, d, x, s, t) {
		return cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	function md51(s) {
		// Converts the string to UTF-8 "bytes" when necessary
		if (/[\x80-\xFF]/.test(s)) {
			s = unescape(encodeURI(s));
		}
		txt = '';
		var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
		for (i = 64; i <= s.length; i += 64) {
			md5cycle(state, md5blk(s.substring(i - 64, i)));
		}
		s = s.substring(i - 64);
		var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (i = 0; i < s.length; i++)
		tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
		tail[i >> 2] |= 0x80 << ((i % 4) << 3);
		if (i > 55) {
			md5cycle(state, tail);
			for (i = 0; i < 16; i++) tail[i] = 0;
		}
		tail[14] = n * 8;
		md5cycle(state, tail);
		return state;
	}

	function md5blk(s) { /* I figured global was faster.   */
		var md5blks = [], i; /* Andy King said do it this way. */
		for (i = 0; i < 64; i += 4) {
			md5blks[i >> 2] = s.charCodeAt(i) +
			                  (s.charCodeAt(i + 1) << 8) +
			                  (s.charCodeAt(i + 2) << 16) +
			                  (s.charCodeAt(i + 3) << 24);
		}
		return md5blks;
	}

	var hex_chr = '0123456789abcdef'.split('');

	function rhex(n) {
		var s = '', j = 0;
		for (; j < 4; j++)
		s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] +
		     hex_chr[(n >> (j * 8)) & 0x0F];
		return s;
	}

	function hex(x) {
		for (var i = 0; i < x.length; i++)
		x[i] = rhex(x[i]);
		return x.join('');
	}

	md5 = function (s) {
		return hex(md51(s));
	}

	/* this function is much faster, so if possible we use it. Some IEs are the
	only ones I know of that need the idiotic second function, generated by an
	if clause.  */
	function add32(a, b) {
		return (a + b) & 0xFFFFFFFF;
	}

	if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
		function add32(x, y) {
			var lsw = (x & 0xFFFF) + (y & 0xFFFF),
			    msw = (x >> 16) + (y >> 16) + (lsw >> 16);
			return (msw << 16) | (lsw & 0xFFFF);
		}
	}
})();function SocketChat(roomName){
	this._eventsListener = {};
	this.room = {
		name: roomName
	};
	this.init();
}

SocketChat.prototype.init = function(){
	var me = this;
	// ws://meet.xpro.im:8080/xgate/websocket/{$xnest_id}?nickname={$nickname}
	// var url = "{{url}}/{{$xnest_id}}?nickname={{$nickname}}";
	// url = _.render(url, {
	// 	url: me.url,
	// 	xnest_id: room.id,
	// 	nickname: user.name
	// });

	var config = {
        wsUrl: 'ws://meet.xpro.im:8080/xgate/websocket/lurenjia',
        linkKey: 'temp',//'http://www.baidu.com',
        host: '/meet.xpro.im'
    };
    var url = config.wsUrl + md5(config.host + config.linkKey);
	var socket = me.socket = new WebSocket(url);
	socket.onopen = function(e){
		console.log('open');
	};
	socket.onmessage = function(e){
		console.log(e.data);
		me.parseMessage(JSON.parse(e.data));
	};
	socket.onerror = function(e){
		console.log(e);
	};
	socket.onclose = function(e){
	};
};

SocketChat.prototype.send = function(messsage){
	this.socket.send(messsage);
};

SocketChat.prototype.parseMessage = function(data){
	var me = this;
	switch(data.type){
		case 'self':
			me.dispatch('connected', wrapData('connected'));
		break;
		case 'member_count':
			//do nothing
		break;
		case 'members':
			me.dispatch('members', wrapData('members'));
		break;
		case 'join':
			me.dispatch('joined', wrapData('joined'));
		break;
		case 'leave':
			me.dispatch('leaved', wrapData('leaved'));
		break;
		case 'normal':
			me.dispatch('receive', wrapData('receive'));
		break;
	}
	function wrapData(type){
		return {
			type: type,
			roomId: data.xnest,
			from: data.from,
			content: data.payload,
			time: data.send_time
		};
	}
};

SocketChat.prototype.on = function(eventType, fn){
	var me = this;
	me._eventsListener[eventType] = fn;
};

SocketChat.prototype.dispatch = function(eventType, param){
	var me = this;
	var fn = me._eventsListener[eventType];
	fn && fn(param);
};

window.SocketChat = SocketChat;	(function (window) {
	
	var sock, win, members;

	function GroupChat(){
		this.initialize();
	}

	GroupChat.prototype.initialize = function(){
		var me = this;
		_.loadCss('api/xmeet.api.css');
		
		var tpl_chat = "<div class=\"xmeet-chat-logo\">\n	<img width=\"48\" height=\"48\" src=\"api/img/chat.png\"/>\n</div>\n";
		var nodes = _.dom.create(tpl_chat);
		document.body.appendChild(nodes[0]);

		_.dom.on('.xmeet-chat-logo img', 'click', function(e){
			_.dom.toggle('.xmeet-chat-room');
		});
		
		var tpl_room = "<div class=\"xmeet-chat-room\">\n	<div class=\"box-body\">\n		<p>\n			<span class=\"logo\">\n				<img width=\"48\" height=\"48\" src=\"api/img/chat.png\"/>\n			</span>\n		</p>\n		<p class=\"room\">XMeet</p>\n		<p><input class=\"name\" type=\"text\"/></p>\n	</div>\n	<div class=\"box-bottom\">\n		<a id=\"room-enter\" class=\"btn\">进入聊天室</a>\n	</div>\n</div>";
		var nodes = _.dom.create(tpl_room);
		document.body.appendChild(nodes[0]);
		_.dom.get('.xmeet-chat-room .name')[0].value = generateName();
		_.dom.on('#room-enter', 'click', function(e){
			_.dom.toggle('.xmeet-chat-room');
			me.createChatWindow();
		});
	};

	GroupChat.prototype.createChatWindow = function(){
		var me = this;
		if(!sock){
			sock = new SocketChat('交流群');
			sock.on('connected', function(data){
				win = new GroupChatWindow(data.roomId, {
					uid: data.from,
					name: '路人甲'
				});
				me.bindChatEvent();
			});

			sock.on('members', function(data){
				members = {};
				for(var i=data.content.length; i>0; i--){
					var u = data.content[i-1];
					members[u.pid] = {
						uid: u.pid,
						name: u.nickname
					};
				}
			});

			sock.on('joined', function(data){
				members[data.from] = {
					uid: data.from,
					name: data.content
				};
			});

			sock.on('receive', function(data){
				var u = members[data.from];
				if(u){
					win.receiveMessage(data.content, u, data.time);
				}
			});
		}
	};

	GroupChat.prototype.bindChatEvent = function(){
		win.on('send', function(data){
			sock.send(data.message);
		});
	};

	function generateName(){
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
			'Beatles': '比特斯',    //甲壳虫
			'Eagle': '伊格',
			'Goat': '勾特',
			'Python': '派森',
			'Cobra': '科波拉',
			'Monkey': '芒可',
			'Octopus': '奥克托帕斯',  //章鱼
			'Tortoise': '托特斯',
			'Horse': '霍斯',
			'Panda': '胖达',
			'Kaola': '考拉',
			'Boar': '伯恩',       //野猪
			'Squirrel': '斯奎尔',
			'Rabbit': '拉比特',
			'Sardine': '沙丁',   //沙丁鱼
			'Salmon': '莎尔蒙',  //鲑鱼
			'Sloth': '斯洛兹',  //树懒
			'buffalo': '巴伐罗',  //水牛
			'gnu': '格鲁',  //角马
			'jellyfish': '杰丽菲诗',
			'shark': '沙奎尔',
			'crocodile': '克拉克戴尔',  //
			'penguin': '平格温',
			'pigeon': '匹金',
			'bat': '波特',  //蝙蝠
			'lizard': '李札特',  //蜥蜴
			'mosquito': '马斯奎特',  //蚊子
			'frog': '弗洛格',  //蚊子
			'squid': '斯奎德',  //乌贼
			'lobster': '罗伯斯特',  //龙虾
			'ant': '安特',
			'butterfly': '巴特弗莱',
			'flamingo': '弗拉明戈',  //火烈鸟
			'peacock': '皮科克',  //孔雀
			'swan': '斯万',  //天鹅
			'spider': '斯派德尔',  //蜘蛛
			'owl': '欧尔',
			'ostrich': '奥斯纯齐', //鸵鸟
			'camel': '凯梅尔',
			'crab': '克拉伯',
			'mongoose': '芒古斯', //猫鼬
			'deer': '迪尔',
			'antelope': '艾迪路普',  //羚羊
			'mustang': '木斯唐',  //野马
		};
		var keys = Object.keys(names);
		return names[keys[Math.floor(keys.length*Math.random())]];
	}

	function getTemplate(name, fn){
		_.ajax.get('/api/'+ name, null, function(text){
			fn(text);
		});
	}

	var xmeet = {
		GroupChat: function(){
			var groupChat = new GroupChat();
		}
	};

	window.XMeet = xmeet;
})(window);

















function GroupChatWindow(roomId, self){
	this._eventsListener = {};
	this.roomId = roomId;
	this.self = self;
	this.init();
}


GroupChatWindow.prototype.init = function(){
	var me = this;
	
	var tpl = "<div class=\"xmeet-chat-window\">\n	<div class=\"window-title\">\n		<img width=\"48\" height=\"48\" src=\"api/img/chat.png\"/>\n		<span class=\"title\">交流群</span>\n		<span class=\"setting\"></span>\n	</div>\n	<div id=\"\" class=\"window-body chat-messages\">\n		<div class=\"chat-messages-list\"></div>\n	</div>\n\n	<div class=\"chat-input-bar\">\n		<div class=\"chat-info-container\">\n		</div>\n		<div class=\"chat-effect-container\">\n			<div class=\"chat-effect-bar\"></div>\n		</div>\n		<div class=\"chat-input-wrapper\">\n			<button class=\"chat-input-tool\">\n				<i class=\"icon-emotion\"></i>\n			</button>\n			<div class=\"chat-input\" contenteditable=\"true\"></div>\n			<button class=\"chat-send\">\n				<i class=\"icon-send\" style=\"transform: translate3d(0px, 0px, 0px);\"></i>\n			</button>\n		</div>\n	</div>\n\n	<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"800\">\n	  <defs>\n	    <filter id=\"goo\">\n			<feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"10\" result=\"blur\"></feGaussianBlur>\n			<feColorMatrix in=\"blur\" mode=\"matrix\" values=\"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9\" result=\"goo\"></feColorMatrix>\n			<feComposite in=\"SourceGraphic\" in2=\"goo\"></feComposite>\n	    </filter>\n	  </defs>\n	</svg>\n</div>";
	var nodes = _.dom.create(tpl);
	document.body.appendChild(nodes[0]);

	_.dom.on('.chat-send', 'click', function(e){
		me.sendMessage();
	});

	_.dom.on('.chat-input', 'keydown', function(e){
		if(e.which == 13){
			me.sendMessage();
			e.stopPropagation();
			e.preventDefault();
		}
		me.startTyping();
	});
};


GroupChatWindow.prototype.sendMessage = function(){
	var me = this;

	var input = _.dom.get('.chat-input')[0];
	var message = input.innerHTML;
	if(message == "") return;
	var effectContainer = _.dom.get(".chat-effect-container")[0];
	var sendButton = _.dom.get(".chat-send")[0];
	var messageElements = me.addMessage(message, me.self, null, true);
	var messageContainer = messageElements.container;
	var messagesContainer = _.dom.get(".chat-messages")[0];
	var messageBubble = messageElements.bubble;

	var oldInputHeight = 48;
	input.innerHTML = '';

	var newInputHeight = 48;
	var inputHeightDiff = newInputHeight-oldInputHeight;

	var messageEffect = _.dom.create('<div class="chat-message-effect"></div>')[0];
	messageEffect.appendChild(messageBubble.cloneNode(true));
	effectContainer.appendChild(messageEffect);
	_.dom.css(effectContainer, {left: 0, top: 0});
	me.setFilter('url(#goo)');

	var messagePos = _.dom.offset(messageBubble);
	var effectPos =  _.dom.offset(messageEffect);
	var pos = {
		x: messagePos.left - effectPos.left,
		y:messagePos.top - effectPos.top
	}

	var startingScroll = messagesContainer.scrollTop;
	var curScrollDiff = 0;
	var effectYTransition;
	var setEffectYTransition = function(dest, dur, ease){
		return TweenLite.to(
			messageEffect, dur, {
				y: dest,
				ease: ease,
				onUpdate: function(){
					var curScroll = messagesContainer.scrollTop;
					var scrollDiff = curScroll - startingScroll;
					if(scrollDiff > 0){
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

	TweenLite.to(
		messageEffect, 0.6, {
			delay: 0.2,
			x: pos.x,
			ease: Quad.easeInOut,
			onComplete: function(){
			}
		}
	);

	TweenLite.from(
		messageBubble, 0.2,{
			delay: 0.65,
			opacity: 0,
			ease: Quad.easeInOut,
			onComplete: function(){
				TweenLite.killTweensOf(messageEffect);
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

GroupChatWindow.prototype.addMessage = function(message, user, time, isSelf){
	var messagesContainer= _.dom.get(".chat-messages")[0]
	var msgList = _.dom.get('.chat-messages-list')[0];
	var messageContainer = _.dom.create('<li class="chat-message chat-message-other"></li>')[0];
	msgList.appendChild(messageContainer);

	var messageBubble = _.dom.create('<div class="chat-message-bubble"></div>')[0];
	messageBubble.innerHTML = '<p class="user">'+ user.name +'<i></i>'+ time +'</p><p class="msg">' + message + '</p>';
	messageContainer.appendChild(messageBubble);

	var oldScroll = messagesContainer.scrollTop;
	messagesContainer.scrollTop = 9999999;

	var newScroll = messagesContainer.scrollTop;
	var scrollDiff = newScroll - oldScroll;
	TweenLite.fromTo(
		msgList, 0.4, {
			y: scrollDiff
		},{
			y: 0,
			ease:Quint.easeOut
		}
	);
	return {
		container: messageContainer,
		bubble: messageBubble
	};
};

GroupChatWindow.prototype.receiveMessage = function(message, user, time){
	var me = this;
	if(user.id == me.self.id) return;
	var messageElements = me.addMessage(message, user, time, false),
		messageContainer = messageElements.container,
		messageBubble = messageElements.bubble;

	TweenLite.set(messageBubble,{
		transformOrigin: "60px 50%"
	});
	TweenLite.from(messageBubble, 0.4,{
		scale:0,
		ease:Back.easeOut
	});
	TweenLite.from(messageBubble, 0.4, {
		x:-100,
		ease:Quint.easeOut
	});
}


GroupChatWindow.prototype.startTyping = function(){
	var me = this;
	if(me.isTyping) return;

	me.isTyping = true;
	var effectContainer = _.dom.get(".chat-effect-container")[0],
		infoContainer = _.dom.get(".chat-info-container")[0];

	var dots= _.dom.create('<div class="chat-effect-dots"></div>')[0];
	_.dom.css(dots, {top: -30, left:10});
	effectContainer.appendChild(dots);

	me.setFilter('url(#goo)');
	for (var i = 0; i < 3; i++) {
		var dot= _.dom.create('<div class="chat-effect-dot">')[0];
		_.dom.css(dot, {left: i*20});
		dots.appendChild(dot);
		TweenLite.to(dot, 0.3, {
			delay: -i*0.1,
			y:30,
			yoyo: true,
			repeat: -1,
			ease:Quad.easeInOut
		});
	}

	var info = _.dom.create('<div class="chat-info-typing">')[0];
	info.innerHTML = "正在输入";
	_.dom.css(info, {transform: "translate3d(0, 30px, 0)" });
	infoContainer.appendChild(info);
	TweenLite.to(info, 0.3, {
		y: 0
	});
};

GroupChatWindow.prototype.StoppedTyping = function(){
	var me = this;
	if(!me.isTyping) return;

	me.isTyping = false;
	var effectContainer = _.dom.get(".chat-effect-container")[0],
		infoContainer = _.dom.get(".chat-info-container")[0];

	var dots= _.dom.get(".chat-effect-dots")[0];
	TweenLite.to(dots, 0.3, {
		y: 40,
		ease: Quad.easeIn,
	});

	var info = _.dom.get(".chat-info-typing")[0];
	TweenLite.to(info, 0.3, {
		y: 30,
		ease: Quad.easeIn,
		onComplete:function(){
			effectContainer.removeChild(dots);
			infoContainer.removeChild(info);
			me.setFilter('none');
		}
	});
};

GroupChatWindow.prototype.setFilter = function(value){
	var effectContainer = _.dom.get(".chat-effect-container")[0];
	_.dom.css(effectContainer, {"-webkit-filter": value});
};


GroupChatWindow.prototype.on = function(eventType, fn){
	var me = this;
	me._eventsListener[eventType] = fn;
};

GroupChatWindow.prototype.dispatch = function(eventType, param){
	var me = this;
	var fn = me._eventsListener[eventType];
	fn && fn(param);
};

window.GroupChatWindow = GroupChatWindow;