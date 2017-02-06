
var TimelineWindow = function(id, parent, data) {
	timelineData = [];
	scrollPosition = data.scrollValue;
	zoom = data.zoomValue;
	windowHeight = 0;
	windowWidth = 0;
	var maxDate = 120;
	var minDate = -2320;
	var currentBook = "";
	var maxZoom = 2;
	var minZoom = 0.1;
	var  svgns = "http://www.w3.org/2000/svg";
	var  xlinkns = "http://www.w3.org/1999/xlink";


	targetDiv = createElement('div', 'window-timeline', '');
	targetDiv.id = id;
	parent.node[0].appendChild(targetDiv);
	controlsCreated = false;
		
	function loadEvents() {

		console.log('TIMELINE: loading events');
		
		//likely need to lad them dynamically.

		timelineData = bibleTimelineData;
		
		bibleTimelineData.sort(function(a, b) {
		    return parseFloat(a.startDate) - parseFloat(b.startDate);
		});

		drawTimeline();
/*		
		TextLoader.getText(data.textid,

			// success
			function(loadedTextInfo) {

				// store this setting
				currentTextInfo = loadedTextInfo;
				console.log(currentTextInfo);

				textsInitialized = true;
				
				drawTimeline();
			},
			// error handler
			function() {
		
				drawTimeline();
		});
		

		sofia.ajax({
			dataType: 'json',
			url: 'content/maps/maps.json',
			success: function(data) {

				// store data
				timelineData = data.names;

			}
		});
*/
	}


	function drawTimeline() {

		zoom = Math.min(maxZoom, Math.max(minZoom, zoom));
		
		if (targetDiv==null) return;
		
		if (!controlsCreated) {
			targetDiv.innerHTML = '';
			
			var controlDiv = createElement('div', 'controlDiv', '');
			targetDiv.appendChild(controlDiv);
			var infoDiv = createElement('div', 'timelineInfoBox', '');
			infoDiv.id = 'timelineInfoBox';
			targetDiv.appendChild(infoDiv);
			var zoomIn = createElement('button','zoom','+');
			controlDiv.appendChild(zoomIn);
			zoomIn.onclick = function() {
				oldZoom = zoom;
				zoom = Math.max(minZoom ,zoom*0.75);
				zoomChange = oldZoom/zoom;
				scrollPosition = ((scrollPosition + windowWidth/2) * zoomChange)-windowWidth/2;
				saveTimelineSettings();
				drawTimeline();
			};
			var zoomOut = createElement('button','zoom','-');
			controlDiv.appendChild(zoomOut);
			zoomOut.onclick = function() {
				oldZoom = zoom;
				zoom = Math.min(maxZoom ,zoom*1.25);
				zoomChange = oldZoom/zoom;
				scrollPosition = ((scrollPosition + windowWidth/2) * zoomChange)-windowWidth/2;
				saveTimelineSettings()
				drawTimeline();
			};
			var explainButton = createElement('button','zoom','i');
			controlDiv.appendChild(explainButton);
			explainButton.onclick = function() {
				$('.explainDiv').toggle();
			}
			var explainDiv = createElement('div','explainDiv','This timeline has been created to assist in understanding the sequence of events in the bible. It is based on a number of sources, but the dates of some events cannot be precisely determined. If you have suggestions please let me know. Icons made by Freepik from www.flaticon.com');
			controlDiv.appendChild(explainDiv);
		
			var timelineDiv = createElement('div', 'timelineDiv', '');
			targetDiv.appendChild(timelineDiv);
			timelineDiv.onscroll = function() {
				scrollPosition = timelineDiv.scrollLeft;
				saveTimelineSettings();
				allBookLabels = document.getElementsByClassName('movingLabel');
				for (var i = 0; i < allBookLabels.length; i++) {
					var parentOffset = parseInt(allBookLabels[i].parentNode.style.left) || 0;
					var currentOffset = parseInt(allBookLabels[i].style.left) || 0;
					var parentWidth = parseInt(allBookLabels[i].parentNode.style.width) || 0;
					if (parentOffset+currentOffset<scrollPosition ||
						parentOffset+currentOffset >scrollPosition && currentOffset >0){
						intendedOffset = Math.min(Math.max((scrollPosition - parentOffset),0),parentWidth);
						allBookLabels[i].style.left = intendedOffset+'px';
					}
				}
			};
		}
		
		timelineDiv.innerHTML = '';
		var divHeight = timelineDiv.offsetHeight;
		function row(rowDiv) {this.rowDiv = rowDiv; this.lastItemEnd = 0; this.items = [];}
		var rows = [];
		var maxRows = divHeight/31 - 2;
		var eventRow;
		
		for (var i = 0; i<=maxRows; i++) {
			if (i<6) {
				rowHeight = 21;
            }
			else {
				rowHeight = 31;
			}
			var middleYOffset = divHeight/2 - rowHeight/2;
			var aboveMiddle = (i%2==0) ? -1: 1;
			var distanceFromMiddle = rowHeight*Math.floor((i+1)/2);
			var yOffset = middleYOffset + distanceFromMiddle*aboveMiddle;
			var timelineRow = createElement('div','timelineRow','');
			timelineRow.style.top = yOffset+"px";
			timelineRow.style.height = rowHeight+"px";
			timelineDiv.appendChild(timelineRow);
			rows.push(new row(timelineRow));
        }
		
		for (var i=0; i< timelineData.length; i++) {
			if (timelineData[i].type == 'book' && timelineData[i].startDate != null) {
				if (timelineData[i].priority == 1 || (timelineData[i].priority == 2 && zoom >= 0.2) || (timelineData[i].priority == 3 && zoom < 0.2)){
					bookStart = (minDate*-1+timelineData[i].startDate)/zoom;
					bookLength = (timelineData[i].endDate-timelineData[i].startDate)/zoom;
					bookLength = Math.max(bookLength,10);
					for (var j=0; j<6; j++){
						if (rows[j].lastItemEnd<=bookStart || rows[j].lastItemEnd == undefined) {
							rows[j].lastItemEnd = bookStart+bookLength;
							break;
						}
					}
					var eventMarker = createElement('div',timelineData[i].subtype+'BookMarker '+timelineData[i].type+'Marker','');
					eventMarker.style.left = bookStart+'px';
					eventMarker.style.width = bookLength+'px';
					rows[j].rowDiv.appendChild(eventMarker);
					var eventLabel = createElement('div','bookMarkerLabel movingLabel', timelineData[i].label);
					eventMarker.appendChild(eventLabel);
				}
            }
			else if (timelineData[i].type == "era" ) {
				eraStart = (minDate*-1+timelineData[i].startDate)/zoom;
				eraLength = (timelineData[i].endDate-timelineData[i].startDate)/zoom;
				var eventMarker = createElement('div',timelineData[i].subtype+'Marker '+timelineData[i].type+'Marker','');
				eventMarker.style.left = eraStart+'px';
				eventMarker.style.width = eraLength+'px';
				rows[4].rowDiv.appendChild(eventMarker);
				var eventLabel = createElement('div','eventLabel movingLabel', timelineData[i].label);
				eventMarker.appendChild(eventLabel);
            }
			
			else {	
				var classNames = 'timelineMarker '+timelineData[i].type+'Marker '+timelineData[i].subtype+'Marker';
				var spaceNeeded = -1;
				if (timelineData[i].priority == 1 || (timelineData[i].priority == 3 && zoom < 0.6) || (timelineData[i].priority == 2 && zoom < 1.1)){
					classNames = classNames + " emphasis";
					spaceNeeded = 30;
				}
				var eventPosition = ((minDate*-1)+timelineData[i].startDate)/zoom;
				
				if (timelineData[i].type=="person" || maxRows<14) {
                    if (timelineData[i].kingdom == "judah") {
                        eventRow = rows[7];
                    }
					else if (timelineData[i].kingdom == "israel") {
                        eventRow = rows[8];
                    }
					else {
						eventRow = rows[7].lastItemEnd<rows[8].lastItemEnd ? rows[7] : rows[8];
					}
                }
				else {
                    if (timelineData[i].kingdom == "judah") {
                        eventRow = rows[9];
                    }
					else if (timelineData[i].kingdom == "israel") {
                        eventRow = rows[10];
                    }
					else {
						eventRow = rows[9].lastItemEnd<rows[10].lastItemEnd ? rows[9] : rows[10];
					}
				}

				if (timelineData[i].subtype===undefined || timelineData[i].subtype===null || timelineData[i].subtype==='') {
					timelineData[i].subtype = "generalEvent";
				}
				if (eventRow.lastItemEnd<eventPosition || eventRow.lastItemEnd == undefined ) {    
					var eventMarker = createElement('div',classNames,'');
					eventMarker.style.left = eventPosition+'px';
					eventRow.rowDiv.appendChild(eventMarker);
					if (timelineData[i].endDate !=null) {
						var eventDuration = (timelineData[i].endDate - timelineData[i].startDate)/zoom;
						var eventLifeline = createElement('div','eventLifeline', '');
						eventLifeline.style.width = eventDuration+'px';
						eventMarker.appendChild(eventLifeline);
					}
					var eventLabel = createElement('div','eventLabel', timelineData[i].label);
					eventMarker.appendChild(eventLabel);
					var eventIcon = document.createElementNS(svgns, 'svg');
					var use = document.createElementNS(svgns, "use");
					use.setAttributeNS(xlinkns, "href", sofia.config.icons+"#"+timelineData[i].subtype);
					eventIcon.appendChild(use);
					eventMarker.appendChild(eventIcon);
					eventRow.items.push(eventMarker);
					eventRow.lastItemEnd = eventPosition + spaceNeeded;
				}
				else {
					if (spaceNeeded>0) {
						var lastItem = eventRow.rowDiv.lastElementChild;
						var eventCollection;
						if (lastItem.className != 'eventCollection') {
							eventCollection = createElement('div','eventCollection','');
							eventCollection.style.left = parseInt(lastItem.style.left)+'px';
							eventRow.lastItemEnd = parseInt(lastItem.style.left) + 14;
							eventCollection.style.top = eventRow.yOffset+'px';
							var eventIcon = document.createElementNS(svgns, 'svg');
							var use = document.createElementNS(svgns, "use");
							if(timelineData[i].type=="person"){
								use.setAttributeNS(xlinkns, "href", sofia.config.icons+"#"+"multiplePeople");
							}
							else {
								use.setAttributeNS(xlinkns, "href", sofia.config.icons+"#"+"multipleEvent");
							}
							eventIcon.appendChild(use);
							eventCollection.appendChild(eventIcon);
							eventRow.rowDiv.appendChild(eventCollection);
							eventRow.items.push(eventCollection);
							lastItem.style.left = '0px';
							lastItem.style.top = '0px';
							lastItem.className = lastItem.className +' emphasis';
							eventCollection.appendChild(lastItem);
						}
						else {
							eventCollection = lastItem;
						}
						classNames = classNames + ' emphasis';
						var eventMarker = createElement('div',classNames,'');
						eventCollection.appendChild(eventMarker);
						if (timelineData[i].endDate !=null) {
							var eventDuration = (timelineData[i].endDate - timelineData[i].startDate)/zoom;
							var eventLifeline = createElement('div','eventLifeline', '');
							eventLifeline.style.width = eventDuration+'px';
							eventMarker.appendChild(eventLifeline);
						}
						var eventLabel = createElement('div','eventLabel', timelineData[i].label);
						eventMarker.style.left = eventPosition - parseInt(eventCollection.style.left) +'px';
						eventMarker.appendChild(eventLabel);
						var eventIcon = document.createElementNS(svgns, 'svg');
						var use = document.createElementNS(svgns, "use");
						use.setAttributeNS(xlinkns, "href", sofia.config.icons+"#"+timelineData[i].subtype);
						eventIcon.appendChild(use);
						eventMarker.appendChild(eventIcon);
					}
				}
			}
		}
		$('.timelineMarker, .bookMarker, .eventCollection').click( function(e) {
			$(e.currentTarget).toggleClass('selectedEvent');
		});
		timelineDiv.scrollLeft = scrollPosition;
	}

	function createElement(type, className, text) {
		var el = document.createElement(type);
		el.className = className;
		el.textContent = text;
		return el;
	}

	function size(width, height) {
		windowHeight = height;
		windowWidth = width;
		targetDiv.style.width=width+"px";
		targetDiv.style.height=height+"px";
		loadEvents();
	}

	
	// So that current state can be saved to the url for back/forward/refresh purposes.
	function getData() {
		data = {
			scrollValue: scrollPosition,
			zoomValue: zoom,
			params:{
				'win':'timeline',
				'scrollValue': scrollPosition,
				'zoomValue': zoom,
			}
		}
		return data
	}
	
	function saveTimelineSettings() {
		ext.trigger('settingschange', {
					type:'settingschange',
					target: this,
					data: {
						scroll: scrollPosition,
						zoom: zoom,
					}
				});
    }

	function close() {
		console.log('closing timeline');
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
			book = chapter.substring(0,2);
			if (book != currentBook) {
				currentBook = book;
				for (var i=0; i< timelineData.length; i++) {
					if (timelineData[i].ref == book) {
						if (timelineData[i].startDate == null || timelineData[i].endDate == null) {
                            document.getElementById('timelineInfoBox').textContent = "No dates available for this book";
							document.getElementById('timelineInfoBox').style.display = "block";
                        }
						else {
							document.getElementById('timelineInfoBox').style.display = "none";
							bookStart = timelineData[i].startDate-10;
							bookEnd = timelineData[i].endDate+10;
							bookLength = bookEnd - bookStart;
							bookMiddle = bookStart + bookLength/2;
							zoom = Math.max(Math.min(bookLength/windowWidth, maxZoom), minZoom);
							scrollPosition = (minDate*-1+bookMiddle)/zoom - windowWidth/2;
							console.log("redrawing timeline");
							saveTimelineSettings();
							drawTimeline();
						}
					}
				}
			}
		}
	});

	return ext;
};

