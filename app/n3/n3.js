/*

TODO

 -new file structure:
    - first file with version!
    - tree.json - keys, childrens, expanded
	- evry note in one file - all infos
	- trash -> removes only from tree.json and puts in tree-trash.json! 
 
 - add demo
 - custom domain
 - fix add screenshot/ drop file
 - file upload implmentieren - erst Drag & Drop in tree
 - list view with sorting 
 - bilder gallery/slides
 - search index trash - zweiten index?
 - routing https://developer.chrome.com/docs/workbox/modules/workbox-routing/ ?
 - new feature: change to typ (task, note) on (date)
 - trash
 - versionen
 - search trash and versions
 - all files encryption
 - google drive storage
 - plan 3 tasks for today - choose from list (https://www.youtube.com/watch?v=oJTiq-Pqp9k)
 - file strucure ändern - bei Google
 - Suche opcje: szukaj historie, szukaj skasowane
 - davon PWA machen
 - Tags colors
 - changes log - welche nodes/tasks wurden geändert für nachverfolgung von Arbeit
 - better filters - save, add, remove 
 - recuring tasks? reopen? deadline? date - kann eine Woche/Monat/Jahr sein (von - bis) 	  
 - Ocr with tesseractjs
 - export als ZIP (semantic UI first)
 - choose folder list (semantic UI first)
 - list assets + info if in use and where
 - close all nodes/expande all nodes utton fpr tree
 - consolidate store events - gleiche events mit gleich wparameter müssen nicht wiederhol1t werden! - veielleicht brauche ich merhere asyncqueues? 
 - daten strzuktur version einbauen --! - bei start konvertierung zum neue struktur!
	  --> noch besser: foldere mit versionnummer und in xml version nummer
	  --> nowy plik conf.json
 - timer - worjlking on Task/Node - wird in Journal siechtbar - mit kommentar option - wenn man nur auf kjunde starten und keine unteraufagbe angibt ->erst log 
 - https://yuku.takahashi.coffee/textcomplete/
 - files
 - drag and drop files in tinymce
 - performance tests
 - import local images from local - fpr copy/pdate from Outlook - it's not possible to access local files (security: Access to image at 'file:///E:/Projekte/n3todo-local/public/img/n3todo-logo_200_58.png' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, chrome-untrusted, https.)
   Tried all Approaches from: https://stackoverflow.com/questions/6150289/how-can-i-convert-an-image-into-base64-string-using-javascript
 - trash implementieren
  
***********************************************
 @warten es reicht wenn die erst von liste verschwinden, und wieder kommen, aber als done zu setzen ist falsch...
 nicht DONE, DONE, Warten bis(Datum)/auf, 
 
 - task.due date vs task.scheduled vs deadline
 verschiedne sttaus? entwiucklungstatus: 
 installation sttaus: dev, qs, prod
  - warten auf ereignis (zb produktivsitzung) was damit ????
  - warten auf die Person 
					-> task nachfragen bei am ....

 - warten als Flag? damit es auf der liste nicht stört		
   - group/stack - workingon, waiting, ... ODER WORKFLOW??? man konnte mehrere haben... soger gleichzeitig für ein task odre node (merkierung das node ist produktiv..)
				eher STATUS...
	- attributen für notes??? ich brauche marke das die sache produktiv ist (oder nixht) etwas wie status...

	Kategoriesierung Tasks Beispeile:
		* kann nich selber machen
		* umgestztet
			* auf DEV/QS installiert
				* muss von adrer Person getestet werden
					* an die Person schreiben ---------------- OK kann ich selber machen
					* muss mit Person absprechen
				* wartet auf installation PROD
					* ich muss termin abstimmen
						* nur anschreiben  ------------- OK kann ich selber machen
						* muss absprechen
					* ich warte an ein Termin
		
		
	Kategories:
		* kann ich jeder Zeit machen
		* kann ich an einem bestimmten Termin machen
			- Termin ist bekannt
			- Termin ist noch nicht bekannt - ich warte auf ein Erreignis
		* kann ich mit bestimmte Person machen
		* ist noch nicht freigegeben
			* wartet auf ein Erreignis


ähnliche Apps:
	https://github.com/anita-app/anita


*/


window.n3 = window.n3 || {};

window.n3.priorities = [
	{
		id: 3,
		text: "Urgent &amp; Important",
		selected: false
	},
	{
		id: 2,
		text: "Urgent",
		selected: false
	},
	{
		id: 1,
		text: "Important",
		selected: false
	},
	{
		id: 0,
		text: "No priority",
		selected: true
	}
];

window.n3.tags = [];


window.n3.node = window.n3.node || {
	"tinymce": false
};
window.n3.modal = window.n3.modal || {};
window.n3.ui = window.n3.ui || {};
window.n3.action = window.n3.action || {
	"handlers": {}
};

window.n3.localFolder = {};

window.n3.storeService = false;

