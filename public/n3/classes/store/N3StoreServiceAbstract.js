
class N3StoreServiceAbstract {

	constructor(searchService) {
		if (new.target === N3StoreServiceAbstract) {
			throw new TypeError("Cannot construct N3StoreServiceAbstract instances directly");
		}
		
		this.searchService = searchService;
		
		// TODO: complete list of required methods
		/*if (typeof this.addNote !== "function") {
			throw new TypeError("Must override method addNote");
		}*/
	};

	// TODO: add change logger service
	
	// load root nodes, if key undefined
	// load children notes if key defined
	loadNotes(key) {
		var that = this;
		return new Promise(function(resolve, reject) {
			that.readNotesStore(key).then(function(children) {
				resolve(children);
			}).catch(function(error) {
				reject(error);
			});
	
		});
	}
	
	iterateNotes(callback) {
		return this.iterateNotesStore(callback);
	}
	
	addTask(task) {
		var that = this;
		return that.#extractImages("task", task.id, task.description || "").then(function(htmltext) {
			task.description = htmltext;
			return that.addTaskStore(task);
		}).then(function() {
			return that.searchService.addTask(task);
		});
	}
	
	modifyTask(task) {
		var that = this;
		return that.#extractImages("task", task.id, task.description || "").then(function(htmltext) {
			task.description = htmltext;
			return that.modifyTaskStore(task);
		}).then(function() {
			return that.searchService.updateTask(task);
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
		return this.#extractImages("note", note.key, (note.data || {}).description || "").then(function(htmltext) {
			note.data = note.data || {};
			note.data.description = htmltext;
			
			return that.addNoteStore(note);
		}).then(function() {
			return that.searchService.addNote(note);
		});
	}
	
	modifyNote(note, modifiedFields) {
		var that = this;
		return that.#extractImages("note", note.key, (note.data || {}).description || "").then(function(htmltext) {
			note.data = note.data || {};
			note.data.description = htmltext;
			
			return that.modifyNoteStore(note, modifiedFields);
		}).then(function() {
			return that.searchService.updateNote(note);
		});
	}

	expandNote(note, expanded) {
		return this.expandNoteStore(note, expanded);
	}
	
	moveNote(note, oldParentNote) {
		return this.moveNoteStore(note, oldParentNote);
	}
	
	moveTaskToTrash(task) {
		return this.moveTaskToTrashStore(task).then(function() {
			return that.searchService.updateNote(note, true);
		});
	}
	
	moveNoteToTrash(note) {
		return this.moveNoteToTrashStore(note);
	}

	#extractImages(ownerTyp, ownerId, htmltext) {
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
