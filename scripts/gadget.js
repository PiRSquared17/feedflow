/**********************************************

 *	Filename:	gadget.js
 *	Authors:	Tolga Hosgor, Cristian Patrasciuc
 *	Emails:		fasdfasdas@gmail.com, cristian.patrasciuc@gmail.com
 
 Copyright © 2010, 2011 Tolga Hosgor, Cristian Patrasciuc
 
 This file is part of FeedFlow.

 FeedFlow is free project: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 FeedFlow is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with FeedFlow.  If not, see <http://www.gnu.org/licenses/>.

**********************************************/

 var autoscrolltimeout;
 var feedloading=0;
 var isAutoScroll=0;
 var aSInterval=15000;
 var getNewsTimeout;
 var refreshInterval;
 var newVer=0;
 var markedAsReadCache="";
 
/* Set the event handlers */
System.Gadget.settingsUI = "Settings.html";
System.Gadget.onSettingsClosed = settingsClosed;
/*System.Gadget.onDock = resizeGadget;
System.Gadget.onUndock = resizeGadget;*/

/* Refresh feed when Settings dialog is closed */
function settingsClosed(event)
{
	if (event.closeAction == event.Action.commit) 
	{
		clearTimeout(autoscrolltimeout);
		clearTimeout(getNewsTimeout);
		clearInterval(refreshInterval);
		var refreshTime = System.Gadget.Settings.read('feedFetchRefresh');
			if (!isNaN(parseFloat(refreshTime)))refreshInterval=setInterval("getNews(null,1);",refreshTime*60000);
		loadTheme();
		currentFeed = 0;
		getNews(1);
	}
}

/* Rezise gadget when docked/undocked */
function initiateGadget()
{
	document.getElementById("gAnalytics").src="http://feedflow.googlecode.com/hg/__NODL__/analytics.html?ver="+System.Gadget.version;
	checkVersion();

	if(window.ActiveXObject){
		var fO=new ActiveXObject("Scripting.FileSystemObject");
		var f=fO.OpenTextFile(System.Gadget.path+"\\readFeeds",1,true);
		if(!f.AtEndOfStream)
			markedAsReadCache=f.readAll();
	}

	var gHeight=System.Gadget.Settings.read("gHeight")||162;

	document.body.style.height=gHeight+60+"px";
	mainContainer.style.height=gHeight+"px";
	message.style.height=gHeight-13+"px";
	mainL.style.height=gHeight+43+"px";
	mainR.style.height=gHeight+43+"px";
	mainBL.style.top=gHeight+48+"px";
	mainB.style.top=gHeight+48+"px";
	mainBR.style.top=gHeight+48+"px";
	vResizer.style.height=gHeight-27+"px";

	var gWidth=System.Gadget.Settings.read("gWidth")||132;

	document.body.style.width=gWidth+"px";
	feedList.style.width=gWidth-55+"px";
	mainContainer.style.width=gWidth+"px";
	mCC.style.width=gWidth-13+"px";
	feedTitle.style.width=gWidth+"px";
	titleDiv.style.width=gWidth-60+"px";
	titleDiv.style.marginLeft=(60-gWidth)/2+"px";
	hResizer.style.width=gWidth-22+"px";
	message.style.width=gWidth-10+"px";
	mainT.style.width=gWidth-10+"px";
	mainTR.style.left=gWidth-5+"px";
	mainR.style.left=gWidth-2+"px";
	mainBR.style.left=gWidth-5+"px";
	mainB.style.width=gWidth-10+"px";
	navigation.style.width=gWidth+"px";
	position.style.width=gWidth-57+"px";
}

function bodyMouseOver()
{
	if(System.Gadget.Settings.read("notStopAutoScroll")==0)
		clearTimeout(autoscrolltimeout);
}

function bodyMouseOut()
{
	if(isAutoScroll==1&&System.Gadget.Flyout.show==false&&System.Gadget.Settings.read("notStopAutoScroll")==0){
		clearTimeout(autoscrolltimeout);
		autoscrolltimeout=setTimeout("autoScroll();", aSInterval);
	}
}