$(function() {
/* Test sql.js
	initSqlJs().then(function(SQL){
		//Create the database
		const db = new SQL.Database();
		// Run a query without reading the results
		db.run("CREATE TABLE test (col1, col2);");
		// Insert two rows: (1,111) and (2,222)
		db.run("INSERT INTO test VALUES (?,?), (?,?)", [1,111,2,222]);
  
		// Prepare a statement
		const stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN $start AND $end");
		stmt.getAsObject({$start:1, $end:1}); // {col1:1, col2:111}
  
		// Bind new values
		stmt.bind({$start:1, $end:2});
		while(stmt.step()) { //
		  const row = stmt.getAsObject();
		  console.log('Here is a row: ' + JSON.stringify(row));
		}
	  });
*/	
	window.n3.localFolder.init();


	window.n3.action.handlers["activate-node"] = window.n3.action.activateNode;
	window.n3.action.handlers["add-node"] = window.n3.node.add;
	window.n3.action.handlers["delete-node-confirm"] = window.n3.node.delete;

	window.n3.action.handlers["choose-folder"] = window.n3.localFolder.select;
	window.n3.action.handlers["verify-folder"] = window.n3.localFolder.queryVerifyPermission;

	window.n3.action.handlers["open-modal"] = window.n3.ui.openModal;
	window.n3.action.handlers["close-dialog"] = window.n3.action.closeDialog;

	window.n3.getActiveNode = function() {
		return $.ui.fancytree.getTree("[data-tree]").getActiveNode();
	}

	window.n3.tagInput = $("[data-sarch-tag]").search({
		minCharacters: 0,
		onSelect: function(result, response) {
			let newTag = result.title;

			// need these three lines to remove value and close search results
			window.n3.tagInput.search("set value", "");
			window.n3.tagInput.search("query");

			let node = window.n3.getActiveNode();
			node.data.tags = node.data.tags || [];

			if (!node.data.tags.includes(newTag)) {
				window.n3.tagInput.before(window.n3.getTagHTML(newTag));
				node.data.tags.push(newTag);
				window.n3.storeService.modifyNote(node, ["tags"]).then(function() { });
			}
			return false;
		},	
		showNoResults: false,
		cache: false,
		apiSettings: {
			responseAsync: function(settings, callback) {	
				let noteKey = undefined;
				let $ticketDataOwner = this.closest("[data-owner='node']");
				if ($ticketDataOwner && $ticketDataOwner.dataset.notekey) {
					noteKey = $ticketDataOwner.dataset.notekey;
				}

				let node = window.n3.getNoteByKey(noteKey);
				node.data.tags = node.data.tags || [];
				let filterettags = window.n3.tags.filter(function(tag) {
					return !node.data.tags.includes(tag.title);
				});
				
				callback({
					success: true,
					results: filterettags
				});
			}
		}
	}).on('keypress',function(e) {
		if(e.which == 13) {
			let newTag = window.n3.tagInput.search("get value").trim();
			if (newTag.length > 0) {
				
				window.n3.tagInput.search("set value", "");

				let noteKey = undefined;
				let $ticketDataOwner = this.closest("[data-owner='node']");
				if ($ticketDataOwner && $ticketDataOwner.dataset.notekey) {
					noteKey = $ticketDataOwner.dataset.notekey;
				}

				let node = window.n3.getNoteByKey(noteKey);
				node.data.tags = node.data.tags || [];
				if (!node.data.tags.includes(newTag)) {
					window.n3.tagInput.before(window.n3.getTagHTML(newTag));

					window.n3.tags.push({
						title: newTag
					});

					
					node.data.tags = node.data.tags || [];
					node.data.tags.push(newTag);
					window.n3.storeService.modifyNote(node, ["tags"]).then(function() { });
				}
			}
		}
	});

	$(document).on("click", "[data-delete-tag]", function(event) {
		let deleteTag = this.dataset.tag;
		$("[data-tag='" + deleteTag + "']").remove();
		let noteKey = undefined;
		let $ticketDataOwner = $("[data-owner='node']")[0];
		if ($ticketDataOwner && $ticketDataOwner.dataset.notekey) {
			noteKey = $ticketDataOwner.dataset.notekey;
		}

		let node = window.n3.getNoteByKey(noteKey);
		node.data.tags = node.data.tags || [];
		let tagIndex = node.data.tags.findIndex(function(tag) {
			return tag === deleteTag
		});
		node.data.tags.splice(tagIndex, 1);
		window.n3.storeService.modifyNote(node, ["tags"]).then(function() { });
	});

	$(document).on("mouseover", "span.fancytree-node", function(event) {
		$(this).addClass("n3-mouseover");
	});
	$(document).on("mouseout", "span.fancytree-node", function(event) {
		$(this).removeClass("n3-mouseover");
	});

	$(document).on("click", "[data-node-add]", function(event) {
		window.n3.node.add();
	});

	$(document).on("click", "[data-breadcrumbs] [data-link-note]", function() {
		if (this.dataset && this.dataset.linkNote) {
			window.n3.action.activateNode(this.dataset.linkNote);
		}
	});

	$(document).on("click", "[data-backlinks-title]", function() {
		if ($(this).hasClass("active")) {
			$("[data-backlinks-title]").removeClass("active");
			$("[data-backlinks-content]").removeClass("active");
		} else {
			$("[data-backlinks-title]").addClass("active");
			$("[data-backlinks-content]").addClass("active");
		}
	});

	$(document).on("click", "[data-action]", function(event) {
		let targetElement = event.target || event.srcElement;
		let $trigger = this;
		let noteKey = undefined;
		
		//let $nodeDataOwner = targetElement.closest("[data-owner='node']");
		//if ($nodeDataOwner && $nodeDataOwner.dataset.notekey) {
		//	noteKey = $nodeDataOwner.dataset.notekey;
		//}

		let $ticketDataOwner = targetElement.closest("[data-owner='node']");
		if ($ticketDataOwner && $ticketDataOwner.dataset.notekey) {
			noteKey = $ticketDataOwner.dataset.notekey;
		}
	


		let action = $trigger.dataset.action;
		if (window.n3.action.handlers[action]) {
			if (window.n3.action.handlers[action](noteKey, $trigger)) {
				let $modal = $trigger.closest(".modal");
				if ($modal) {
					window.n3.modal.close($modal, true);
				}
			}
		}

	});

	$(document).on("change", "[data-noteeditor] [name='title']", function() {
		let $nodeDataOwner = this.closest("[data-owner='node']");
		let noteKey = false;
		if ($nodeDataOwner && $nodeDataOwner.dataset.notekey) {
			noteKey = $nodeDataOwner.dataset.notekey;
		}
		if (noteKey) {
			let node = window.n3.getNoteByKey(noteKey);

			let newTitle = $(this).val();
			if (node.title != newTitle) {
				node.setTitle(newTitle);
				window.n3.storeService.modifyNote(node, ["title"]).then(function() { });
			}
		}
	});

	$(document).on("click", "[data-noteeditor] [name='title']", function() {
		$(this).select();
	});

	$(document).on("click", "[data-type]", function() {
		const newType = this.dataset.type;

		if (newType === "task") {
			$("[data-done]").show();
		} else {
			$("[data-done]").hide();
		}
	
		$("[data-type='" + newType + "']").addClass("active");
		$("[data-type='" + newType + "']").addClass("primary");
		$("[data-type='" + (newType === "task" ? "note" : "task") + "']").removeClass("active");
		$("[data-type='" + (newType === "task" ? "note" : "task") + "']").removeClass("primary");

		let $nodeDataOwner = this.closest("[data-owner]");
		let noteKey = false;
		if ($nodeDataOwner && $nodeDataOwner.dataset.notekey) {
			noteKey = $nodeDataOwner.dataset.notekey;
		}
		if (noteKey) {
			let node = window.n3.getNoteByKey(noteKey);
			if (!node.data.type || node.data.type !== newType) {
				node.data.type = newType;
				node.checkbox = node.data.type === "task";

				let parentNode = node;
				while (parentNode) {
					parentNode.renderTitle();
					parentNode = parentNode.parent;
				}

				window.n3.storeService.modifyNote(node, ["type"]).then(function() { });
			}
		}
	});

	$(document).on("change", "[data-done] [name='done']", function() {
		let $nodeDataOwner = this.closest("[data-owner='node']");
		let noteKey = false;
		if ($nodeDataOwner && $nodeDataOwner.dataset.notekey) {
			noteKey = $nodeDataOwner.dataset.notekey;
		}
		if (noteKey) {
			let node = window.n3.getNoteByKey(noteKey);

			node.data.done = $(this).prop("checked");
			node.selected = node.data.done;

			let parentNode = node;
			while (parentNode) {
				parentNode.renderTitle();
				parentNode = parentNode.parent;
			}
			
			window.n3.storeService.modifyNote(node, ["done"]).then(function() { });
		}
	});

	$(document).on("keyup", "[data-search] input", function() {

		if ($(this).val().trim().length > 0) {
			$("[data-search] i").removeClass("search");
			$("[data-search] i").addClass("delete");
		} else {
			$("[data-search] i").removeClass("delete");
			$("[data-search] i").addClass("search");
		}

		window.n3.filterTree();
	});
	
	$(document).on("click", "[data-search] i.delete", function() {
		$("[data-search] input").val("");
		$("[data-search] input").trigger("keyup");
	});

	$(document).on("click", "[data-backlink-note]", function() {
		if (this &&  this.dataset && this.dataset.backlinkNote) {
			window.n3.action.activateNode(this.dataset.backlinkNote);
		}
	});
	


	let filterDropDown = $("[data-filter]").dropdown({
		onShow: function(a, b, c) {
			let $list = $("[data-menu]", this);
			$("[data-filter-tag]", $list).remove();
			window.n3.tags.forEach(function(tag) {
				$list.append(`<div class='item' data-filter-tag data-value='tag-${tag.title}'>
				<div class="ui green empty circular label"></div>${tag.title}</div>`);
			});
		}
	});

	filterDropDown.dropdown("setting", "onChange", function(value, text, $choice) {
		$("[data-filter]").dropdown("hide");
		window.n3.filterTree();
	});


	// TODO: does it work?
	window.addEventListener("beforeunload", function(event) {
		window.n3.ui.onUnload(event);
	});

});


