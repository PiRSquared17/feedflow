/**********************************************

 *	Filename:	settings.js
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

System.Gadget.onSettingsClosing = settingsClosing;

function settingsClosing(event)
{
    if (event.closeAction == event.Action.commit)
    {
        System.Gadget.Settings.write("theme",feedTheme.options[feedTheme.selectedIndex].value );
		System.Gadget.Settings.write("autoScroll",autoScrollCheckBox.checked?1:0);
		System.Gadget.Settings.write("autoScrollInterval",(autoScrollInterval.value<2000?2000:autoScrollInterval.value));
		System.Gadget.Settings.write("disableLoop",disableLoopCheckBox.checked==true?1:0);
		System.Gadget.Settings.write("notStopAutoScroll",notStopAutoScroll.checked==true?1:0);
		System.Gadget.Settings.write("feedLoadTimeout",(feedLoadTimeout.value<2000?2000:feedLoadTimeout.value));
		System.Gadget.Settings.write("feedFetchRefresh",(feedFetchRefresh.disabled?feedFetchRefresh.value+"abc":feedFetchRefresh.value));
		System.Gadget.Settings.write("fontFamily",feedFontF.options[feedFontF.selectedIndex].text);
		System.Gadget.Settings.write("fontSize",feedFontS.value);
		System.Gadget.Settings.write("hideFeeds",hideFeeds.selectedIndex);
		System.Gadget.Settings.write("hideFeedsMax",hideFeedsMax.value);
		System.Gadget.Settings.write("NOUpdate",0);
		System.Gadget.Settings.writeString("feedPPGCoefficient",feedPPGCoefficient.value);
        event.cancel = false;
    }
}

function loadSettings() 
{
	var feedCount=System.Gadget.Settings.read("noFeeds");
	if(feedCount=="")feedCount=0;

	autoScrollInterval.value=((interval = System.Gadget.Settings.read("autoScrollInterval"))?interval:15000);
	disableLoopCheckBox.checked=(System.Gadget.Settings.read("disableLoop")==1);
	feedLoadTimeout.value=((feedloadtimeout = System.Gadget.Settings.read("feedLoadTimeout"))?feedloadtimeout:6500);
	
	for ( var i=0; i<4; i++ ) if ( feedTheme[i].value == System.Gadget.Settings.read("theme") ) feedTheme[i].selected = "1";
	updatePreview();

	buildFeedList();
	deleteFeed.disabled=!feedCount;
	moveFeedUpButton.disabled=true;
	moveFeedDownButton.disabled=feedCount<2;
	autoScrollCheckBox.checked = System.Gadget.Settings.read( "autoScroll" );
	notStopAutoScroll.checked = System.Gadget.Settings.read("notStopAutoScroll");
	hideFeeds[(a=System.Gadget.Settings.read("hideFeeds"))==""?0:a].selected=true;
	hideFeedsMax.value=((a=System.Gadget.Settings.read("hideFeedsMax"))?a:1000);	
	eEditButton.disabled = !feedCount;
	feedFetchRefresh.value=((ref=System.Gadget.Settings.read("feedFetchRefresh"))?parseInt(ref):"15");
	eEditTableDisableHTML.checked = System.Gadget.Settings.read("feedFNotDecoded");
	feedPPGCoefficient.value=System.Gadget.Settings.readString("feedPPGCoefficient")||"1.000";

	if(!window.ActiveXObject){
		saveSettingsToFile.disabled=true;
		loadSettingsFromFile.disabled=true;
		importFeedsFromIE.disabled=true;
		hideFeeds.disabled=true;
	}

	var font=System.Gadget.Settings.read("fontFamily");
	if(font=="")
		font="Arial";
	var bfr=System.Gadget.Settings.read("fontSize");
	if(bfr!="")
		feedFontS.value=bfr;
	
	var bfr2=new Array();
	for(var i=1;i<dlgH.fonts.count;i++)
		bfr2[i-1]=dlgH.fonts(i);
	bfr2.sort();
	for(var i=1;i<dlgH.fonts.count;i++){
		var bfr=document.createElement("option");
		if(bfr2[i-1]==font)
			bfr.selected=true;
		bfr.text=bfr2[i-1];
		feedFontF.add(bfr);
	}
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
	feedFetchRefresh.disabled=System.Gadget.Settings.read("autoScroll")&&n!=1;
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

	System.Gadget.Settings.write("feedName"+n,name);	
	System.Gadget.Settings.write("feedURL"+n,url);	

	n++;
	System.Gadget.Settings.write("noFeeds",n);

	errorMessage.innerHTML = "";

	buildFeedList();
	feeds.options[feeds.options.length-1].selected = "1";
	feedName.value=name;
	feedURL.value=url;
	deleteFeed.disabled=false;
	editFeed.disabled=true;
	eEditButton.disabled=false;
	if(n>1)
		moveFeedUpButton.disabled=false;
	moveFeedDownButton.disabled=true;
}

function flushReadCache()
{
	var f=new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(System.Gadget.path+"\\readFeeds",2,true);
	f.Write("a,");
	f.Close();
	System.Gadget.document.parentWindow.markedAsReadCache="";
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
		eEditButton.disabled=true;
	}
	System.Gadget.Settings.write("noFeeds",n);
	editFeed.disabled=true;
	buildFeedList();
	feedName.value=System.Gadget.Settings.read("feedName0");
	feedURL.value=System.Gadget.Settings.read("feedURL0");
	if(a=feeds.options[0])
		a.selected=true;
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

function eEditCurrentFeed()
{
	var i=feeds.selectedIndex;
	eEditTableN.innerText=feeds.selectedIndex+1+". "+System.Gadget.Settings.read("feedName"+i);
	eEditTableTitle.value=System.Gadget.Settings.read("feedFTitle"+i);
	eEditTableContent.value=System.Gadget.Settings.read("feedFContent"+i);
	eEditTableDisableHTML.value=System.Gadget.Settings.read("feedFNotDecoded"+i);
	maxAgeToView.value=System.Gadget.Settings.read("feedMaxAgeToView"+i)||0;
	maxAgeToViewC.options[System.Gadget.Settings.read("feedMaxAgeToViewC"+i)||0].selected=1;
	wrapTitle.checked=System.Gadget.Settings.read("feedWrapTitle"+i)||0;
	wrapDescription.checked=System.Gadget.Settings.read("feedWrapDescription"+i)||0;
	feedPPCoefficient.value=System.Gadget.Settings.readString("feedPPCoefficient"+i)||"1.000";
	showTable(eEditTable);
}

function eEditApplyChanges()
{
	var i=feeds.selectedIndex;
	System.Gadget.Settings.write("feedFTitle"+i,eEditTableTitle.value);
	System.Gadget.Settings.write("feedFContent"+i,eEditTableContent.value);
	System.Gadget.Settings.write("feedFNotDecoded"+i,eEditTableDisableHTML.value);
	System.Gadget.Settings.write("feedMaxAgeToView"+i,maxAgeToView.value);
	System.Gadget.Settings.write("feedMaxAgeToViewC"+i,maxAgeToViewC.selectedIndex);
	System.Gadget.Settings.write("feedWrapTitle"+i,wrapTitle.checked?1:0);
	System.Gadget.Settings.write("feedWrapDescription"+i,wrapDescription.checked?1:0);
	System.Gadget.Settings.writeString("feedPPCoefficient"+i,feedPPCoefficient.value);
	showTable(feedsTable);
}

function saveSettingsToFile()
{
	var aS=["theme","fontFamily","fontSize","autoScroll","autoScrollInterval","disableLoop","notStopAutoScroll","feedLoadTimeout","feedFetchRefresh","hideFeeds","hideFeedsMax","NOUpdate","feedPPGCoefficient"];
	var setP=System.Shell.saveFileDialog("C:\\", "FeedFlow config file\0*.fcg\0\0");
	if(setP=="")
		return;
	var f=new ActiveXObject("Scripting.FileSystemObject");
	var nf=f.OpenTextFile(setP+(setP.match(/\.fcg$/)?"":".fcg"),2,true,-1);

	nf.WriteLine("[G]");
	for(n in aS)
		nf.WriteLine(aS[n]+"="+System.Gadget.Settings.read(aS[n]));

	for(var i=0;i<System.Gadget.Settings.read("noFeeds");i++){
		nf.WriteLine("[F]");
		nf.WriteLine("feedName="+System.Gadget.Settings.readString("feedName"+i));
		nf.WriteLine("feedURL="+System.Gadget.Settings.readString("feedURL"+i));
		nf.WriteLine("feedFTitle="+System.Gadget.Settings.readString("feedFTitle"+i));
		nf.WriteLine("feedFContent="+System.Gadget.Settings.readString("feedFContent"+i));
		nf.WriteLine("feedFNotDecoded="+System.Gadget.Settings.readString("feedFNotDecoded"+i));
		nf.WriteLine("feedMaxAgeToView="+System.Gadget.Settings.read("feedMaxAgeToView"+i));
		nf.WriteLine("feedMaxAgeToViewC="+System.Gadget.Settings.read("feedMaxAgeToViewC"+i));
		nf.WriteLine("feedWrapTitle="+System.Gadget.Settings.read("feedWrapTitle"+i));
		nf.WriteLine("feedWrapDescription="+System.Gadget.Settings.read("feedWrapDescription"+i));
		nf.WriteLine("feedPPCoefficient="+System.Gadget.Settings.readString("feedPPCoefficient"+i));
	}
	nf.Close();
}

function readSettingsFromFile()
{
	var setP=System.Shell.chooseFile(true, "FeedFlow config file:*.fcg::","C:\\","");
	if(!setP)
		return;
	var f=new ActiveXObject("Scripting.FileSystemObject");
	var sf=f.OpenTextFile(setP.path, 1, false, -1);
	var sct=0;
	while(!sf.AtEndOfStream){
		var bffr=sf.ReadLine();
		if(bffr=="")
			continue;
		if(bffr=="[F]")
			sct++;
		if(!bffr.match(/^\[.\]$/)){
			var sep=bffr.indexOf("=");
			System.Gadget.Settings.write(bffr.substr(0,sep)+(sct?(sct-1):""),bffr.substring(sep+1));
		}
	}
	sf.Close();
	System.Gadget.Settings.write("noFeeds",sct);
	loadSettings();
}

function importFeedsFromIE7() 
{
	var feedManager = null;
	try
	{
		feedManager = new ActiveXObject("Microsoft.FeedsManager");
		if (feedManager == null) return false;
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
		feedManager = new ActiveXObject("Microsoft.FeedsManager");
		if (feedManager == null) return false;
	} catch(e) {}

	var folder = feedManager.RootFolder.CreateSubfolder("FeedFlow Gadget Feeds");
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
	eEditTable.style.display="none";
	table.style.display = 'block';
}

function onlyNumbers(evt,d)
{
    var e = event || evt;
    var cC = e.which || e.keyCode;

    if (cC > 31 && (cC < 48 || cC > 57) && cC!=d)
        return false;

    return true;

}

function parseTimeStr(str)
{
	var s;
	if(!(s=str.match(/([0-9]+)(d|h|m|s)$/)))
		return false;
	else
	{
		switch(s[2])
		{
			case "d":
				return s[1]*86400;
			case "h":
				return s[1]*3600;
			case "m":
				return s[1]*60;
			default:
				return s[1];
		}
	}
}