function resizeVB()
{
	document.body.style.cursor="n-resize";
	var mYC=event.clientY;
	document.body.onmousemove=function(){
		if(event.button==0){
			resizeVE();
			return;
		}
		var mYF=event.clientY-mYC;
		mYC=event.clientY;
		if(g=parseInt(document.body.style.height)+mYF<222){
			resizeVE();
			return;
		}
		document.body.style.height=parseInt(document.body.style.height)+mYF+"px";
		mainContainer.style.height=parseInt(mainContainer.style.height)+mYF+"px";
		vResizer.style.height=parseInt(vResizer.style.height)+mYF+"px";
		message.style.height=parseInt(message.style.height)+mYF+"px";
		mainL.style.height=parseInt(mainL.style.height)+mYF+"px";
		mainR.style.height=parseInt(mainR.style.height)+mYF+"px";
		mainBL.style.top=parseInt(mainBL.style.top)+mYF+"px";
		mainB.style.top=parseInt(mainB.style.top)+mYF+"px";
		mainBR.style.top=parseInt(mainBR.style.top)+mYF+"px";
	};
	document.body.onmouseup="resizeVE();";
}

function resizeVE()
{
	var gHeight=parseInt(mainContainer.style.height);
	System.Gadget.Settings.write("gHeight",gHeight);
	document.body.style.cursor="";
	document.body.onmousemove="";
	document.body.onmouseup="";
	showNews(news);
}

function resizeHB()
{
	document.body.style.cursor="e-resize";
	var mXC=event.clientX;
	document.body.onmousemove=function(){
		if(event.button==0){
			resizeHE();
			return;
		}
		var mXF=event.clientX-mXC;
		mXC=event.clientX;
		if(g=parseInt(document.body.style.width)+mXF<132){
			resizeVE();
			return;
		}
		document.body.style.width=parseInt(document.body.style.width)+mXF+"px";
		feedList.style.width=parseInt(feedList.style.width)+mXF+"px";
		mainContainer.style.width=parseInt(mainContainer.style.width)+mXF+"px";
		mCC.style.width=parseInt(mCC.style.width)+mXF+"px";
		hResizer.style.width=parseInt(hResizer.style.width)+mXF+"px";
		message.style.width=parseInt(message.style.width)+mXF+"px";
		mainT.style.width=parseInt(mainT.style.width)+mXF+"px";
		mainTR.style.left=parseInt(mainTR.style.left)+mXF+"px";
		mainR.style.left=parseInt(mainR.style.left)+mXF+"px";
		mainBR.style.left=parseInt(mainBR.style.left)+mXF+"px";
		mainB.style.width=parseInt(mainB.style.width)+mXF+"px";
		feedTitle.style.width=parseInt(feedTitle.style.width)+mXF+"px";
		titleDiv.style.width=parseInt(titleDiv.style.width)+mXF+"px";
		titleDiv.style.marginLeft=-parseInt(titleDiv.style.width)/2+"px";
		navigation.style.width=parseInt(navigation.style.width)+mXF+"px";
		position.style.width=parseInt(position.style.width)+mXF+"px";
		/*mainBL.style.top=parseInt(mainBL.style.top)-mXF+"px";
		mainB.style.top=parseInt(mainB.style.top)-mXF+"px";
		mainBR.style.top=parseInt(mainBR.style.top)-mXF+"px";*/
	};
	document.body.onmouseup="resizeHE();";
}

function resizeHE()
{
	var gWidth=parseInt(mainContainer.style.width);
	System.Gadget.Settings.write("gWidth",gWidth);
	document.body.style.cursor="";
	document.body.onmousemove="";
	document.body.onmouseup="";
}

function getPos(o_){
	var curleft=0;
	var curtop=0;
	og=o_;
	do{
		curleft+=og.offsetLeft;
	}
	while(og=og.offsetParent);
	
	do{
		curtop+=o_.offsetTop;
	}
	while(o_=o_.offsetParent);
	return [curleft,curtop];
}

