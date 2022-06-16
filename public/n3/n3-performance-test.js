

window.n3 = window.n3 || {};
window.n3.task = window.n3.task || {
	"tinymce": false,
	"validate": {},
	"priority": [
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
			text: "None",
			selected: true
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
			icon: "",
			selected: false
		},
		{
			id: "SCHEDULED",
			intern: "TOBEDONE",
			text: "Scheduled",
			cssClass: "is-primary",
			icon: "",
			selected: false
		},
		{
			id: "WAITING LABOR",
			intern: "TOBEDONE",
			text: "Waiting on person",
			cssClass: "is-primary",
			icon: "",
			selected: false
		},
		{
			id: "WAITING QS",
			intern: "TOBEDONE",
			text: "Waiting QS Installation",
			cssClass: "is-primary",
			icon: "",
			selected: false
		},
		{
			id: "WAITING PROD",
			intern: "TOBEDONE",
			text: "Waiting Prod installation",
			cssClass: "is-primary",
			icon: "",
			selected: false
		},
		{
			id: "DONE",
			intern: "DONE",
			text: "Done",
			cssClass: "is-outlined",
			icon: "",
			selected: false
		},
		{
			id: "CANCELED",
			intern: "DONE",
			text: "Canceled",
			cssClass: "is-danger is-outlined",
			icon: "",
			selected: false
		},
		{
			id: "ARCHIVED",
			intern: "DONE",
			text: "Archived",
			cssClass: "is-success",
			icon: "fas fa-check",
			selected: false
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
// window.n3.tasks = [];
//TODO: window.n3.tabulator = false;
window.n3.tasksList = false;

let searchService;
let storeService;

$(function() {
	
	// TODO: init UI
/*	$("[data-tabitem]").tab({
		onLoad: function(tabPath, parameterArray, historyEvent) {
			if (tabPath == "tasks") {
				window.n3.ui.onOpenTabTasks(this);
			}
		}
	});*/


	const nodeSidebarResizeObserver = new ResizeObserver(function(entries) {
		for (let entry of entries) {
			if(entry.contentBoxSize) {
				// Firefox implements `contentBoxSize` as a single content rect, rather than an array
				const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;

				if (contentBoxSize.inlineSize <= 84) {
					if (!entry.target.classList.contains("mini-sidebar")) {
						entry.target.classList.add("mini-sidebar");
					}
				} else {
					if (entry.target.classList.contains("mini-sidebar")) {
						entry.target.classList.remove("mini-sidebar");
					}
				}
/*
				if (contentBoxSize.inlineSize > 84 && contentBoxSize.inlineSize <= 300) {
					if (!entry.target.classList.contains("small-sidebar")) {
						entry.target.classList.add("small-sidebar");
					}
				} else {
					if (entry.target.classList.contains("small-sidebar")) {
						entry.target.classList.remove("small-sidebar");
					}
				}
*/
				// if (contentBoxSize.inlineSize > 300) {
				if (contentBoxSize.inlineSize > 84) {
					if (!entry.target.classList.contains("full-sidebar")) {
						entry.target.classList.add("full-sidebar");
					}
				} else {
					if (entry.target.classList.contains("full-sidebar")) {
						entry.target.classList.remove("full-sidebar");
					}
				}
			}
		}
	});
	nodeSidebarResizeObserver.observe(document.querySelector(".n3-sidebar-node"));


	window.n3.localFolder.init();

	window.n3.action.handlers["refresh-tasks"] = window.n3.refreshNodeTasksFilter;
	window.n3.action.handlers["activate-node"] = window.n3.action.activateNode;
	window.n3.action.handlers["searchresults-activate-node"] = window.n3.action.activateNodeFromSearchResults;
	window.n3.action.handlers["searchresults-open-task"] = window.n3.action.openTaskDetailsFromSaecrhResults;
	window.n3.action.handlers["open-task"] = window.n3.action.openTaskDetailsFromList;
	window.n3.action.handlers["choose-folder"] = window.n3.localFolder.select;
	window.n3.action.handlers["verify-folder"] = window.n3.localFolder.queryVerifyPermission;
	window.n3.action.handlers["add-node"] = window.n3.node.add;
	window.n3.action.handlers["add-task"] = window.n3.task.add;
	window.n3.action.handlers["dalete-task-confirm"] = window.n3.task.delete;
	window.n3.action.handlers["delete-node-confirm"] = window.n3.node.delete;
	window.n3.action.handlers["open-modal"] = window.n3.ui.openModal;
	window.n3.action.handlers["open-dropdown"] = window.n3.ui.openDropDown;
	window.n3.action.handlers["save-task"] = window.n3.task.save;
	window.n3.action.handlers["close-dialog"] = window.n3.action.closeDialog;
	window.n3.action.handlers["open-modal-delete-task-confirm"] = window.n3.action.openModalDeleteTaskConfirm;
	window.n3.action.handlers["taskeditor-on-open"] = window.n3.modal.onOpenTaskDetails;
	window.n3.action.handlers["task-duration-validate"] = window.n3.task.validate.duration;
	window.n3.action.handlers["searchdialog-on-open"] = window.n3.ui.openSearchDialog;
	window.n3.action.handlers["task-list-delete-tag"] = window.n3.action.taskListDeleteTag;
	

	$(document).on("click", "[data-action]", function(event) {
		let targetElement = event.target || event.srcElement;
		let $trigger = this;
		let noteKey = undefined;
		let taskId = undefined;

		//let $nodeDataOwner = targetElement.closest("[data-owner='node']");
		//if ($nodeDataOwner && $nodeDataOwner.dataset.notekey) {
		//	noteKey = $nodeDataOwner.dataset.notekey;
		//}

		let $ticketDataOwner = targetElement.closest("[data-owner='node'], [data-owner='task']");
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

	$(document).on("change", "[data-noteeditor] [name='title']", function() {
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
				// storeService.modifyNote(node, ["title"]).then(function() { });
			}
		}
	});

	$(document).on("change", "[data-taskeditor] [name='title']", function() {
		let ticketDataOwner = $(this).closest("[data-owner='task']");
		let taskId = ticketDataOwner[0].dataset.taskid;

		let task = window.n3.tasksList.get("id", taskId);
		if (task && task.length > 0) {
			task = task[0];
		}

		let title = $(this).val();
		if (task.values().title !== title) {
			let taskValues = task.values();
			taskValues.title = title || "";
			task.values(taskValues);
			// storeService.modifyTask(task.values(), ["title"]).then(function() {});
		}
	});

	$(document).on("change", "[data-taskeditor] [name='duration']", function() {
		console.log("change duration ", $(this).val());
		let ticketDataOwner = $(this).closest("[data-owner='task']");
		let taskId = ticketDataOwner[0].dataset.taskid;

		let task = window.n3.tasks.find(function(task) {
			return task.id == taskId
		});

		let duration = $(this).val();
		if (task.duration !== duration) {
			task.duration = duration;
			// storeService.modifyTask(task, ["duration"]).then(function() {});
		}
	});

	$(document).on("change", "[data-task-list] [data-task-filter-recursively], [data-task-list] [data-task-filter-status], [data-task-list] [data-task-filter-parents]", function() {
		window.n3.refreshNodeTasksFilter();
	});

	// TODO: does it work?
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

	// storeService.modifyNote(node, modifiedFields).then(function() { });
}

window.n3.action.taskListDeleteTag = function(noteKey, taskId, $trigger) {
	console.log("window.n3.action.taskListDeleteTag", noteKey, taskId, $trigger);

	let task = window.n3.tasksList.get("id", taskId)[0];
	let tags = task.values().tags.split(",");
	var index = tags.indexOf($trigger.dataset.tag);
	if (index !== -1) {
		tags.splice(index, 1);
	
		let taskValues = task.values();
		taskValues.tags = tags.join(",");
		task.values(taskValues);
		// storeService.modifyTask(task.values(), ["tags"]).then(function() {});
		task.displayTags();
	}

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

	window.n3.task.status.forEach(function(status) {
		html += " ";
		html += "<span class='tag " + (status.cssClass ? status.cssClass : "") + " '> <label class='checkbox' data-action='refresh-tasks'> <input type='checkbox' data-status='true' name='" + status.id + "' checked>";
		if (status.icon) {
			html += "	<span class='icon'>";
			html += "		<i class='" + status.icon + "'></i>";
			html += "	</span>";
		}
		html += "	<span> " + status.text + "</span>";
		html += "</label></span>";
	});


	$("[data-statusfilter]").html(html);
}


window.n3.task.add = function(noteKey, taskId, $trigger) {
	let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);

	let task = {
		id: crypto.randomUUID(),
		noteKey: noteKey,
		creationDate: JSJoda.Instant.now().toString(),
		title: "TODO: " + node.title,
		status: "TODO",
		priority: 0,
		tags: ""
	};

	// storeService.addTask(task).then(function() {
	// 	window.n3.tasksList.add(task);
	// 	window.n3.refreshNodeTasksFilter();
	// 	window.n3.modal.openTaskDetails(task);
	// 	$.ui.fancytree.getTree("[data-tree]").render(true, false);
	// });
	
}


window.n3.action.openModalDeleteTaskConfirm = function(noteKey, taskId, $trigger) {
	window.n3.action.closeDialog(noteKey, taskId, $trigger)
	if (taskId) {
		let deleteTaskCondirmModal = document.getElementById("n3-delete-openTaskDetailsonopetask-trigger");
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

window.n3.action.openTaskDetailsFromList = function(noteKey, taskId, $trigger) {
	let task = window.n3.tasksList.items.find(function(task) {
		return task.values().id == taskId
	});

	noteKey = task.values().noteKey;
	//let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
	//node.setActive();
	window.n3.modal.openTaskDetails({ id: taskId, noteKey: noteKey });
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


		// storeService.moveNoteToTrash(node).then(function() {
		// 
		// 	// remove tasks from list
		// 	node.visit(function(node) {
		// 
		// 		let taskIndexToRemove = -1;
		// 		do {
		// 			taskIndexToRemove = window.n3.tasks.findIndex(function(task) {
		// 				return task.noteKey == node.key
		// 			});
		// 			if (taskIndexToRemove > -1) {
		// 				window.n3.tasks.splice(taskIndexToRemove, 1);
		// 			}
		// 		} while (taskIndexToRemove > -1);
		// 
		// 	});
		// 
		// 	node.remove();
		// 
		// 	if (parentNode.title != "root") {
		// 		parentNode.setActive();
		// 	} else if (parentNode.children && parentNode.children.length > 0) {
		// 		parentNode.children[0].setActive();
		// 	}
		// });

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
					searchService = new N3SearchServiceFlexSearch(dir);
					storeService = new N3StoreServiceFileSystem(dir, searchService);


					set("localFolder", dir).then(function() {
						window.n3.modal.closeAll();
					});

					window.n3.modal.closeAll(true);


					let tree = [];
					for (let i = 0; i < 1000; i++) {

						let node = {
							"title": "CPCPAC" + i,
							"key": "CPCPAC" + i,
							"nodeType": "cpac",
							"icon": false,
							"folder": true,
							"data": {
								"description": "bla " + i
							},
							"children": [
							]
						};

						for (let j = 0; j < 100; j++) {

							let node1 = {
								"title": "CPCPAC" + i + "-" + j,
								"key": "CPCPAC" + i + "-" + j,
								"nodeType": "cpac",
								"icon": false,
								"folder": true,
								"data": {
									"description": "bla " + i + "-" + j
								},
								"children": [
								]
							};

							for (let k = 0; k < 100; k++) {

								let node2 = {
									"title": "CPCPAC" + i + "-" + j + " - " + k,
									"key": "CPCPAC" + i + "-" + j + " - " + k,
									"nodeType": "cpac",
									"icon": false,
									"folder": true,
									"data": {
										"description": "bla " + i + "-" + j + " - " + k
									},
									"children": [
									]
								};
	
								node1.children.push(node2);
	
							}

							node.children.push(node1);

						}

						tree.push(node);
					}

					window.n3.initFancyTree(tree).then(function() {
						//window.n3.initTaskList(tasks);
						resolve(true);
					});



					/*
					storeService.migrateStore().then(function() {
						storeService.loadTasks().then(function(tasks) {
							storeService.loadNotesTree().then(function(tree) {
								searchService.addNotesTree(tree).then(function() {
									tasks.forEach(function(task) {
										searchService.addTask(task).then(function() {
											// just continue async
										});
									});
									

									// TODO init UI method?
									$("[data-node-menu]").dropdown();
										
									let form = $("[data-noteeditor]");
									window.n3.node.getNodeHTMLEditor(form).then(function(data) {
										window.n3.initFancyTree(tree, tasks).then(function() {
											window.n3.initTaskList(tasks);
											resolve(true);
										});
									});
								});
							});
						});
					});
					*/


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
		"title": JSJoda.LocalDateTime.now().format(JSJoda.DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")),
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
	// storeService.addNote(newNode).then(function() { });
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
	}
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

		if (window.n3.tasksList && window.n3.tasksList.n3RefreshFilter) {
			window.n3.tasksList.n3RefreshFilter();
		}
		resolve();
	});
}

// noLinks - in Bulma gibt es keine BredCrumb ohne Links...
window.n3.node.getNodeTitlePath = function(node, noLinks) {
	let breadCrumbs = "";
	let pathNode = node;
	while (pathNode && pathNode.title !== "root") {
		let breadCrumbNote = "";
		if (noLinks || pathNode.key == node.key) {
			breadCrumbNote += "<div class='section " + (pathNode.key == node.key ? "active" : "") + "'>" + pathNode.title + "</div>";
		} else{
			breadCrumbNote += "<a class=''section' data-owner='node' href='#' data-action='activate-node' data-noteKey='" + pathNode.key + "'>" + pathNode.title + "</a>";
		}
		breadCrumbs = breadCrumbNote + (breadCrumbs ? "<div class='divider'> / </div>" : "") + breadCrumbs;
		pathNode = pathNode.parent;
	}
	return breadCrumbs;
}



window.n3.initTaskList = function(tasks) {

/*
	window.n3.tasks.forEach(function(task) {
		if (task && task.tags) {
			let tags = task.tags.split(",");
			tags.forEach(function(tag) {
				if (!window.n3.task.tagsList.includes(tag)) {
					window.n3.task.tagsList.push(tag);
				}
			});
		}
	});
*/

	

	var options = {
		valueNames: [ 'title' ],
		item: function(values) {
			let $itemTmpl = $("[data-task-template]");

			let $ticketDataOwner = $("[data-owner='task']", $itemTmpl);
			$ticketDataOwner[0].dataset.notekey = values.noteKey;
			$ticketDataOwner[0].dataset.taskid = values.id;
			
			return $itemTmpl.html();
		}
	};
	
	window.n3.tasksList = new List($("[data-task-list]")[0], options, tasks);

	
	
	if (!window.n3.tasksList.n3RefreshFilter) {
		
		window.n3.tasksList.n3RefreshFilter = function() {
			const recursively = $("[data-task-filter-recursively]", window.n3.tasksList.listContainer).prop("checked");
			const parents = $("[data-task-filter-parents]", window.n3.tasksList.listContainer).prop("checked");
			const statusTodo = $("[data-task-filter-status]", window.n3.tasksList.listContainer).prop("checked");

			let $nodeDataOwner = $("[data-owner='node']")[0];

			let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey($nodeDataOwner.dataset.notekey);
			let childrenNotesKey = recursively ? collectChildrenNodesKeys(node) : [node.key];
			if (parents) {
				childrenNotesKey = childrenNotesKey.concat(collectParentsNodesKeys(node));
			}
			window.n3.tasksList.filter(function(item) {
				let show = childrenNotesKey.indexOf(item.values().noteKey) > -1;

				let currentStatus = window.n3.task.status.find(function(status) {
					return status.id == item.values().status
				});

				show = show && (!statusTodo || (statusTodo && currentStatus.intern == "TOBEDONE")) 
				return show;
			});
		
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
			function collectParentsNodesKeys(node) {
				let parentsKeys = [];
				parentsKeys.push(node.key);
				while (node.parent) {
					parentsKeys.push(node.parent.key);
					node = node.parent;
				}
				return parentsKeys;
			}
		}
	}
	window.n3.tasksList.n3RefreshFilter();

	

	window.n3.tasksList.on("updated", function(a, b, c) {
		initTaskItem();
	});
	initTaskItem();

	function initTaskItem() {
		window.n3.tasksList.items.forEach(function(task) {

			$("[data-task-menu]", task.elm).dropdown();

			///////////////////////////////////////////////////////////////////////////////////////////////////////

			$("[data-task-title]", task.elm).html(task.values().title);

			//////////////////////////////////////////////////////////////////////////////////////////////////////////

			if (!task.n3StatusDropDown) {
				let statusDropDownValues = window.n3.task.status.map(function(status) {
					return {
						name: status.text,
						value: status.id,
						selected: (task ? (task.values().status == status.id): status.selected)
					}
				});
				task.n3StatusDropDown = $("[data-status]", task.elm).dropdown({
					values: statusDropDownValues
				});
				task.n3StatusDropDown.dropdown("setting", "onChange", function(value, text, $choice) {
					let taskValues = task.values();
					taskValues.status = value;
					task.values(taskValues);
					// storeService.modifyTask(task.values(), ["status"]).then(function() {
					//	$.ui.fancytree.getTree("[data-tree]").render(true, false);
					// });
				});
			}

			if (!task.n3SetStatus) {
				task.n3SetStatus = function(status) {
					task.n3StatusDropDown.dropdown("set selected", status);
				}
			}

			//////////////////////////////////////////////////////////////////////////////////////////////////////////
		
			if (!task.n3PriorityDropDown) {
				let priorityDropDownValues = window.n3.task.priority.map(function(priority) {
					return {
						name: priority.text,
						value: priority.id + "",
						selected: (priority.id + "") == (task.values().priority + "")
					}
				});


				task.n3PriorityDropDown = $("[data-priority]", task.elm).dropdown({
					values: priorityDropDownValues
				});
				task.n3PriorityDropDown.removeClass(["red", "yellow", "teal", "grey"]);
				task.n3PriorityDropDown.addClass(task.values().priority == 3 ? "red" : task.values().priority == 2 ? "yellow" : task.values().priority == 1 ? "teal" : "grey");

				task.n3PriorityDropDown.dropdown("setting", "onChange", function(value, text, $choice) {
					let taskValues = task.values();
					taskValues.priority = value;
					task.values(taskValues);
					task.n3PriorityDropDown.removeClass(["red", "yellow", "teal", "grey"]);
					task.n3PriorityDropDown.addClass(task.values().priority == 3 ? "red" : task.values().priority == 2 ? "yellow" : task.values().priority == 1 ? "teal" : "grey");

					// storeService.modifyTask(task.values(), ["priority"]).then(function() {
					// });
				});
			}

			if (!task.n3SetPriority) {
				task.n3SetPriority = function(priority) {
					task.n3PriorityDropDown.dropdown("set selected", priority);
				}
			}
		
			//////////////////////////////////////////////////////////////////////////////////////////////////////////

			if (!task.displayTags) {
				task.displayTags = function() {
					let tagsList = $("[data-tags]", task.elm);
					tagsList.empty();


					// convert from old version
					if (Array.isArray(task.values().tags)) {
						let newTags = [];
						task.values().tags.forEach(function(tag) {
							newTags.push(tag.value);
						});


						let taskValues = task.values();
						taskValues.tags = newTags.join(",");
						task.values(taskValues);

						// storeService.modifyTask(task.values(), ["tags"]).then(function() {
						// 	console.log(`Task ${task.values().id} converted from old storage version.`);
						// });
						
					}
					// convert from old version
					if (task.values().tags === undefined) {
						let taskValues = task.values();
						taskValues.tags = "";
						task.values(taskValues);

						// storeService.modifyTask(task.values(), ["tags"]).then(function() {
						// 	console.log(`Task ${task.values().id} converted from old storage version.`);
						// });
					}

					task.values().tags.split(",").forEach(function(tag) {
						if (tag) {
							tagsList.append(`<a class='ui mini label'>${tag} <i class='icon close' data-tag='${tag}' data-action='task-list-delete-tag'></i></a>`);
						}
					});
				}
			}
			task.displayTags();

			let breadcrumb = $("[data-breadcrumb]", task.elm);
			let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(task.values().noteKey);
			breadcrumb.html(window.n3.node.getNodeTitlePath(node, false));

			



		});
	}

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
			toolbar_sticky_offset: 48,
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
						// storeService.modifyNote(currentNode, ["description"]).then(function() { });
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
	let removeTask = window.n3.tasksList.items.find(function(task) {
		return task.values().id == taskId
	});

	let deletedCount = window.n3.tasksList.remove("id", taskId);
	console.log("deletedCount=" + deletedCount);

	// storeService.moveTaskToTrash(removeTask.values()).then(function() {
	// 	$.ui.fancytree.getTree("[data-tree]").render(true, false);
	// });

};


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

				editor.on("blur", function(e) {
					if (editor.isDirty()) {
						let $ticketDataOwner = $(editor.getContainer()).closest("[data-owner='task']");
						let taskId = $ticketDataOwner[0].dataset.taskid;

						let task = window.n3.tasksList.get("id", taskId)[0];
						let description = editor.getContent();
						if (task.values().description !== description) {
							let taskValues = task.values();
							taskValues.description = description;
							task.values(taskValues);
							// storeService.modifyTask(task.values(), ["description"]).then(function() {});
							editor.setDirty(false);
						}
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
			}
		}).then(function(editor) {
			window.n3.task.tinymce = editor[0];
			resolve(window.n3.task.tinymce);
		});
	});
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
	window.n3.modal.open(taskDetailsModal);
}