sofia.initMethods.push(function() {

	if (sofia.config.enableOnlineSources) {

		sofia.windowTypes.push( {
					className:'TimelineWindow',
					param: 'timeline',
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

var bibleTimelineData = [
	{"label":"Beginning", "startDate":-2300, "endDate":-2092, "type":"era", "subtype":"beggining", "priority":1},
	{"label":"Covenant", "startDate":-2091, "endDate":-1805, "type":"era", "subtype":"covenant", "priority":1},
	{"label":"Wilderness", "startDate":-1804, "endDate":-1400, "type":"era", "subtype":"wilderness", "priority":1},
	{"label":"Nation", "startDate":-1399, "endDate":-930, "type":"era", "subtype":"nation", "priority":1},
	{"label":"Divided nation", "startDate":-929, "endDate":-586, "type":"era", "subtype":"divided", "priority":1},
	{"label":"Exile", "startDate":-585, "endDate":-538, "type":"era", "subtype":"exile", "priority":1},
	{"label":"Return", "startDate":-537, "endDate":-1, "type":"era", "subtype":"return", "priority":1},
	{"label":"Gospel", "startDate":0, "endDate":30, "type":"era", "subtype":"gospel", "priority":1},
	{"label":"Early church", "startDate":31, "endDate":150, "type":"era", "subtype":"earlychurch", "priority":1},
	{"label":"Othniel", "startDate":-1376, "endDate":-1327,  "type":"person", "subtype":"judge", "priority":3},
	{"label":"Ehud", "startDate":-1309, "endDate":-1229,  "type":"person", "subtype":"judge", "priority":3},
	{"label":"Deborah", "startDate":-1209, "endDate":-1169,  "type":"person", "subtype":"judge", "priority":3},
	{"label":"Gideon", "startDate":-1162, "endDate":-1122,  "type":"person", "subtype":"judge", "priority":2},
	{"label":"Samson", "startDate":-1075, "endDate":-1055,  "type":"person", "subtype":"judge", "priority":2},
	{"label":"Samuel", "startDate":-1105, "endDate":-1011, "born":-1105, "type":"person", "subtype":"prophet", "priority":2},
	{"label":"Saul ", "startDate":-1043, "endDate":-1010,  "type":"person", "subtype":"kingUnited", "priority":2},
	{"label":"David", "startDate":-1010, "endDate":-967, "born":-1040, "type":"person", "subtype":"kingUnited", "priority":1},
	{"label":"Solomon", "startDate":-990, "endDate":-930, "born":-991, "type":"person", "subtype":"kingUnited", "priority":2},
	{"label":"Elijah", "startDate":-875, "endDate":-848,  "type":"person", "subtype":"prophet", "priority":2},
	{"label":"Jeroboam I", "startDate":-930, "endDate":-909,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Rehoboam", "startDate":-930, "endDate":-913,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Asa", "startDate":-910, "endDate":-872,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Nadab", "startDate":-909, "endDate":-908,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Baasha", "startDate":-908, "endDate":-886,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Elah", "startDate":-886, "endDate":-885,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Zimri", "startDate":-885, "endDate":-885,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Tibni", "startDate":-885, "endDate":-885,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Omri", "startDate":-885, "endDate":-874,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Ahab", "startDate":-874, "endDate":-853,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":2},
	{"label":"Ahazia", "startDate":-853, "endDate":-852,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Joram", "startDate":-852, "endDate":-841,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Jehu", "startDate":-841, "endDate":-814,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Jehoahaz", "startDate":-814, "endDate":-798,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Jehoash", "startDate":-798, "endDate":-793,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Jeroboam II", "startDate":-793, "endDate":-753,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Zechariah", "startDate":-753, "endDate":-752,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Shallum", "startDate":-752, "endDate":-752,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Menahem", "startDate":-752, "endDate":-742,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Pekahiah", "startDate":-742, "endDate":-740,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Pekahiah", "startDate":-740, "endDate":-732,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Hoshea", "startDate":-732, "endDate":-722,  "type":"person", "kingdom":"israel", "subtype":"kingIsrael", "priority":3},
	{"label":"Abijah", "startDate":-913, "endDate":-910,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Jehosophat", "startDate":-872, "endDate":-853,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Jehoram", "startDate":-853, "endDate":-841,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Ahaziah", "startDate":-841, "endDate":-841,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Athaliah", "startDate":-841, "endDate":-835,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Joash", "startDate":-835, "endDate":-796,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Amaziah", "startDate":-796, "endDate":-792,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Azariah/Uzziah", "startDate":-792, "endDate":-750,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Jotham", "startDate":-750, "endDate":-735,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Ahaz", "startDate":-735, "endDate":-715,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Hezekiah", "startDate":-715, "endDate":-697,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Manasseh", "startDate":-697, "endDate":-642,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Amon", "startDate":-642, "endDate":-640,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Josiah", "startDate":-640, "endDate":-609,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":2},
	{"label":"Jehoahaz", "startDate":-609, "endDate":-609,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Jehoiakim", "startDate":-609, "endDate":-598,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Jehoiachin", "startDate":-598, "endDate":-597,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Zedekiah", "startDate":-597, "endDate":-586,  "type":"person", "kingdom":"judah", "subtype":"kingJudah", "priority":3},
	{"label":"Elisha", "startDate":-848, "endDate":-797,  "type":"person", "subtype":"prophet", "priority":2},
	{"label":"Jonah", "startDate":-793, "endDate":-753,  "type":"person", "subtype":"prophet", "priority":1},
	{"label":"Obadiah", "startDate":-855, "endDate":-840,  "type":"person", "subtype":"prophet", "priority":2},
	{"label":"Joel", "startDate":-835, "endDate":-796,  "type":"person", "subtype":"prophet", "priority":2},
	{"label":"Ahijah", "startDate":-934, "endDate":-909,  "type":"person", "subtype":"prophet", "priority":3},
	{"label":"Amos", "startDate":-760, "endDate":-750,  "type":"person", "subtype":"prophet", "priority":2},
	{"label":"Hosea", "startDate":-753, "endDate":-715,  "type":"person", "subtype":"prophet", "priority":2},
	{"label":"Micah", "startDate":-742, "endDate":-687,  "type":"person", "subtype":"prophet", "priority":2},
	{"label":"Isaiah", "startDate":-740, "endDate":-681,  "type":"person", "subtype":"prophet", "priority":1},
	{"label":"Nahum", "startDate":-663, "endDate":-654,  "type":"person", "subtype":"prophet", "priority":3},
	{"label":"Zephaniah", "startDate":-640, "endDate":-621,  "type":"person", "subtype":"prophet", "priority":2},
	{"label":"Jeremiah", "startDate":-627, "endDate":-586,  "type":"person", "subtype":"prophet", "priority":1},
	{"label":"Habakkuk", "startDate":-612, "endDate":-589,  "type":"person", "subtype":"prophet", "priority":3},
	{"label":"Jesus' crucified", "startDate":30, "endDate":null, "type":"event", "subtype":"cross", "priority":1},
	{"label":"1 Chronicles", "ref":"R1", "startDate":-2300, "endDate":-970, "written":null, "type":"book", "subtype":"hist", "priority":1},
	{"label":"2 Chronicles", "ref":"R2", "startDate":-970, "endDate":-586, "written":null, "type":"book",  "subtype":"hist", "priority":1},
	{"label":"Genesis", "ref":"GN", "startDate":-2300, "endDate":-1805, "written":-1430, "type":"book",  "subtype":"penta", "priority":1},
	{"label":"Exodus", "ref":"EX", "startDate":-1805, "endDate":-1430, "written":-1430, "type":"book",  "subtype":"penta", "priority":1},
	{"label":"Leviticus", "ref":"LV", "startDate":-1444, "endDate":-1445, "written":null, "type":"book",  "subtype":"penta", "priority":1},
	{"label":"Numbers", "ref":"NU", "startDate":-1444, "endDate":-1406, "written":-1430, "type":"book",  "subtype":"penta", "priority":1},
	{"label":"Psalms", "ref":"PS", "startDate":-1440, "endDate":-586, "written":null, "type":"book",  "subtype":"poet", "priority":1},
	{"label":"Deuteronomy", "ref":"DT", "startDate":-1407, "endDate":-1400, "written":-1406, "type":"book",  "subtype":"penta", "priority":1},
	{"label":"Joshua", "ref":"JS", "startDate":-1407, "endDate":-1375, "written":null, "type":"book",  "subtype":"hist", "priority":1},
	{"label":"Judges", "ref":"JU", "startDate":-1375, "endDate":-1050, "written":null, "type":"book",  "subtype":"hist", "priority":1},
	{"label":"1 Samuel", "ref":"S1", "startDate":-1105, "endDate":-1010, "written":null, "type":"book",  "subtype":"hist", "priority":1},
	{"label":"2 Samuel", "ref":"S2", "startDate":-1010, "endDate":-970, "written":-930, "type":"book",  "subtype":"hist", "priority":1},
	{"label":"Ruth", "ref":"RT", "startDate":-1050, "endDate":-1040, "written":null, "type":"book",  "subtype":"hist", "priority":1},
	{"label":"1 Kings", "ref":"K1", "startDate":-970, "endDate":-852, "written":null, "type":"book",  "subtype":"hist", "priority":1},
	{"label":"2 Kings", "ref":"K2", "startDate":-852, "endDate":-586, "written":null, "type":"book",  "subtype":"hist", "priority":1},
	{"label":"Song of Solomon", "ref":"SS", "startDate":-970, "endDate":-960, "written":null, "type":"book",  "subtype":"poet", "priority":1},
	{"label":"Joel", "ref":"JL", "startDate":-835, "endDate":-796, "written":null, "type":"book",  "subtype":"minorp", "priority":1},
	{"label":"Proverbs", "ref":"PR", "startDate":-970, "endDate":-960, "written":null, "type":"book",  "subtype":"poet", "priority":1},
	{"label":"Obadiah", "ref":"OB", "startDate":-853, "endDate":-841, "written":null, "type":"book",  "subtype":"minorp", "priority":1},
	{"label":"Jonah", "ref":"JH", "startDate":-785, "endDate":-760, "written":null, "type":"book", "subtype":"minorp", "priority":1},
	{"label":"Amos", "ref":"AM", "startDate":-760, "endDate":-750, "written":null, "type":"book", "subtype":"minorp", "priority":1},
	{"label":"Hosea", "ref":"HS", "startDate":-753, "endDate":-715, "written":-715, "type":"book", "subtype":"minorp", "priority":1},
	{"label":"Micah", "ref":"MC", "startDate":-742, "endDate":-687, "written":null, "type":"book", "subtype":"minorp", "priority":1},
	{"label":"Isaiah", "ref":"IS", "startDate":-700, "endDate":-681, "written":null, "type":"book", "subtype":"majorp", "priority":1},
	{"label":"Nahum", "ref":"NH", "startDate":-663, "endDate":-612, "written":null, "type":"book", "subtype":"minorp", "priority":1},
	{"label":"Zephaniah", "ref":"ZP", "startDate":-640, "endDate":-621, "written":null, "type":"book", "subtype":"minorp", "priority":1},
	{"label":"Jeremiah", "ref":"JR", "startDate":-627, "endDate":-586, "written":null, "type":"book", "subtype":"majorp", "priority":1},
	{"label":"Habakkuk", "ref":"HK", "startDate":-612, "endDate":-588, "written":null, "type":"book", "subtype":"minorp", "priority":1},
	{"label":"Daniel", "ref":"DN", "startDate":-605, "endDate":-535, "written":null, "type":"book", "subtype":"majorp", "priority":1},
	{"label":"Lamentations", "ref":"LM", "startDate":-586, "endDate":-586, "written":-586, "type":"book", "subtype":"poet", "priority":1},
	{"label":"Ezekiel", "ref":"EK", "startDate":-571, "endDate":-571, "written":-571, "type":"book", "subtype":"majorp", "priority":1},
	{"label":"Ezra", "ref":"ER", "startDate":-538, "endDate":-450, "written":-450, "type":"book", "subtype":"hist", "priority":1},
	{"label":"Haggai", "ref":"HG", "startDate":-538, "endDate":-520, "written":-520, "type":"book", "subtype":"minorp", "priority":1},
	{"label":"Zechariah", "ref":"ZC", "startDate":-520, "endDate":-480, "written":null, "type":"book", "subtype":"minorp", "priority":1},
	{"label":"Esther", "ref":"ET", "startDate":-483, "endDate":-471, "written":null, "type":"book", "subtype":"hist", "priority":1},
	{"label":"Nehemiah", "ref":"NH", "startDate":-445, "endDate":-432, "written":-440, "type":"book", "subtype":"hist", "priority":1},
	{"label":"Malachi", "ref":"ML", "startDate":-430, "endDate":-430, "written":null, "type":"book", "subtype":"minorp", "priority":1},
	{"label":"Matthew", "ref":"MT", "startDate":0, "endDate":30, "written":65, "type":"book", "subtype":"gospel", "priority":1},
	{"label":"Mark", "ref":"MK", "startDate":25, "endDate":30, "written":65, "type":"book", "subtype":"gospel", "priority":1},
	{"label":"Luke", "ref":"LK", "startDate":0, "endDate":30, "written":60, "type":"book", "subtype":"gospel", "priority":1},
	{"label":"John", "ref":"JN", "startDate":25, "endDate":30, "written":90, "type":"book", "subtype":"gospel", "priority":1},
	{"label":"Acts", "ref":"AC", "startDate":31, "endDate":62, "written":70, "type":"book", "subtype":"acts", "priority":1},
	{"label":"Paul's letters", "startDate":51, "endDate":100, "type":"book", "subtype":"paul", "priority":2},
	{"label":"Other letters", "startDate":75, "endDate":110, "type":"book", "subtype":"general", "priority":2},
	{"label":"2 Thessalonians", "ref":"H2", "startDate":51, "endDate":51, "written":51, "type":"book", "subtype":"paul", "priority":3},
	{"label":"1 Thessalonians", "ref":"H1", "startDate":51, "endDate":51, "written":51, "type":"book", "subtype":"paul", "priority":3},
	{"label":"2 Thessalonians", "ref":"H2", "startDate":51, "endDate":51, "written":51, "type":"book", "subtype":"paul", "priority":3},
	{"label":"Philippians", "ref":"PP", "startDate":54, "endDate":54, "written":54, "type":"book", "subtype":"acts", "subtype":"paul", "priority":3},
	{"label":"Philemon", "ref":"PM", "startDate":54, "endDate":54, "written":54, "type":"book", "subtype":"paul", "priority":3},
	{"label":"Galatians", "ref":"GL", "startDate":55, "endDate":55, "written":55, "type":"book", "subtype":"paul", "priority":3},
	{"label":"1 Corinthians", "ref":"C1", "startDate":56, "endDate":56, "written":56, "type":"book", "subtype":"paul", "priority":3},
	{"label":"2 Corinthians", "ref":"C2", "startDate":56, "endDate":56, "written":56, "type":"book", "subtype":"paul", "priority":3},
	{"label":"Romans", "ref":"RM", "startDate":57, "endDate":57, "written":57, "type":"book", "subtype":"paul", "priority":3},
	{"label":"Colossians", "ref":"CL", "startDate":66, "endDate":66, "written":66, "type":"book", "subtype":"paul", "priority":3},
	{"label":"James", "ref":"JM", "startDate":75, "endDate":75, "written":75, "type":"book", "subtype":"general", "priority":3},
	{"label":"1 Peter", "ref":"P1", "startDate":82, "endDate":83, "written":82, "type":"book", "subtype":"general", "priority":3},
	{"label":"Ephesians", "ref":"EP", "startDate":85, "endDate":85, "written":85, "type":"book", "subtype":"paul", "priority":3},
	{"label":"Hebrews", "ref":"HB", "startDate":85, "endDate":85, "written":85, "type":"book", "subtype":"general", "priority":3},
	{"label":"Revelation", "ref":"RV", "startDate":95, "endDate":95, "written":95, "type":"book", "subtype":"rev", "priority":1},
	{"label":"1 Timothy", "ref":"T1", "startDate":100, "endDate":100, "written":100, "type":"book", "subtype":"paul", "priority":3},
	{"label":"2 Timothy", "ref":"T2", "startDate":100, "endDate":100, "written":100, "type":"book", "subtype":"paul", "priority":3},
	{"label":"Titus", "ref":"TT", "startDate":100, "endDate":100, "written":100, "type":"book", "subtype":"paul", "priority":3},
	{"label":"1 John", "ref":"J1", "startDate":100, "endDate":100, "written":100, "type":"book", "subtype":"general", "priority":3},
	{"label":"2 John", "ref":"J2", "startDate":100, "endDate":100, "written":100, "type":"book", "subtype":"general", "priority":3},
	{"label":"3 John", "ref":"J3", "startDate":100, "endDate":100, "written":100, "type":"book", "subtype":"general", "priority":3},
	{"label":"2 Peter", "ref":"P2", "startDate":110, "endDate":110, "written":110, "type":"book", "subtype":"general", "priority":3},
	{"label":"Abram/Abraham", "startDate":-2166, "endDate":-1991, "ref":"Genesis 12", "type":"person", "subtype":"person", "priority":1},
	{"label":"Sarai/Sarah", "startDate":-2166, "endDate":-2030, "ref":"Genesis 12", "type":"person", "subtype":"person", "priority":2},
	{"label":"God sends Abram to Egypt", "startDate":-2091 , "endDate":-2091 , "ref":"Genesis 12", "type":"event", "priority":3},
	{"label":"Famine in Canaan", "startDate":-2090 , "endDate":-2090 , "ref":"Genesis 12:10", "type":"event", "priority":3},
	{"label":"Abram and Lot separate", "startDate":-2085 , "endDate":-2085 , "ref":"Genesis 13", "type":"event", "priority":3},
	{"label":"God promises Abram children", "startDate":-2085 , "endDate":-2085 , "ref":"Genesis 13:14", "type":"event", "priority":2},
	{"label":"Abram rescues Lot", "startDate":-2084 , "endDate":-2084 , "ref":"Genesis 14", "type":"event", "priority":3},
	{"label":"God's Agreement with Abram", "startDate":-2081 , "endDate":-2081 , "ref":"Genesis 15", "type":"event", "priority":2},
	{"label":"Ishmael", "startDate":-2080 , "endDate":-2080 , "ref":"Genesis 16:15", "type":"person", "subtype":"person", "priority":2},
	{"label":"Introduction of circumcision", "startDate":-2067 , "endDate":-2067 , "ref":"Genesis 17", "type":"event", "priority":3},
	{"label":"God promises Abraham and Sarah a son", "startDate":-2067 , "endDate":-2067 , "ref":"Genesis 18", "type":"event", "priority":2},
	{"label":"The destruction of Sodom", "startDate":-2067 , "endDate":-2067 , "ref":"Genesis 19", "type":"event", "priority":3},
	{"label":"Isaac", "startDate":-2066 , "endDate":-1977 , "ref":"Genesis 21", "type":"person", "subtype":"person", "priority":1},
	{"label":"The treaty at Beersheba", "startDate":-2057 , "endDate":-2057 , "ref":"Genesis 21:22", "type":"event", "priority":3},
	{"label":"Abraham to sacrifice Isaac", "startDate":-2054 , "endDate":-2054 , "ref":"Genesis 22", "type":"event", "priority":2},
	{"label":"Isaac marries Rebekah", "startDate":-2026 , "endDate":-2026 , "ref":"Genesis 24", "type":"event", "priority":3},
	{"label":"Jacob", "startDate":-2006 , "endDate":-1859 , "ref":"Genesis 25", "type":"person", "subtype":"person", "priority":1},
	{"label":"Esau", "startDate":-2006 , "endDate":-2006 , "ref":"Genesis 25", "type":"person", "subtype":"person", "priority":2},
	{"label":"Esau sells his birthright", "startDate":-1978 , "endDate":-1978 , "ref":"Genesis 25:29", "type":"event", "priority":3},
	{"label":"Jacob gets Isaac's blessing", "startDate":-1929 , "endDate":-1929 , "ref":"Genesis 27", "type":"event", "priority":3},
	{"label":"Jacob flees to Laban", "startDate":-1928 , "endDate":-1928 , "ref":"Genesis 28", "type":"event", "priority":3},
	{"label":"Jacob's vision of a ladder", "startDate":-1928 , "endDate":-1928 , "ref":"Genesis 28:10", "type":"event", "priority":3},
	{"label":"Jacob and Rachel's marriage", "startDate":-1921 , "endDate":-1903 , "ref":"Genesis 29:28", "type":"event", "priority":3},
	{"label":"Joseph", "startDate":-1916 , "endDate":-1806 , "ref":"Genesis 30:22", "type":"person", "subtype":"person",  "priority":1},
	{"label":"Jacob leaves for Canaan", "startDate":-1908 , "endDate":-1908 , "ref":"Genesis 31", "type":"event", "priority":3},
	{"label":"Jacob wrestles with God", "startDate":-1906 , "endDate":-1906 , "ref":"Genesis 32", "type":"event", "priority":3},
	{"label":"Jacob and Esau reconciled", "startDate":-1906 , "endDate":-1906 , "ref":"Genesis 33", "type":"event", "priority":3},
	{"label":"Jacob renamed Israel", "startDate":-1906 , "endDate":-1906 , "ref":"Genesis 35:10", "type":"event", "priority":3},
	{"label":"Joseph sold into Slavery", "startDate":-1898 , "endDate":-1898 , "ref":"Genesis 37:25", "type":"event", "priority":2},
	{"label":"Tamar deceives Judah", "startDate":-1898 , "endDate":-1898 , "ref":"Genesis 38", "type":"event", "priority":3},
	{"label":"Joseph imprisoned", "startDate":-1889 , "endDate":-1889 , "ref":"Genesis 39:20", "type":"event", "priority":3},
	{"label":"Joseph interprets Pharaoh's dreams", "startDate":-1886 , "endDate":-1886 , "ref":"Genesis 41", "type":"event", "priority":2},
	{"label":"Seven years of plenty", "startDate":-1886 , "endDate":-1875 , "ref":"Genesis 41:47", "type":"event", "priority":3},
	{"label":"Famine", "startDate":-1875 , "endDate":-1868 , "ref":"Genesis 41:53", "type":"event", "priority":3},
	{"label":"Joseph's brothers visit Egypt", "startDate":-1874 , "endDate":-1875 , "ref":"Genesis 42", "type":"event", "priority":3},
	{"label":"Joseph's brothers return with Benjamin", "startDate":-1873 , "endDate":-1875 , "ref":"Genesis 43", "type":"event", "priority":3},
	{"label":"Israelites multiply in Egypt", "startDate":-1700 , "endDate":-1700 , "ref":"Exodus 1:6", "type":"event", "priority":2},
	{"label":"Israelites oppressed by Pharaoh", "startDate":-1600 , "endDate":-1600 , "ref":"Exodus 1:8", "type":"event", "priority":3},
	{"label":"Moses", "startDate":-1525, "endDate":-1406, "ref":"Exodus 2", "type":"person", "subtype":"person", "priority":1},
	{"label":"Aaron", "startDate":-1529, "endDate":-1407, "ref":"Exodus 2", "type":"person", "subtype":"person", "priority":2},
	{"label":"Moses flees to Midian", "startDate":-1486 , "endDate":-1486 , "ref":"Exodus 2:11", "type":"event", "priority":3},
	{"label":"Moses sent to deliver Israel", "startDate":-1446 , "endDate":-1446 , "ref":"Exodus 3 - 6", "type":"event", "priority":3},
	{"label":"The ten plagues on Egypt", "startDate":-1446 , "endDate":-1446 , "ref":"Exodus 7 - 12", "type":"event", "priority":1},
	{"label":"The Exodus begins", "startDate":-1446 , "endDate":-1446 , "ref":"Exodus 13 - 18", "type":"event", "priority":2},
	{"label":"Moses receives the ten commandments", "startDate":-1446 , "endDate":-1446 , "ref":"Exodus 20", "type":"event", "priority":1},
	{"label":"Preparations for the Tabernacle", "startDate":-1446 , "endDate":-1446 , "ref":"Exodus 25 - 31", "type":"event", "priority":3},
	{"label":"The Golden Calf and Moses' Anger", "startDate":-1446 , "endDate":-1446 , "ref":"Exodus 32", "type":"event", "priority":3},
	{"label":"The Tabernacle is built", "startDate":-1445 , "endDate":-1445 , "ref":"Exodus 40", "type":"event", "priority":2},
	{"label":"Korah's rebellion", "startDate":-1426 , "endDate":-1426 , "ref":"Numbers 16", "type":"event", "priority":3},
	{"label":"Water from the Rock at Meribah", "startDate":-1407 , "endDate":-1407 , "ref":"Numbers 20", "type":"event", "priority":3},
	{"label":"The bronze snake", "startDate":-1407 , "endDate":-1407 , "ref":"Numbers 21", "type":"event", "priority":3},
	{"label":"The second census", "startDate":-1407 , "endDate":-1407 , "ref":"Numbers 26", "type":"event", "priority":3},
	{"label":"Joshua", "startDate":-1407 , "endDate":-1375 , "ref":"Numbers 27:18", "type":"event", "priority":2},
	{"label":"Conquest of Midian", "startDate":-1407 , "endDate":-1407 , "ref":"Numbers 31", "type":"event", "subtype":"battle", "priority":3},
	{"label":"Psalm of Moses", "startDate":-1407 , "endDate":-1407 , "ref":"Psalm 90", "type":"event", "priority":3},
	{"label":"Moses gives the people instructions", "startDate":-1406 , "endDate":-1406 , "ref":"Deuteronomy 4:44 - 31", "type":"event", "priority":3},
	{"label":"God commissions Joshua", "startDate":-1406 , "endDate":-1406 , "ref":"Joshua 1", "type":"event", "priority":3},
	{"label":"Rahab Welcomes the spies", "startDate":-1406 , "endDate":-1406 , "ref":"Joshua 2", "type":"event", "priority":3},
	{"label":"Crossing the Jordan", "startDate":-1406 , "endDate":-1406 , "ref":"Joshua 3 - 5", "type":"event", "priority":2},
	{"label":"Jericho captured", "startDate":-1406 , "endDate":-1406 , "ref":"Joshua 6 - 8", "type":"event","subtype":"battle", "priority":2},
	{"label":"The sun stands still", "startDate":-1405 , "endDate":-1405 , "ref":"Joshua 10", "type":"event", "priority":3},
	{"label":"Northern Palestine captured", "startDate":-1405 , "endDate":-1405 , "ref":"Joshua 11, 12", "type":"event","subtype":"battle", "priority":3},
	{"label":"Israelites fight Benjamites", "startDate":-1375 , "endDate":-1375 , "ref":"Judges 20", "type":"event","subtype":"battle", "priority":3},
	{"label":"Jerusalem captured", "startDate":-1374 , "endDate":-1374 , "ref":"Judges 1", "type":"event","subtype":"battle", "priority":3},
	{"label":"Israel rebuked and defeated", "startDate":-1374 , "endDate":-1374 , "ref":"Judges 2", "type":"event","subtype":"battle", "priority":3},
	{"label":"Eglon", "startDate":-1334 , "endDate":-1334 , "ref":"Judges 3:12", "type":"person","subtype":"judge", "priority":3},
	{"label":"Gideon fights the Midianites", "startDate":-1169 , "endDate":-1169 , "ref":"Judges 6 - 8", "type":"event","subtype":"battle", "priority":3},
	{"label":"Naomi, Ruth and Boaz", "startDate":-1140 , "endDate":-1140 , "ref":"Ruth 1 - 4", "type":"person", "subtype":"person", "priority":2},
	{"label":"Abimelech", "startDate":-1129 , "endDate":-1126 , "ref":"Judges 9", "type":"person", "subtype":"person", "priority":3},
	{"label":"Plot against Abimelech", "startDate":-1126 , "endDate":-1126 , "ref":"Judges 9:22", "type":"event", "priority":3},
	{"label":"Jephthah's covenant with the Gileadites", "startDate":-1097 , "endDate":-1097 , "ref":"Judges 11", "type":"event", "priority":3},
	{"label":"Samson's marriage and riddle", "startDate":-1075 , "endDate":-1075 , "ref":"Judges 14", "type":"event", "priority":3},
	{"label":"Samson and Delilah", "startDate":-1075 , "endDate":-1075 , "ref":"Judges 16", "type":"event", "priority":3},
	{"label":"Battle of Shiloh", "startDate":-1070 , "endDate":-1070 , "ref":"1 Samuel 3", "type":"event","subtype":"battle", "priority":3},
	{"label":"Philistines take the Ark", "startDate":-1070 , "endDate":-1070 , "ref":"1 Samuel 4, 5", "type":"event", "priority":3},
	{"label":"Israelites Repent at Mizpeh", "startDate":-1050 , "endDate":-1050 , "ref":"1 Samuel 7:3", "type":"event", "priority":3},
	{"label":"Saul defeats the Ammonites", "startDate":-1042 , "endDate":-1042 , "ref":"1 Samuel 11, 12", "type":"event","subtype":"battle", "priority":3},
	{"label":"Saul's fights the Philistines", "startDate":-1041 , "endDate":-1041 , "ref":"1 Samuel 13", "type":"event","subtype":"battle", "priority":3},
	{"label":"Samuel anoints David at Bethlehem", "startDate":-1024 , "endDate":-1024 , "ref":"1 Samuel 16", "type":"event", "priority":2},
	{"label":"David kills Goliath", "startDate":-1024 , "endDate":-1024 , "ref":"1 Samuel 17", "type":"event","subtype":"battle", "priority":1},
	{"label":"David protected from Saul", "startDate":-1014 , "endDate":-1014 , "ref":"1 Samuel 19", "type":"event", "priority":2},
	{"label":"David's Psalm of deliverance", "startDate":-1013 , "endDate":-1013 , "ref":"Psalm 59", "type":"event", "priority":3},
	{"label":"Saul slays the priests of Nob", "startDate":-1011 , "endDate":-1011 , "ref":"1 Samuel 22", "type":"event","subtype":"battle", "priority":3},
	{"label":"David flees Saul", "startDate":-1011 , "endDate":-1011 , "ref":"1 Samuel 23", "type":"event", "priority":3},
	{"label":"David spares Saul's life", "startDate":-1011 , "endDate":-1011 , "ref":"1 Samuel 24", "type":"event", "priority":3},
	{"label":"David defeats the Amalekites", "startDate":-1010 , "endDate":-1010 , "ref":"1 Samuel 30", "type":"event","subtype":"battle", "priority":3},
	{"label":"David Mourns for Saul and Jonathan", "startDate":-1010 , "endDate":-1010 , "ref":"2 Samuel 1", "type":"event", "priority":3},
	{"label":"David becomes king", "startDate":-1010 , "endDate":-1010 , "ref":"2 Samuel 2", "type":"event", "priority":1},
	{"label":"Civil war between Abner and Joab", "startDate":-1008 , "endDate":-1008 , "ref":"2 Samuel 2:12", "type":"event", "priority":3},
	{"label":"The Ark brought to Jerusalem", "startDate":-1000 , "endDate":-1000 , "ref":"2 Samuel 6,", "type":"event", "priority":1},
	{"label":"David defeats the Philistines", "startDate":-998 , "endDate":-998 , "ref":"2 Samuel 8", "type":"event","subtype":"battle", "priority":3},
	{"label":"David purposes to build a Temple", "startDate":-997 , "endDate":-997 , "ref":"1 Chronicles 17", "type":"event", "priority":3},
	{"label":"David and Mephibosheth", "startDate":-995 , "endDate":-995 , "ref":"2 Samuel 9", "type":"event", "priority":3},
	{"label":"David defeats Ammon and Aram", "startDate":-995 , "endDate":-995 , "ref":"2 Samuel 10,", "type":"event","subtype":"battle", "priority":3},
	{"label":"David and Bathsheba", "startDate":-993 , "endDate":-993 , "ref":"2 Samuel 11", "type":"event", "priority":3},
	{"label":"Amnom killed by Absalom", "startDate":-990 , "endDate":-990 , "ref":"2 Samuel 13:23", "type":"event", "priority":3},
	{"label":"David calls a Census", "startDate":-979 , "endDate":-979 , "ref":"1 Chronicles 21", "type":"event", "priority":3},
	{"label":"Absalom's plans to overthrow David", "startDate":-976 , "endDate":-976 , "ref":"2 Samuel 15", "type":"event", "priority":3},
	{"label":"Absalom killed by Joab", "startDate":-972 , "endDate":-972 , "ref":"2 Samuel 18", "type":"event", "priority":3},
	{"label":"Sheba rebels against David", "startDate":-972 , "endDate":-972 , "ref":"2 Samuel 20", "type":"event","subtype":"battle", "priority":3},
	{"label":"The Gibeonites avenged", "startDate":-970 , "endDate":-970 , "ref":"2 Samuel 21", "type":"event","subtype":"battle", "priority":3},
	{"label":"Solomon asks for wisdom", "startDate":-967 , "endDate":-967 , "ref":"2 Chronicles 1,", "type":"event", "priority":3},
	{"label":"The building of the temple", "startDate":-966 , "endDate":-966 , "ref":"1 Kings 6", "type":"event","subtype":"building", "priority":1},
	{"label":"The Ark brought to the temple", "startDate":-966 , "endDate":-966 , "ref":"1 Kings 8", "type":"event", "priority":2},
	{"label":"The Queen of Sheba visits Solomon", "startDate":-946 , "endDate":-946 , "ref":"1 Kings 10,", "type":"event", "priority":2},
	{"label":"The Kingdom is divided", "startDate":-931 , "endDate":-931 , "ref":"1 Kings 12, 13", "type":"event","subtype":"battle", "priority":1},
	{"label":"Rehoboam's sin", "startDate":-927 , "endDate":-927 , "ref":"2 Chronicles 12", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Ahijah prophecys against Jeroboam", "startDate":-925 , "endDate":-925 , "kingdom":"israel", "ref":"1 Kings 14", "type":"event", "priority":3},
	{"label":"Civil War against Jeroboam", "startDate":-913 , "endDate":-913 , "ref":"2 Chronicles 13", "kingdom":"judah", "type":"event","subtype":"battle", "priority":3},
	{"label":"Asa Destroys Idolatry", "startDate":-913 , "endDate":-913 , "ref":"2 Chronicles 14", "type":"event", "priority":3},
	{"label":"Jehu's prophecy against Baasha", "startDate":-909 , "endDate":-909 , "ref":"1 Kings 16", "type":"event", "priority":3},
	{"label":"Asa's Reforms", "startDate":-895 , "endDate":-895 , "ref":"2 Chronicles 15", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Elijah prays for drought", "startDate":-863 , "endDate":-863 , "ref":"1 Kings 17", "kingdom":"israel", "type":"event", "priority":3},
	{"label":"Elijah on Mount Carmel", "startDate":-863 , "endDate":-863 , "ref":"1 Kings 18", "kingdom":"israel", "type":"event", "priority":2},
	{"label":"Elijah flees Jezebel", "startDate":-858 , "endDate":-858 , "ref":"1 Kings 19", "kingdom":"israel", "type":"event", "priority":3},
	{"label":"Ben-Hadad attacks Samaria", "startDate":-857 , "endDate":-857 , "ref":"1 Kings 20", "type":"event","subtype":"battle", "priority":3},
	{"label":"Ahab defeats Ben-Hadad", "startDate":-857 , "endDate":-857 , "ref":"1 Kings 20:14", "kingdom":"israel", "type":"event","subtype":"battle", "priority":3},
	{"label":"Ahab takes Naboth's Vineyard", "startDate":-855 , "endDate":-855 , "ref":"1 Kings 21", "kingdom":"israel", "type":"event", "priority":3},
	{"label":"Israel and Judah fight Syria", "startDate":-853 , "endDate":-853 , "ref":"1 Kings 22", "type":"event", "subtype":"battle","priority":3},
	{"label":"War with Ammon and Moab", "startDate":-853 , "endDate":-853 , "ref":"2 Chronicles 20", "type":"event", "subtype":"battle","priority":3},
	{"label":"Moab rebels", "startDate":-852 , "endDate":-852 , "ref":"2 Kings 1", "type":"event", "subtype":"battle", "priority":3},
	{"label":"Elijah Taken up to Heaven", "startDate":-851 , "endDate":-851 , "ref":"2 Kings 2", "kingdom":"israel", "type":"event", "priority":2},
	{"label":"Jehoram meets Moab rebellion", "startDate":-850 , "endDate":-850 , "ref":"2 Kings 3", "kingdom":"judah", "type":"event","subtype":"battle", "priority":3},
	{"label":"The Widow's Oil", "startDate":-849 , "endDate":-849 , "ref":"2 Kings 4", "kingdom":"israel", "type":"event", "priority":2},
	{"label":"The Healing of Naaman", "startDate":-849 , "endDate":-849 , "ref":"2 Kings 5", "kingdom":"israel", "type":"event", "priority":3},
	{"label":"Elisha Floats an Axhead", "startDate":-848 , "endDate":-848 , "ref":"2 Kings 6", "kingdom":"israel", "type":"event", "priority":3},
	{"label":"Jehu kills Joram", "startDate":-841 , "endDate":-841 , "ref":"2 Kings 9:11", "kingdom":"israel", "type":"event", "subtype":"battle","priority":3},
	{"label":"Baal worshipers killed", "startDate":-841 , "endDate":-841 , "ref":"2 Kings 10:18", "type":"event", "priority":3},
	{"label":"Joash escapes Athaliah", "startDate":-841 , "endDate":-841 , "ref":"2 Kings 11", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Joash orders Temple repairs", "startDate":-812 , "endDate":-812 , "ref":"2 Kings 12:6", "kingdom":"judah", "type":"event", "subtype":"building", "priority":2},
	{"label":"Isaiah's Vision and Commission", "startDate":-739 , "endDate":-739 , "ref":"Isaiah 6", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Isaiah Prophesies a Child Is Born", "startDate":-730 , "endDate":-730 , "ref":"Isaiah 9", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Israel taken into exile", "startDate":-722 , "endDate":-722 , "ref":"2 Kings 17:6", "kingdom":"israel", "type":"event","subtype":"battle", "priority":1},
	{"label":"Hezekiah proclaims a solemn Passover", "startDate":-715 , "endDate":-715 , "ref":"2 Chronicles 30", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Hezekiah's illness and healing", "startDate":-712 , "endDate":-712 , "ref":"2 Kings 20,", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Hezekiah shows sies temple treasures", "startDate":-711 , "endDate":-711 , "ref":"2 Kings 20:12,", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Isaiah prophesies captivity and restoration", "startDate":-711 , "endDate":-711 , "ref":"Isaiah 40 - 66", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Sennacherib threatens Jerusalem", "startDate":-701 , "endDate":-701 , "ref":"2 Kings 18,", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Jeremiah's message", "startDate":-627 , "endDate":-627 , "ref":"Jeremiah 7 - 10", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"The Oracle to Habakkuk", "startDate":-625 , "endDate":-625 , "ref":"Habakkuk 1 - 3", "type":"event", "priority":3},
	{"label":"Jeremiah proclaims God's covenant", "startDate":-622 , "endDate":-622 , "ref":"Jeremiah 11, 12", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Josiah repairs the temple", "startDate":-621 , "endDate":-621 , "ref":"2 Kings 22:3", "kingdom":"judah", "type":"event","subtype":"building", "priority":2},
	{"label":"Josiah celebrates the Passover", "startDate":-621 , "endDate":-621 , "ref":"2 Kings 23,", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Jeremiah proclaims covenant is broken", "startDate":-609 , "endDate":-609 , "ref":"Jeremiah 13 - 20", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Daniel", "startDate":-605 , "endDate":-539 , "ref":"Daniel 1", "type":"person","subtype":"prophet", "priority":3},
	{"label":"Daniel Interprets Nebuchadnezzar Dream", "startDate":-604 , "endDate":-604 , "ref":"Daniel 2", "type":"event", "priority":2},
	{"label":"Jehoiachim exiled", "startDate":-597 , "endDate":-597 , "ref":"2 Kings 24:10", "type":"event", "priority":3},
	{"label":"Ezekiel", "startDate":-593 , "endDate":-573 , "ref":"Ezekiel 1", "type":"person","subtype":"prophet", "priority":3},
	{"label":"Siege of Jerusalem", "startDate":-588 , "endDate":-586 , "ref":"2 Kings 25", "kingdom":"judah", "kingdom":"judah", "type":"event", "subtype":"battle", "priority":3},
	{"label":"Jeremiah prophesies judgment on Judah", "startDate":-588 , "endDate":-588 , "ref":"Jeremiah 34 - 45", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Fall of Jerusalem", "startDate":-586 , "endDate":-586 , "ref":"2 Kings 25,", "kingdom":"judah", "type":"event", "subtype":"battle", "priority":1},
	{"label":"Jeremiah Prophesies against Babylon", "startDate":-586 , "endDate":-586 , "ref":"Jeremiah 50, 51", "kingdom":"judah", "type":"event", "priority":3},
	{"label":"Ezekiel Sees Resurrection of Dry Bones", "startDate":-585 , "endDate":-585 , "ref":"Ezekiel 37", "type":"event", "priority":3},
	{"label":"Shadrach, Meshach, and Abednego", "startDate":-585 , "endDate":-585 , "ref":"Daniel 3", "type":"person","subtype":"person", "priority":3},
	{"label":"Daniel Interprets Nebuchadnezzar’s Dream", "startDate":-582 , "endDate":-582 , "ref":"Daniel 4:19", "type":"event", "priority":3},
	{"label":"Daniel and the lions' den", "startDate":-539 , "endDate":-539 , "ref":"Daniel 6", "type":"event", "priority":1},
	{"label":"The exiles return", "startDate":-537 , "endDate":-537 , "ref":"Ezra 2", "type":"event", "priority":1},
	{"label":"Temple Work Begins", "startDate":-535 , "endDate":-535 , "ref":"Ezra 3", "type":"event","subtype":"building", "priority":3},
	{"label":"Artaxerxes Orders Work Stopped", "startDate":-534 , "endDate":-534 , "ref":"Ezra 4:17", "type":"event","subtype":"building", "priority":3},
	{"label":"Temple work resumed by Darius' decree", "startDate":-520 , "endDate":-520 , "ref":"Ezra 6", "type":"event","subtype":"building", "priority":3},
	{"label":"Completion of the second temple", "startDate":-515 , "endDate":-515 , "ref":"Ezra 6:16", "type":"event","subtype":"building", "priority":1},
	{"label":"Queen Vashti deposed", "startDate":-483 , "endDate":-483 , "ref":"Esther 1", "type":"event", "priority":3},
	{"label":"Esther", "startDate":-478 , "endDate":-478 , "ref":"Esther 2", "type":"person","kingdom":"judah", "subtype":"kingJudah", "priority":2},
	{"label":"Mordecai thwarts a conspiracy", "startDate":-478 , "endDate":-478 , "ref":"Esther 2:21", "type":"event", "priority":3},
	{"label":"Xerxes' edict on behalf of Esther and Jews", "startDate":-473 , "endDate":-473 , "ref":"Esther 8", "type":"event", "priority":3},
	{"label":"Ezra journeys to Jerusalem", "startDate":-458 , "endDate":-458 , "ref":"Ezra 7", "type":"event", "priority":3},
	{"label":"Nehemiah", "startDate":-445 , "endDate":-432 , "ref":"Nehemiah 1", "type":"person","subtype":"person", "priority":2},
	{"label":"Nehemiah's prayer for the exiles", "startDate":-445 , "endDate":-445 , "ref":"Nehemiah 1", "type":"event", "priority":3},
	{"label":"Artaxerxes sends Nehemiah to Jerusalem", "startDate":-444 , "endDate":-444 , "ref":"Nehemiah 2", "type":"event", "priority":3},
	{"label":"Rebuilding walls of Jerusalem", "startDate":-444 , "endDate":-444 , "ref":"Nehemiah 3", "type":"event","subtype":"building", "priority":2},
	{"label":"Nehemiah abolishes debt and bondage", "startDate":-444 , "endDate":-444 , "ref":"Nehemiah 5", "type":"event", "priority":3},
	{"label":"Census of returned exiles", "startDate":-444 , "endDate":-444 , "ref":"Nehemiah 7", "type":"event", "priority":3},
	{"label":"Ezra reads the law", "startDate":-444 , "endDate":-444 , "ref":"Nehemiah 8", "type":"event", "priority":3},
	{"label":"Nehemiah restores laws", "startDate":-432 , "endDate":-432 , "ref":"Nehemiah 13", "type":"event", "priority":2},
	{"label":"Malachi", "startDate":-430 , "endDate":-430 , "ref":"Malachi 1 - 4", "type":"person","subtype":"prophet", "priority":3},
	{"label":"Jesus life on Earth", "startDate":0 , "endDate":33 , "type":"person","subtype":"person", "priority":1},
	{"label":"Peter the apostle", "startDate":6 , "endDate":64 , "type":"person","subtype":"person", "priority":2},
	{"label":"John the baptist", "startDate":-1 , "endDate":31 , "type":"person","subtype":"person", "priority":2},
	{"label":"John the apostle", "startDate":6 , "endDate":100 , "type":"person","subtype":"person", "priority":2},
	{"label":"Paul", "startDate":37 , "endDate":67 , "type":"person","subtype":"person", "priority":2},
	{"label":"Paul's first journey", "startDate":45 , "endDate":47 , "type":"event","subtype":"journey", "priority":2},
	{"label":"Paul's second journey", "startDate":51 , "endDate":53 , "type":"event","subtype":"journey", "priority":2},
	{"label":"Paul's third journey", "startDate":54 , "endDate":58 , "type":"event","subtype":"journey", "priority":2},
	{"label":"Paul imprisoned and taken to Rome", "startDate":58 , "endDate":63 , "type":"event","subtype":"journey", "priority":2},
]