function checkVersion()
{
	var XMLVersionCheck = new XMLHttpRequest();
	XMLVersionCheck.onreadystatechange = function(){
		if(XMLVersionCheck.readyState==4){
			clearTimeout(XMLVersionCheckTimeout);
			if(XMLVersionCheck.status==200)
				if((a=XMLVersionCheck.responseText.split(":"))[0]!=System.Gadget.version){
					if((a[0].replace(/\./g,"").split(":")[0]-1)==System.Gadget.version.replace(/\./g,"") && typeof(performBgUpdate)=="function")
						newVer=a[1];
					else
						newVer=2;
					if(newVer==1 && window.ActiveXObject){
						mCC.innerHTML="";
						showMessage("New version found, automatic update will start in 5 sec.<br/>Changes will only be effective after a restart!<br>Gadget may hang during update<br/><br/>");
						setTimeout("performBgUpdate();showMessage('Automatic update has been completed.<br>Changes will only be effective after a restart!<br><br><br>');", 5000);
					}
				}
		}
	};
	var XMLVersionCheckTimeout=setTimeout(function(){
		XMLVersionCheck.abort();
	},16500);
	XMLVersionCheck.open("GET","http://feedflow.googlecode.com/files/feedflowver?"+Math.random(),true);
	XMLVersionCheck.send(null);
}

function markAsRead(i)
{
	if(!window.ActiveXObject)
		return 0;
	if(i==System.Gadget.Settings.read("hideFeeds")){
		if(isMarkedAsRead(news.items[flyoutIndex].title)==-1){
			var fO=new ActiveXObject("Scripting.FileSystemObject");
			if(markedAsReadCache.length > System.Gadget.Settings.read("hideFeedsMax")*11){
				markedAsReadCache="";
				var fmode=2;
			}
			else
				var fmode=8;
			var f=fO.OpenTextFile(System.Gadget.path+"\\readFeeds",fmode,true);
			f.Write(crc32(news.items[flyoutIndex].title)+",");
			f.Close();
			markedAsReadCache=markedAsReadCache+crc32(news.items[flyoutIndex].title)+",";
		}
	}
}

function isMarkedAsRead(str)
{
	return markedAsReadCache.indexOf(crc32(str));
}

function fillFeedList()
{
	feedList.options.length=0;
	for (i=0;t=System.Gadget.Settings.read("feedName"+i);i++)
	{
		feedList.options[i] = new Option(t,i);
	}
	feedList.options[currentFeed].selected=true;
}

function feedListMUP(e)
{
	if(e.button==2)
		getNews();
}

/* Create a new RSS item object */
function RSS2Item(itemxml)
{
	this.title;
	this.link;
	this.description;
	this.pubDate;

	var properties = new Array("title", "link", "description", "pubDate", "enclosure", "media:thumbnail");
	var feedMaxAgeToViewArray = new Array(86400000, 3600000, 60000, 1000);
	var tmpElement = null;
	for (var i=0; i<properties.length; i++)
	{
		tmpElement = itemxml.getElementsByTagName(properties[i])[0];
		if(tmpElement==null)
			continue;
		var filterTData=new RegExp(FT=System.Gadget.Settings.readString("feedFTitle"+currentFeed));
		var filterCData=new RegExp(FC=System.Gadget.Settings.readString("feedFContent"+currentFeed));
		if(i==0 && FT!="" && tmpElement.childNodes[0].nodeValue.match(filterTData)!=null)
			this.filter=false;
		if(i==2 && FC!="" && tmpElement.childNodes[0].nodeValue.match(filterCData)!=null)
			this.filter=false;
		if(i==0 && isMarkedAsRead(tmpElement.childNodes[0].nodeValue)!=-1)
			this.filter=false;
		if(i==3){
			if(System.Gadget.Settings.read("feedMaxAgeToView"+currentFeed))
				if(new Date()-Date.parse(tmpElement.childNodes[0].nodeValue) > System.Gadget.Settings.read("feedMaxAgeToView"+currentFeed)*feedMaxAgeToViewArray[System.Gadget.Settings.read("feedMaxAgeToViewC"+currentFeed)])
					this.filter=false;
			var d=new Date(tmpElement.childNodes[0].nodeValue);
			tmpElement.childNodes[0].nodeValue=d.toLocaleDateString()+", "+d.toLocaleTimeString();
		}
		if ( tmpElement.childNodes != null )
			if ( tmpElement.childNodes[0] != null )
				if ( tmpElement.childNodes[0].nodeValue != null )
					eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue;");
		if (i>=4)
			this.enclosure=tmpElement.attributes.getNamedItem("url").nodeValue;
	}
}

