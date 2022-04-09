/*

 - TODO: window.n3.task.validate.duration zum ende machen
 Usunax odwolania so js merhod z index.hrml zamienic handler
 
Status - interne werte: tobedone, done
Done- style in table - durchgesrrichen, xolor light


 
 - prio ändern -> style of title ist immer noch alt aber von prio column ist korrekt
  - bei tasb immer rechts miniatur anzeige: bei note die liste von Tasks (als liste ohne filter)
  		bei tasks - miniature note text - zuklappbar
 - file strucure ändern: /data /cache /archive /archive/history /archive/tasks /deleted
 - volltext Suche!!!!
https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-statuses-priorities-and-resolutions/
	STATUS (WORFLOW): DONE|ARCHIVED -
		done sagt niht was z umachen ist, 
		Status soll sagen was zu machen ist: TODO, WORKING ON, Cancelled (das ist resolution?), Closed
	resolutions: 

 bold in tree auf nodes with tasks
 - versionnierung und dann save buttons entfernen
 - option: task veschieben zu andere note
 - davon PWA machen
 - Note tab bold markieren wenn eine Bescheibung gibt!
    dazu: wie viele wörte/Bilder
    Tasks auch bold machen wenn Taskjs gibt
 - copy/paste images from outlook - die sind über file:// erreichbar - herunterladen, speichern, ersetzen
 - move done in table to title column and replace with pretty checkboix
 - new design für task modal
 - Tags colors
 - task tab - add note button
 - rename images to image_UUIUIUZIU.png
 - changes log - welche nodes/tasks wurden geändert für nachverfolgung von Arbeit
 - full text search: lunrjs, elasticlunr.js 
 - node description und alle attributen die nicht in tree gezeigt werden in anderen datein spreichern, Descriuptio nist zu lang
 - better filters - save, add, remove 
 - recuring tasks? reopen? deadline? date - kann eine Woche/Monat/Jahr sein (von - bis) 
 - subtasks - checkliste	  

 

	  
 - full filter options (filet completed/archived als beide oder nur eine)
 - close all nodes/expande all nodes utton fpr tree
 - pretty checkboxes für done
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
window.n3.store = window.n3.store || {};
window.n3.task = window.n3.task || {
	"tinymce": false,
	"validate": {}, 
	"priorites": {
		1: "Low",
		2: "Medium",
		3: "High"
	},
	"tagsList": [],
	"status": [
		{
			id: "TODO",
			text: "Todo",
			cssClass: "is-primary",
			icon: "",
			selected: true
		},
		{
			id: "DOING",
			text: "In Progress",
			cssClass: "is-primary",
			icon: ""
		},
		{
			id: "SCHEDULED",
			text: "Scheduled",
			cssClass: "is-primary",
			icon: ""
		},
		{
			id: "WAITING LABOR",
			text: "Waiting on person",
			cssClass: "is-primary",
			icon: ""
		},
		{
			id: "WAITING QS",
			text: "Waiting QS Installation",
			cssClass: "is-primary",
			icon: ""
		},
		{
			id: "WAITING PROD",
			text: "Waiting Prod installation",
			cssClass: "is-primary",
			icon: ""
		},
		{
			id: "CANCELED",
			text: "Canceled",
			cssClass: "is-danger is-outlined",
			icon: ""
		},
		{
			id: "ARCHIVED",
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

window.n3.localFolder = {
	"dir": false
};
window.n3.tasks = [];
window.n3.tabulator = false;

window.n3.events = {
	"listeners": {}
};


$(function() {
	
	window.n3.localFolder.init();

	// ESC - close all modalas and dropDowns
	$(document).on("keydown", function(event) {
		var e = event || window.event;

		if (e.keyCode === 27) { // Escape key
			/*window.n3.modal.closeAll();*/
			window.n3.ui.closeAllDropdowns();
		}
	});

	window.n3.action.handlers["refresh-tasks"] = window.n3.refreshNodeTasksFilter;
	window.n3.action.handlers["activate-node"] = window.n3.action.activateNode;
	window.n3.action.handlers["choose-folder"] = window.n3.localFolder.choose;
	window.n3.action.handlers["verify-folder"] = window.n3.localFolder.queryVerifyPermission;
	window.n3.action.handlers["add-node"] = window.n3.node.add;
	window.n3.action.handlers["save-node"] = window.n3.node.save;
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

	$(document).on("click", "[data-action]", function(event) {
		var targetElement = event.target || event.srcElement;
		var $trigger = this;
		var nodeKey = undefined;
		var taskId = undefined;

		var $nodeDataOwner = targetElement.closest("[data-owner='node']");
		if ($nodeDataOwner && $nodeDataOwner.dataset.nodekey) {
			nodeKey = $nodeDataOwner.dataset.nodekey;
		}

		var $ticketDataOwner = targetElement.closest("[data-owner='task']");
		if ($ticketDataOwner && $ticketDataOwner.dataset.nodekey) {
			nodeKey = $ticketDataOwner.dataset.nodekey;
		}
		if ($ticketDataOwner && $ticketDataOwner.dataset.taskid) {
			taskId = $ticketDataOwner.dataset.taskid;
		}


		var action = $trigger.dataset.action;
		if (window.n3.action.handlers[action]) {
			if (window.n3.action.handlers[action](nodeKey, taskId, $trigger)) {
				var $modal = $trigger.closest(".modal");
				if ($modal) {
					window.n3.modal.close($modal, true);
				}
			}
		}

	});

	$(document).on("blur", "[data-noteeditor='true'] [name='title']", function() {
		var $nodeDataOwner = this.closest("[data-owner='node']");
		var nodeKey = false;
		if ($nodeDataOwner && $nodeDataOwner.dataset.nodekey) {
			nodeKey = $nodeDataOwner.dataset.nodekey;
		}
		if (nodeKey) {
			window.n3.node.save(nodeKey, undefined, this);
		}
	});

	window.n3.events.addListener("nodeModified", window.n3.store.writeNodes);
	window.n3.events.addListener("taskModified", window.n3.store.writeNodeTasks);
	window.addEventListener("beforeunload", function(event) {
		var $nodeDataOwner = $("[data-owner='node']");
		var nodeKey = $nodeDataOwner[0].dataset.nodekey;

		window.n3.events.triggerEvent("nodeModified", {
			key: nodeKey
		});
	});
	window.addEventListener("unload", function(event) {
		var $nodeDataOwner = $("[data-owner='node']");
		var nodeKey = $nodeDataOwner[0].dataset.nodekey;

		window.n3.events.triggerEvent("nodeModified", {
			key: nodeKey
		});
	});
	
	window.n3.ui.initTaskTab();
	
});

