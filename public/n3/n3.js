/*

TODO 

 - file structure changed
 - delete task - modal geht nicht zu
 - export als ZIP (semantic UI first)
 - link note, link task
 - change sttaus with comment ? task status change history
 - choose folder list (semantic UI first)
 - file strucure ändern - bei Google
 - priority: Is Important, Is urgent, like/don't like -  wie in amplenote, score todos (like amlenote...) opcja: push down (score manipulation) to DATE, push to top (score)
				Eisenhower Matrix - https://www.amplenote.com/blog/todo_list_auto_sorts_with_eisenhower_matrix
				https://todoist.com/de/help/articles/eisenhower-matrix-with-todoist
				new status: delagated (warten auf Antwort?)
 - ctrl-s to save - nach react
  - links von notes to tasks, notes to notes usw. - bacllinks anzeigen
 - file upload implmentieren - erst Drag & Drop in tree
 - versionnierung und dann save buttons entfernen -  - versions tylko dla description i title ale niezaleznie
 - Opcja move/copy task (dla note jest z drzewka)
 - Widok taskow lista: sortowanie, filtrowanie
 - Suche opcje: szukaj historie, szukaj skasowane
 - option: task veschieben zu andere note
 - davon PWA machen
 - Tags colors
 - changes log - welche nodes/tasks wurden geändert für nachverfolgung von Arbeit
 - better filters - save, add, remove 
 - recuring tasks? reopen? deadline? date - kann eine Woche/Monat/Jahr sein (von - bis) 
 - subtasks - checkliste	  
 - Ocr with tesseractjs
 - bulma theme ? better change to symantic UI  

	  
 - full filter options (filet completed/archived als beide oder nur eine)
 - close all nodes/expande all nodes utton fpr tree
 - dynamische grupierung
 - consolidate store events - gleiche events mit gleich wparameter müssen nicht wiederhol1t werden! - veielleicht brauche ich merhere asyncqueues? 
 - versionnierung alle Änderungen?
 - display orphan files als liste
 - daten strzuktur version einbauen --! - bei start konvertierung zum neue struktur!
	  --> noch besser: foldere mit versionnummer und in xml version nummer
	  --> nowy plik conf.json
 - timer - worjlking on Task/Node - wird in Journal siechtbar - mit kommentar option - wenn man nur auf kjunde starten und keine unteraufagbe angibt ->erst log 
 - https://yuku.takahashi.coffee/textcomplete/
 - tree- icon in tree
 - neue TAB "backlinks"
 - files
 - drag and drop files in tinymce
 - jpournal?
 - inbox?
 - personen?
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
		

*/


window.n3 = window.n3 || {};
window.n3.task = window.n3.task || {
	"tinymce": false,
	"validate": {},
	"priority": [
		{
			id: 1,
			text: "Low"
		},
		{
			id: 2,
			text: "Medium"
		},
		{
			id: 3,
			text: "High"
		}
	],
	"tagsList": [],
	"status": [
		{
			id: "TODO",
			intern: "TOBEDONE",
			text: "Todo",
			cssClass: "is-primary",
			icon: "",
			selected: true
		},
		{
			id: "DOING",
			intern: "TOBEDONE",
			text: "In Progress",
			cssClass: "is-primary",
			icon: ""
		},
		{
			id: "SCHEDULED",
			intern: "TOBEDONE",
			text: "Scheduled",
			cssClass: "is-primary",
			icon: ""
		},
		{
			id: "WAITING LABOR",
			intern: "TOBEDONE",
			text: "Waiting on person",
			cssClass: "is-primary",
			icon: ""
		},
		{
			id: "WAITING QS",
			intern: "TOBEDONE",
			text: "Waiting QS Installation",
			cssClass: "is-primary",
			icon: ""
		},
		{
			id: "WAITING PROD",
			intern: "TOBEDONE",
			text: "Waiting Prod installation",
			cssClass: "is-primary",
			icon: ""
		},
		{
			id: "DONE",
			intern: "DONE",
			text: "Done",
			cssClass: "is-outlined",
			icon: ""
		},
		{
			id: "CANCELED",
			intern: "DONE",
			text: "Canceled",
			cssClass: "is-danger is-outlined",
			icon: ""
		},
		{
			id: "ARCHIVED",
			intern: "DONE",
			text: "Archived",
			cssClass: "is-success",
			icon: "fas fa-check"
		}
	]
};
window.n3.node = window.n3.node || {
	"tinymce": false
};
window.n3.modal = window.n3.modal || {};
window.n3.ui = window.n3.ui || {};
window.n3.action = window.n3.action || {
	"handlers": {}
};

window.n3.localFolder = {};
window.n3.tasks = [];
window.n3.tabulator = false;

let searchService;
let storeService;

