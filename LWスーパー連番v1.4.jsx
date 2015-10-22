﻿/*	Renban(Auto Nubering) for InDesign CS4+	Author: Yuichiro Ohtsu(Libroworks inc.)	Home:http://www.libroworks.co.jp/	*/var g_stylename;	//連番の対象の文字スタイル名var g_zerotype;	//ゼロパディングタイプ（0：なし、1：二桁、2：三桁）var g_sectionstylename = null; //セクションスタイルvar g_startindex = 0; //初期値main();function main(){	//Make certain that user interaction (display of dialogs, etc.) is turned on.	//app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;	if (app.documents.length != 0){		//ダイアログ表示		if(myDisplayDialog() == true){				//連番実行			doRenban();			alert ("変換完了");		}	} else { 	   alert ("ドキュメントを開いてください");	}}function myDisplayDialog(){	//文字スタイルの一覧を取得	var myDocument = app.activeDocument;	var stylenames = [];	for(var i=0, l = myDocument.allCharacterStyles.length; i<l; i++){		stylenames.push(myDocument.allCharacterStyles[i].name);	}    //段落スタイルの一覧を取得	var parastyles = [];	for(var i=0, l = myDocument.allParagraphStyles.length; i<l; i++){		parastyles.push(myDocument.allParagraphStyles[i].name);	}		//ダイアログ生成	var myDialog = app.dialogs.add({name:"Renban"});	with(myDialog.dialogColumns.add()){		//説明ラベル		staticTexts.add({staticLabel:"特定の文字スタイルを設定した数字に対して連番を挿入します"});		//パネルを追加		with(borderPanels.add()){			//ラベル			with(dialogColumns.add()){				staticTexts.add({staticLabel:"文字スタイルを選択"});			}			//リストボックス			with(dialogColumns.add()){				var listboxCharaStyle = dropdowns.add					({stringList: stylenames, selectedIndex:0});			}		}		//パネルを追加		with(borderPanels.add()){			//ラベル			with(dialogColumns.add()){				staticTexts.add({staticLabel:"セクションの段落スタイルを選択（選択しない場合はセクションリセットしない）"});			}			//リストボックス			with(dialogColumns.add()){				var listboxSectionStyle = dropdowns.add					({stringList: parastyles, selectedIndex:0});			}		}    		//パネルを追加		with(borderPanels.add()){			//ラベル			with(dialogColumns.add()){				staticTexts.add({staticLabel:"ゼロ埋めの形式"});			}			//ラジオボタン			var myRadioButtonGroup = radiobuttonGroups.add();			with(myRadioButtonGroup){				radiobuttonControls.add({staticLabel:"1"});				radiobuttonControls.add({staticLabel:"01", checkedState:true});				radiobuttonControls.add({staticLabel:"001"});			}		}		//パネルを追加		with(borderPanels.add()){			//ラベル			with(dialogColumns.add()){				staticTexts.add({staticLabel:"連番初期値"});			}			//リストボックス			with(dialogColumns.add()){				var numStartIndex = integerEditboxes.add({editValue:1});			}		}    	}		myReturn = myDialog.show();	if (myReturn == true){		if(listboxCharaStyle.selectedIndex<1){			alert ("スタイルを選択してください");			return false;		}		g_stylename = myDocument.allCharacterStyles[listboxCharaStyle.selectedIndex];         if(listboxSectionStyle.selectedIndex > 0){              g_sectionstylename = myDocument.allParagraphStyles[listboxSectionStyle.selectedIndex];         }		g_zerotype = myRadioButtonGroup.selectedButton;		g_startindex = numStartIndex.editValue - 1;		myDialog.destroy();		return true;	} else {		myDialog.destroy();		return false;	}		}//セクションの一覧を取得function findSection(sectionstylename){	var myDocument = app.activeDocument;	//前回の検索結果を消去	app.findGrepPreferences = NothingEnum.nothing;	app.changeGrepPreferences = NothingEnum.nothing;	//検索条件を設定	app.findChangeGrepOptions.includeFootnotes = false;	app.findChangeGrepOptions.includeHiddenLayers = false;	app.findChangeGrepOptions.includeLockedLayersForFind = false;	app.findChangeGrepOptions.includeLockedStoriesForFind = false;	app.findChangeGrepOptions.includeMasterPages = false;	app.findGrepPreferences.appliedParagraphStyle = sectionstylename;	//文字スタイル	//検索実行	var findresult = myDocument.findGrep();	//ページと座標を調べる	var exresult = explorePageAndPos(findresult);	//並べ替え	exresult.sort(function(a, b){		var a_page = parseInt(a.pagenumber, 10);		var b_page = parseInt(b.pagenumber, 10); 		//ページ番号で比較		if(a_page > b_page) return 1;		if(a_page < b_page) return -1;		return 0;	});        return exresult;}//連番実行function doRenban(){    if(g_sectionstylename != null){        var sectionlist = findSection(g_sectionstylename);    }	//alert("スタイルは" + g_stylename);	//alert("ゼロ埋め形式は" + g_zerotype);	var myDocument = app.activeDocument;	//前回の検索結果を消去	app.findGrepPreferences = NothingEnum.nothing;	app.changeGrepPreferences = NothingEnum.nothing;	//検索条件を設定	app.findChangeGrepOptions.includeFootnotes = false;	app.findChangeGrepOptions.includeHiddenLayers = false;	app.findChangeGrepOptions.includeLockedLayersForFind = false;	app.findChangeGrepOptions.includeLockedStoriesForFind = false;	app.findChangeGrepOptions.includeMasterPages = false;	app.findGrepPreferences.findWhat = "[0-9]+";	//1つ以上の数値	app.findGrepPreferences.appliedCharacterStyle = g_stylename;	//文字スタイル	//検索実行	var findresult = myDocument.findGrep();	//ページと座標を調べる	var exresult = explorePageAndPos(findresult);	//並べ替え	exresult.sort(function(a, b){		//座標は1000倍して整数にする		var a_page = parseInt(a.pagenumber, 10), 			a_x = Math.round(a.cordx*1000), a_y = Math.round(a.cordy*1000);		var b_page = parseInt(b.pagenumber, 10), 			b_x = Math.round(b.cordx*1000), b_y = Math.round(b.cordy*1000);		//まずページ番号で比較		if(a_page > b_page) return 1;		if(a_page < b_page) return -1;		//同ページ内ならy座標で比較		if(a_page == b_page){			if(a_y > b_y) return 1;			if(a_y < b_y) return -1;			//y座標がピッタリ同じならx座標で比較			if(a_y == b_y){				//$.write('samey' + a_y + ' ax:' + a_x + ' b.x:' + b_x);				if(a_x > b_x) return 1;				if(a_x < b_x) return -1;							}		}		return 0;	});	//連番挿入    var num = g_startindex;	for(var i=0; i<exresult.length; i++){        //セクションチェック        if(g_sectionstylename != null){            if(sectionlist.length>0){                var a_page = parseInt(exresult[i].pagenumber, 10);                var b_page = parseInt(sectionlist[0].pagenumber, 10);                //$.write(a_page + ' : ' + b_page);			   while(a_page >= b_page && sectionlist.length>0){  				sectionlist.shift();  				num = 0;				  if(sectionlist.length)  b_page = parseInt(sectionlist[0].pagenumber, 10);   			   //$.write('-----');	 			//$.write('reset page: ' + b_page);			   }            }        }        num++;		var renban = String(num);		if(g_zerotype > 0){			renban = ('000' + renban).slice(-(g_zerotype+1));		}		exresult[i].text.contents = renban;		//$.write('renban: ' + renban);		//$.write('page: ' + exresult[i].pagenumber + ':' + exresult[i].cordx + ':' + exresult[i].cordy);	}	//検索結果を消去	app.findGrepPreferences = NothingEnum.nothing;	app.changeGrepPreferences = NothingEnum.nothing;}//parentをさかのぼって位置とページを調べるfunction explorePageAndPos(findresult){	var newresult = [];		for(var i=0; i<findresult.length; i++){		var parent = null, x = null, y = null, page = null, counter=0;		var current = findresult[i];		x = current.horizontalOffset;		y = current.baseline;		//$.write(current.constructor.name + ':' + x + ':' + y);		do{			parent = current.parent;			//parentがstoryの場合はテキストフレームの親を探す			if(parent.constructor.name == 'Story'){				//$.write(parent.constructor.name);				//$.write(parent.textFrames.length);				parent = current.parentTextFrames[0];			}			//$.write(parent.constructor.name);			if(parent == undefined) break;			//parentがPageの場合はページを調べる			if(parent.constructor.name ==  'Page'){				page = parent.name;				//$.write(' page: '+page);				break;	//ループ脱出			}			current = parent;			//無限ループ対策			counter++;			if(counter > 20) break;		}while(current.constructor.name != 'Document');		if(page!=null){			//$.write('y: ' + y + ' x:' +  x + ' p.:' +  page);			newresult.push({				text: findresult[i], cordy: y, cordx: x, pagenumber: page			});			//$.write('#pushed');		}	}	return newresult;}