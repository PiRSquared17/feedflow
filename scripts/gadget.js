/**********************************************

 *	Filename:	gadget.js
 *	Authors:	Tolga Hosgor, Cristian Patrasciuc
 *	Emails:		fasdfasdas@gmail.com, cristian.patrasciuc@gmail.com
 *	Date:		05-Jul-2010
 
 Copyright © 2010 Tolga Hosgor, Cristian Patrasciuc
 
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
		var refreshTime = System.Gadget.Settings.read('refresh');
			if ( refreshTime > 0 )refreshInterval=setInterval( "getNews();", refreshTime );
		loadTheme();
		currentFeed = 0;
		getNews(1);
	}
}

/* Rezise gadget when docked/undocked */
function initiateGadget()
{	
	checkVersion();
	
	noItems = System.Gadget.Settings.read("noItems");
	if ( noItems == "" ) noItems = 4;
	
	var gHeight=System.Gadget.Settings.read("gHeight");
	if(gHeight=="")gHeight=152;
	
	document.body.style.height=gHeight+60+"px";
	mainContainer.style.height=gHeight+"px";
	message.style.height=gHeight-10+"px";
	vResizer.style.height=gHeight-27+"px";
}

/* Create a new RSS item object */
function RSS2Item(itemxml)
{
	this.title;
	this.link;
	this.description;
	this.pubDate;

	var properties = new Array("title", "link", "description", "pubDate");
	var tmpElement = null;
	for (var i=0; i<properties.length; i++)
	{
		tmpElement = itemxml.getElementsByTagName(properties[i])[0];
		var filterTData=new RegExp(FT=System.Gadget.Settings.read("feedFTitle"+currentFeed));
		var filterCData=new RegExp(FC=System.Gadget.Settings.read("feedFContent"+currentFeed));
		if(i==0 && FT!="" && tmpElement.childNodes[0].nodeValue.match(filterTData)!=null)
			this.filter=false;
		if(i==2 && FC!="" && tmpElement.childNodes[0].nodeValue.match(filterCData)!=null)
			this.filter=false;
		if ( tmpElement != null )
			if ( tmpElement.childNodes != null )
				if ( tmpElement.childNodes[0] != null )
					if ( tmpElement.childNodes[0].nodeValue != null ){
						eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue");
					}
	}
}

/* Create a new RSS channel object */
function RSS2Channel(rssxml)
{
	this.items = new Array();
	var itemElements = rssxml.responseXML.getElementsByTagName("item");
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
	
	var filterTData=new RegExp(FT=System.Gadget.Settings.read("feedFTitle"+currentFeed));
	var filterCData=new RegExp(FC=System.Gadget.Settings.read("feedFContent"+currentFeed));
	if(i==0 && FT!="" && itemxml.getElementsByTagName("title")[0].childNodes[0].nodeValue.match(filterTData)!=null)
		this.filter=false;
	if(i==2 && FC!="" && itemxml.getElementsByTagName("content")[0].childNodes[0].nodeValue.match(filterCData)!=null)
		this.filter=false;

	try { this.title = itemxml.getElementsByTagName("title")[0].childNodes[0].nodeValue; }
	catch (e) { this.title = "(no title)"; }
	
	try { this.pubDate = itemxml.getElementsByTagName("published")[0].childNodes[0].nodeValue; }
	catch (e) { this.pubDate = null; }
	
	try { this.description = itemxml.getElementsByTagName("summary")[0].childNodes[0].nodeValue; }
	catch (e) { this.description = null; }
	
	if ( this.description == null ) 
	{
		try { this.description = itemxml.getElementsByTagName("content")[0].childNodes[0].nodeValue; }
		catch (e) { this.description = "(no summary)"; }
	}
	
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
	try { itemElements = atomxml.responseXML.getElementsByTagName("feed")[0].getElementsByTagName("entry"); } catch (e) { return false; }

	for ( var i=0; i<itemElements.length; i++ )
	{
		Item = new AtomItem(itemElements[i]);
		if(Item.filter!=false)
			this.items.push(Item);
	}	
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
		var mYF=mYC-event.clientY;
		mYC=event.clientY;
		if(g=parseInt(document.body.style.height)-mYF<212){
			document.style.body.height="210px";
			resizeVE();
			return;
		}
		document.body.style.height=parseInt(document.body.style.height)-mYF+"px";
		vResizer.style.height=parseInt(vResizer.style.height)-mYF+"px";
		mainContainer.style.height=parseInt(mainContainer.style.height)-mYF+"px";
		message.style.height=parseInt(message.style.height)-mYF+"px";
	};
	document.body.onmouseup="resizeVE();";
}