$(function() {

	window.n3.localFolder.init();

	window.n3.action.handlers["refresh-tasks"] = window.n3.refreshNodeTasksFilter;
	window.n3.action.handlers["activate-node"] = window.n3.action.activateNode;
	window.n3.action.handlers["searchresults-activate-node"] = window.n3.action.activateNodeFromSearchResults;
	window.n3.action.handlers["searchresults-open-task"] = window.n3.action.openTaskDetailsFromSaecrhResults;
	window.n3.action.handlers["choose-folder"] = window.n3.localFolder.select;
	window.n3.action.handlers["verify-folder"] = window.n3.localFolder.queryVerifyPermission;
	window.n3.action.handlers["add-node"] = window.n3.node.add;
	window.n3.action.handlers["add-task"] = window.n3.task.add;
	window.n3.action.handlers["dalete-task-confirm"] = window.n3.task.delete;
	window.n3.action.handlers["delete-node-confirm"] = window.n3.node.delete;
	window.n3.action.handlers["change-tab"] = window.n3.ui.changeTab;
	window.n3.action.handlers["open-modal"] = window.n3.ui.openModal;
	window.n3.action.handlers["open-dropdown"] = window.n3.ui.openDropDown;
	window.n3.action.handlers["save-task"] = window.n3.task.save;
	window.n3.action.handlers["close-dialog"] = window.n3.action.closeDialog;
	window.n3.action.handlers["open-modal-delete-task-confirm"] = window.n3.action.openModalDeleteTaskConfirm;
	window.n3.action.handlers["taskeditor-on-open"] = window.n3.modal.onOpenTaskDetails;
	window.n3.action.handlers["task-duration-validate"] = window.n3.task.validate.duration;
	window.n3.action.handlers["searchdialog-on-open"] = window.n3.ui.openSearchDialog;


	$(document).on("click", "[data-action]", function(event) {
		let targetElement = event.target || event.srcElement;
		let $trigger = this;
		let noteKey = undefined;
		let taskId = undefined;

		let $nodeDataOwner = targetElement.closest("[data-owner='node']");
		if ($nodeDataOwner && $nodeDataOwner.dataset.notekey) {
			noteKey = $nodeDataOwner.dataset.notekey;
		}

		let $ticketDataOwner = targetElement.closest("[data-owner='task']");
		if ($ticketDataOwner && $ticketDataOwner.dataset.notekey) {
			noteKey = $ticketDataOwner.dataset.notekey;
		}
		if ($ticketDataOwner && $ticketDataOwner.dataset.taskid) {
			taskId = $ticketDataOwner.dataset.taskid;
		}


		let action = $trigger.dataset.action;
		if (window.n3.action.handlers[action]) {
			if (window.n3.action.handlers[action](noteKey, taskId, $trigger)) {
				let $modal = $trigger.closest(".modal");
				if ($modal) {
					window.n3.modal.close($modal, true);
				}
			}
		}

	});

	$(document).on("blur", "[data-noteeditor] [name='title']", function() {
		let $nodeDataOwner = this.closest("[data-owner='node']");
		let noteKey = false;
		if ($nodeDataOwner && $nodeDataOwner.dataset.notekey) {
			noteKey = $nodeDataOwner.dataset.notekey;
		}
		if (noteKey) {
			let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);

			let newTitle = $(this).val();
			if (node.title != newTitle) {
				node.setTitle(newTitle);
				storeService.modifyNote(node, ["title"]).then(function() { });
			}
		}
	});



	// TODO: it doesn't work...'
	window.addEventListener("beforeunload", function(event) {
		window.n3.ui.onUnload(event);
	});

	window.n3.ui.initTaskTab();

});

window.n3.ui.onUnload = function(event) {
	let $nodeDataOwner = $("[data-owner='node']");
	let noteKey = $nodeDataOwner[0].dataset.notekey;

	let modifiedFields = [];

	let newTitle = $("[data-noteeditor] [name='title']").val();
	let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);

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

	storeService.modifyNote(node, modifiedFields).then(function() { });
}


window.n3.ui.openSearchDialog = function(noteKey, taskId, $trigger) {
	let $searchInput = $("[data-searchinput]", $($trigger));
	$searchInput.focus();
	let $resultsList = $("[data-searchresultslist]", $($trigger));
	$searchInput.on("keyup", function(event) {
		let e = event || window.event;

		let searchText = $(this).val();
		let searchResults = searchService.getIndex().search(searchText, { index: "content", enrich: true });
		$resultsList.html("");
		if (searchResults && searchResults.length > 0) {
			searchResults[0].result.forEach(function(searchResult) {
				let noteKey;
				if (searchResult.doc.type === "note") {
					noteKey = searchResult.id;
				} else {
					noteKey = searchResult.doc.noteKey;
				}
				let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
				let breadCrumb = window.n3.node.getNodeTitlePath(node, true);


				if (searchResult.doc.type === "note") {
					$resultsList.append("<div class='panel-block'><a href='#' class='is-active' data-action='searchresults-activate-node' data-owner='node' data-noteKey='" + searchResult.id + "'><span class='panel-icon'><span class='fancytree-icon'></span></span> " + searchResult.doc.title + "</a><div class='breadcrumb'>" + breadCrumb + "</div></div>");
				} else {
					$resultsList.append("<div class='panel-block'><a href='#' class='panel-block is-active' data-action='searchresults-open-task' data-owner='task' data-taskId='" + searchResult.id + "'><span class='panel-icon'><i class='fa-solid fa-list-check'></i></span> " + searchResult.doc.title + "</a><div class='breadcrumb'>" + breadCrumb + "</div></div>");
				}
			});
		}

	});

}

window.n3.ui.initTaskTab = function() {

	let html = "";

	window.n3.task.status.forEach(function(state) {
		html += " ";
		html += "<span class='tag " + (state.cssClass ? state.cssClass : "") + " '> <label class='checkbox' data-action='refresh-tasks'> <input type='checkbox' data-status='true' name='" + state.id + "' checked>";
		if (state.icon) {
			html += "	<span class='icon'>";
			html += "		<i class='" + state.icon + "'></i>";
			html += "	</span>";
		}
		html += "	<span> " + state.text + "</span>";
		html += "</label></span>";
	});


	$("[data-statusfilter]").html(html);
}


window.n3.task.add = function(noteKey, taskId, $trigger) {
	window.n3.modal.openTaskDetails({ noteKey: noteKey });
}


window.n3.action.openModalDeleteTaskConfirm = function(noteKey, taskId, $trigger) {
	window.n3.action.closeDialog(noteKey, taskId, $trigger)
	if (taskId) {
		let deleteTaskCondirmModal = document.getElementById("n3-delete-task-trigger");
		deleteTaskCondirmModal.dataset.notekey = noteKey;
		deleteTaskCondirmModal.dataset.taskid = taskId;
		window.n3.modal.open(deleteTaskCondirmModal);
	}
};

window.n3.action.closeDialog = function(noteKey, taskId, $trigger) {
	let $modal = $trigger.closest('.modal');
	window.n3.modal.close($modal, true);
}