window.n3.getTagHTML = function(tag) {
	let newTagTemplate = `<a class="ui tiny tag label" data-tag="${tag}">${tag}</a>		
	<button class="ui transparent icon mini button n3-tag-remove" data-tooltip="Remove tag '${tag}'" data-tag="${tag}" data-delete-tag="${tag}">
		<i class="icon trash"></i>
	</button>`;

	return newTagTemplate;
}

window.n3.getNoteByKey = function(noteKey) {
	let note = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
	return note;
}

window.n3.filterTree = function() {

	let filterValue = $("[data-filter]").dropdown("get value");
	let filters = [];
	if (filterValue.trim().length > 0) {
		filters = filterValue.trim().split(",");
	}

	let searchText = $("[data-search] input").val();


	if (filters.length == 0 && searchText.trim().length == 0) {
		$.ui.fancytree.getTree("[data-tree]").clearFilter();
	} else {

		let searchResults = window.n3.storeService.search(searchText);
		let foundNoteKeys = [];

		if (searchResults.length > 0) {
			foundNoteKeys = searchResults[0].result.map(function(searchResult) {
				return searchResult.id;
			});
		}

		let filterByTags = filters.reduce(function(tags, filter) {
			if (filter.indexOf("tag-") == 0) {
				tags.push(filter.substring(4));
			}
			return tags;
		}, []);

		$.ui.fancytree.getTree("[data-tree]").filterNodes(function(node) {			
			let show = true;

			let showTypes = [];
			if (filters.includes("tasks")) {
				showTypes.push("task");
			}
			if (filters.includes("notes")) {
				showTypes.push("note");
			}
			if (showTypes.length > 0) {
				show = show && showTypes.includes(node.data.type);
			}
			

			let showDone = [];
			if (filters.includes("done")) {
				showDone.push(true);
			}
			if (filters.includes("not-done")) {
				showDone.push(false);
			}
			if (showDone.length > 0) {
				show = show && node.data.type === "task" && showDone.includes(node.data.done);
			}
			
			let showPriority = [];
			if (filters.includes("priority-3")) {
				showPriority.push("3");
			}
			if (filters.includes("priority-2")) {
				showPriority.push("2");
			}
			if (filters.includes("priority-1")) {
				showPriority.push("1");
			}
			if (filters.includes("priority-0")) {
				showPriority.push("0");
			}
			if (showPriority.length > 0) {
				show = show && showPriority.includes(node.data.priority + "");
			}

			if (searchText.trim().length > 0) {
				show = show && foundNoteKeys.includes(node.key);
			}

			if (filterByTags.length > 0) {
				node.data.tags = node.data.tags || {};
				let tagMatch = node.data.tags.some(function(tag) {
					return filterByTags.includes(tag);
				});

				show = show && tagMatch;
			}

			return show;
		});

	}
}

