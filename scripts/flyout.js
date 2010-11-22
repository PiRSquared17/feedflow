/**********************************************

 *	Filename:	flyout.js
 *	Authors:	Tolga Hosgor, Cristian Patrasciuc
 *	Emails:		fasdfasdas@gmail.com, cristian.patrasciuc@gmail.com
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
 
/* Retrieves the content that must be displayed in the flyout */
function initFlyout()
{
	System.Gadget.Flyout.onHide=hideFlyout;
	var ctom = /&lt;([^&]*)&gt;/g;
	var news = System.Gadget.document.parentWindow.news;
	var i = System.Gadget.document.parentWindow.flyoutIndex;
	flyoutTitle.innerHTML = news.items[i].title;
	flyoutDescription.innerHTML = (news.items[i].enclosure!=undefined?"<img src='"+news.items[i].enclosure+"' alt='' align='left'/>"+news.items[i].description.replace(/(\<img.+?\>)/i,''):news.items[i].description);
	flyoutPubDate.innerHTML = "Published on: " + (news.items[i].pubDate==null ? "undefined" : news.items[i].pubDate);
	flyoutLink.href = news.items[i].link;
	self.focus();
}

function hideFlyout()
{
	if(System.Gadget.document.parentWindow.isAutoScroll==1)
		System.Gadget.document.parentWindow.autoscrolltimeout=System.Gadget.document.parentWindow.setTimeout("autoScroll();",System.Gadget.document.parentWindow.aSInterval);
	var xD=System.Gadget.document.parentWindow.xmlDocument;
	xD.responseXML.loadXML(System.Gadget.document.parentWindow.XMLMem);
	if ( xD.responseXML.getElementsByTagName("item") != null ) news = new System.Gadget.document.parentWindow.RSS2Channel(xD);
		else news = new System.Gadget.document.parentWindow.AtomChannel(xD);
	System.Gadget.document.parentWindow.showNews(news);
	System.Gadget.document.parentWindow.news=news;
}