window.n3.action.activateNodeFromSearchResults = function(noteKey, taskId, $trigger) {
	let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
	node.setActive();
	window.n3.action.closeDialog(noteKey, taskId, $trigger);
};

window.n3.action.openTaskDetailsFromSaecrhResults = function(noteKey, taskId, $trigger) {
	let task = window.n3.tasks.find(function(task) {
		return task.id == taskId
	});
	noteKey = task.noteKey;
	let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
	node.setActive();
	window.n3.modal.openTaskDetails({ id: taskId, noteKey: noteKey });
	window.n3.action.closeDialog(noteKey, taskId, $trigger);
}

window.n3.action.activateNode = function(noteKey) {
	let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
	node.setActive();
};

window.n3.ui.openDropDown = function(noteKey, taskId, $trigger) {
	$trigger.classList.toggle('is-active');
};


window.n3.ui.openModal = function(noteKey, taskId, $trigger) {
	let modal = $trigger.dataset.target;
	let $target = document.getElementById(modal);

	let $nodeDataOwner = $trigger.closest("[data-owner='node']");
	if ($nodeDataOwner && $nodeDataOwner.dataset.notekey) {
		$target.dataset.notekey = $nodeDataOwner.dataset.notekey;
	}

	let $ticketDataOwner = $trigger.closest("[data-owner='task']");
	if ($ticketDataOwner && $ticketDataOwner.dataset.notekey) {
		$target.dataset.notekey = $ticketDataOwner.dataset.notekey;
	}
	if ($ticketDataOwner && $ticketDataOwner.dataset.taskid) {
		$target.dataset.taskid = $ticketDataOwner.dataset.taskid;
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


window.n3.ui.changeTab = function(noteKey, taskId, $trigger) {
	let targetTabName = $trigger.dataset.target;
	$("[data-tab]").hide();
	let tab = $("[data-tabname='" + targetTabName + "']");
	tab.show();

	$("[data-tabtrigger]").removeClass("is-active");
	let $tabLi = $trigger.closest("[data-tabtrigger]");
	$($tabLi).addClass("is-active");
	if (tab[0].dataset.ontabopen) {
		executeFunctionByName(tab[0].dataset.ontabopen, window, $trigger);
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

window.n3.ui.onOpenTabTasks = function($trigger) {
	let $formTasktable = $("[data-form='tasks-table']");
	window.n3.task.getTagsFilter($formTasktable);
}

window.n3.node.delete = function(noteKey, taskId, $trigger) {
	var that = this;
	return new Promise(function(resolve, reject) {
		let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
		if (node.title === "root") {
			return;
		}
		let parentNode = node.parent;


		storeService.moveNoteToTrash(node).then(function() {

			// remove tasks from list
			node.visit(function(node) {

				let taskIndexToRemove = -1;
				do {
					taskIndexToRemove = window.n3.tasks.findIndex(function(task) {
						return task.noteKey == node.key
					});
					if (taskIndexToRemove > -1) {
						window.n3.tasks.splice(taskIndexToRemove, 1);
					}
				} while (taskIndexToRemove > -1);

			});

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
			});
		});
	} catch (err) {
		console.log(err);
		window.n3.modal.closeAll(true);
		document.getElementById("n3-folder-access-error").innerHTML = err;
		window.n3.modal.open(document.getElementById("n3-table-noAccessError-local-folder-modal"));
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
					$(".n3-no-localfolder").removeClass("n3-no-localfolder");
					searchService = new N3SearchServiceFlexSearch(dir);
					storeService = new N3StoreServiceFileSystem(dir, searchService);

					set("localFolder", dir).then(function() {
						window.n3.modal.closeAll();
					});

					window.n3.modal.closeAll(true);
					
					console.log("start iterating all notes");
					storeService.iterateNotesStore(function(note) {
						return new Promise(function(resolve, reject) {
							console.log("iterating note key " + note.key);
							searchService.addNote(note).then(function() {
								// just continue async
							});
							resolve();
						});
					}).then(function() {
						console.log("finish iterating all notes");
						
						storeService.loadNotes().then(function(rootNodes) {
							storeService.loadTasks().then(function(tasks) {
								window.n3.tasks.splice(0, window.n3.tasks.length, ...tasks);
								
								window.n3.tasks.forEach(function(task) {
									searchService.addTask(task).then(function() {
										// just continue async
									});
								});
								
								window.n3.initFancyTree(rootNodes).then(function() {
									window.n3.initTaskTable();
								
									// TODO init UI method?
									let form = $("[data-noteeditor]");
									window.n3.node.getNodeHTMLEditor(form).then(function(data) {
										resolve(true);
									});
								});
							});
						});
					});


				} else {
					window.n3.modal.closeAll(true);
					window.n3.modal.open(document.getElementById("n3-table-noAccessError-local-folder-modal"));
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
	if ($el instanceof jQuery) {
		$el = $el[0];
	}
	$el.classList.add("is-active");

	if ($el.dataset.onopen) {
		if (window.n3.action.handlers[$el.dataset.onopen]) {
			window.n3.action.handlers[$el.dataset.onopen](undefined, undefined, $el);
		}
	}

}

window.n3.modal.close = function($el, force) {
	if ($el.classList.contains("is-active") && ($el.dataset.preventclosemodal || force)) {
		$el.classList.remove("is-active");
	}
	$(document).off("keydown.closemodal");
}

window.n3.modal.closeAll = function(force) {
	(document.querySelectorAll(".modal.is-active") || []).forEach(($modal) => {
		window.n3.modal.close($modal, force);
	});
}

window.n3.node.getNewNodeData = function() {
	return {
		"key": crypto.randomUUID(),
		"title": "New note created on " + JSJoda.LocalDateTime.now().format(JSJoda.DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")),
		"data": {
			"creationDate": JSJoda.Instant.now().toString()
		}
	};
}

window.n3.node.add = function() {
	let node = $.ui.fancytree.getTree("[data-tree]").getActiveNode();
	if (!node) {
		node = $.ui.fancytree.getTree("[data-tree]").getRootNode();
	}

	let newNodeData = window.n3.node.getNewNodeData();
	let newNode = node.addNode(newNodeData, "child");
	newNode.setActive();
	storeService.addNote(newNode).then(function() { });
}

window.n3.node.activateNode = function(node) {
	return new Promise(function(resolve) {

		let $nodeDataOwner = $("[data-owner='node']");
		$nodeDataOwner[0].dataset.notekey = node.key;

		window.n3.refreshNodeTasksFilter(node.key).then(function() { });

		let form = $("[data-noteeditor]");

		$("[name='title']", form).val(node.title);
		var description = ((node || {}).data || {}).description || "";
		storeService.loadImages("node", node.key, description).then(function(htmlText) {
			window.n3.node.getNodeHTMLEditor(form).then(function(htmlEditor) {
				htmlEditor.setContent(htmlText);
				htmlEditor.setDirty(false);
				resolve();
			});
		});

		let $badge = $("[data-notebadge]");
		if (description.length > 0) {
			$badge.show();
			$("span", $badge).html(prettyBytes(description.length));
		} else {
			$badge.hide();
		}

	});
}

window.n3.task.getTagsFilter = function(form) {
	if (!window.n3.task.tagsFilter) {
		let tagsInput = $('[name="tags"]', form);
		window.n3.task.tagsFilter = new Tagify(tagsInput[0],
			{
				whitelist: window.n3.task.tagsList.concat([{ value: "Ignore tags", color: "green" }]),
				editTags: false,
				userInput: false,
				/*transformTag: function(tagData) {
					tagData.color = getRandomColor();
				},*/
				dropdown: {
					enabled: 0,              // show the dropdown immediately on focus
					closeOnSelect: true,          // keep the dropdown open after selecting a suggestion
					highlightFirst: true
				}
			}
		);
		window.n3.task.tagsFilter.on('change', function() {
			window.n3.refreshNodeTasksFilter();
		});
		window.n3.task.tagsFilter.removeAllTags();
		window.n3.task.tagsFilter.addTags(window.n3.task.tagsList.concat([{ value: "Ignore tags", color: "green" }]));
	}
	window.n3.task.tagsFilter.whitelist = window.n3.task.tagsList.concat([{ value: "Ignore tags", color: "green" }]);
	return window.n3.task.tagsFilter;
}

/*// generate a random color (in HSL format, which I like to use)
function getRandomColor(){
	function rand(min, max) {
		return min + Math.random() * (max - min);
	}

	let h = rand(1, 360)|0,
		s = rand(40, 70)|0,
		l = rand(65, 72)|0;

	return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}*/
window.n3.refreshNodeTasksFilter = function(noteKey, taskId, trigger) {

	return new Promise(function(resolve) {
		let form = $("[data-form='tasks-table']");
		if (!noteKey) {
			if (!trigger) {
				trigger = form[0];
			}
			let $nodeDataOwner = trigger.closest("[data-owner='node']");
			if ($nodeDataOwner && $nodeDataOwner.dataset.notekey) {
				noteKey = $nodeDataOwner.dataset.notekey;
			}

			let $ticketDataOwner = trigger.closest("[data-owner='task']");
			if ($ticketDataOwner && $ticketDataOwner.dataset.notekey) {
				noteKey = $ticketDataOwner.dataset.notekey;
			}
		}

		let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);

		let childrenTasks = $("[name='children']", form).prop("checked");

		let chosenStatus = [];
		$("[data-status='true']", form).each(function(index) {
			if ($(this).prop("checked")) {
				chosenStatus.push($(this).attr("name"));
			}
		});

		let tags = window.n3.task.getTagsFilter(form).value;


		let childrenNodesKeys = [node.key];
		if (childrenTasks) {
			childrenNodesKeys = collectChildrenNodesKeys(node);

			function collectChildrenNodesKeys(node) {
				let childrenKeys = [];
				childrenKeys.push(node.key);
				if (node.children) {
					for (let i = 0; i < node.children.length; i++) {
						childrenKeys = childrenKeys.concat(collectChildrenNodesKeys(node.children[i]));
					}
				}
				return childrenKeys;
			}
		}
		
		if (window.n3.tabulator) {
			window.n3.tabulator.setFilter(function(data, filterParams) {
				//data - the data for the row being filtered
				//filterParams - params object passed to the filter
	
				let passed = filterParams.childrenNodesKeysJoined.indexOf("|" + data.noteKey + "|") > -1;
				passed = passed && filterParams.chosenStatusJoined.indexOf("|" + data.status + "|") > -1;
	
				let ignoreTags = filterParams.tags.some(function(filterTag) {
					return filterTag.value == "Ignore tags";
				});
	
				let hasTage = ignoreTags || data.tags.some(function(taskTag) {
					return filterParams.tags.some(function(filterTag) {
						return taskTag.value == filterTag.value;
					});
				});
				passed = passed && hasTage;
	
				return passed;
			}, {
				chosenStatusJoined: "|" + chosenStatus.join("|") + "|",
				childrenNodesKeysJoined: "|" + childrenNodesKeys.join("|") + "|",
				tags: tags
			});
		}
		resolve();
	});
}

window.n3.ui.displayBreadCrumb = function(node, $el) {
	$el.html(window.n3.node.getNodeTitlePath(node));
}

// noLinks - in Bulma gibt es keine BredCrumb ohne Links...
window.n3.node.getNodeTitlePath = function(node, noLinks) {
	let breadCrumbs = "";
	let pathNode = node;
	while (pathNode && pathNode.title !== "root") {
		let breadCrumbNote = "<li " + (pathNode.key == node.key ? " class='is-active' " : "") + ">";
		//if (!noLinks) {
		breadCrumbNote += "<a " + (pathNode.key == node.key ? " aria-current='page' " : " data-owner='node' ") + " href='#' data-action='activate-node' data-noteKey='" + pathNode.key + "'>";
		//}
		breadCrumbNote += pathNode.title;
		//if (!noLinks) {
		breadCrumbNote += "</a>";
		//}
		breadCrumbNote += "</li>";

		breadCrumbs = breadCrumbNote + breadCrumbs;
		pathNode = pathNode.parent;
	}
	breadCrumbs = "<ul>" + breadCrumbs + "</ul>"
	return breadCrumbs;
}



window.n3.initTaskTable = function() {

	window.n3.tabulator = new Tabulator("[data-tasks]", {
		reactiveData: true, //enable reactive data
		data: window.n3.tasks,
		layout: "fitColumns",
		height: "500px",
		// movableRows: true, //enable user movable rows
		columns: [
			{
				title: "Status",
				field: "status",
				maxWidth: 200,
				formatter: function(cell, formatterParams, onRendered) {
					//cell - the cell component
					//formatterParams - parameters set for the column
					//onRendered - function to call when the formatter has been rendered

					let rowElement = cell.getRow().getElement();
					let status = window.n3.task.status.find(function(status) {
						return status.id == cell.getValue()
					});
					rowElement.dataset.internstatus = status.intern;

					onRendered(function() {
						let tagElement = $(".tag", cell.getElement());

						let instanceTippy = tippy(tagElement[0], {
							content: function(trigger) {

								let html = "";
								html += "<div class='notification n3-notification'><button class='delete'></button><div data-choosestatus class='tags'>";
								window.n3.task.status.forEach(function(state) {
									html += " ";
									html += "<span data-state='" + state.id + "' class='tag " + (state.cssClass ? state.cssClass : "") + " '> ";
									if (state.icon) {
										html += "	<span class='icon'>";
										html += "		<i class='" + state.icon + "'></i>";
										html += "	</span>";
									}
									html += "	<span> " + state.text + "</span>";
									html += "</span>";
								});
								html += "</div></div>";

								return html;
							},
							allowHTML: true,
							theme: 'light-border',
							trigger: 'click',
							interactive: true,
							placement: 'bottom',
							appendTo: document.body
						});


						$(instanceTippy.popper).on("click mousedown", ".tag", function(event) {
							event.stopPropagation && event.stopPropagation();
							event.preventDefault && event.preventDefault();

							let state = this.dataset.state;
							cell.setValue(state, false);

							storeService.modifyTask(cell.getData()).then(function() {
								instanceTippy.hide();
							});

						});

						$(instanceTippy.popper).on("click mousedown", ".delete", function(event) {
							event.stopPropagation && event.stopPropagation();
							event.preventDefault && event.preventDefault();
							instanceTippy.hide();
						});

						// ignore click row
						$(".tag", cell.getElement()).on("mousedown click", function(event) {
							event.stopPropagation && event.stopPropagation();
							event.preventDefault && event.preventDefault();
						});
					});

					let state = window.n3.task.status.find(function(status) {
						return status.id == cell.getValue()
					});

					let html = "";
					html += "<span class='tag " + (state.cssClass ? state.cssClass : "") + " '>";
					if (state.icon) {
						html += "	<span class='icon'>";
						html += "		<i class='" + state.icon + "'></i>";
						html += "	</span>";
					}
					html += "	<span> " + state.text + "</span>";
					html += "</span>";

					return html;
				},
			},
			{
				title: "Title",
				field: "title",
				tooltip: true,
				formatter: function(cell, formatterParams, onRendered) {
					//cell - the cell component
					//formatterParams - parameters set for the column
					//onRendered - function to call when the formatter has been rendered
					let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(cell.getData().noteKey);
					return "<div class='n3title'>" + cell.getValue() + "</div><div class='breadcrumb n3-breadcrumb'>" + window.n3.node.getNodeTitlePath(node) + "</div>"; //return the contents of the cell;
				}
			},
			{
				title: "Prio",
				field: "priority",
				maxWidth: 100,
				tooltip: true,
				formatter: function(cell, formatterParams, onRendered) {
					//cell - the cell component
					//formatterParams - parameters set for the column
					//onRendered - function to call when the formatter has been rendered

					onRendered(function() {
						let rowElement = cell.getRow().getElement();
						rowElement.dataset.priority = cell.getValue();
					});

					// convert old values TODO remove it
					let priority = window.n3.task.priority.find(function(priority) {
						return priority.id == cell.getValue()
					});
					return "<div class='n3priority'>" + priority.text + "</div>"; //return the contents of the cell;
				}
			},
			{
				title: "Tags",
				field: "tags",
				maxWidth: 250,
				formatter: function(cell, formatterParams, onRendered) {
					//cell - the cell component
					//formatterParams - parameters set for the column
					//onRendered - function to call when the formatter has been rendered

					onRendered(function() {
						let tagify = new Tagify($("input", cell.getElement())[0],
							{
								editTags: false,
								userInput: false
							}
						);
						tagify.addTags(cell.getValue());
					});
					return "<input class='input is-static' name='tags' readonly value=''>";
				}
			}
		],
		persistence: {
			sort: true, //persist column sorting
			// filter: true, //persist filter sorting
			// group: true, //persist row grouping
			// page: true, //persist page
			// columns: true, //persist columns
		}
	});

	window.n3.tabulator.on("rowClick", function(event, row) {

		// click on done? then don't open modal'
		// it's because event.stopPropagation(); on cellClick doesn't work...
		let targetElement = event.target || event.srcElement;
		if (targetElement.tagName == "svg" || targetElement.tagName == "path" ||
			$(targetElement).attr("tabulator-field") == "done") {
			return;
		}

		let rowData = row.getData();
		window.n3.modal.openTaskDetails(rowData);

	});

	window.n3.tabulator.on("dataFiltered", function(filters, rows) {
		//filters - array of filters currently applied
		//rows - array of row components that pass the filters
		let $badge = $("[data-tasksbadge]");
		if (rows.length > 0) {
			$badge.show();
			$("span", $badge).html(rows.length);
		} else {
			$badge.hide();
		}
	});


}

window.n3.node.getNodeHTMLEditor = function(form) {

	return new Promise(function(resolve) {
		if (window.n3.node.tinymce) {
			resolve(window.n3.node.tinymce);
			return;
		}

		let specialChars = [
			{ text: "exclamation mark", value: "!" },
			{ text: "at", value: "@" },
			{ text: "hash", value: "#" },
			{ text: "dollars", value: "$" },
			{ text: "percent sign", value: "%" },
			{ text: "caret", value: "^" },
			{ text: "ampersand", value: "&" },
			{ text: "asterisk", value: "*" }
		];


		tinymce.init({
			target: $("[name='description']", form)[0],
			menubar: false,
			toolbar_sticky: true,
			min_height: 400,

			inline_boundaries: false,
			plugins: [
				"advlist", "autolink", "lists", "link", "image", "charmap", "preview",
				"anchor", "searchreplace", "visualblocks", "code", "fullscreen",
				"insertdatetime", "media", "table", "code", "help", "wordcount",
				"autoresize"
			],
			toolbar: "undo redo | formatselect | " +
				"bold italic backcolor | alignleft aligncenter " +
				"alignright alignjustify | bullist numlist outdent indent | " +
				"removeformat | code",
			powerpaste_word_import: "clean",
			powerpaste_html_import: "clean",
			block_unsupported_drop: false,
			setup: function(editor) {

				editor.on("blur", function(e) {
					if (editor.isDirty()) {

						let $nodeDataOwner = $(editor.getContainer()).closest("[data-owner='node']");
						let noteKey = $nodeDataOwner[0].dataset.notekey;

						let currentNode = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
						currentNode.data.description = editor.getContent();
						storeService.modifyNote(currentNode, ["description"]).then(function() { });
						editor.setDirty(false);
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



				/* An autocompleter that allows you to insert special characters */
				/*
				
				****************************************************************************************
				TODO: 
				1. link to page autocomplter
				2. backlinks!!
				
				
				let getMatchedChars = function(pattern) {
					return specialChars.filter(function(char) {
						return char.text.indexOf(pattern) !== -1;
					});
				};

				editor.ui.registry.addAutocompleter("specialchars", {
					ch: '#",
					minChars: 1,
					columns: "auto",
					onAction: function(autocompleteApi, rng, value) {
						editor.selection.setRng(rng);
						editor.insertContent(value);
						autocompleteApi.hide();
					},
					fetch: function(pattern) {
						return new Promise(function(resolve) {
							let results = getMatchedChars(pattern).map(function(char) {
								return {
									type: "autocompleteitem",
									value: char.value,
									text: char.text,
									icon: char.value
								}
							});
							resolve(results);
						});
					}
				});
				
				*/
			}
		}).then(function(editor) {
			window.n3.node.tinymce = editor[0];
			resolve(window.n3.node.tinymce);
		});
	});
}

window.n3.task.delete = function(noteKey, taskId, $trigger) {
	let taskToRemoveIndex = window.n3.tasks.findIndex(function(task) {
		return task.id == taskId
	});

	let removedTasks = window.n3.tasks.splice(taskToRemoveIndex, 1);

	removedTasks.forEach(function(task) {
		storeService.moveTaskToTrash(task).then(function() {
			window.n3.tabulator.refreshFilter();
		});
	});
	let $modal = $trigger.closest('.modal');
	window.n3.modal.close($modal, true);

};


window.n3.task.getTagsEditor = function(form) {
	if (!window.n3.task.tagsEditor) {
		let tagsInput = $('[name="tags"]', form);
		window.n3.task.tagsEditor = new Tagify(tagsInput[0],
			{
				whitelist: window.n3.task.tagsList,
				editTags: false,
				dropdown: {
					enabled: 0,              // show the dropdown immediately on focus
					closeOnSelect: true,          // keep the dropdown open after selecting a suggestion
					highlightFirst: true
				}
			}
		);
	}
	window.n3.task.tagsEditor.whitelist = window.n3.task.tagsList;
	return window.n3.task.tagsEditor;
}

window.n3.task.getTaskHTMLEditor = function(form) {
	return new Promise(function(resolve) {
		if (window.n3.task.tinymce) {
			resolve(window.n3.task.tinymce);
			return;
		}

		tinymce.init({
			target: $("[name='description']", form)[0],
			menubar: false,
			toolbar_sticky: true,
			inline_boundaries: false,
			plugins: [
				"advlist", "autolink", "lists", "link", "image", "charmap", "preview",
				"anchor", "searchreplace", "visualblocks", "code", "fullscreen",
				"insertdatetime", "media", "table", "code", "help", "wordcount"
			],
			toolbar: "undo redo | formatselect | " +
				"bold italic backcolor | alignleft aligncenter " +
				"alignright alignjustify | bullist numlist outdent indent | " +
				"removeformat | code",
			powerpaste_word_import: "clean",
			powerpaste_html_import: "clean",
			block_unsupported_drop: false,
			setup: function(editor) {

				editor.on("PreProcess", function(e) {
					let imgs = $("img", e.node);
					imgs.each(function() {
						if (!this.dataset.n3src && (this.src.indexOf("data:image/") > -1 || this.src.indexOf("blob:") > -1)) {
							let fileExt = "png"; // this.src.substring(11, 14);
							this.dataset.n3src = "image_" + crypto.randomUUID() + "." + fileExt;
						}
					});
				});
			}
		}).then(function(editor) {
			window.n3.task.tinymce = editor[0];
			resolve(window.n3.task.tinymce);
		});
	});
}


window.n3.task.getStatusEditor = function(form, taskStatus) {
	if (!taskStatus) {
		return window.n3.task.statusEditor;
	}
	window.n3.task.statusEditor = $("[name='status']", form);
	window.n3.task.statusEditor.on("change", function(event) {

		let inputStatus = $(this).val();
		let state = window.n3.task.status.find(function(status) {
			return status.id == inputStatus
		});

		let html = "";
		html += "<span class='tag " + (state.cssClass ? state.cssClass : "") + " '>";
		if (state.icon) {
			html += "	<span class='icon'>";
			html += "		<i class='" + state.icon + "'></i>";
			html += "	</span>";
		}
		html += "	<span> " + state.text + "</span>";
		html += "</span>";

		let existingTagEl = $(".tag", window.n3.task.statusEditor.parent());
		if (existingTagEl.length > 0) {
			existingTagEl.replaceWith(html);
		} else {
			window.n3.task.statusEditor.after(html);
		}

		let instanceTippy = tippy($(".tag", window.n3.task.statusEditor.parent())[0], {
			content: function(trigger) {

				let html = "";
				html += "<div class='notification'><button class='delete'></button><div data-choosestatus class='tags'>";
				window.n3.task.status.forEach(function(state) {
					html += " ";
					html += "<span data-state='" + state.id + "' class='tag " + (state.cssClass ? state.cssClass : "") + " '> ";
					if (state.icon) {
						html += "	<span class='icon'>";
						html += "		<i class='" + state.icon + "'></i>";
						html += "	</span>";
					}
					html += "	<span> " + state.text + "</span>";
					html += "</span>";
				});
				html += "</div></div>";

				return html;
			},
			allowHTML: true,
			theme: 'light-border',
			trigger: 'click',
			interactive: true,
			placement: 'bottom',
			appendTo: document.body
		});


		$(instanceTippy.popper).on("click mousedown", ".tag", function(event) {
			event.stopPropagation && event.stopPropagation();
			event.preventDefault && event.preventDefault();

			let state = this.dataset.state;
			window.n3.task.statusEditor.val(state).trigger("change");

			instanceTippy.hide();
		});

		$(instanceTippy.popper).on("click mousedown", ".delete", function(event) {
			event.stopPropagation && event.stopPropagation();
			event.preventDefault && event.preventDefault();
			instanceTippy.hide();
		});
	});

	window.n3.task.statusEditor.val(taskStatus).trigger("change");


	return window.n3.task.statusEditor;
}

window.n3.modal.openTaskDetails = function(task) {
	let taskDetailsModal = $("#n3-task-details");

	let $ticketDataOwner = taskDetailsModal.closest("[data-owner='task']");
	if (task.id) {
		$ticketDataOwner[0].dataset.taskid = task.id;
	} else {
		delete $ticketDataOwner[0].dataset.taskid;
	}
	if (task.noteKey) {
		$ticketDataOwner[0].dataset.notekey = task.noteKey;
	} else {
		delete $ticketDataOwner[0].dataset.notekey;
	}
	window.n3.modal.open(taskDetailsModal);// todo .then?
}

window.n3.modal.onOpenTaskDetails = function(noteKey, taskId, targetElement) {
	return new Promise(function(resolve) {
		let ticketDataOwner = targetElement.closest("[data-owner='task']");
		let noteKey = ticketDataOwner.dataset.notekey;
		let taskId = ticketDataOwner.dataset.taskid;

		let form = $("[data-taskeditor]");

		let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
		window.n3.ui.displayBreadCrumb(node, $("[data-breadcrumb]", form));

		if (!taskId) {
			// Add task
			$("[name='title']", form).val("");
			$("[name='priority']", form).val("2");
			$("[name='tags']", form).val();
			$("[name='duration']", form).val("");

			window.n3.task.getTagsEditor(form).removeAllTags();
			window.n3.task.getStatusEditor(form, "TODO");
			window.n3.task.getTaskHTMLEditor(form).then(function(editor) {
				editor.setContent("");
				resolve();
			});
		} else {
			// Edit task
			let task = window.n3.tasks.find(function(task) {
				return task.id == taskId
			});

			$("[name='title']", form).val(task.title);
			$("[name='priority']", form).val(task.priority || "2");
			window.n3.task.getTagsEditor(form).removeAllTags();
			window.n3.task.getTagsEditor(form).addTags(task.tags);
			window.n3.task.getStatusEditor(form, task.status);
			$("[name='duration']", form).val(task.duration || "");

			storeService.loadImages("task", task.id, (task || {}).description || "").then(function(htmlText) {
				window.n3.task.getTaskHTMLEditor(form).then(function(htmlEditor) {
					htmlEditor.setContent(htmlText);
					htmlEditor.setDirty(false);
					resolve();
				});
			});
		}
	});
}


window.n3.task.validate.duration = function(form, el) {
	let $el = $(el);
	let duration = $el.val();
	if (duration == "") {
		return true;
	}
	let $validationMessage = $el.closest(":has([data-validate-massage)").find("[data-validate-massage='true']");
	let valid = parseDuration(duration);
	if (!valid) {
		$validationMessage.show();
	} else {
		$validationMessage.hide();
	}
	return valid;
}

window.n3.task.validate.form = function(form) {
	let validateFields = $("[data-validate]");
	let validForm = true;
	validateFields.each(function(index) {
		if (this.dataset.validate) {
			if (window.n3.action.handlers[this.dataset.validate]) {
				let valid = window.n3.action.handlers[this.dataset.validate](form, this);
				validForm = validForm && valid;
			}
		}
	});
	return validForm;
}

window.n3.task.save = function(noteKey, taskId, $trigger) {

	let form = $("[data-taskeditor]");
	if (!window.n3.task.validate.form(form)) {
		return false;
	}

	if (!taskId) {
		// it's add task from modal'

		let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
		if (!node) {
			node = $.ui.fancytree.getTree("[data-tree]").getRootNode();
		}

		if (node.title == "root") {
			// it's root and has no children, crate some first noto
			// ther's no nodes, add one
			let newNode = window.n3.node.getNewNodeData();
			node = node.addNode(newNode, "child");
			storeService.addNote(node).then(function() { });
		}

		let newTaskId = crypto.randomUUID();
		window.n3.task.getTaskHTMLEditor(form).then(function(editor) {
			let description = "";
			if (editor.isDirty()) {
				description = editor.getContent();
			}

			let newTask = {
				"id": newTaskId,
				"title": $("[name='title']", form).val(),
				"priority": $("[name='priority'] option:selected", form).val(),
				"duration": $("[name='duration']", form).val(),
				"noteKey": node.key,
				"tags": window.n3.task.getTagsEditor(form).value,
				"status": window.n3.task.getStatusEditor(form, undefined).val(),
				"description": description,
				"creationDate": JSJoda.Instant.now().toString()
			};

			storeService.addTask(newTask).then(function() {
				let newLength = window.n3.tasks.unshift(newTask);

				window.n3.task.getTagsEditor(form).value.forEach(function(tagToAdd) {
					let tagIndex = window.n3.task.tagsList.findIndex(function(existingTag) {
						return existingTag.value == tagToAdd.value
					});
					if (tagIndex == -1) {
						window.n3.task.tagsList.push(tagToAdd);
					}
				});

				window.n3.tabulator.refreshFilter();
				node.setActive();
			});
		});
	} else {
		// it's edit task from modal

		let task = window.n3.tasks.find(function(task) {
			return task.id == taskId
		});

		task.title = $("[name='title']", form).val() || "";
		window.n3.task.getTaskHTMLEditor(form).then(function(editor) {
			task.description = editor.getContent();
			task.status = window.n3.task.getStatusEditor(form, undefined).val(),
				task.priority = $("[name='priority'] option:selected", form).val();
			task.tags = window.n3.task.getTagsEditor(form).value;
			task.duration = $("[name='duration']", form).val();
			window.n3.task.getTagsEditor(form).value.forEach(function(tagToAdd) {
				let tagIndex = window.n3.task.tagsList.findIndex(function(existingTag) {
					return existingTag.value == tagToAdd.value
				});
				if (tagIndex == -1) {
					window.n3.task.tagsList.push(tagToAdd);
				}
			});

			storeService.modifyTask(task).then(function() {

				window.n3.tabulator.refreshFilter();

			});
		});
	}

	return true;
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
			source: rootNodes,
			lazyLoad: function(event, data) {
				data.result = new Promise(function(resolve, reject) {
					storeService.loadNotes(data.node.key).then(function(children) {
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
			extensions: ["dnd5"],
			nodata: false,
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
					$(".n3-app").removeClass("n3-no-nodes");
				} else {
					$(".n3-app").addClass("n3-no-nodes");
				}*/

				if (data.tree.rootNode.children.length > 0) {
					data.tree.activateKey(data.tree.rootNode.children[0].key);
				} else {
					$(".n3-app").addClass("n3-no-nodes");
				}
			},
			modifyChild: function(event, data) {
				// bei remove - data.tree.rootNode.children is not yet actuall
				if (data.operation == "remove" && data.node.title == "root") {
					$(".n3-app").addClass("n3-no-nodes");
				}/* else if (data.operation != "remove" && data.tree.rootNode.children.length > 0) {
					// on add new node, when there is no statusNodeType !== "nodata" node
					$(".n3-app").removeClass("n3-no-nodes");
				}*/
			},
			// --- Node events -------------------------------------------------			
			activate: function(event, data) {
				$(".n3-app").removeClass("n3-no-nodes");
				if (data.node.key !== "_1") {
					window.n3.node.activateNode(data.node).then(function() { });
				} else {
					window.n3.tabulator.setFilter("noteKey", "=", "HIDE_ALL_TASKS_THIS_NODE_KEY_DOES_NOT_EXISTS");
				}
			},
			expand: function(event, data, a, b) {
				storeService.expandNote(data.node, true);
			},
			collapse: function(event, data) {
				storeService.expandNote(data.node, false);
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
				let $spanTitle = $(".fancytree-title", data.node.span);

				let childrenNodesKeys = "|" + collectChildrenNodesKeys(data.node).join("|") + "|";

				let tasksAmount = window.n3.tasks.reduce(function(sum, task) {
					let updatedSum = sum;

					let status = window.n3.task.status.find(function(status) {
						return status.id == task.status
					});

					if (childrenNodesKeys.indexOf("|" + task.noteKey + "|") > -1 && status.intern == "TOBEDONE") {
						updatedSum++;
					}
					return updatedSum;
				}, 0);

				if (tasksAmount > 0) {
					$spanTitle.append(" <span class='n3-title-info'>[" + tasksAmount + "]</span>");
				}

				function collectChildrenNodesKeys(node) {
					let childrenKeys = [];
					childrenKeys.push(node.key);
					if (node.children) {
						for (let i = 0; i < node.children.length; i++) {
							childrenKeys = childrenKeys.concat(collectChildrenNodesKeys(node.children[i]));
						}
					}
					return childrenKeys;
				}
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
						// TODO: first call storeService.moveNote!! - the same way change all other moveNote places!
						storeService.moveNote(data.otherNode, oldParentNote).then(function() { });
					} else if (data.files.length) {
						// Drop files
						for (let i = 0; i < data.files.length; i++) {
							let file = data.files[i];

							let newNodeData = window.n3.node.getNewNodeData();
							newNodeData.title = "'" + file.name + "' (" + file.size + " bytes)";

							let newNode = node.addNode(newNodeData, data.hitMode);
							storeService.addNote(newNode).then(function() { });
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
						storeService.addNote(newNode).then(function() { });

					}
					node.setExpanded();
				}
			}
		});

		resolve();
	});

}