/* Create a new RSS channel object */
function RSS2Channel(rssxml)
{
	this.items = new Array();
	var itemElements = rssxml.getElementsByTagName("item");
	for (var i=0; i<itemElements.length; i++)
	{
		Item = new RSS2Item(itemElements[i]);
		if(Item.filter!=false)
			this.items.push(Item);
	}
}

/* Creates a new Atom feed entry object */
function AtomItem(itemxml)
{
	this.title;
	this.link;
	this.description;
	this.pubDate;

	try { this.title = itemxml.getElementsByTagName("title")[0].childNodes[0].nodeValue; }
	catch (e) { this.title = "(no title)"; }

	var filterTData=new RegExp(FT=System.Gadget.Settings.read("feedFTitle"+currentFeed));
	var filterCData=new RegExp(FC=System.Gadget.Settings.read("feedFContent"+currentFeed));
	var feedMaxAgeToViewArray = new Array(86400000, 3600000, 60000, 1000);

	try { this.pubDate = itemxml.getElementsByTagName("created")[0].childNodes[0].nodeValue; }
	catch (e) {
	try { this.pubDate = itemxml.getElementsByTagName("published")[0].childNodes[0].nodeValue; }
	catch (e) {
	try { this.pubDate = itemxml.getElementsByTagName("updated")[0].childNodes[0].nodeValue; }
	catch (e) {
	try { this.pubDate = itemxml.getElementsByTagName("modified")[0].childNodes[0].nodeValue; }
	catch (e) {this.pubDate=null;}
	}}}

	if(this.pubDate!=null){
		var d=new Date();
		d.setTime(Date.parse(this.pubDate)||convISODate(this.pubDate));
		if(System.Gadget.Settings.read("feedMaxAgeToView"+currentFeed))
			if(new Date()-d > System.Gadget.Settings.read("feedMaxAgeToView"+currentFeed)*feedMaxAgeToViewArray[System.Gadget.Settings.read("feedMaxAgeToViewC"+currentFeed)])
				this.filter=false;
		this.pubDate=d.toLocaleDateString()+", "+d.toLocaleTimeString();
	}

	try {this.description = itemxml.getElementsByTagName("summary")[0].childNodes[0].nodeValue;}
	catch (e) {
	try {this.description = itemxml.getElementsByTagName("content")[0].childNodes[0].nodeValue;}
	catch (e) { this.description = "(no summary)"; }
	}

	if(FT!="" && this.title.match(filterTData)!=null)
		this.filter=false;
	if(FC!="" && this.description.match(filterCData)!=null)
		this.filter=false;
	if(isMarkedAsRead(this.title)!=-1)
		this.filter=false;

	try 
	{
		var links = itemxml.getElementsByTagName("link");
		for ( var i = 0; i < links.length; i++ ) 
		{
			try { if ( links[i].attributes.getNamedItem("rel").value == "alternate" ) this.link = links[i].attributes.getNamedItem("href").value }
			catch (e) {}
		}
	} catch(e) {}
}

/* Create a new Atom feed channel object */
function AtomChannel(atomxml)
{
	this.items = new Array();
	var itemElements;
	try { itemElements = atomxml.getElementsByTagName("feed")[0].getElementsByTagName("entry"); } catch (e) { return false; }

	for ( var i=0; i<itemElements.length; i++ )
	{
		Item = new AtomItem(itemElements[i]);
		if(Item.filter!=false)
			this.items.push(Item);
	}	
}

