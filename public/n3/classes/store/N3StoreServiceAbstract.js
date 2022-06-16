
class N3StoreServiceAbstract {

	
	constructor() {
		if (new.target === N3StoreServiceAbstract) {
			throw new TypeError("Cannot construct N3StoreServiceAbstract instances directly");
		}
		
		this.searchService = new N3SearchServiceFlexSearch();
		
		// TODO: complete list of required methods
		/*if (typeof this.addNote !== "function") {
			throw new TypeError("Must override method addNote");
		}*/
	};

	// TODO: add change logger service
	
	
	
	migrateStore() {
		return Promise.resolve();
		/*var that = this;
		return new Promise(function(resolve, reject) {
			return that.migrateStoreNow().then(function() {
				console.log("N3StoreServiceAbstract migrateStore");
				resolve();
			});
		});*/
	}
	
	
	#setPathsAndBacklinks(notes, path, notesBacklinks, level) {
		let that = this;
		path = path || "";
		notesBacklinks = notesBacklinks || {};
		level = level || 0;
		let deeperLevel = level + 1;
		
		notes.forEach(function(note) {
			note.data.path = path + (path.length > 0 ? " / " : "") + note.title;
			let $htmlCntainer = $("<div />");
			$htmlCntainer.html(note.data.description);
			let internalLinks = $("[data-link-node]", $htmlCntainer);
			internalLinks.each(function(index) {
				let $this = $(this);
				if ($this[0].dataset.linkNode) {
					if (notesBacklinks[$this[0].dataset.linkNode] === undefined) {
						notesBacklinks[$this[0].dataset.linkNode] = [];
					}
					notesBacklinks[$this[0].dataset.linkNode].push(note.key);
				}
			});
			that.#setPathsAndBacklinks(note.children, note.data.path, notesBacklinks, deeperLevel);		
		});

		if (level === 0) {
			setBacklinks(notes, notesBacklinks);
			function setBacklinks(notes, notesBacklinks) {
				notes.forEach(function(note) {
					note.data.backlinks = notesBacklinks[note.key];
					setBacklinks(note.children, notesBacklinks);
				});
			}
		}	
	}

	// load root nodes, if key undefined
	// load children notes if key defined
	loadNotes(key) {
		return this.readNotesStore(key);
	}


	loadNotesTree() {
		let that = this;
		return this.readNotesTreeStore().then(function(tree) {
			that.#setPathsAndBacklinks(tree);
			that.searchService.addNotesTree(tree);
			return Promise.resolve(tree);
		});
	}
		
	iterateNotes(callback) {
		return this.iterateNotesStore(callback);
	}
		
	addNote(note) {
		var that = this;
		note.data.path = (note.parent.key !== "root_1" ? (note.parent.data.path + " / ") : "") + note.title;
		return this.#extractImages("note", note.key, (note.data || {}).description || "").then(function(htmltext) {
			note.data = note.data || {};
			note.data.description = htmltext;
			
			return that.addNoteStore(note);
		}).then(function() {
			that.searchService.addNote(note);
			return Promise.resolve(note);
		});
	}
	
	modifyNote(note, modifiedFields) {
		var that = this;

		note.data.path = (note.parent.key !== "root_1" ? (note.parent.data.path + " / ") : "") + note.title;

		return that.#extractImages("note", note.key, (note.data || {}).description || "").then(function(htmltext) {
			note.data = note.data || {};
			note.data.description = htmltext;
			
			return that.modifyNoteStore(note, modifiedFields);
		}).then(function() {

			if (note.children && modifiedFields && modifiedFields.includes("title")) {
				updateNoteTree(note);
			} else {
				that.searchService.updateNote(note);
			}

			function updateNoteTree(note) {
				note.data.path = (note.parent.key !== "root_1" ? (note.parent.data.path + " / ") : "") + note.title;
				that.searchService.updateNote(note);
				note.children.forEach(function(child) {
					updateNoteTree(child)
				});
			}

			return Promise.resolve(note);
		});
	}

	search(searchText, limit) {
		let searchOptions = {
			index: "content", 
			enrich: true
		};
		if (limit !== undefined) {
			searchOptions.limit = limit;
		}
		return this.searchService.getIndex().search(searchText, searchOptions);
	}

	getIndexedDocuments(count) {

		let searchResults = [];

		let allDocs = Object.entries(this.searchService.getIndex().store);
		if (count !== undefined) {
			if (allDocs.length < count) {
				count = allDocs.length;
			}
		} else {
			count = allDocs.length;
		}

		for (let i = 0; i < count; i++) {
			searchResults.push({
				id: allDocs[i][0],
				doc: allDocs[i][1]
			});
		}
		
		return searchResults;
	}

	expandNote(note, expanded) {
		return this.expandNoteStore(note, expanded);
	}
	
	moveNote(note, oldParentNote) {
		return this.moveNoteStore(note, oldParentNote);
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
