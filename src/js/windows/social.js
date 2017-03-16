var SocialWindow = function(id, parent, data) {
    
    var social_width = 0;
    var social_height = 0;
    var facebookObjectUrl = '';
    var hashTag = 'bible#JN1';
    var targetDiv;
	var  svgns = 'http://www.w3.org/2000/svg';
	var  xlinkns = 'http://www.w3.org/1999/xlink';
    targetDiv = createElement('div', 'window-social', '');
    targetDiv.id = id;
    parent.node[0].appendChild(targetDiv);
    var platforms = ['facebook','twitter'];
    var currentPlatform = data.currentPlatform || "facebook";

    function redrawSocialDiv() {

        console.log(facebookObjectUrl);
        targetDiv.innerHTML = '';
        var menu = createElement('div', 'socialMediaMenu','');
        targetDiv.appendChild(menu);
        for (var i=0; i<platforms.length; i++) {
            var option = createElement('div', 'socialMediaOption '+platforms[i], '');
            if (currentPlatform == platforms[i]) {
                option.className += ' selected';
            }
            var icon = document.createElementNS(svgns, 'svg');
            icon.setAttribute('platform', platforms[i]);
    		var use = document.createElementNS(svgns, 'use');
            use.setAttribute('platform', platforms[i]);
            use.setAttributeNS(xlinkns, 'href', sofia.config.icons+'#'+platforms[i]);
            icon.appendChild(use);
            option.appendChild(icon);
            menu.appendChild(option);
        }
        menu.onclick = function(e) {
            currentPlatform = e.target.getAttribute('platform');
            ext.trigger('settingschange', {
                type:'settingschange',
                target: this,
                data: {
                    currentPlatform: currentPlatform
                }
            });
            redrawSocialDiv();
        };
        
        if (currentPlatform == 'facebook') {
            var facebookComments = createElement('div', 'fb-comments', 'Loading comments...');
            facebookComments.setAttribute('data-share','true');
            facebookComments.setAttribute('data-width', social_width);
            facebookComments.setAttribute('data-href', facebookObjectUrl);
            facebookComments.setAttribute('data-numposts','5');
            facebookComments.setAttribute('data-order-by','social');
            facebookComments.id = "facebookCommentsDiv";
            targetDiv.appendChild(facebookComments);
            if (typeof FB != 'undefined') {
                FB.XFBML.parse();
            }
        }
        else if (currentPlatform == 'twitter') {
            var twitterComments = createElement('div', 'twitterCommentsDiv', '');
            twitterComments.id = "twitterCommentsDiv";
            twitterComments.style.height = (social_height - 44) + 'px';
            targetDiv.appendChild(twitterComments);
            var tweetForm = createElement('div', 'tweetForm', '');
            twitterComments.appendChild(tweetForm);
            var tweetText = createElement('textarea', 'textOfTweet', '');
            tweetText.id = 'tweetText';
            tweetText.setAttribute('maxlength', (139 - hashTag.length));
            tweetForm.appendChild(tweetText);
            var sendTweet = createElement('div', 'sendTweetButton', 'Send tweet');
            tweetForm.appendChild(sendTweet);
            tweetForm.appendChild(createElement('div', 'clearDiv', ''));
            sendTweet.onclick = sendTweetFunction;
            var loadingTweets = createElement('div', 'loadingMessage', 'Loading tweets...');
            twitterComments.appendChild(loadingTweets);
            sofia.ajax({
                dataType: 'json',
                url: 'http://104.155.6.124:80?hashTag='+hashTag,
                success: function(data) {
                    if (data.statuses.length!=undefined && data.statuses.length>0) {
                        twitterComments.removeChild(loadingTweets);
                        for (var i=0; i<data.statuses.length; i++){
                            var newTweet = createElement('div','tweetElement','');
                            twitterComments.appendChild(newTweet);
                            twttr.widgets.createTweet(data.statuses[i].id_str,
                                                      newTweet,
                                                      {conversation: 'none',
                                                      cards: 'hidden',
                                                      align: 'center'})
                            .then(function (el) {
                                  console.log("Tweet displayed.")
                            });
                        }
                    }
                    else {
                        loadingTweets.textContent = 'No tweets found for this chapter';
                    }
    			}
    		});
            twttr.widgets.load()
        }
    }
    
    function sendTweetFunction() {
        var content = document.getElementById('tweetText').value;
        var intentURL = "https://twitter.com/intent/tweet?hashtags="+encodeURIComponent(hashTag)+"&text="+encodeURIComponent(content);
        window.open(intentURL, '', "width=550,height=420");
    }
    
    function createElement(type, className, text) {
		var el = document.createElement(type);
		el.className = className;
		el.textContent = text;
		return el;
	}

	function size(width, height) {
        social_width = width;
        social_height = height;
        redrawSocialDiv();
	}
	
	// So that current state can be saved to a cookie for back/forward/refresh purposes.
	function getData() {
		data = {
            currentPlatform: currentPlatform
/*			scrollValue: scrollPosition,
			zoomValue: zoom,
			params:{
				'win':'timeline',
				'scrollValue': scrollPosition,
				'zoomValue': zoom,
			}*/
		}
		return data
	}
	
	function saveTimelineSettings() {
		ext.trigger('settingschange', {
            type:'settingschange',
            target: this,
            data: {
                currentPlatform: currentPlatform
            }
        });
    }

	function close() {
		console.log('closing social');
		ext.clearListeners();
	}

	var ext = {
		size: size,
		getData: getData,
		sendMessage: function() {},
		close: close
	};
	ext = $.extend(true, ext, EventEmitter);

	ext.on('message', function(e) {
		console.log(e.data.messagetype);
		if (e.data.messagetype == 'nav' && e.data.locationInfo.sectionid != null) {
			chapter = e.data.locationInfo.sectionid;
            var fbDiv = document.getElementById("facebookCommentsDiv");
            var newHashTag = 'bible'+chapter;
            if (newHashTag != hashTag) {
                var newUrl = window.location.href +"?w1=bible&v1="+chapter;
                hashTag = newHashTag;
                facebookObjectUrl = newUrl;
                redrawSocialDiv();
            }
		}
	});
	return ext;
};

sofia.initMethods.push(function() {

	if (sofia.config.enableOnlineSources) {            
        window.fbAsyncInit = function() {
          FB.init({
            appId      : '972782192822255',
            xfbml      : true,
            version    : 'v2.8'
          });
          FB.AppEvents.logPageView();
        };
      
        (function(d, s, id){
           var js, fjs = d.getElementsByTagName(s)[0];
           if (d.getElementById(id)) {return;}
           js = d.createElement(s); js.id = id;
           js.src = "//connect.facebook.net/en_US/sdk.js";
           fjs.parentNode.insertBefore(js, fjs);
         }(document, 'script', 'facebook-jssdk'));

        window.twttr = (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
            t = window.twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);
            t._e = [];
            t.ready = function(f) {
                t._e.push(f);
            };
            return t;
        }(document, "script", "twitter-wjs"));
        
                sofia.windowTypes.push( {
					className:'SocialWindow',
					param: 'social',
					paramKeys: {
						'scrollValue': 'sc',
						'zoomValue': 'zm',
					},
					init: {
						'scrollValue': 0,
						'zoomValue': 1,
						'textid': sofia.config.newBibleWindowVersion,
					}
		});
	}
});