window.n3.modal.onOpenTaskDetails = function(noteKey, taskId, targetElement) {
	return new Promise(function(resolve) {
		let ticketDataOwner = targetElement.closest("[data-owner='task']");
		let noteKey = ticketDataOwner.dataset.notekey;
		let taskId = ticketDataOwner.dataset.taskid;
		
		let node = $.ui.fancytree.getTree("[data-tree]").getNodeByKey(noteKey);
		let task = window.n3.tasksList.get("id", taskId)[0];


		
		let form = $("[data-taskeditor]");
		$("[name='title']", form).focus();
		$("[name='title']", form).val(task.values().title);


		$("[data-breadcrumb]", form).html(window.n3.node.getNodeTitlePath(node, true));

		///////////////////////////////////////////////////////////////////////////////////////

		let statusDropDown = window.n3.task.status.map(function(status) {
			return {
				name: status.text,
				value: status.id,
		        selected: (task ? (task.values().status == status.id): status.selected)
			}
		});
		$("[data-status]", form).dropdown({
			values: statusDropDown
		});
		$("[data-status]", form).dropdown("setting", "onChange", function(value, text, $choice) {
			let taskValues = task.values();
			taskValues.status = value;
			task.values(taskValues);
			// storeService.modifyTask(task.values(), ["status"]).then(function() {
			// 	task.n3SetStatus(value);
			// });
			
		});

		///////////////////////////////////////////////////////////////////////////////////////

		let priorityDropDown = window.n3.task.priority.map(function(priority) {
			return {
				name: priority.text,
				value: priority.id + "",
				selected: (priority.id + "") == (task.values().priority + "")
			}
		});
		let priorityDropdown = $("[data-priority]", form).dropdown({
			values: priorityDropDown
		});
		let selectedPriority = window.n3.task.priority.find(function(priority) {
			return priority.id == task.values().priority;
		});
		priorityDropdown.dropdown("set selected", selectedPriority.id + "");
		priorityDropdown.dropdown("setting", "onChange", function(value, text, $choice) {
			let taskValues = task.values();
			taskValues.priority = value;
			task.values(taskValues);
			// storeService.modifyTask(task.values(), ["priority"]).then(function() {
			// 	task.n3SetPriority(value);
			// });
		});

		///////////////////////////////////////////////////////////////////////////////////////

		// TODO: list tags
		let tagsDropDownMenu = window.n3.task.tagsList.map(function(tag) {
			return {
				name: tag,
				value: tag,
		        selected: ("," + task.values().tags + ",").indexOf(tag) > -1
			}
		});
		
		let tagsDropDownEl = $("[data-tags]", form);
		let tagsDropDown = tagsDropDownEl.dropdown({
			allowAdditions: true,
			values: tagsDropDownMenu
		});
		tagsDropDown.dropdown("clear");
		task.values().tags.split(",").forEach(function(tag) {
			tagsDropDown.dropdown("set selected", tag);
		});
		tagsDropDown.dropdown("setting", "onChange", function(value, text, $choice) {
			let taskValues = task.values();
			taskValues.tags = value;
			task.values(taskValues);
			// storeService.modifyTask(task.values(), ["tags"]).then(function() {});
			task.displayTags();
		});



		$("[name='duration']", form).val(task.values().duration || "");

		storeService.loadImages("task", task.values().id, (task.values() || {}).description || "").then(function(htmlText) {
			window.n3.task.getTaskHTMLEditor(form).then(function(htmlEditor) {
				htmlEditor.setContent(htmlText);
				htmlEditor.setDirty(false);
				resolve();
			});
		});
		
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

window.n3.initFancyTree = function(rootNodes, tasks) {
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
			// lazyLoad: function(event, data) {
			// 	data.result = new Promise(function(resolve, reject) {
			// 		// storeService.loadNotes(data.node.key).then(function(children) {
			// 		// 	resolve(children);
			// 		// });
			// 	});
			// },
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
				} else {
					window.n3.tabulator.setFilter("noteKey", "=", "HIDE_ALL_TASKS_THIS_NODE_KEY_DOES_NOT_EXISTS");
				}
			},
			expand: function(event, data, a, b) {
				// storeService.expandNote(data.node, true);
			},
			collapse: function(event, data) {
				// storeService.expandNote(data.node, false);
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
				if (!tasks) {
					return;
				}
				let taskToCount = tasks;
				let childrenNodesKeys = "|" + collectChildrenNodesKeys(data.node).join("|") + "|";
				
				if (window.n3.tasksList) {
					taskToCount = window.n3.tasksList.items;
				}

				let tasksAmount = taskToCount.reduce(function(sum, task) {
					let updatedSum = sum;
					let taskValues = task.values ? task.values() : task;

					let status = window.n3.task.status.find(function(status) {
						return status.id == taskValues.status
					});

					if (childrenNodesKeys.indexOf("|" + taskValues.noteKey + "|") > -1 && status.intern == "TOBEDONE") {
						updatedSum++;
					}
					return updatedSum;
				}, 0);

				childrenNodesKeys = "|" + data.node.key + "|";
				let tasksAmountOnNode = taskToCount.reduce(function(sum, task) {
					let updatedSum = sum;
					let taskValues = task.values ? task.values() : task;

					let status = window.n3.task.status.find(function(status) {
						return status.id == taskValues.status
					});

					if (childrenNodesKeys.indexOf("|" + taskValues.noteKey + "|") > -1 && status.intern == "TOBEDONE") {
						updatedSum++;
					}
					return updatedSum;
				}, 0);

				if (tasksAmount > 0) {
					$("span.fancytree-icon,span.fancytree-custom-icon", data.node.span ).append(
						$("<span class='fancytree-childcounter'" + (tasksAmountOnNode > 0 ? " style='background-color: #2185d0; ' " : "") + "/>").text(tasksAmountOnNode > 0 ? (tasksAmountOnNode == tasksAmount ? tasksAmountOnNode : (tasksAmountOnNode + "/" + tasksAmount)) : tasksAmount)
					);
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
						// storeService.moveNote(data.otherNode, oldParentNote).then(function() { });
						data.tree.render(true, false);
					} else if (data.files.length) {
						// Drop files
						for (let i = 0; i < data.files.length; i++) {
							let file = data.files[i];

							let newNodeData = window.n3.node.getNewNodeData();
							newNodeData.title = "'" + file.name + "' (" + file.size + " bytes)";

							let newNode = node.addNode(newNodeData, data.hitMode);
							// storeService.addNote(newNode).then(function() { });
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
						// storeService.addNote(newNode).then(function() { });

					}
					node.setExpanded();
				}
			}
		});

		resolve();
	});

}