/* Download (request) the feed from the URL */
function getNews(i,p)
{
	clearTimeout(getNewsTimeout);
	isAutoScroll = System.Gadget.Settings.read("autoScroll");
	var URL = System.Gadget.Settings.read("feedURL"+currentFeed);
	if (URL=="")
	{
		titleLink.innerHTML="FeedFlow";
		showMessage( "No Feed" );
		return true;
	}
	var name = System.Gadget.Settings.read("feedName"+currentFeed);
	if (name != "") titleLink.innerHTML = name;
	else titleLink.innerHTML="FeedFlow";
	//position.innerHTML="";
	//mCC.innerHTML="";

	loadingIcon.style.display="block";
	if(p!=1)
		currentPosition = 0;

	window["xmlDocument"] = new ActiveXObject('Microsoft.XMLDOM');
	xmlDocument.onreadystatechange = function () {
		if (xmlDocument.readyState == 4) {
				/*if(xmlDocument.getResponseHeader("Content-Type")!="text/xml")
					xmlDocument.responseXML.loadXML(xmlDocument.responseText);
				xmlDocument=xmlDocument.responseXML;*/
				if ( xmlDocument.getElementsByTagName("item")[0] != null ) news = new RSS2Channel(xmlDocument);
				else news = new AtomChannel(xmlDocument);
				currentPosition=0;
				showNews(news);
				loadingIcon.style.display="none";
				clearTimeout(getNewsTimeout);
				aSInterval=System.Gadget.Settings.read("autoScrollInterval");
				if(i==1&&isAutoScroll==1)
					autoscrolltimeout=setTimeout("autoScroll();",aSInterval);
		}
	};
	xmlDocument.load(URL+(URL.match(/\?/)?"&":"?")+Math.random()+"=1");

	getNewsTimeout=setTimeout(function(){xmlDocument.abort();loadingIcon.style.display="none";/*showMessage("Could not load<br>"+name);*/setTimeout(getNextFeed,3000);}, System.Gadget.Settings.read("feedLoadTimeout"));

	return;
}

/* Display the current 4 items in the news */
function showNews(news)
{
	if(!news)
		return;

	noItems=Math.round((System.Gadget.Settings.read("gHeight")||162)/39*(System.Gadget.Settings.readString("feedPPCoefficient"+currentFeed)||1)*(System.Gadget.Settings.readString("feedPPGCoefficient")||1));
	var buffer="";
	for ( var i = currentPosition; (i < currentPosition+noItems) && (i < news.items.length); i++ ) 
	{
		item_html = "<a style='white-space:"+(System.Gadget.Settings.read("feedWrapTitle"+currentFeed)?"normal":"nowrap")+";' ";
		item_html += (news.items[i].link == null)?"":"href='javascript:void(0)' onclick='flyoutIndex="+i+";markAsRead(1);showFlyout();' ondblclick='window.location.href=\""+news.items[i].link+"\";'>";
		item_html += (news.items[i].title == null )?"(no title)</a>":news.items[i].title+"</a>";
		item_html += (news.items[i].description == null) ?"":"<br><span style='white-space:"+(System.Gadget.Settings.read("feedWrapDescription"+currentFeed)?"normal":"nowrap")+";'>"+decodeHTML(news.items[i].description)+"</span>";
		buffer+="<div class='feedItem'>"+item_html+"</div>";
	}
	if((newVer==2||(newVer==1&&!window.ActiveXObject))&&System.Gadget.Settings.read("NOUpdate")!=1)
		buffer="<div style='border:2px red solid;width:100%;height:50px;'>A manual update of FeedFlow is required! Click <a href='http://code.google.com/p/feedflow/'>here</a> to download</div>"+buffer;

	mCC.innerHTML=buffer;

	var posText = (currentPosition + 1) + '-' + ((currentPosition + noItems)>news.items.length?news.items.length:(currentPosition + noItems)) + '/' + news.items.length;
	position.innerHTML = posText;

	System.Gadget.Settings.write("currentFeed", currentFeed);
	showMessage("");
	return true;
}

/* Display a message to the user */
function showMessage( msg )
{
	message.style.display = "block";
	messageText.innerHTML = msg;
	if ( msg == "" ) message.style.display = "none";
}

/* Loads the current theme or the default one */
function loadTheme()
{
	var themeName = System.Gadget.Settings.read('theme');
	if(themeName == "")themeName = "default";
	document.styleSheets(1).href = 'themes/' + themeName + '/style.css';
	document.body.style.fontFamily=System.Gadget.Settings.read("fontFamily");
	document.body.style.fontSize=System.Gadget.Settings.read("fontSize");
	initiateGadget();	
}

/* Show the flyout when mouse is over an item */
function showFlyout()
{
	if ( flyoutIndex >= news.items.length )
	{
		System.Gadget.Flyout.show = false;
		return true;
	}
	clearTimeout(autoscrolltimeout);
	System.Gadget.Flyout.file = "Flyout.html";
	System.Gadget.Flyout.show = true;
}

/* Clear the contents of the gadget */
function clear()
{
	mainContent="";
}

