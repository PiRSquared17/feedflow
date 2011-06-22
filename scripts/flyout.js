/**********************************************

 *	Filename:	flyout.js
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
 
var currentFeed = System.Gadget.document.parentWindow.currentFeed;
	
/* Retrieves the content that must be displayed in the flyout */
function initFlyout()
{
	System.Gadget.Flyout.onHide=hideFlyout;
	var ctom = /&lt;([^&]*)&gt;/g;
	var news = System.Gadget.document.parentWindow.news;
	var i = System.Gadget.document.parentWindow.flyoutIndex;
	var d;
	flyoutTitle.innerHTML = news[currentFeed].items[i].title;
	flyoutDescription.innerHTML = (news[currentFeed].items[i].enclosure!=undefined?"<img src='"+news[currentFeed].items[i].enclosure+"' alt='' align='left'/>"+news[currentFeed].items[i].description.replace(/\<img .+?\>/ig,''):news[currentFeed].items[i].description);
	flyoutPubDate.innerHTML = "Published on: " + ((d=news[currentFeed].items[i].dateObj)==null?"undefined":d.toLocaleDateString()+", "+d.toLocaleTimeString());
	flyoutLink.href = news[currentFeed].items[i].link;
	self.focus();
}

function hideFlyout()
{
	if(System.Gadget.document.parentWindow.isAutoScroll==1)
		System.Gadget.document.parentWindow.autoscrolltimeout=System.Gadget.document.parentWindow.setTimeout("autoScroll();",System.Gadget.document.parentWindow.aSInterval);
}

function readMoreClick()
{
	System.Gadget.document.parentWindow.markAsRead(2);
	if(System.Gadget.Settings.read('hideFeeds')==2)
	{
		System.Gadget.document.parentWindow.news[currentFeed].items.splice(System.Gadget.document.parentWindow.flyoutIndex,1);System.Gadget.document.parentWindow.showNews();
	}
}
