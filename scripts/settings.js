/**********************************************

 *	Filename:	settings.js
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

System.Gadget.onSettingsClosing = settingsClosing;

function settingsClosing(event)
{
    if (event.closeAction == event.Action.commit)
    {
        System.Gadget.Settings.write( "refresh", feedRefresh.options[feedRefresh.selectedIndex].value );
        System.Gadget.Settings.write( "theme", feedTheme.options[feedTheme.selectedIndex].value );
		System.Gadget.Settings.write( "noItems", noItems.options[noItems.selectedIndex].value );
		System.Gadget.Settings.write( "autoScroll", ((autoScrollCheckBox.checked == true) ? 1 : 0 ) );
		System.Gadget.Settings.write( "autoScrollInterval", (autoScrollInterval.value<2000?2000:autoScrollInterval.value) );
		System.Gadget.Settings.write("disableLoop",((disableLoopCheckBox.checked==true)?1:0));
		System.Gadget.Settings.write("notStopAutoScroll",((notStopAutoScroll.checked==true)?1:0));
        event.cancel = false;
    }
}

function loadSettings() 
{
	var refresh = System.Gadget.Settings.read("refresh");
	var theme = System.Gadget.Settings.read("theme");
	var interval = System.Gadget.Settings.read("autoScrollInterval");
	var feedcount=System.Gadget.Settings.read("noFeeds");
	if(feedcount=="")feedcount=0;

	switch ( refresh ) {
		case 60000:
			feedRefresh[0].selected = "1";
			break;
		case 900000:
			feedRefresh[1].selected = "1";
			break;
		case 1800000:
			feedRefresh[2].selected = "1";
			break;
		case 3600000:
			feedRefresh[3].selected = "1";
			break;
		default:
			feedRefresh[4].selected = "1";
	}
	
	autoScrollInterval.value=(interval?interval:15000);
		
	disableLoopCheckBox.checked=(System.Gadget.Settings.read("disableLoop")==1);
	
	for ( var i=0; i<4; i++ ) if ( feedTheme[i].value == theme ) feedTheme[i].selected = "1";
	updatePreview();

	buildFeedList();
	deleteFeed.disabled=!feedcount;
	moveFeedUpButton.disabled=true;
	moveFeedDownButton.disabled=feedcount<2;
	autoScrollCheckBox.checked = System.Gadget.Settings.read( "autoScroll" );
	notStopAutoScroll.checked = System.Gadget.Settings.read("notStopAutoScroll");
	filteringButton.disabled = !feedcount;
	var items = System.Gadget.Settings.read("noItems");
	if ( items == "" ) items = 4;
	noItems.options[items/2-2].selected = "1";
}

function updatePreview()
{
	previewImage.src = "/themes/" + feedTheme.options[feedTheme.selectedIndex].value + "/preview.png";
}

function buildFeedList()
{
	var n;
	var aux = System.Gadget.Settings.read("noFeeds");
	if ( aux == "" ) n = 0; else n = aux;
	
	for ( var i = 0; i < feeds.options.length; i++ ) feeds.options[i] = null;
	
	for ( var i = 0; i < n; i++ )
	{
		var text = System.Gadget.Settings.read("feedName"+i);
		feeds.options[i] = new Option((i+1)+". "+text,i+'');
	}
	feedName.value=System.Gadget.Settings.read("feedName0");
	feedURL.value=System.Gadget.Settings.read("feedURL0");
}

function addNewFeed( name, url )
{
	if ( url == "" )
	{
		if ( feedURL.value.replace(/^\s+|\s+$/, '') == "" ) 
		{
			errorMessage.innerHTML = "URL is empty.";
			return true;
		}
		if ( feedName.value.replace(/^\s+|\s+$/, '') == "" )
		{
			errorMessage.innerHTML = "Name is empty.";
			return true;
		}
		url = feedURL.value;
		name = feedName.value;
	}
	
	var n;
	var aux = System.Gadget.Settings.read("noFeeds");
	if ( aux == "" ) n = 0; else n = aux;

	System.Gadget.Settings.write( "feedName"+n, name );	
	System.Gadget.Settings.write( "feedURL"+n, url );	

	n++;
	System.Gadget.Settings.write("noFeeds",n);
	
	errorMessage.innerHTML = "";
	
	buildFeedList();
	feeds.options[feeds.options.length-1].selected = "1";
	feedName.value=name;
	feedURL.value=url;
	deleteFeed.disabled=false;
	editFeed.disabled=true;
	filteringButton.disabled=false;
	if(n>1)
		moveFeedUpButton.disabled=false;
	moveFeedDownButton.disabled=true;
}

function moveFeed(m)
{
	var i=feeds.selectedIndex;
	if(m==0){
		if(i==1)
			moveFeedUpButton.disabled=true;
		moveFeedDownButton.disabled=false;
		n=i-1;
	} else {
		if(i+2==feeds.options.length)
			moveFeedDownButton.disabled=true;
		moveFeedUpButton.disabled=false;
		n=i+1;
	}
	var name=System.Gadget.Settings.read("feedName"+i);
	var url=System.Gadget.Settings.read("feedURL"+i);
	System.Gadget.Settings.write("feedName"+i, System.Gadget.Settings.read("feedName"+n));
	System.Gadget.Settings.write("feedURL"+i, System.Gadget.Settings.read("feedURL"+n));
	System.Gadget.Settings.write("feedName"+n, name);
	System.Gadget.Settings.write("feedURL"+n, url);
	buildFeedList();
	feedName.value=name;
	feedURL.value=url;
	feeds.options[n].selected=true;
}

function feedsChange()
{
	var n=feeds.selectedIndex;
	feedName.value=System.Gadget.Settings.read("feedName"+n);
	feedURL.value=System.Gadget.Settings.read("feedURL"+n);
	editFeed.disabled=true;
	moveFeedDownButton.disabled=false;
	moveFeedUpButton.disabled=false;
	if(n==0)
		moveFeedUpButton.disabled=true;
	else if(n+1==feeds.options.length)
		moveFeedDownButton.disabled=true;
}

function deleteExistingFeed()
{
	var n;
	var aux = System.Gadget.Settings.read("noFeeds");
	if ( aux == "" ) n = 0; else n = aux;

	for ( var i = feeds.selectedIndex; i < n; i++ )	
	{
		var URL = System.Gadget.Settings.read("feedURL"+(i+1));
		var name = System.Gadget.Settings.read("feedName"+(i+1));
		System.Gadget.Settings.write("feedURL"+i, URL);
		System.Gadget.Settings.write("feedName"+i, name);
	}

	if ( n > 0 ) n--; else n = 0;
	if(n==0){
		deleteFeed.disabled=true;
		filteringButton.disabled=true;
	}
	System.Gadget.Settings.write("noFeeds",n);
	editFeed.disabled=true;
	buildFeedList();
	feedName.value=System.Gadget.Settings.read("feedName0");
	feedURL.value=System.Gadget.Settings.read("feedURL0");
	feeds.options[0].selected=true;
	if(n<2)
		moveFeedDownButton.disabled=true;
	moveFeedUpButton.disabled=true;
}

function editExistingFeed()
{
	var selected=feeds.selectedIndex;
	System.Gadget.Settings.write("feedName"+selected, h=feedName.value);
	System.Gadget.Settings.write("feedURL"+selected, j=feedURL.value);
	buildFeedList();
	feeds.options[selected].selected = "1";
	feedName.value=h;
	feedURL.value=j;
	editFeed.disabled=true;
}

function editCheck(){
	if(System.Gadget.Settings.read("noFeeds")==""){
		editFeed.disabled=true;
		return;
	}
	if(System.Gadget.Settings.read("feedName"+feeds.selectedIndex)==feedName.value && System.Gadget.Settings.read("feedURL"+feeds.selectedIndex)==feedURL.value)
			editFeed.disabled=true;
		else
			editFeed.disabled=false;
}

function filterCurrentFeed()
{
	var i=feeds.selectedIndex;
	filteringTableN.innerText=feeds.selectedIndex+1+". "+System.Gadget.Settings.read("feedName"+i);
	filteringTitle.value=System.Gadget.Settings.read("feedFTitle"+i);
	filteringContent.value=System.Gadget.Settings.read("feedFContent"+i);
	showTable(filteringTable);
	
}

function filteringApplyChanges()
{
	var i=feeds.selectedIndex;
	System.Gadget.Settings.write("feedFTitle"+i,filteringTitle.value);
	System.Gadget.Settings.write("feedFContent"+i,filteringContent.value);
	showTable(feedsTable);
}

function importFeedsFromIE7() 
{
	var feedManager = null;
	try
	{
		feedManager = new ActiveXObject( "Microsoft.FeedsManager" );
		if ( feedManager == null ) return false;
		searchAndAddFeed( feedManager.RootFolder );
	} catch(e) {}
	buildFeedList();
	moveFeedUpButton.disabled=true;
	if(System.Gadget.Settings.read("noFeeds")>1)
		moveFeedDownButton.disabled=false;
}

function searchAndAddFeed( folder ) 
{
	var feeds = folder.Feeds;
	for ( var i = 0; i < feeds.Count; i++ )	addNewFeed( feeds.Item(i).Name, feeds.Item(i).Url );
	
	var subFolders = folder.Subfolders;
	for ( var i = 0; i < subFolders.Count; i++ ) searchAndAddFeed( subFolders.Item(i) );
}

function exportFeeds()
{
	var feedManager = null;
	try
	{
		feedManager = new ActiveXObject( "Microsoft.FeedsManager" );
		if ( feedManager == null ) return false;
	} catch(e) {}
	
	var folder = feedManager.RootFolder.CreateSubfolder( "FeedFlow Gadget Feeds" );
	var n;
	var aux = System.Gadget.Settings.read("noFeeds");
	if ( aux == "" ) n = 0; else n = aux;
	
	for ( var i = 0; i < n; i++ )
	{
		var name = System.Gadget.Settings.read("feedName"+i);
		var url = System.Gadget.Settings.read("feedURL"+i);
		folder.CreateFeed( name, url );
	}
}

function showTable( table )
{
	feedsTable.style.display = 'none';
	aboutTable.style.display = 'none';
	optionsTable.style.display = 'none';
	filteringTable.style.display="none";
	table.style.display = 'block';
}

function onlyNumbers(evt)
{
    var e = event || evt;
    var charCode = e.which || e.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;

    return true;

}