window.n3.ui.onUnload = function(event) {
	let $nodeDataOwner = $("[data-owner='node']");
	let noteKey = $nodeDataOwner[0].dataset.notekey;

	let modifiedFields = [];

	let newTitle = $("[data-noteeditor] [name='title']").val();
	let node = window.n3.getNoteByKey(noteKey);

	if (newTitle != node.title) {
		node.title = newTitle;
		modifiedFields.push("title");
	}

	let form = $("[data-noteeditor]");
	window.n3.node.getNodeHTMLEditor(form).then(function(htmlEditor) {
		if (htmlEditor.isDirty()) {
			node.data.description = editor.getContent();
			modifiedFields.push("description");
		}
	});

	window.n3.storeService.modifyNote(node, modifiedFields).then(function() { });
}



window.n3.action.closeDialog = function(noteKey, $trigger) {
	let $modal = $trigger.closest('.modal');
	window.n3.modal.close($modal, true);
}


window.n3.action.activateNode = function(noteKey) {
	let node = window.n3.getNoteByKey(noteKey);
	node.setActive();
};


window.n3.ui.openModal = function(noteKey, $trigger) {
	let modal = $trigger.dataset.target;
	let $target = document.getElementById(modal);

	let $nodeDataOwner = $trigger.closest("[data-owner='node']");
	if ($nodeDataOwner && $nodeDataOwner.dataset.notekey) {
		$target.dataset.notekey = $nodeDataOwner.dataset.notekey;
	}

	window.n3.modal.open($target);

	if ($target.dataset.hasOwnProperty("closeonesc")) {

		$(document).on("keydown.closemodal", function(event) {
			let e = event || window.event;

			if (e.keyCode === 27) { // Escape key
				window.n3.modal.close($target, true);
			}
		});

	}
}

function executeFunctionByName(functionName, context /*, args */) {
	let args = Array.prototype.slice.call(arguments, 2);
	let namespaces = functionName.split(".");
	let func = namespaces.pop();
	for (let i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
	}
	return context[func].apply(context, args);
}


window.n3.node.delete = function(noteKey, $trigger) {
	var that = this;
	return new Promise(function(resolve, reject) {
		let node = window.n3.getNoteByKey(noteKey);
		if (node.title === "root") {
			return;
		}
		let parentNode = node.parent;


		window.n3.storeService.moveNoteToTrash(node).then(function() {
			node.remove();

			if (parentNode.title != "root") {
				parentNode.setActive();
			} else if (parentNode.children && parentNode.children.length > 0) {
				parentNode.children[0].setActive();
			}
		});

	});
};




window.n3.localFolder.init = function() {
	get("localFolder").then(function(dir) {
		if (dir) {
			document.getElementById("n3-folder-verify-foldername").innerHTML = dir.name;
			window.n3.modal.open(document.getElementById("n3-table-verify-local-folder-modal"));
		} else {
			window.n3.modal.open(document.getElementById("n3-table-choose-local-folder-modal"));
		}
	});
}


window.n3.localFolder.select = function() {

	try {
		del("localFolder").then(function() {

			window.showDirectoryPicker({
				mode: "readwrite"
			}).then(function(dir) {

				window.n3.localFolder.queryVerifyPermission(dir).then(function() { });
			}).catch(function(err) {
				window.n3.modal.closeAll(true);
				window.n3.modal.open(document.getElementById("n3-table-noAccessError-local-folder-modal"));
				let a = $("[data-folderaccesserror]");
				a.html(err + "");
			});
		});
	} catch (err) {
		console.log(err);
		window.n3.modal.closeAll(true);
		window.n3.modal.open(document.getElementById("n3-table-noAccessError-local-folder-modal"));
		let a = $("[data-folderaccesserror]");
		a.html(err + "");
	}
}


window.n3.localFolder.queryVerifyPermission = function(dir) {
	return new Promise(function(resolve) {

		(function(dir) {
			return new Promise(function(resolveI, rejectI) {
				if (!dir) {
					get("localFolder").then(function(dir) {
						resolveI(dir);
					});
				} else {
					resolveI(dir);
				}
			});
		})(dir).then(function(dir) {
			window.n3.localFolder.verifyPermission(dir, true).then(function(granted) {
				if (granted) {
					window.n3.storeService = new N3StoreServiceFileSystem(dir);
					// window.n3.storeService = new N3StoreServiceSQLite(dir);


					set("localFolder", dir).then(function() {
						window.n3.modal.closeAll();
					});

					window.n3.modal.closeAll(true);

					window.n3.storeService.migrateStore().then(function() {
					
						window.n3.storeService.loadNotesTree().then(function(tree) {

							tree = setCheckBoxFromTyp(tree);

							function setCheckBoxFromTyp(tree) {
								if (!tree) {
									return tree;
								}

								for (let i = 0; i < tree.length; i++) {
									tree[i].data = tree[i].data || {};
									tree[i].checkbox = tree[i].data.type !== undefined && tree[i].data.type === "task";
									tree[i].selected = tree[i].data.done !== undefined && tree[i].data.done;
									if (tree[i].children) {
										tree[i].children = setCheckBoxFromTyp(tree[i].children);
									}
									tree[i].data.tags = tree[i].data.tags || [];
									tree[i].data.tags.forEach(function(tag) {
										let indexExistingTag = window.n3.tags.findIndex(function(existingTag) {
											return existingTag.title === tag;
										});
							
										if (indexExistingTag == -1) {
											window.n3.tags.push({
												title: tag
											});
										}
									});
								}

								return tree;
							}
							
								
							let form = $("[data-noteeditor]");
							window.n3.node.getNodeHTMLEditor(form).then(function(data) {
								window.n3.initFancyTree(tree).then(function() {
									window.n3.storeService.indexTree($.ui.fancytree.getTree("[data-tree]").getRootNode().children);
									resolve(true);
								});
							});
						});
					});


				} else {
					window.n3.modal.closeAll(true);
					window.n3.modal.open(document.getElementById("n3-table-noAccessError-local-folder-modal"));
					let a = $("[data-folderaccesserror]");
					a.html("You have no granted access to local folder.");
					resolve(false);
				}
			});
		});

	});
}



