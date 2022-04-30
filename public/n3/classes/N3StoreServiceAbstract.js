
class N3StoreServiceAbstract {

	constructor() {
		if (new.target === N3StoreServiceAbstract) {
			throw new TypeError("Cannot construct N3StoreServiceAbstract instances directly");
		}
		
		// TODO: complete list of required methods
		if (typeof this.addNote !== "function") {
			throw new TypeError("Must override method addNote");
		}
	};

	// TODO: add serach index service  in all mewthods
	// TODO: add change logger service

/*	loadData() {
		var that = this;
		return new Promise(function(resolve) {
			that.loadNodes().then(function(tree) {
				that.loadTasks().then(function(tasks) {
					resolve({tree:tree, tasks: tasks});
				});
	
			});
		});
	}*/
	
	// load root nodes, if key undefined
	// load children notes if key defined
	loadNotes = function(key) {
		var that = this;
		return new Promise(function(resolve, reject) {
			
			that.readNotesStore(key).then(function(children) {
				
				// TODO: umbauen!! search as Class, als Parameter to this class
				addTreeToSearchIndex(children);
				
				function addTreeToSearchIndex(tree) {
					if (!tree) {
						return;
					}
					tree.forEach(function(node) {
						// window.n3.search.index.add("noteKey:" + node.key, node.title + " " + node.data.description);
						
						window.n3.search.document.add({
							id: node.key,
							type: "note",
							title: node.title,
							content: node.title + " " + node.data.description
						});		
						
						addTreeToSearchIndex(node.children);					
					});
				}
					

				resolve(children);
			}).catch(function(error) {
				reject(error);
			});
	
		});
	}
	
	addTask(task) {
		var that = this;
		return that.#extractImages("task", task.id, task.description || "").then(function(htmltext) {
			task.description = htmltext;
			return that.addTaskStore(task);
		});
	}
	
	modifyTask(task) {
		var that = this;
		return that.#extractImages("task", task.id, task.description || "").then(function(htmltext) {
			task.description = htmltext;
			return that.modifyTaskStore(task);
		});
	}
	
	loadTasks() {
		var that = this;
		return new Promise(function(resolve, reject) {
			
			that.readTasksStore().then(function(tasks) {
				resolve(tasks);
			}).catch(function(error) {
				reject(error);
			});
			
		});
	};
	
	addNote(note) {
		var that = this;
		return new Promise(function(resolve, reject) {
			that.#extractImages("note", note.key, (note.data || {}).description || "").then(function(htmltext) {
				note.data = note.data || {};
				note.data.description = htmltext;
				
				that.addNoteStore(note).then(function() {
					resolve();
				}).catch(function(error) {
					reject(error);
				});
			});
		});
	}
	
	modifyNote(note, modifiedFields) {
		var that = this;
		return new Promise(function(resolve, reject) {
			that.#extractImages("note", note.key, (note.data || {}).description || "").then(function(htmltext) {
				note.data = note.data || {};
				note.data.description = htmltext;
				
				that.modifyNoteStore(note, modifiedFields).then(function() {
					resolve();
				}).catch(function(error) {
					reject(error);
				});
			});
		});
	}

	expandNote(note, expanded) {
		return this.expandNoteStore(note, expanded);
	}
	
	moveNote(note, oldParentNote) {
		return this.moveNoteStore(note, oldParentNote);
	}
	
	moveTaskToTrash(task) {
		return this.moveTaskToTrashStore(task);
	}
	
	moveNoteToTrash(note) {
		return this.moveNoteToTrashStore(note);
	}

// TODO: remove after reafcroring, no more used
	#extractTasksImages(tasks) {
		var that = this;
		return new Promise(function(resolve) {
	
			if (!tasks || tasks.length == 0) {
				resolve(tasks);
			}
	
			(function loopTasks(i) {
	
				if (i >= tasks.length) {
					resolve(tasks);
				} else {
					let task = tasks[i];
					task.modificationDate = JSJoda.Instant.now().toString();
					// conert from old structure, TODO remove it
					if (!task.creationDate) {
						task.creationDate = JSJoda.Instant.now().toString();
					}
	
					that.#extractImages("task", task.id, task.description || "").then(function(htmltext) {
						task["description"] = htmltext;
						loopTasks(i + 1);
					});
	
				}
			})(0);
		});
	}


	#extractImages = function(ownerTyp, ownerId, htmltext) {
		var that = this;
		return new Promise(function(resolve) {
			if (!htmltext) {
				resolve("");
			}
	
			let $description = $("<div />")
			$description.html(htmltext);
	
			let imgs = $("img", $description);
	
			(function loopImages(i) {
	
				if (i >= imgs.length) {
					let html = $description.html();
					resolve(html);
				} else {
					let nextImg = imgs[i];
	
					if (nextImg.src.indexOf("data:image/") == -1) {
						loopImages(i + 1);
					} else {
	
						let fileName = nextImg.dataset.n3src;
	
						fetch(nextImg.src).then(function(base64Response) {
							base64Response.blob().then(function(blob) {
								
								that.writeImageStore(ownerTyp, ownerId, fileName, blob).then(function() {
									nextImg.src = "";
								}).catch(function(error) {
									console.error(error);
								}).finally(function() {
									loopImages(i + 1);
								});
								
							});
	
						});
	
					}
				}
			})(0);
	
		});
	}
	
	// return Primise with description with loaded images
	loadImages(ownerTyp, ownerId, htmltext) {
		var that = this;
		return new Promise(function(resolve) {
	
			let $imagesHiddenContainer = $("<div />");
			$imagesHiddenContainer.html(htmltext);
	
			let imgs = $("img", $imagesHiddenContainer);
	
			(function loopImages(i) {
	
				if (i >= imgs.length) {
					let htmlWithImages = $imagesHiddenContainer.html();
					$imagesHiddenContainer.remove();
					resolve(htmlWithImages || "");
				} else {
					let nextImg = imgs[i];
	
					if (!nextImg.dataset.n3src) {
						loopImages(i + 1);
					} else {
	
						let fileName = nextImg.dataset.n3src;
	
						that.readImageStore(ownerTyp, ownerId, fileName).then(function(fileData) {
							nextImg.src = fileData;
						}).catch(function(error) {
							console.log(error);
						}).finally(function() {
							loopImages(i + 1);
						});
	
					}
				}
			})(0);
		});
	}


}
