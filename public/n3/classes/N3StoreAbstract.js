
class N3StoreAbstract {

	constructor() {
		if (new.target === N3StoreAbstract) {
			throw new TypeError("Cannot construct N3StoreAbstract instances directly");
		}
		if (typeof this.saveNodes !== "function") {
			throw new TypeError("Must override method saveNodes");
		}
		if (typeof this.addNote !== "function") {
			throw new TypeError("Must override method addNote");
		}
		if (typeof this.deleteTasks !== "function") {
			throw new TypeError("Must override method deleteTasks");
		}
		if (typeof this.writeImage !== "function") {
			throw new TypeError("Must override method writeImage");
		}
	};


	loadNodes = function() {
		var that = this;
		return new Promise(function(resolve, reject) {
			that.readNodes().then(function(treeContents) {
				let tree = false;
				if (treeContents) {
					tree = JSON.parse(treeContents);
					
					addTreeToSearchIndex(tree);
					
					function addTreeToSearchIndex(tree) {
						if (!tree) {
							return;
						}
						tree.forEach(function(node) {
							// window.n3.search.index.add("nodeKey:" + node.key, node.title + " " + node.data.description);
							
							window.n3.search.document.add({
								id: node.key,
								type: "note",
								title: node.title,
								content: node.title + " " + node.data.description
							});		
							
							addTreeToSearchIndex(node.children);					
						});
					}
					
				}

				resolve(tree);
			}).catch(function(error) {
				reject(error);
			});
	
		});
	}

	// TODO: remove it after erfactoring - store every node separatly
	saveNodes(tree) {
		var that = this;
		return new Promise(function(resolve, reject) {
			// tree - root contains only fancytree internal-root node so precess only children
			that.#extractNodesImages(tree.children).then(function(tree) {
				that.writeNodes(tree).then(function() {
					resolve();
				}).catch(function(error) {
					reject(error);
				});
			});
		});
	}
	
	addNote(note) {
		var that = this;
		return new Promise(function(resolve, reject) {
			that.#extractImages("note", note.key, (note.data || {}).description || "").then(function(htmltext) {
				note.data = node.data || {};
				note.data.description = htmltext;
				
				that.addNote(tree).then(function() {
					resolve();
				}).catch(function(error) {
					reject(error);
				});
			});
		});
	}

	saveTasks = function(params, tasksToSave) {
		var that = this;
		return new Promise(function(resolve) {

			let nodeKey = params.nodeKey;
			let taskId = params.taskId;

			// make a copy before modifing for write
			tasksToSave = JSON.parse(JSON.stringify(tasksToSave));
			tasksToSave.forEach(function(task) {
				delete task["nodeKey"];
			});

			if (tasksToSave && tasksToSave.length > 0) {

				that.#extractTasksImages(tasksToSave).then(function(tasksToSave) {
					
					that.writeTasks(params, tasksToSave).then(function() {
						console.log("N3StoreAbstract.saveTasks " + nodeKey + " ready");
						resolve();
					}).catch(function(error) {
						reject(error);
					});

				});

			} else {
				that.deleteTasks(nodeKey).then(function() {
					resolve();
				});
			}

		});

	}
	

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

	// Loop nodes tree and save all pasted Base64 images to external files 
	#extractNodesImages(nodes) {
		var that = this;
		return new Promise(function(resolve) {

			if (!nodes || nodes.length == 0) {
				resolve(nodes);
			}

			(function loopNodes(i) {

				if (i >= nodes.length) {
					resolve(nodes);
				} else {
					let node = nodes[i];
					node.data = node.data || {};
					node.data.modificationDate = JSJoda.Instant.now().toString();

					that.#extractNodesImages(node.children).then(function(childrenUpdated) {
						node.children = childrenUpdated;

						that.#extractImages("node", node.key, (node.data || {}).description || "").then(function(htmltext) {
							node.data = node.data || {};
							node.data["description"] = htmltext;
							loopNodes(i + 1);
						});

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
								
								that.writeImage(ownerTyp, ownerId, fileName, blob).then(function() {
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
	
						that.readImage(ownerTyp, ownerId, fileName).then(function(fileData) {
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

	
	loadTasks() {
		var that = this;
		return new Promise(function(resolve, reject) {
			
			that.readTasks().then(function(tasks) {
				resolve(tasks);
			}).catch(function(error) {
				reject(error);
			});
			
		});
	};
	
	loadData() {
		var that = this;
		return new Promise(function(resolve) {
			that.loadNodes().then(function(tree) {
				that.loadTasks().then(function(tasks) {
					resolve({tree:tree, tasks: tasks});
				});
	
			});
		});
	}

}