window.n3.localFolder.verifyPermission = function(fileHandle, readWrite) {
	return new Promise(function(resolve) {

		const options = {};

		if (readWrite) {
			options.mode = "readwrite";
		}

		fileHandle.queryPermission(options).then(function(granted) {
			if (granted === "granted") {
				resolve(true);
			}

			fileHandle.requestPermission(options).then(function(granted) {

				if (granted === "granted") {
					resolve(true);
				} else {
					resolve(false);
				}

			});
		});

	});

}



// Functions to open and close a modal
window.n3.modal.open = function($el) {
	let el = $el;
	if ($el instanceof jQuery) {
		el = $el[0];
	}
	
	let preventclosemodal = el.dataset.preventclosemodal === "";
	$($el).modal({
		autofocus: false,
		closable: !preventclosemodal
	}).modal("show");
	
	if (el.dataset.onopen) {
		if (window.n3.action.handlers[el.dataset.onopen]) {
			window.n3.action.handlers[el.dataset.onopen](undefined, undefined, el);
		}
	}

}

window.n3.modal.close = function($el, force) {
	if ($el.dataset.preventclosemodal || force) {
		$($el).modal("hide");
	}
	$(document).off("keydown.closemodal");
}

window.n3.modal.closeAll = function(force) {
	(document.querySelectorAll(".modal.visible") || []).forEach(($modal) => {
		window.n3.modal.close($modal, force);
	});
}