/* Displays the next feed when clicking the top right arrow */
function getNextFeed(i)
{
	var noFeeds = System.Gadget.Settings.read("noFeeds");
	if ( noFeeds == "" || noFeeds < 2 ){if (isAutoScroll==1) autoscrolltimeout = setTimeout( "autoScroll();", aSInterval );return true;}
	currentFeed = (currentFeed+1) % noFeeds;
	getNews(i);	
}

/* Displays the previous feed when clicking the top left arrow */
function getPreviousFeed()
{
	var noFeeds = System.Gadget.Settings.read("noFeeds");
	if ( noFeeds == "" || noFeeds < 2 ){if (isAutoScroll==1) autoscrolltimeout = setTimeout( "autoScroll();", aSInterval );return true;}
	currentFeed--;
	if ( currentFeed < 0 ) currentFeed = noFeeds-1;
	getNews();	
}

function decodeHTML(text)
{
	var ctom = /<.+?>/ig; //&lt;([^&]*)&gt;/g;
    return text.replace(ctom,decodeHTMLR);
}

function decodeHTMLR(str,p1)
{
	var a=System.Gadget.Settings.readString("feedFNotDecoded"+currentFeed).replace(/,/g,"|");
	m=new RegExp("</?("+a+")( .+?)?/?>");
	if(m.test(str))
		return str;
	else
		return " ";
}

/* Scroll one page up */
function previousPage()
{
	if(feedloading==1)return;
	currentPosition = (currentPosition - noItems >= 0) ? currentPosition - noItems : ((news.items.length - news.items.length%noItems)); 
	if ( currentPosition >= news.items.length ) currentPosition -= noItems;
	showNews(news);
}

/* Scroll one page down */
function nextPage(i)
{
	if(feedloading==1&&i==1)return;
	currentPosition = (currentPosition + noItems) >= news.items.length ? 0 : (currentPosition + noItems); 
	showNews(news);
}

/* Navigates through the feeds automatically */
function autoScroll()
{
	nextPage(1);
	if ( currentPosition == 0 && System.Gadget.Settings.read("disableLoop")==0) getNextFeed(1);
	else {clearTimeout(autoscrolltimeout);autoscrolltimeout = setTimeout( "autoScroll();", aSInterval );}
}

/* Current position in the feed */
var currentPosition = 0;

/* The index of the item that must be displayed in the flyout */
var flyoutIndex = 0;

/* The news items */
var news;

/* The index of the current feed in the list */
var currentFeed = ( (System.Gadget.Settings.read("currentFeed") == "" ) ? 0 : System.Gadget.Settings.read("currentFeed") );

/* Number of items to display on a page */
var noItems;

function crc32 ( str ) {
    // Calculate the crc32 polynomial of a string  
    // 
    // version: 1006.1915
    // discuss at: http://phpjs.org/functions/crc32    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: T0bsn
    // -    depends on: utf8_encode
    // *     example 1: crc32('Kevin van Zonneveld');
    // *     returns 1: 1249991249    str = this.utf8_encode(str);
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
 
    var crc = 0;
    var x = 0;    var y = 0;
 
    crc = crc ^ (-1);
    for (var i = 0, iTop = str.length; i < iTop; i++) {
        y = ( crc ^ str.charCodeAt( i ) ) & 0xFF;        x = "0x" + table.substr( y * 9, 8 );
        crc = ( crc >>> 8 ) ^ x;
    }
 
    return crc ^ (-1);
}

//setISO8601
function convISODate(dString){

var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;

if (dString.toString().match(new RegExp(regexp))) {
var d = dString.match(new RegExp(regexp));
var offset = 0;

var z=new Date();
z.setUTCDate(1);
z.setUTCFullYear(parseInt(d[1],10));
z.setUTCMonth(parseInt(d[3],10) - 1);
z.setUTCDate(parseInt(d[5],10));
z.setUTCHours(parseInt(d[7],10));
z.setUTCMinutes(parseInt(d[9],10));
z.setUTCSeconds(parseInt(d[11],10));
if (d[12])
z.setUTCMilliseconds(parseFloat(d[12]) * 1000);
else
z.setUTCMilliseconds(0);
if (d[13] != 'Z') {
offset = (d[15] * 60) + parseInt(d[17],10);
offset *= ((d[14] == '-') ? -1 : 1);
z.setTime(z.getTime() - offset * 60 * 1000);
}
}
else {
z.setTime(Date.parse(dString));
}
return z.getTime();
};