window.n3.ui.initTaskTab = function() {
	
	var html = "";
	
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
	
	
	$("[data-statusfilter='true']").html(html);
}

window.n3.node.save = function(nodeKey, taskId, $trigger) {
	var node = $.ui.fancytree.getTree("[data-tree='true']").getNodeByKey(nodeKey);
	var modified = false;

	var form = $("[data-noteeditor='true']");

	var newTitle = $("[name='title']", form).val();
	if (node.title != newTitle) {
		node.setTitle(newTitle);
		modified = true;
	}
	window.n3.node.getNodeHTMLEditor(form).then(function(editor) {
		if (editor.isDirty()) {
			node.data.description = editor.getContent();
			modified = true;
		}
		if (modified) {
			window.n3.events.triggerEvent("nodeModified", {
				key: nodeKey
			});
		}
	});
}

window.n3.task.add = function(nodeKey, taskId, $trigger) {
	window.n3.modal.openTaskDetails({ nodeKey: nodeKey });
}


window.n3.action.openModalDeleteTaskConfirm = function(nodeKey, taskId, $trigger) {
	if (taskId) {
		var deleteTaskCondirmModal = document.getElementById("n3-delete-task-trigger");
		deleteTaskCondirmModal.dataset.nodekey = nodeKey;
		deleteTaskCondirmModal.dataset.taskid = taskId;
		window.n3.modal.open(deleteTaskCondirmModal);
	}
};

window.n3.action.closeDialog = function(nodeKey, taskId, $trigger) {
	var $modal = $trigger.closest('.modal');
	window.n3.modal.close($modal, true);
}

window.n3.action.activateNode = function(nodeKey) {
	var node = $.ui.fancytree.getTree("[data-tree='true']").getNodeByKey(nodeKey);
	node.setActive();
};

window.n3.ui.openDropDown = function(nodeKey, taskId, $trigger) {
	$trigger.classList.toggle('is-active');
};


window.n3.ui.openModal = function(nodeKey, taskId, $trigger) {
	var modal = $trigger.dataset.target;
	var $target = document.getElementById(modal);

	var $nodeDataOwner = $trigger.closest("[data-owner='node']");
	if ($nodeDataOwner && $nodeDataOwner.dataset.nodekey) {
		$target.dataset.nodekey = $nodeDataOwner.dataset.nodekey;
	}

	var $ticketDataOwner = $trigger.closest("[data-owner='task']");
	if ($ticketDataOwner && $ticketDataOwner.dataset.nodekey) {
		$target.dataset.nodekey = $ticketDataOwner.dataset.nodekey;
	}
	if ($ticketDataOwner && $ticketDataOwner.dataset.taskid) {
		$target.dataset.taskid = $ticketDataOwner.dataset.taskid;
	}

	window.n3.modal.open($target);
}


window.n3.ui.changeTab = function(nodeKey, taskId, $trigger) {
	var tab = $trigger.dataset.target;
	$("[data-istab='true']").hide();
	var tab = $("[data-tabname='" + tab + "']");
	tab.show();

	$("[data-tabtrigger='true']").removeClass("is-active");
	var $tabLi = $trigger.closest("[data-tabtrigger='true']");
	$($tabLi).addClass("is-active");
	if (tab[0].dataset.ontabopen) {
		executeFunctionByName(tab[0].dataset.ontabopen, window, $trigger);
	}
}

function executeFunctionByName(functionName, context /*, args */) {
	var args = Array.prototype.slice.call(arguments, 2);
	var namespaces = functionName.split(".");
	var func = namespaces.pop();
	for (var i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
	}
	return context[func].apply(context, args);
}

window.n3.ui.onOpenTabTasks = function($trigger) {
	var $formTasktable = $("[data-form='tasks-table']");
	window.n3.task.getTagsFilter($formTasktable);
}

window.n3.node.delete = function(nodeKey, taskId, $trigger) {
	var node = $.ui.fancytree.getTree("[data-tree='true']").getNodeByKey(nodeKey);
	if (node.title === "root") {
		return;
	}
	var parentNode = node.parent;
	// console.log("delete node, parentNode ", node, parentNode);

	var collectNodesKeysToDelete = [node.key];
	node.visit(function(node) {
		collectNodesKeysToDelete.unshift(node.key);
	});

	window.n3.store.deleteAllNodesTasks(collectNodesKeysToDelete).then(function() {
		var removedNodeKey = node.key;
		node.remove();
		window.n3.events.triggerEvent("nodeModified", {
			key: removedNodeKey
		});
		if (parentNode.title != "root") {
			parentNode.setActive();
		} else if (parentNode.children && parentNode.children.length > 0) {
			parentNode.children[0].setActive();
		}
	});
};


window.n3.store.loadImages = function(htmlTex) {


	return new Promise(function(resolve) {

		var $imagesHiddenContainer = $("<div />");
		$imagesHiddenContainer.html(htmlTex);

		var imgs = $("img", $imagesHiddenContainer);

		(function loopImages(i) {

			if (i >= imgs.length) {
				var htmlWithImages = $imagesHiddenContainer.html();
				resolve(htmlWithImages || "");
			} else {
				var nextImg = imgs[i];

				if (!nextImg.dataset.n3src) {
					loopImages(i + 1);
				} else {

					var filePath = nextImg.dataset.n3src;

					var dirs = filePath.split("/");
					var fileName = dirs.pop();

					window.n3.store.getDirectoryHandle(dirs, false).then(function(dirHandle) {
						dirHandle.getFileHandle(fileName).then(function(attachmentFileHandle) {
							attachmentFileHandle.getFile().then(function(fileData) {

								var reader = new FileReader();
								reader.addEventListener("load", function() {
									nextImg.src = reader.result;
									loopImages(i + 1);
								}, false);
								reader.readAsDataURL(fileData);

							});
						});
					});

				}
			}
		})(0);
	});
}