window.n3.node.getNewNodeData = function() {
	return {
		"key": crypto.randomUUID(),
		"checkbox": false,
		"title": JSJoda.LocalDateTime.now().format(JSJoda.DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")),
		"data": {
			"creationDate": JSJoda.Instant.now().toString(),
			"type": "note",
			"priority": 0,
			"done": false
		}
	};
}

window.n3.node.add = function() {
	let hasFocus = $.ui.fancytree.getTree("[data-tree]").hasFocus();
	let node = $.ui.fancytree.getTree("[data-tree]").getActiveNode();
	if (!node) {
		node = $.ui.fancytree.getTree("[data-tree]").getRootNode();
	}

	let newNodeData = window.n3.node.getNewNodeData();
	let newNode = node.addNode(newNodeData, "firstChild");

	newNode.setActive();
	window.n3.storeService.addNote(newNode).then(function() { });
}

window.n3.node.updateInternalLinks = function(htmlText) {
	

	let $htmlCntainer = $("<div />");
	$htmlCntainer.html(htmlText);

	let internalLinks = $("[data-link-node]", $htmlCntainer);

	internalLinks.each(function(index) {
		let $this = $(this);
		
		let note = window.n3.getNoteByKey($this[0].dataset.linkNode);
		if (note) {

			let noteIt = note;
			let links = "";
			let sep = "";
			while (noteIt && noteIt.key !== "root_1") {
				links = "<a href='#" + noteIt.key +"' data-link-note='" + noteIt.key + "'>" + noteIt.title + "</a>" + sep + links;
				sep = " / ";
				noteIt = noteIt.parent;
			}

			

			$(this).html("[ " + links + " ]");
		}
	});

	return $htmlCntainer.html();
}

window.n3.node.activateNode = function(node) {
	return new Promise(function(resolve) {

		let $nodeDataOwner = $("[data-owner='node']");
		$nodeDataOwner[0].dataset.notekey = node.key;

		let form = $("[data-noteeditor]");

		let rootNodeKey = undefined;
		let noteIt = node;
		let breadcrumbs = "";
		let sep = "";
		while (noteIt && noteIt.key !== "root_1") {
			breadcrumbs = "<a href='#" + noteIt.key +"' data-link-note='" + noteIt.key + "'>" + noteIt.title + "</a>" + sep + breadcrumbs;
			sep = " / ";
			rootNodeKey = noteIt.key;
			noteIt = noteIt.parent;
		}
		$("[data-breadcrumbs]").html(`<button class="ui transparent mini icon button" data-link-note='${rootNodeKey}'>
											<i class="blue home icon"></i>
										</button>` + breadcrumbs);
		

		$("[name='title']", form).val(node.title);
		var description = ((node || {}).data || {}).description || "";
		window.n3.storeService.loadImages("node", node.key, description).then(function(htmlText) {
			window.n3.node.getNodeHTMLEditor(form).then(function(htmlEditor) {
				htmlText = window.n3.node.updateInternalLinks(htmlText);
				htmlEditor.setContent(htmlText);
				htmlEditor.setDirty(false);

				if (node.data.backlinks) {
					let htmlBacklinks = "<ul class='ui list'>";
					let countBacklinks = 0;
					node.data.backlinks.forEach(function(backlinkNoteKey) {
						let backlinkNote = window.n3.getNoteByKey(backlinkNoteKey);

						let noteIt = backlinkNote;
						let links = "";
						let sep = "";
						while (noteIt && noteIt.key !== "root_1") {
							links = "<a href='#" + noteIt.key +"' data-backlink-note='" + noteIt.key + "'>" + noteIt.title + "</a>" + sep + links;
							sep = " / ";
							noteIt = noteIt.parent;
						}
						countBacklinks++;
						htmlBacklinks += "<li>[ " + links + " ]</li>";
					});
					htmlBacklinks += "</ul>";
					$("[data-backlinks-content]").html(htmlBacklinks);
					$("[data-backlinks-count]").html(countBacklinks);
					$("[data-backlinks-count]").addClass("blue");
				} else {
					$("[data-backlinks-content]").html("");
					$("[data-backlinks-count]").html("0");
					$("[data-backlinks-count]").removeClass("blue");
				}

				
				resolve();
			});
		});


		if (node.data.type === "task") {
			$("[data-done]").show();
		} else {
			$("[data-done]").hide();
		}
		$("[data-done] [name='done']").prop("checked", node.data.done !== undefined && node.data.done);

		//////////////////////////////

		let priorityDropDownValues = window.n3.priorities.map(function(priority) {
			return {
				name: priority.text,
				value: priority.id + "",
				selected: node.data.priority !== undefined && (priority.id + "") === (node.data.priority + "")
			}
		});
		let priorityDropdown = $("[data-priority]", form).dropdown({
			values: priorityDropDownValues
		});
		let selectedPriority = window.n3.priorities.find(function(priority) {
			return node.data.priority !== undefined && (priority.id + "") === (node.data.priority + "");
		});
		if (!selectedPriority) {
			selectedPriority = 0;
		}
		priorityDropdown.dropdown("set selected", selectedPriority.id + "");
		priorityDropdown.dropdown("setting", "onChange", function(value, text, $choice) {
			node.data.priority = value;
			window.n3.storeService.modifyNote(node, ["priority"]).then(function() {});
			node.renderTitle();
		});

		//////////////////////////////

		$("[data-type='" + node.data.type + "']").addClass("active");
		$("[data-type='" + node.data.type + "']").addClass("primary");
		$("[data-type='" + (node.data.type === "task" ? "note" : "task") + "']").removeClass("active");
		$("[data-type='" + (node.data.type === "task" ? "note" : "task") + "']").removeClass("primary");

		//////////////////////////////

		$("[data-tag]").remove();
		node.data.tags = node.data.tags || [];
		node.data.tags.forEach(function(tag) {
			
			let indexExistingTag = window.n3.tags.findIndex(function(existingTag) {
				return existingTag.title === tag;
			});

			if (indexExistingTag == -1) {
				window.n3.tags.push({
					title: tag
				});
			}

			window.n3.tagInput.before(window.n3.getTagHTML(tag));
		});
	});
}



window.n3.node.getNodeHTMLEditor = function(form) {

	return new Promise(function(resolve) {
		if (window.n3.node.tinymce) {
			resolve(window.n3.node.tinymce);
			return;
		}

		tinymce.init({
			target: $("[name='description']", form)[0],
			menubar: false,
			toolbar_sticky: true,
			toolbar_sticky_offset: 0,
			min_height: 400,
			inline_boundaries: false,
			plugins: [
				"advlist", "autolink", "lists", "link", "image", "charmap", "preview",
				"anchor", "searchreplace", "visualblocks", "code", "fullscreen",
				"insertdatetime", "media", "table", "code", "help", "wordcount",
				"autoresize"
			],
			toolbar: "undo redo | blocks | " +
				"bold italic backcolor | alignleft aligncenter " +
				"alignright alignjustify | bullist numlist outdent indent | " +
				"removeformat | code",
			powerpaste_word_import: "clean",
			powerpaste_html_import: "clean",
			block_unsupported_drop: false,
			setup: function(editor) {

				editor.addShortcut("ctrl+s", "Save note", function () {
					let $nodeDataOwner = $(editor.getContainer()).closest("[data-owner='node']");
					let noteKey = $nodeDataOwner[0].dataset.notekey;
					let currentNode = window.n3.getNoteByKey(noteKey);
					
					let editorContent = editor.getContent();
					if (currentNode.data.description !== editorContent) {
						currentNode.data.description = editorContent;

						window.n3.storeService.modifyNote(currentNode, ["description"]).then(function() { });
					}
				});

				editor.on("drop", function(event) {
					console.log("drop", event);
					event.stopPropagation && event.stopPropagation();
					event.preventDefault && event.preventDefault();
				});

				editor.on('click', function(e) {
					if (e.srcElement &&  e.srcElement.dataset && e.srcElement.dataset.linkNote) {
						window.n3.action.activateNode(e.srcElement.dataset.linkNote);
					}
				});
				
				editor.on("blur", function(e) {
					// editor.isDirty() sometimes is wrong
					
					let $nodeDataOwner = $(editor.getContainer()).closest("[data-owner='node']");
					let noteKey = $nodeDataOwner[0].dataset.notekey;
					let currentNode = window.n3.getNoteByKey(noteKey);
					
					let editorContent = editor.getContent();
					if (currentNode && currentNode.data && currentNode.data.description !== editorContent) {
						currentNode.data.description = editorContent;

						window.n3.storeService.modifyNote(currentNode, ["description"]).then(function() { });
					}
				});

				editor.on("PreProcess", function(e) {
					let imgs = $("img", e.node);
					imgs.each(function() {
						if (!this.dataset.n3src && (this.src.indexOf("data:image/") > -1 || this.src.indexOf("blob:") > -1)) {
							let fileExt = "png"; // this.src.substring(11, 14);
							this.dataset.n3src = "image_" + crypto.randomUUID() + "." + fileExt;
						}
					});

				});

				// Drag&Drop
				/*				
				drop on body or something like this...
				editor.on("drop", function(event) {
					 console.log("drop", event);
				})*/
				
				editor.ui.registry.addAutocompleter("specialchars", {
					ch: '[',
					minChars: 0,
					columns: 1,
					onAction: function(autocompleteApi, rng, value) {
						editor.selection.setRng(rng);
						let note = window.n3.getNoteByKey(value);

						let noteIt = note;
						let links = "";
						let sep = "";
						while (noteIt && noteIt.key !== "root_1") {
							links = "<a href='#" + noteIt.key +"' data-link-note='" + noteIt.key + "'>" + noteIt.title + "</a>" + sep + links;
							sep = " / ";
							noteIt = noteIt.parent;
						}
						
						editor.insertContent("<span data-link-node='" + value +"' contenteditable='false'>[ " + links + " ]</span>");
						autocompleteApi.hide();
					},
					fetch: function(pattern) {
						return new Promise(function(resolve) {
							let searchResults = [];

							if (pattern.trim() === "") {	
								searchResults = window.n3.storeService.getIndexedDocuments(20);					
																
							} else {

								searchResults = window.n3.storeService.search(pattern, 20);
								searchResults = searchResults[0].result;
							}

							if (searchResults.length > 0) {
								let results = searchResults.map(function(searchResult) {
									return {
										type: 'cardmenuitem',
										value: searchResult.id,
										label: searchResult.doc.path,
										items: [
											{
												type: 'cardcontainer',
												direction: 'vertical',
												items: [
													{
														type: 'cardtext',
														text: searchResult.doc.path,
														name: 'char_name'
													}
												]
											}
										]
									}
								});
								resolve(results);
							} else {
								resolve([]);
							}
							
						});
					}
				});
				
				
			}
		}).then(function(editor) {
			window.n3.node.tinymce = editor[0];
			resolve(window.n3.node.tinymce);
		});
	});
}


window.n3.initFancyTree = function(rootNodes) {
	var that = this;
	return new Promise(function(resolve, reject) {

		let LAST_EFFECT_DO = null,
			LAST_EFFECT_DD = null,
			lazyLogCache = {};

		/* Log if value changed, nor more than interval/sec.*/
		function logLazy(name, value, interval, msg) {
			/*let now = Date.now(),
				entry = lazyLogCache[name];
			if (!lazyLogCache[name]) { lazyLogCache[name] = { stamp: now } };
	
			if (value && value === entry.value) {
				return;
			}
			entry.value = value;
	
			if (interval > 0 && (now - entry.stamp) <= interval) {
				return;
			}
			entry.stamp = now;
			lazyLogCache[name] = entry;*/
			// console.log(msg);
		}

		let ff = $("[data-tree]").fancytree({
			checkbox: true,
			icon: false,
			source: rootNodes,
			lazyLoad: function(event, data) {
				data.result = new Promise(function(resolve, reject) {
					window.n3.storeService.loadNotes(data.node.key).then(function(children) {
						resolve(children);
					});
				});
			},
			postProcess: function(event, data) {
				//logLazy(event, data);
				// either modify the Ajax response directly
				//data.response[0].title += " - hello from postProcess";
				// or setup and return a new response object
				//        data.result = [{title: "set by postProcess"}];
			},
			extensions: ["dnd5", "filter"],
			nodata: false,
			filter: {
				autoApply: true,   // Re-apply last filter if lazy data is loaded
				autoExpand: false, // Expand all branches that contain matches while filtered
				counter: false,     // Show a badge with number of matching child nodes near parent icons
				fuzzy: false,      // Match single characters in order, e.g. 'fb' will match 'FooBar'
				hideExpandedCounter: true,  // Hide counter badge if parent is expanded
				hideExpanders: true,       // Hide expanders if all child nodes are hidden by filter
				highlight: false,   // Highlight matches by wrapping inside <mark> tags
				leavesOnly: false, // Match end nodes only
				nodata: true,      // Display a 'no data' status node if result is empty
				mode: "hide"       // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
			},
			select: function(event, data) {
				console.log("select", event, data);

				data.node.data.done = data.node.selected;
				$("[data-done] [name='done']").prop("checked", data.node.data.done);
				
				let parentNode = data.node;
				while (parentNode) {
					parentNode.renderTitle();
					parentNode = parentNode.parent;
				}

				window.n3.storeService.modifyNote(data.node, ["done"]).then(function() { });

			},
			// doesn't work 'placeholder: "There's no tasks in this note.",
			edit: {
				// Available options with their default:
				adjustWidthOfs: 4,   // null: don't adjust input size to content
				inputCss: { minWidth: "3em" },
				triggerStart: ["clickActive", "f2", "dblclick", "shift+click", "mac+enter"],
				beforeEdit: $.noop,   // Return false to prevent edit mode
				edit: $.noop,         // Editor was opened (available as data.input)
				beforeClose: $.noop,  // Return false to prevent cancel/save (data.input is available)
				save: $.noop,         // Save data.input.val() or return false to keep editor open
				close: $.noop,        // Editor was removed
			},
			init: function(event, data) {
				/*if (data.tree.rootNode.children.length > 0) {
					$("[data-app]").removeClass("n3-no-nodes");
				} else {
					$("[data-app]").addClass("n3-no-nodes");
				}*/

				if (data.tree.rootNode.children.length > 0) {
					data.tree.activateKey(data.tree.rootNode.children[0].key);
				} else {
					$("[data-app]").addClass("n3-no-nodes");
				}
				data.tree.$container.addClass("fancytree-ext-childcounter");
			},
			modifyChild: function(event, data) {
				// bei remove - data.tree.rootNode.children is not yet actuall
				if (data.operation == "remove" && data.node.title == "root") {
					$("[data-app]").addClass("n3-no-nodes");
				}/* else if (data.operation != "remove" && data.tree.rootNode.children.length > 0) {
					// on add new node, when there is no statusNodeType !== "nodata" node
					$("[data-app]").removeClass("n3-no-nodes");
				}*/
			},
			// --- Node events -------------------------------------------------			
			activate: function(event, data) {
				$("[data-app]").removeClass("n3-no-nodes");
				if (data.node.key !== "_1") {
					window.n3.node.activateNode(data.node).then(function() { });
				}
			},
			expand: function(event, data, a, b) {
				window.n3.storeService.expandNote(data.node, true);
			},
			collapse: function(event, data) {
				window.n3.storeService.expandNote(data.node, false);
			},
			loadChildren: function(event, data) {
				data.node.visit(function(subNode) {
					// Load all lazy/unloaded child nodes
					// (which will trigger `loadChildren` recursively)
					if (subNode.isUndefined() && subNode.isExpanded()) {
						subNode.load();
					}
				});
			},
			enhanceTitle: function(event, data) {
				let tasksAmountOnNode = 0;
				let tasksAmount = 0;
				data.node.visit(function(subNode) {
					if (subNode.data.type === "task" && (subNode.data.done === undefined || !subNode.data.done)) {
						tasksAmount++;
						if (data.node.key === subNode.parent.key) {
							tasksAmountOnNode++;
						}
					}
				});

				$(data.node.span).append(
					`<div class="n3-childcounter ${ tasksAmount > 0 ? "n3-active" : "" }"> ${tasksAmount} </div>`
				);


				$(data.node.span).append(
					`<span class='n3-task-priority n3-task-priority-${data.node.data.priority}'></span>
					<button data-node-add data-node-key='${data.node.key}' class='ui compact n3-node-add icon button mini'>
						<i class='plus square outline icon'></i>
					</button>`
				);

			},
			dnd5: {
				// autoExpandMS: 400,
				// preventForeignNodes: true,
				// preventNonNodes: true,
				preventRecursion: true, // Prevent dropping nodes on own descendants
				// preventSameParent: true,
				preventVoidMoves: true, // Prevent moving nodes 'before self', etc.
				// effectAllowed: "all",
				dropEffectDefault: "move", // "auto",
				multiSource: false,  // drag all selected nodes (plus current node)

				// --- Drag-support:

				dragStart: function(node, data) {
					/* This function MUST be defined to enable dragging for the tree.
					  *
					  * Return false to cancel dragging of node.
					  * data.dataTransfer.setData() and .setDragImage() is available
					  * here.
					  */
					node.debug("T1: dragStart: " + "data: " + data.dropEffect + "/" + data.effectAllowed +
						", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed, data);

					// Set the allowed effects (i.e. override the 'effectAllowed' option)
					data.effectAllowed = "all";

					// Set a drop effect (i.e. override the 'dropEffectDefault' option)
					// data.dropEffect = "link";
					data.dropEffect = "copy";

					// We could use a custom image here:
					// data.dataTransfer.setDragImage($("<div>TEST</div>").appendTo("body")[0], -10, -10);
					// data.useDefaultImage = false;

					// Return true to allow the drag operation
					return true;
				},
				dragDrag: function(node, data) {
					//   logLazy("dragDrag", null, 2000,
					//     "T1: dragDrag: " + "data: " + data.dropEffect + "/" + data.effectAllowed +
					//     ", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed );
				},
				dragEnd: function(node, data) {
					//   node.debug( "T1: dragEnd: " + "data: " + data.dropEffect + "/" + data.effectAllowed +
					//     ", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed, data);
					//     alert("T1: dragEnd")
				},

				// --- Drop-support:

				dragEnter: function(node, data) {
					node.debug("T1: dragEnter: " + "data: " + data.dropEffect + "/" + data.effectAllowed +
						", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed, data);

					// data.dropEffect = "copy";
					return true;
				},
				dragOver: function(node, data) {
					logLazy("dragOver", null, 2000,
						"T1: dragOver: " + "data: " + data.dropEffect + "/" + data.effectAllowed +
						", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed);

					// Assume typical mapping for modifier keys
					data.dropEffect = data.dropEffectSuggested;
					// data.dropEffect = "move";
				},
				dragLeave(node, data) {
					logLazy("dragLeave", null, 2000,
						"T1: dragOver: " + "data: " + data.dropEffect + "/" + data.effectAllowed +
						", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed);

				},
				dragDrop: function(node, data) {
					/* This function MUST be defined to enable dropping of items on
					  * the tree.
					  */
					let newNode,
						transfer = data.dataTransfer,
						sourceNodes = data.otherNodeList,
						mode = data.dropEffect;

					node.debug("T1: dragDrop: effect=" + "data: " + data.dropEffect + "/" + data.effectAllowed +
						", dataTransfer: " + transfer.dropEffect + "/" + transfer.effectAllowed, data);

					if (data.hitMode === "after") {
						// If node are inserted directly after tagrget node one-by-one,
						// this would reverse them. So we compensate:
						sourceNodes.reverse();
					}
					if (data.otherNode) {
						// ignore mode, always move
						var oldParentNote = data.otherNode.parent;
						data.otherNode.moveTo(node, data.hitMode);
						// TODO: first call window.n3.storeService.moveNote!! - the same way change all other moveNote places!
						window.n3.storeService.moveNote(data.otherNode, oldParentNote).then(function() { });
						data.tree.render(true, false);
					} else if (data.files.length) {
						// Drop files
						for (let i = 0; i < data.files.length; i++) {
							let file = data.files[i];

							let newNodeData = window.n3.node.getNewNodeData();
							newNodeData.title = file.name;
							newNodeData.data.description = "<a href='#' data-fileName='aaa.pdf' data-attachment>" + file.name + "</a>";
							

							let newNode = node.addNode(newNodeData, data.hitMode);
							window.n3.storeService.addNote(newNode).then(function() { });
							// TODO: upload file!!!


							// let url = "'https://example.com/upload",
							//     formData = new FormData();

							// formData.append("file", transfer.files[0])
							// fetch(url, {
							//   method: "POST",
							//   body: formData
							// }).then(function() { /* Done. Inform the user */ })
							// .catch(function() { /* Error. Inform the user */ });
						}
					} else {
						// Drop a non-node
						let newNodeData = window.n3.node.getNewNodeData();
						let text = transfer.getData("text");
						var firstLine = text.split('\n')[0] || "";
						newNodeData.title = firstLine.trim();
						newNodeData.data.description = text;
						let newNode = node.addNode(newNodeData, data.hitMode);
						window.n3.storeService.addNote(newNode).then(function() { });

					}
					node.setExpanded();
				}
			}
		});

		if (!rootNodes || rootNodes.length == 0) {
			window.n3.node.add();
		}

		resolve();
	});

}
