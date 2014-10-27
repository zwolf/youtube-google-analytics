var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var videoArray = new Array();
var playerArray = new Array();
var videoTitle = new Array();
var showTitle = 3;
var reloadFrames = 0;
function trackYouTube() {
	var i = 0;
	jQuery('iframe').each(function() {
		if($(this).attr('src')){
			var video = $(this);
			var vidSrc = video.attr('src');
			if(reloadFrames){
				var regex1 = /(?:https?:)?\/\/www\.youtube\.com\/embed\/([\w-]{11})(\?)?/;
				var SourceCheckA = vidSrc.match(regex1);
				if(SourceCheckA[2]=="?"){
					var regex2 = /enablejsapi=1/;
					var SourceCheckB = vidSrc.match(regex2);
					if(SourceCheckB){
					}else{
						vidSrc = vidSrc + "&enablejsapi=1";
					}
					var regex2 = /origin=.*/;
					var SourceCheckC = vidSrc.match(regex2);
					if(SourceCheckC){
						for (j=0; j<SourceCheckC.length; j++) {
							newOrigin = "origin=" + window.location.hostname;
							var vidSrc = vidSrc.replace(regex2,newOrigin);
						}
					}else{
						vidSrc = vidSrc + "&origin=" + window.location.hostname;
					}
				}else{
					vidSrc = vidSrc + "?enablejsapi=1&origin=" + window.location.hostname;
				}
				video.attr('src', vidSrc);
			}
			var regex = /(?:https?:)?\/\/www\.youtube\.com\/embed\/([\w-]{11})(?:\?.*)?/;
			var matches = vidSrc.match(regex);
			if(matches && matches.length > 1){
				videoArray[i] = matches[1];
				video.attr('id', matches[1]);
				getRealTitles(i);
				i++;			
			}
		}
	});	
}
function getRealTitles(j) {
	if(showTitle==2){
		playerArray[j] = new YT.Player(videoArray[j], {
		    videoId: videoArray[j],
		    events: {
			    'onStateChange': onPlayerStateChange
			}
		});	
	}else{
	    var tempJSON = $.getJSON('http://gdata.youtube.com/feeds/api/videos/'+videoArray[j]+'?v=2&alt=json',function(data,status,xhr){
		    videoTitle[j] = data.entry.title.$t;
			playerArray[j] = new YT.Player(videoArray[j], {
			    videoId: videoArray[j],
			    events: {
				    'onStateChange': onPlayerStateChange
				}
			});
	    });
	}
}
$(window).load(function() {
    trackYouTube();
});
function onPlayerReady(event) {
}
var pauseFlagArray = new Array();
function onPlayerStateChange(event) {
	var videoURL = event.target.getVideoUrl();
	var regex = /v=(.+)$/;
	var matches = videoURL.match(regex);
	videoID = matches[1];
	thisVideoTitle = "";
	for (j=0; j<videoArray.length; j++) {
	    if (videoArray[j]==videoID) {
	        thisVideoTitle = videoTitle[j]||"";
			console.log(thisVideoTitle);
			if(thisVideoTitle.length>0){
				if(showTitle==3){
					thisVideoTitle = thisVideoTitle + " | " + videoID;
				}else if(showTitle==2){
					thisVideoTitle = videoID;
				}
			}else{
				thisVideoTitle = videoID;
			}
      if (event.data == YT.PlayerState.PLAYING) {
    	    ga('send', 'event', 'Videos', 'Play', thisVideoTitle);
    		pauseFlagArray[j] = false;
    	}
    	if (event.data == YT.PlayerState.ENDED){
    		ga('send', 'event', 'Videos', 'Watch to End', thisVideoTitle);
    	}
    	if (event.data == YT.PlayerState.PAUSED && pauseFlagArray[j] != true){
    		ga('send', 'event', 'Videos', 'Pause', thisVideoTitle);
    		pauseFlagArray[j] = true;
    	}
    	if (event.data == YT.PlayerState.BUFFERING){
    		ga('send', 'event', 'Videos', 'Buffering', thisVideoTitle);
    	}
    	if (event.data == YT.PlayerState.CUED){
    		ga('send', 'event', 'Videos', 'Cueing', thisVideoTitle);
    	}

    }
	}
}