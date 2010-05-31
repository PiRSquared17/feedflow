/**********************************************

 *	Filename:	gadget.js
 *	Authors:	Tolga Hosgor, Cristian Patrasciuc
 *	Emails:		tmuzaffer@gmail.com, cristian.patrasciuc@gmail.com
 *	Date:		30-May-2010
 
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
 
/* Set the event handlers */
System.Gadget.settingsUI = "Settings.html";
System.Gadget.onSettingsClosed = settingsClosed;
System.Gadget.onDock = resizeGadget;
System.Gadget.onUndock = resizeGadget;

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
function resizeGadget() 
{
	var themeName = System.Gadget.Settings.read('theme');
	noItems = System.Gadget.Settings.read('noItems');
	
	if ( noItems == "" ) noItems = 4;
	if ( themeName == "" ) themeName = "default";
	
	switch( noItems ) {
		case 4: 
			document.body.style.height = '209px'; 
			message.style.height = '142px';
			break;
		case 6: 
			document.body.style.height = '278px'; 
			message.style.height = '200px';
			break;
		case 8: 
			document.body.style.height = '348px'; 
			message.style.height = '280px';
			break;
	}
	
	for ( var i = 0; i < noItems; i++ ) document.getElementById(i+'').style.display = 'block';
	for ( var i = noItems; i < 8; i++ ) document.getElementById(i+'').style.display = 'none';
	
	if ( System.Gadget.docked == true )
	{
		try { document.body.style.background = "url('../themes/" + themeName + "/background" + noItems + ".png') no-repeat"; } catch(e) {}
		for ( var i = 0; i < noItems; i++ )
			document.getElementById(i+'').className = "feedItemDocked";	
		message.style.width = '120px';
		navigation.style.marginLeft = '8px';
		titleMarquee.style.width = '72px';
		document.body.style.width = '132px';
	}
	else
	{
		try { document.body.style.background = "url('../themes/" + themeName + "/background-large" + noItems + ".png') no-repeat"; } catch(e) {}
		for ( var i = 0; i < noItems; i++ )
			document.getElementById(i+'').className = "feedItemUndocked";
		message.style.width = '355px'; 
		navigation.style.marginLeft = '127px';
		titleMarquee.style.width = '308px';
		document.body.style.width = '368px';
	}
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
	if(isAutoScroll==1&&System.Gadget.Flyout.show==false&&System.Gadget.Settings.read("notStopAutoScroll")==0)
		autoscrolltimeout=setTimeout("autoScroll();", aSInterval);
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
	
	showMessage( "Fetching ..." );
	currentPosition = 0;
	
	xmlDocument = new XMLHttpRequest();
	xmlDocument.onreadystatechange = function () {
		if (xmlDocument.readyState == 4) {
			if(xmlDocument.status == 200){
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
	getNewsTimeout=setTimeout(function(){xmlDocument.abort();showMessage("Could not load<br>"+name);setTimeout(getNextFeed,3000);}, 6500);
	
	return;
}

/* Display the current 4 items in the news */
function showNews(news)
{
	for ( var i = currentPosition; (i < currentPosition+noItems) && (i < news.items.length); i++ ) 
	{
		item_html = '<a ';
		item_html += (news.items[i].link == null) ? "" : 'href="javascript:void(0)" onclick="flyoutIndex = ' + i + '; showFlyout()">';
		item_html += (news.items[i].title == null ) ? "(no title)</a>" : news.items[i].title + "</a>";
		item_html += (news.items[i].description == null) ? "" : "<br>" + decodeHTML(news.items[i].description);
		document.getElementById( (i-currentPosition) + '' ).innerHTML = item_html;
	}
	
	var posText = (currentPosition + 1) + '-' + ((currentPosition + noItems)>news.items.length?news.items.length:(currentPosition + noItems)) + '/' + news.items.length;
	position.innerHTML = posText;

	System.Gadget.Settings.write("currentFeed", currentFeed);
	showMessage("");
	return true;
}

/* Display a message to the user */
function showMessage( msg )
{
	message.style.visibility = "visible";
	messageText.innerHTML = msg;
	if ( msg == "" ) message.style.visibility = "hidden";
}

/* Loads the current theme or the default one */
function loadTheme()
{
	var themeName = System.Gadget.Settings.read('theme');
	if ( themeName == "" ) themeName = "default";
	document.styleSheets(1).href = 'themes/' + themeName + '/style.css';
	resizeGadget();	
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
	for ( var i = 0; i < 8; i++ )
		document.getElementById(i+'').innerHTML = '';
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
var noItems = ( (System.Gadget.Settings.read("noItems") == "" ) ? 4 : System.Gadget.Settings.read("noItems") );