window.n3.store.writeAttachment = function(filePath, blobFile) {
	return new Promise(function(resolve) {

		var dirs = filePath.split("/");
		var fileName = dirs.pop();

		window.n3.store.getDirectoryHandle(dirs, true).then(function(dirHandle) {
			if (dirHandle) {
				dirHandle.getFileHandle(fileName, { create: true }).then(function(fileHandle) {
					fileHandle.createWritable().then(function(writable) {
						writable.write(blobFile).then(function() {
							writable.close().then(function() {
								resolve(true);
							}, function(err) {
								// no file
								resolve(false);
							});
						}, function(err) {
							// no file
							resolve(false);
						});
					}, function(err) {
						// no file
						resolve(false);
					});
				}, function(err) {
					// no file
					resolve(false);
				});
			} else {
				// no one of dirs
				resolve(false);
			}
		});

	});
}

window.n3.store.getDirectoryHandle = function(dirs, create) {
	return new Promise(function(resolve) {

		(function loopDirs(i, dirHandle) {

			if (i >= dirs.length) {
				resolve(dirHandle);
			} else {

				window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {
					localFolder.getDirectoryHandle(dirs[i], { create: create }).then(function(dirHandle) {
						loopDirs(i + 1, dirHandle);
					}, function(err) {
						resolve(false);
					});
				});

			}
		})(0, false);

	});
}


window.n3.store.fileExist = function(filePath) {
	return new Promise(function(resolve) {

		var dirs = filePath.split("/");
		var fileName = dirs.pop();

		window.n3.store.getDirectoryHandle(dirs, false).then(function(dirHandle) {
			if (dirHandle) {
				dirHandle.getFileHandle(fileName, { create: false }).then(function(fileHandle) {
					resolve(true);
				}, function(err) {
					// no file
					resolve(false);
				});
			} else {
				// no one of dirs
				resolve(false);
			}
		});

	});
}


window.n3.events.addListener = function(eventName, fn) {
	if (!window.n3.events.listeners[eventName]) {
		window.n3.events.listeners[eventName] = [];
	}
	window.n3.events.listeners[eventName].push(fn);
}





window.n3.store.asyncQueue = async.queue(function(task, callback) {
	task.fn().then(function() {
		callback();
	});

}, 1);

window.n3.store.asyncQueue.error(function(err, task) {
	console.error("task experienced an error", err, task);
});

// assign a callback
window.n3.store.asyncQueue.drain(function() {
	console.log("all items have been processed");
});

window.n3.events.triggerEvent = function(eventName, paramObj) {
	if (window.n3.events.listeners[eventName] && window.n3.events.listeners[eventName].length > 0) {

		window.n3.events.listeners[eventName].forEach(function(fun) {
			window.n3.store.asyncQueue.push({
				fn: function() {

					return new Promise(function(resolve) {
						fun(paramObj).then(function() {
							resolve();
						});

					});
				}
			});
		});
	}
}


window.n3.localFolder.getDirectoryHandle = function() {

	return new Promise(function(resolve) {

		if (window.n3.localFolder.dir) {
			resolve(window.n3.localFolder.dir);
		} else {
			get("localFolder").then(function(dir) {
				window.n3.localFolder.dir = dir;
				resolve(window.n3.localFolder.dir);
			}, function() {
				resolve(false);
			});
		}

	});
}

window.n3.localFolder.init = function() {
	if (!window.n3.localFolder.dir) {
		get("localFolder").then(function(dir) {
			if (dir) {
				window.n3.localFolder.dir = dir;
				document.getElementById("n3-folder-verify-foldername").innerHTML = window.n3.localFolder.dir.name;
				window.n3.modal.open(document.getElementById("n3-table-verify-local-folder-modal"));
			} else {
				window.n3.modal.open(document.getElementById("n3-table-choose-local-folder-modal"));
			}
		});
	} else {
		document.getElementById("n3-folder-verify-foldername").innerHTML = window.n3.localFolder.dir.name;
		window.n3.modal.open(document.getElementById("n3-table-verify-local-folder-modal"));
	}
}


window.n3.localFolder.choose = function() {

	try {
		window.n3.localFolder.dir = false;
		del("localFolder").then(function() {

			window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {

				if (!localFolder) {
					window.showDirectoryPicker({
						mode: "readwrite"
					}).then(function(dir) {
						window.n3.localFolder.dir = dir;
						window.n3.localFolder.queryVerifyPermission().then(function() { });
					});
				} else {
					window.n3.localFolder.queryVerifyPermission().then(function() { });
				}
			});
		});
	} catch (err) {
		console.log(err);
		window.n3.modal.closeAll(true);
		document.getElementById("n3-folder-access-error").innerHTML = err;
		window.n3.modal.open(document.getElementById("n3-table-noAccessError-local-folder-modal"));
	}
}