function resizeVE()
{
	var gHeight=parseInt(mainContainer.style.height);
	noItems=parseInt(gHeight/38);
	System.Gadget.Settings.write("noItems",noItems);
	System.Gadget.Settings.write("gHeight",gHeight);
	document.body.style.cursor="";
	document.body.onmousemove="";
	document.body.onmouseup="";
	showNews(news);
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
				if(XMLVersionCheck.responseText!=System.Gadget.version)
					newVer=1;
		}
	};
	var XMLVersionCheckTimeout=setTimeout(function(){
		XMLVersionCheck.abort();
	},8500);
	XMLVersionCheck.open("GET","http://feedflow.googlecode.com/files/feedflowver?"+Math.random(),true);
	XMLVersionCheck.send(null);
}

/* Download (request) the feed from the URL */
function getNews(i)
{
	isAutoScroll = System.Gadget.Settings.read( "autoScroll" );
	clear();
	var URL = System.Gadget.Settings.read("feedURL"+currentFeed);
	if ( URL == "" ) 
	{
		titleLink.innerHTML = "FeedFlow";
		showMessage( "No Feed" );
		return true;
	}
	var name = System.Gadget.Settings.read( "feedName"+currentFeed );
	if ( name != "" ) titleLink.innerHTML = name;
	else titleLink.innerHTML = 'FeedFlow';
	position.innerHTML="";
	mainContainer.innerHTML="";
	
	showMessage( "Fetching ..." );
	currentPosition = 0;

	xmlDocument = new XMLHttpRequest();
	xmlDocument.onreadystatechange = function () {
		if (xmlDocument.readyState == 4) {
			if(xmlDocument.status == 200){
				xmlDocument.responseXML.loadXML(xmlDocument.responseText);
				if ( xmlDocument.responseXML.getElementsByTagName("item") != null ) news = new RSS2Channel(xmlDocument);
				else news = new AtomChannel(xmlDocument);
				showNews(news);
				feedloading=0;
				clearTimeout(getNewsTimeout);
				aSInterval=System.Gadget.Settings.read("autoScrollInterval");
				if(i==1&&isAutoScroll==1)
					autoscrolltimeout=setTimeout("autoScroll();",aSInterval);
			}
		}
	};
	feedloading=1;
	xmlDocument.open("GET",URL,true);
	xmlDocument.send(null);
	
	clearTimeout(getNewsTimeout);
	getNewsTimeout=setTimeout(function(){xmlDocument.abort();showMessage("Could not load<br>"+name);setTimeout(getNextFeed,3000);}, System.Gadget.Settings.read("feedLoadTimeout"));
	
	return;
}

/* Display the current 4 items in the news */
function showNews(news)
{
	var buffer="";
	for ( var i = currentPosition; (i < currentPosition+noItems) && (i < news.items.length); i++ ) 
	{
		item_html = '<a ';
		item_html += (news.items[i].link == null) ? "" : 'href="javascript:void(0)" onclick="flyoutIndex = ' + i + '; showFlyout()">';
		item_html += (news.items[i].title == null ) ? "(no title)</a>" : news.items[i].title + "</a>";
		item_html += (news.items[i].description == null) ? "" : "<br>" + decodeHTML(news.items[i].description);
		buffer+="<div class='feedItem'>"+item_html+"</div>";
	}
	mainContainer.innerHTML=(newVer?"<div style='border:2px red solid;height:50px;position:relative;left:-5px;top:-4px;width:120px;overflow:hidden;'>A new version of<br/>FeedFlow found!<br/>Click <a href='http://code.google.com/p/feedflow/'>here</a> to download</div>":"")+buffer;

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
	if ( themeName == "" ) themeName = "default";
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

/* Converts &lt; and &gt; into < and > */
function decodeHTML(text)
{
	var ctom = /&lt;([^&]*)&gt;/g;
    return text.replace(ctom,"<$1>");
}

/* Scroll one page up */
function previousPage()
{
	if(feedloading==1)return;
	currentPosition = (currentPosition - noItems >= 0) ? currentPosition - noItems : ((news.items.length - news.items.length%noItems)); 
	if ( currentPosition >= news.items.length ) currentPosition -= noItems;
	clear();
	showNews(news);
}

/* Scroll one page down */
function nextPage(i)
{
	if(feedloading==1&&i==1)return;
	currentPosition = (currentPosition + noItems) >= news.items.length ? 0 : (currentPosition + noItems); 
	clear();
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