window.n3.localFolder.queryVerifyPermission = function() {
	return new Promise(function(resolve) {

		window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {
			window.n3.localFolder.verifyPermission(localFolder, true).then(function(granted) {
				if (granted) {

					set("localFolder", window.n3.localFolder.dir).then(function() {
						window.n3.modal.closeAll();
					});

					window.n3.modal.closeAll(true);

					window.n3.store.readAllData().then(function(tree) {
						$(".n3-no-localfolder").removeClass("n3-no-localfolder");
						window.n3.initTaskTable();
						window.n3.initFancyTree(tree);
						resolve(true);
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
	if ($el.dataset.onopen) {
		if (window.n3.action.handlers[$el.dataset.onopen]) {
			window.n3.action.handlers[$el.dataset.onopen](undefined, undefined, $el);
		}
	}
	
	$el.classList.add("is-active");
}

window.n3.modal.close = function($el, force) {
	if ($el.classList.contains("is-active") && ($el.dataset.preventclosemodal != "true" || force)) {
		$el.classList.remove("is-active");
	}
}

window.n3.modal.closeAll = function(force) {
	(document.querySelectorAll(".modal.is-active") || []).forEach(($modal) => {
		window.n3.modal.close($modal, force);
	});
}

window.n3.ui.closeAllDropdowns = function() {
	(document.querySelectorAll(".dropdown.is-active") || []).forEach(($dropDown) => {
		$dropDown.classList.remove('is-active');
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
	var node = $.ui.fancytree.getTree("[data-tree='true']").getActiveNode();
	if (!node) {
		node = $.ui.fancytree.getTree("[data-tree='true']").getRootNode();
	}

	var newNode = window.n3.node.getNewNodeData();

	if (node.children && node.children.length == 0) {
		var tree = [newNode];
		$("[data-tree='true']").fancytree("option", "source", tree);
		newNode = $.ui.fancytree.getTree("[data-tree='true']").getNodeByKey(newNode.key);
		// modifyChild is not trigged, so call manually save
		window.n3.events.triggerEvent("nodeModified", {
			key: newNode.key
		});
	} else {
		newNode = node.addNode(newNode, "child");
	}
	newNode.setActive();
	window.n3.events.triggerEvent("nodeModified", {
		key: newNode.key
	});
}

window.n3.store.deleteAllNodesTasks = function(nodesKey) {

	return new Promise(function(resolve) {

		(function loopNodesKey(i) {

			if (i >= nodesKey.length) {
				resolve();
			} else {

				window.n3.store.removeAllNodeTasks(nodesKey[i]).then(function() {

					var taskIndexToRemove = window.n3.tasks.findIndex(function(task) {
						return task.nodeKey == nodesKey[i]
					});
					while (taskIndexToRemove > -1) {
						window.n3.tasks.splice(taskIndexToRemove, 1);
						taskIndexToRemove = window.n3.tasks.findIndex(function(task) {
							return task.nodeKey == nodesKey[i]
						});
					}
					loopNodesKey(i + 1)
				});
			}
		})(0);
	});
}


// do we need this method? how to do it better??
// save all tasks, but:
// 1. save only modifed tasks lists
// 2. remove all empty task lists...
window.n3.store.removeAllNodeTasks = function(nodeKey) {

	return new Promise(function(resolve) {
		window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {
			localFolder.getDirectoryHandle("tasks", { create: true }).then(function(tableDirHandle) {
				tableDirHandle.removeEntry(nodeKey + ".json").then(function() {
					console.log("window.n3.store.removeAllNodeTasks, for node key: " + nodeKey);
					resolve();
				}, function(err) {
					// no NodeTasks file, ignore
					resolve();
				});
			});
		});
	});

}

window.n3.store.extractImages = function(htmltext) {

	return new Promise(function(resolve) {
		if (!htmltext) {
			resolve("");
		}

		var $description = $("<div />")
		$description.html(htmltext);

		var imgs = $("img", $description);

		(function loopImages(i) {

			if (i >= imgs.length) {
				var html = $description.html();
				resolve(html);
			} else {
				var nextImg = imgs[i];

				if (nextImg.src.indexOf("data:image/") == -1) {
					loopImages(i + 1);
				} else {

					var filePath = nextImg.dataset.n3src;

					fetch(nextImg.src).then(function(base64Response) {
						base64Response.blob().then(function(blob) {

							window.n3.store.fileExist(filePath).then(function(fileExists) {
								if (fileExists) {
									nextImg.src = "";
									loopImages(i + 1);
								} else {

									window.n3.store.writeAttachment(filePath, blob).then(function(isFileSaved) {
										if (isFileSaved) {
											nextImg.src = "";
										}
										loopImages(i + 1);
									});

								}
							});

						});

					});

				}
			}
		})(0);

	});
}

window.n3.store.extractNodesImages = function(nodes) {

	return new Promise(function(resolve) {

		if (!nodes || nodes.length == 0) {
			resolve(nodes);
		}

		(function loopNodes(i) {

			if (i >= nodes.length) {
				resolve(nodes);
			} else {
				var node = nodes[i];
				node.data = node.data || {};
				node.data.modificationDate = JSJoda.Instant.now().toString();
				// conert from old structure, TODO remove it
				if (!node.data.creationDate) {
					node.data.creationDate = JSJoda.Instant.now().toString();
				}

				window.n3.store.extractNodesImages(node.children).then(function(childrenUpdated) {
					node.children = childrenUpdated;

					window.n3.store.extractImages((node.data || {}).description || "").then(function(htmltext) {
						node.data = node.data || {};
						node.data["description"] = htmltext;
						loopNodes(i + 1);
					});

				});

			}
		})(0);

	});

}

window.n3.store.extractTasksImages = function(tasks) {
	return new Promise(function(resolve) {

		if (!tasks || tasks.length == 0) {
			resolve(tasks);
		}

		(function loopTasks(i) {

			if (i >= tasks.length) {
				resolve(tasks);
			} else {
				var task = tasks[i];
				task.modificationDate = JSJoda.Instant.now().toString();
				// conert from old structure, TODO remove it
				if (!task.creationDate) {
					task.creationDate = JSJoda.Instant.now().toString();
				}

				window.n3.store.extractImages(task.description || "").then(function(htmltext) {
					task["description"] = htmltext;
					loopTasks(i + 1);
				});

			}
		})(0);
	});
}

window.n3.store.writeNodes = function() {

	return new Promise(function(resolve) {

		var fancyTree = $.ui.fancytree.getTree("[data-tree='true']");
		var nodesTree = fancyTree.toDict(true);

		window.n3.store.extractNodesImages(nodesTree.children).then(function(nodeTreeUpdated) {
			window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {
				localFolder.getFileHandle("nodes.json", { create: true }).then(function(treeFileHandle) {
					treeFileHandle.createWritable().then(function(writable) {
						// Write the contents of the file to the stream.
						var jsonString = JSON.stringify(nodeTreeUpdated || [], null, 2);
						writable.write(jsonString).then(function() {
							// Close the file and write the contents to disk.
							writable.close().then(function() {
								console.log("window.n3.store.writeNodes ready");
								resolve();
							});
						});
					});
				});
			});
		});
	});
}

window.n3.store.writeNodeTasks = function(params) {

	return new Promise(function(resolve) {

		var nodeKey = params.nodeKey;
		var taskId = params.taskId;

		window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {
			localFolder.getDirectoryHandle("tasks", { create: true }).then(function(tableDirHandle) {
				tableDirHandle.getFileHandle(nodeKey + ".json", { create: true }).then(function(tasksFileHandle) {
					tasksFileHandle.createWritable().then(function(writable) {

						var nodeTasksToWrite = window.n3.tasks.filter(function(task) {
							return task.nodeKey == nodeKey;
						});

						var nodeTasksToWrite = JSON.parse(JSON.stringify(nodeTasksToWrite));
						nodeTasksToWrite.forEach(function(task) {
							delete task["nodeKey"];
						});

						if (nodeTasksToWrite && nodeTasksToWrite.length > 0) {

							window.n3.store.extractTasksImages(nodeTasksToWrite).then(function(nodeTasksToWriteUpdated) {

								writable.write(JSON.stringify(nodeTasksToWriteUpdated, null, 2)).then(function() {
									writable.close().then(function() {
										console.log("window.n3.store.writeNodeTasks " + nodeKey + " ready");
										resolve();
									});
								});

							});

						} else {
							window.n3.store.removeAllNodeTasks(nodeKey).then(function() {
								resolve();
							});
						}
					});
				});
			});
		});
	});

}


window.n3.node.activateNode = function(node) {
	return new Promise(function(resolve) {

		var $nodeDataOwner = $("[data-owner='node']");
		$nodeDataOwner[0].dataset.nodekey = node.key;

		window.n3.refreshNodeTasksFilter(node.key).then(function() { });
		window.n3.ui.displayBreadCrumbs(node);

		var form = $("[data-noteeditor='true']");

		$("[name='title']", form).val(node.title);
		window.n3.store.loadImages((((node || {}).data || {}).description || "")).then(function(htmlText) {
			window.n3.node.getNodeHTMLEditor(form).then(function(htmlEditor) {
				htmlEditor.setContent(htmlText);
				htmlEditor.setDirty(false);
				resolve();
			});
		});

	});
}

window.n3.task.getTagsFilter = function(form) {
	if (!window.n3.task.tagsFilter) {
		var tagsInput = $('[name="tags"]', form);
		window.n3.task.tagsFilter = new Tagify(tagsInput[0],
			{
				whitelist: window.n3.task.tagsList.concat([{ value: "Ignore tags", color:  "green" }]),
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
		window.n3.task.tagsFilter.addTags(window.n3.task.tagsList.concat([{ value: "Ignore tags", color: "green"  }]));
	}
	window.n3.task.tagsFilter.whitelist = window.n3.task.tagsList.concat([{ value: "Ignore tags", color:  "green"  }]);
	return window.n3.task.tagsFilter;
}

/*// generate a random color (in HSL format, which I like to use)
function getRandomColor(){
	function rand(min, max) {
		return min + Math.random() * (max - min);
	}

	var h = rand(1, 360)|0,
		s = rand(40, 70)|0,
		l = rand(65, 72)|0;

	return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}*/
window.n3.refreshNodeTasksFilter = function(nodeKey, taskId, trigger) {

	return new Promise(function(resolve) {
		var form = $("[data-form='tasks-table']");
		if (!nodeKey) {
			if (!trigger) {
				trigger = form[0];
			}
			var $nodeDataOwner = trigger.closest("[data-owner='node']");
			if ($nodeDataOwner && $nodeDataOwner.dataset.nodekey) {
				nodeKey = $nodeDataOwner.dataset.nodekey;
			}

			var $ticketDataOwner = trigger.closest("[data-owner='task']");
			if ($ticketDataOwner && $ticketDataOwner.dataset.nodekey) {
				nodeKey = $ticketDataOwner.dataset.nodekey;
			}
		}

		var node = $.ui.fancytree.getTree("[data-tree='true']").getNodeByKey(nodeKey);

		var childrenTasks = $("[name='children']", form).prop("checked");
		
		var chosenStatus = [];
		$("[data-status='true']", form).each(function(index) {
			if ($(this).prop("checked")) {
				chosenStatus.push($(this).attr("name"));
			}
		});
		
		var tags = window.n3.task.getTagsFilter(form).value;


		var childrenNodesKeys = [node.key];
		if (childrenTasks) {
			childrenNodesKeys = collectChildrenNodesKeys(node);

			function collectChildrenNodesKeys(node) {
				var childrenKeys = [];
				childrenKeys.push(node.key);
				if (node.children) {
					for (var i = 0; i < node.children.length; i++) {
						childrenKeys = childrenKeys.concat(collectChildrenNodesKeys(node.children[i]));
					}
				}
				return childrenKeys;
			}
		}

		window.n3.tabulator.setFilter(function(data, filterParams) {
			//data - the data for the row being filtered
			//filterParams - params object passed to the filter

			var passed = filterParams.childrenNodesKeysJoined.indexOf("|" + data.nodeKey+ "|") > -1;
			passed = passed && filterParams.chosenStatusJoined.indexOf("|" + data.status+ "|") > -1;

			var ignoreTags = filterParams.tags.some(function(filterTag) {
				return filterTag.value == "Ignore tags";
			});

			var hasTage = ignoreTags || data.tags.some(function(taskTag) {
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
		resolve();
	});
}

window.n3.ui.displayBreadCrumbs = function(node) {
	$("[data-breadcrumb='true']").html(window.n3.node.getNodeTitlePath(node));
}

window.n3.node.getNodeTitlePath = function(node) {
	var breadCrumbs = "";
	var pathNode = node;
	while (pathNode && pathNode.title !== "root") {
		breadCrumbs = "<li " + (pathNode.key == node.key ? " class='is-active' " : "") + "><a " + (pathNode.key == node.key ? " aria-current='page' " : " data-owner='node' ") + " href='#' data-action='activate-node' data-nodeKey='" + pathNode.key + "'>" + pathNode.title + "</a></li>" + breadCrumbs;
		pathNode = pathNode.parent;
	}
	breadCrumbs = "<ul>" + breadCrumbs + "</ul>"
	return breadCrumbs;
}

window.n3.store.readTreeData = function() {

	return new Promise(function(resolve) {

		window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {
			localFolder.getFileHandle("nodes.json", { create: true }).then(function(treeFileHandle) {
				treeFileHandle.getFile().then(function(treeFile) {
					treeFile.text().then(function(treeContents) {
						var tree = false;
						if (treeContents) {
							tree = JSON.parse(treeContents);
						}
						resolve(tree);
					});
				});
			});
		});

	});
}


window.n3.store.readTasksData = function(tasks) {

	return new Promise(function(resolve) {

		window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {

			localFolder.getDirectoryHandle("tasks", { create: true }).then(function(tableDirHandle) {

				var asyncIt = tableDirHandle.values();

				var p = new Promise(function(resolvep) {

					(function loopEntries() {

						asyncIt.next().then(function(element) {

							var taskFileHandle = element.value;
							var done = element.done;

							if (done) {
								resolvep();
							} else {

								taskFileHandle.getFile().then(function(taskFile) {
									var taskFileName = taskFile.name;
									taskFile.text().then(function(taskFileAsText) {
										var taskAsJson = JSON.parse(taskFileAsText || "[]");
										var nodeKey = taskFileName.replaceAll(".json", "");
										taskAsJson.forEach(function(task) {
											task["nodeKey"] = nodeKey;
											task.tags = task.tags || [];
											task.tags.forEach(function(tagToAdd) {
												var tagIndex = window.n3.task.tagsList.findIndex(function(existingTag) {
													return existingTag.value == tagToAdd.value
												});
												if (tagIndex == -1) {
													window.n3.task.tagsList.push(tagToAdd);
												}
											});
											// TODO remove it migrate to status from done, archived
											if (task.done) {
												task.status = "DONE";
											} else if (task.archived) {
												task.status = "ARCHIVED";
											} else if (!task.status) {
												task.status = "TODO";
											}
											delete task.done;
											delete task.archived;

											tasks.push(task);
										});
										loopEntries();
									});

								});
							}
						});

					})();

				});
				p.then(function() {
					resolve();
				});

			});
		});
	});
};


window.n3.store.readAllData = function() {

	return new Promise(function(resolve) {

		window.n3.store.readTreeData().then(function(tree) {

			window.n3.store.readTasksData(window.n3.tasks).then(function() {
				resolve(tree);
			});

		});
	});
}

window.n3.initTaskTable = function() {

	window.n3.tabulator = new Tabulator("#n3-table", {
		reactiveData: true, //enable reactive data
		data: window.n3.tasks,
		layout: "fitColumns",
		height: "500px",
		movableRows: true, //enable user movable rows
		/*groupBy: "nodeKey",
		groupHeader: function(value, count, data, group) {
			//value - the value all members of this group share
			//count - the number of rows in this group
			//data - an array of all the row data objects in this group
			//group - the group component for the group
			return window.n3.node.getNodeTitlePath(value);
		},*/
		columns: [
			{
				title: "Status",
				field: "status",
				maxWidth: 200,
				formatter: function(cell, formatterParams, onRendered) {
					//cell - the cell component
					//formatterParams - parameters set for the column
					//onRendered - function to call when the formatter has been rendered
					
					window.n3.task.status.forEach(function(status) {
						status.selected = (status.id == cell.getValue());
					});
					
					onRendered(function() {
						var $select = $("select", cell.getElement());
						var statusSelect = $select.select2({
							theme: "n3",
							minimumResultsForSearch: Infinity,
							data: window.n3.task.status,
							templateSelection: function(state) {
								var html = "";
								html += "<span class='tag " + (state.cssClass ? state.cssClass : "") + " '>";
								if (state.icon) {
									html += "	<span class='icon'>";
									html += "		<i class='" + state.icon + "'></i>";
									html += "	</span>";
								}
								html += "	<span> " + state.text + "</span>";
								html += "</span>";
								
								var $state = $(html);
								return $state;
							},
							templateResult: function(state) {
								var html = "";
								html += "<span class='tag " + (state.cssClass ? state.cssClass : "") + " '>";
								if (state.icon) {
									html += "	<span class='icon'>";
									html += "		<i class='" + state.icon + "'></i>";
									html += "	</span>";
								}
								html += "	<span> " + state.text + "</span>";
								html += "</span>";
								
								var $state = $(html);
								return $state;
							}
						}).on("change.select2", function(e) {
							var value = statusSelect.val();
							cell.setValue(value, false);
							window.n3.events.triggerEvent("taskModified", {
								nodeKey: cell.getData().nodeKey,
								taskId: cell.getData().id
							});
						});
						

						// ignore click row
						$(".select2-container", cell.getElement()).on("mousedown", function(event) {
							event.stopPropagation && event.stopPropagation();
							event.preventDefault && event.preventDefault();
						}).on("click", function(event) {
							event.stopPropagation && event.stopPropagation();
							event.preventDefault && event.preventDefault();
						});
					})
					
					return "<select style='width: 180px; '></select>"; //return the contents of the cell;
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
					var node = $.ui.fancytree.getTree("[data-tree='true']").getNodeByKey(cell.getData().nodeKey);
					return "<div class='n3-task-prio-" + cell.getData().priority + "'><div>" + cell.getValue() + "</div><div class='breadcrumb n3-breadcrumb'>" + window.n3.node.getNodeTitlePath(node) + "</div></div>"; //return the contents of the cell;
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

					// convert old values TODO remove it
					var v = cell.getValue();
					if (v == "Low") {
						v = 1;
					}
					if (v == "Medium") {
						v = 2;
					}
					if (v == "High") {
						v = 3;
					}
					return "<div class='n3-task-prio-" + v + "'>" + window.n3.task.priorites[v] + "</div>"; //return the contents of the cell;
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
						var tagify = new Tagify($("input", cell.getElement())[0],
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
		var targetElement = event.target || event.srcElement;
		if (targetElement.tagName == "svg" || targetElement.tagName == "path" ||
			$(targetElement).attr("tabulator-field") == "done") {
			return;
		}

		var rowData = row.getData();
		window.n3.modal.openTaskDetails(rowData);

	});

	window.n3.tabulator.on("rowAdded", function(row) {
		window.n3.events.triggerEvent("taskModified", {
			nodeKey: row.getData().nodeKey,
			taskId: row.getData().id
		});
	});
	window.n3.tabulator.on("rowUpdated", function(row, e, a) {
		console.log("Tabulator event - rowUpdated, row", row.getData().nodeKey);
		window.n3.events.triggerEvent("taskModified", {
			nodeKey: row.getData().nodeKey,
			taskId: row.getData().id
		});
	});
	window.n3.tabulator.on("rowDeleted", function(row) {
		window.n3.events.triggerEvent("taskModified", {
			nodeKey: row.getData().nodeKey,
			taskId: row.getData().id
		});
	});
	window.n3.tabulator.on("dataFiltered", function(filters, rows) {
		//filters - array of filters currently applied
		//rows - array of row components that pass the filters
		$("[data-tasksbadge='true']").html(rows.length);
	});



	window.n3.tabulator.on("rowMoving", function(row) {
		console.log("Tabulator event - rowMoving, row", row.getData().nodeKey);
		window.n3.task.movingTaskOnNodeKey = row.getData().nodeKey;
	});
	window.n3.tabulator.on("rowMoved", function(row, a, b) {
		// var data = window.n3.tabulator.getData();
		// window.n3.storeTasks(node.key);
		console.log("Tabulator event - rowMoved, from node: " + row.getData().nodeKey + " to node: " + window.n3.task.movingTaskOnNodeKey);
		window.n3.events.triggerEvent("taskModified", {
			nodeKey: window.n3.task.movingTaskOnNodeKey
		});
		window.n3.events.triggerEvent("taskModified", {
			nodeKey: row.getData().nodeKey,
			taskId: row.getData().id
		});
		window.n3.task.movingTaskOnNodeKey = false;
	});
	window.n3.tabulator.on("rowMoveCancelled", function(row) {
		console.log("Tabulator event - rowMoved, row", row.getData().nodeKey);
		window.n3.task.movingTaskOnNodeKey = false;
	});

	window.n3.tabulator.on("dataChanged", function(data, a, b, c) {
		// console.log("Tabulator dataChanged", data, a, b, c);
	});

}

window.n3.node.getNodeHTMLEditor = function(form) {

	return new Promise(function(resolve) {
		if (window.n3.node.tinymce) {
			resolve(window.n3.node.tinymce);
			return;
		}

		var specialChars = [
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

				editor.on("blur", function(e) {
					if (editor.isDirty()) {

						var $nodeDataOwner = $(editor.getContainer()).closest("[data-owner='node']");
						var nodeKey = $nodeDataOwner[0].dataset.nodekey;

						var currentNode = $.ui.fancytree.getTree("[data-tree='true']").getNodeByKey(nodeKey);
						currentNode.data.description = editor.getContent();
						window.n3.events.triggerEvent("nodeModified", {
							key: currentNode.key
						});
						editor.setDirty(false);
					}
				});

				editor.on("PreProcess", function(e) {
					var imgs = $("img", e.node);
					imgs.each(function() {
						if (!this.dataset.n3src && (this.src.indexOf("data:image/") > -1 || this.src.indexOf("blob:") > -1)) {
							var fileExt = "png"; // this.src.substring(11, 14);
							this.dataset.n3src = "files/" + crypto.randomUUID() + "." + fileExt;
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
				
				
				var getMatchedChars = function(pattern) {
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
							var results = getMatchedChars(pattern).map(function(char) {
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

window.n3.task.delete = function(nodeKey, taskId, $trigger) {
	var taskToRemoveIndex = window.n3.tasks.findIndex(function(task) {
		return task.id == taskId
	});
	window.n3.tasks.splice(taskToRemoveIndex, 1);
	window.n3.events.triggerEvent("taskModified", {
		nodeKey: nodeKey,
		taskId: taskId
	});
	window.n3.tabulator.refreshFilter();

	var $modal = $trigger.closest('.modal');
	window.n3.modal.close($modal, true);
};


window.n3.task.getTagsEditor = function(form) {
	if (!window.n3.task.tagsEditor) {
		var tagsInput = $('[name="tags"]', form);
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
					var imgs = $("img", e.node);
					imgs.each(function() {
						if (!this.dataset.n3src && (this.src.indexOf("data:image/") > -1 || this.src.indexOf("blob:") > -1)) {
							var fileExt = "png"; // this.src.substring(11, 14);
							this.dataset.n3src = "files/" + crypto.randomUUID() + "." + fileExt;
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
	if (!window.n3.task.statusEditor) {
		if (taskStatus) {
			window.n3.task.status.forEach(function(status) {
				status.selected = (status.id == taskStatus);
			});
		}
		window.n3.task.statusEditor = $("[name='status']", form);
		window.n3.task.statusEditor.select2({
			theme: "n3",
			minimumResultsForSearch: Infinity,
			data: window.n3.task.status,
			templateSelection: function(state) {
				var html = "";
				html += "<span class='tag " + (state.cssClass ? state.cssClass : "") + " '>";
				if (state.icon) {
					html += "	<span class='icon'>";
					html += "		<i class='" + state.icon + "'></i>";
					html += "	</span>";
				}
				html += "	<span> " + state.text + "</span>";
				html += "</span>";
				
				var $state = $(html);
				return $state;
			},
			templateResult: function(state) {
				var html = "";
				html += "<span class='tag " + (state.cssClass ? state.cssClass : "") + " '>";
				if (state.icon) {
					html += "	<span class='icon'>";
					html += "		<i class='" + state.icon + "'></i>";
					html += "	</span>";
				}
				html += "	<span> " + state.text + "</span>";
				html += "</span>";
				
				var $state = $(html);
				return $state;
			}
		});
	} else {
		if (taskStatus) {
			window.n3.task.statusEditor.val(taskStatus);
			window.n3.task.statusEditor.trigger('change.select2');
		}
	}
	return window.n3.task.statusEditor;
}

window.n3.modal.openTaskDetails = function(task) {
	var taskDetailsModal = $("#n3-task-details");

	var $ticketDataOwner = taskDetailsModal.closest("[data-owner='task']");
	if (task.id) {
		$ticketDataOwner[0].dataset.taskid = task.id;
	} else {
		delete $ticketDataOwner[0].dataset.taskid;
	}
	if (task.nodeKey) {
		$ticketDataOwner[0].dataset.nodekey = task.nodeKey;
	} else {
		delete $ticketDataOwner[0].dataset.nodekey;
	}
	window.n3.modal.open(taskDetailsModal);// todo .then?
}

window.n3.modal.onOpenTaskDetails = function(nodeKey, taskId, targetElement) {
	return new Promise(function(resolve) {
		var ticketDataOwner = targetElement.closest("[data-owner='task']");
		var nodeKey = ticketDataOwner.dataset.nodekey;
		var taskId = ticketDataOwner.dataset.taskid;

		var form = $("[data-taskeditor='true']");		
		
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
			var task = window.n3.tasks.find(function(task) {
				return task.id == taskId
			});

			$("[name='title']", form).val(task.title);
			$("[name='priority']", form).val(task.priority || "2");
			window.n3.task.getTagsEditor(form).removeAllTags();
			window.n3.task.getTagsEditor(form).addTags(task.tags);
			window.n3.task.getStatusEditor(form, task.status);
			$("[name='duration']", form).val(task.duration || "");
		
			window.n3.store.loadImages((task || {}).description || "").then(function(htmlText) {
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
	var $el = $(el);
	var duration = $el.val();
	var $validationMessage = $el.closest(":has([data-validate-massage='true'])").find("[data-validate-massage='true']");
	var valid = parseDuration(duration);
	if (!valid) {
		$validationMessage.show();
	} else {
		$validationMessage.hide();
	}
	return valid;
}

window.n3.task.validate.form = function(form) {
	var validateFields = $("[data-validate]");
	var validForm = true;
	validateFields.each(function(index) {
		if (this.dataset.validate) {
			if (window.n3.action.handlers[this.dataset.validate]) {
				var valid = window.n3.action.handlers[this.dataset.validate](form, this);
				validForm = validForm && valid;
			}
		}
	});
	return validForm;
}

window.n3.task.save = function(nodeKey, taskId, $trigger) {
	
	var form = $("[data-taskeditor='true']");
	if (!window.n3.task.validate.form(form)) {
		return false;
	}
	
	if (!taskId) {
		// it's add task from modal'

		var node = $.ui.fancytree.getTree("[data-tree='true']").getNodeByKey(nodeKey);
		if (!node) {
			node = $.ui.fancytree.getTree("[data-tree='true']").getRootNode();
		}

		if (node.title == "root") {
			// it's root and has no children, crate some first noto
			// ther's no nodes, add one
			var newNode = window.n3.node.getNewNodeData();
			node = node.addNode(newNode, "child");
			window.n3.events.triggerEvent("nodeModified", {
				key: node.key
			});
		}

		var newTaskId = crypto.randomUUID();
		window.n3.task.getTaskHTMLEditor(form).then(function(editor) {
			var description = "";
			if (editor.isDirty()) {
				description = editor.getContent();
			}

			var newTask = {
				"id": newTaskId,
				"title": $("[name='title']", form).val(),
				"priority": $("[name='priority'] option:selected", form).val(),
				"duration": $("[name='duration']", form).val(),
				"nodeKey": node.key,
				"tags": window.n3.task.getTagsEditor(form).value,
				"status": window.n3.task.getStatusEditor(form, undefined).val(),
				"description": description,
				"creationDate": JSJoda.Instant.now().toString()
			};

			window.n3.tasks.unshift(newTask);

			window.n3.task.getTagsEditor(form).value.forEach(function(tagToAdd) {
				var tagIndex = window.n3.task.tagsList.findIndex(function(existingTag) {
					return existingTag.value == tagToAdd.value
				});
				if (tagIndex == -1) {
					window.n3.task.tagsList.push(tagToAdd);
				}
			});

			window.n3.tabulator.refreshFilter();
			node.setActive();
			window.n3.events.triggerEvent("taskModified", {
				nodeKey: node.key,
				taskId: newTaskId
			});
		});
	} else {
		// it's edit task from modal

		var task = window.n3.tasks.find(function(task) {
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
				var tagIndex = window.n3.task.tagsList.findIndex(function(existingTag) {
					return existingTag.value == tagToAdd.value
				});
				if (tagIndex == -1) {
					window.n3.task.tagsList.push(tagToAdd);
				}
			});

			window.n3.tabulator.refreshFilter();
		});
	}
	
	return true;
}

window.n3.initFancyTree = function(tree) {
	var LAST_EFFECT_DO = null,
		LAST_EFFECT_DD = null,
		lazyLogCache = {};

	/* Log if value changed, nor more than interval/sec.*/
	function logLazy(name, value, interval, msg) {
		if (!lazyLogCache[name]) { lazyLogCache[name] = { stamp: now } };
		var now = Date.now(),
			entry = lazyLogCache[name];

		if (value && value === entry.value) {
			return;
		}
		entry.value = value;

		if (interval > 0 && (now - entry.stamp) <= interval) {
			return;
		}
		entry.stamp = now;
		lazyLogCache[name] = entry;
		// console.log(msg);
	}
	var ff = $("[data-tree='true']").fancytree({
		source: tree,
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
			if (data.tree.rootNode.children.length > 0) {
				$(".n3-main").removeClass("n3-no-nodes");
			} else {
				$(".n3-main").addClass("n3-no-nodes");
			}
			if (data.tree.rootNode.children.length > 0) {
				data.tree.activateKey(data.tree.rootNode.children[0].key);
			}
		},
		modifyChild: function(event, data) {
			// bei remove - data.tree.rootNode.children is not yet actuall
			if (data.operation == "remove" && data.node.title == "root") {
				$(".n3-main").addClass("n3-no-nodes");
			} else if (data.operation != "remove" && data.tree.rootNode.children.length > 0) {
				// on add new node, when there is no statusNodeType !== "nodata" node
				$(".n3-main").removeClass("n3-no-nodes");
			}
		},
		// --- Node events -------------------------------------------------			
		activate: function(event, data) {
			if (data.node.key !== "_1") {
				window.n3.node.activateNode(data.node).then(function() { });
			} else {
				window.n3.tabulator.setFilter("nodeKey", "=", "HIDE_ALL_TASKS_THIS_NODE_KEY_DOES_NOT_EXISTS");
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
				var newNode,
					transfer = data.dataTransfer,
					sourceNodes = data.otherNodeList,
					mode = data.dropEffect;

				node.debug("T1: dragDrop: effect=" + "data: " + data.dropEffect + "/" + data.effectAllowed +
					", dataTransfer: " + transfer.dropEffect + "/" + transfer.effectAllowed, data);

				/*alert("Drop on " + node + ":\n"
					+ "source:" + JSON.stringify(data.otherNodeData) + "\n"
					+ "hitMode:" + data.hitMode
					+ ", dropEffect:" + data.dropEffect
					+ ", effectAllowed:" + data.effectAllowed);*/

				if (data.hitMode === "after") {
					// If node are inserted directly after tagrget node one-by-one,
					// this would reverse them. So we compensate:
					sourceNodes.reverse();
				}
				if (data.otherNode) {
					// Drop another Fancytree node from same frame (maybe a different tree however)
					var sameTree = (data.otherNode.tree === data.tree);

					//if (mode === "move") {
					data.otherNode.moveTo(node, data.hitMode);
					/*} else {
						newNode = data.otherNode.copyTo(node, data.hitMode);
						if (mode === "link") {
							newNode.setTitle("Link to " + newNode.title);
						} else {
							newNode.setTitle("Copy of " + newNode.title);
						}
					}*/
				} else if (data.otherNodeData) {
					// Drop Fancytree node from different frame or window, so we only have
					// JSON representation available
					node.addChild(data.otherNodeData, data.hitMode);
				} else if (data.files.length) {
					// Drop files
					for (var i = 0; i < data.files.length; i++) {
						var file = data.files[i];
						node.addNode({ title: "'" + file.name + "' (" + file.size + " bytes)" }, data.hitMode);
						// var url = "'https://example.com/upload",
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
					node.addNode({ title: transfer.getData("text") }, data.hitMode);
				}
				node.setExpanded();
				window.n3.events.triggerEvent("nodeModified", {
					key: node.key
				});
			},
		}
	});


}




