
class N3SearchServiceFlexSearch extends N3SearchServiceAbstract {
	
	#indexFolderName
	#flexSearchDocument
	#asyncExportIndexQueue

	constructor(directoryHandle) {
		super();
		this.directoryHandle = directoryHandle;
		this.#indexFolderName = "index";
		this.#flexSearchDocument = new FlexSearch.Document({
			tokenize: "forward",
			document: {
				id: "id",
				tag: "type",
				index: ["type", "content", "trash"],
				store: ["type", "title", "noteKey"]
			}
		});
		this.#importIndex();
		
		this.#asyncExportIndexQueue = async.queue(function(task, callback) {
			
			task.fn().then(function() {
				callback();
			});
		
		}, 1);
		
		this.#asyncExportIndexQueue.error(function(err, task) {
			console.error("task experienced an error", err, task);
		});
		
		this.#asyncExportIndexQueue.drain(function() {
			console.log("all items have been processed");
		});	
	}
	
	getIndex() {
		return this.#flexSearchDocument;
	}
	
	addNote(note) {
		this.#flexSearchDocument.add({
			id: note.key,
			type: "note",
			title: note.title,
			content: note.title + " " + note.data.description,
			trash: false
		});	
		return this.#exportIndex();
	}
	
	// TODO: history title, description are not indexed
	updateNote(note, trash = false) {
		this.#flexSearchDocument.update({
			id: note.key,
			type: "note",
			title: note.title,
			content: note.title + " " + note.data.description,
			trash: trash
		});	
		return this.#exportIndex();
	}
	
	addTask(task) {
		this.#flexSearchDocument.add({
			id: task.id,
			type: "task",
			title: task.title,
			content: task.title + " " + task.description,
			trash: false
		});	
		return this.#exportIndex();
	}
	
	// TODO: history title, description are not indexed
	updateTask(task, trash = false) {
		this.#flexSearchDocument.update({
			id: task.id,
			type: "task",
			title: task.title,
			content: task.title + " " + task.description,
			trash: trash
		});	
		return this.#exportIndex();
	}
	
	// TODO: hostory title, description are not indexed
	updateNote(note, trash = false) {
		this.#flexSearchDocument.update({
			id: note.key,
			type: "note",
			title: note.title,
			content: note.title + " " + note.data.description,
			trash: trash
		});	
		return this.#exportIndex();
	}
	
	#exportIndex() {
		return Promise.resolve();
		/*let that = this;
		this.#asyncExportIndexQueue.push({
			fn: function() {

				return new Promise(function(resolve) {
					that.#writeIndex().then(function() {
						resolve();
					});

				});
			}
		});*/
	}
	
	#writeIndex() {
		let that = this;
		let indexFolder = new N3Directory(that.directoryHandle, [that.#indexFolderName]);
		return new Promise(function(resolve, reject) {
			return indexFolder.getHandle(true).then(function(indexFolderHandle) {
				let exportKeysCount = 1;
				that.#flexSearchDocument.export(function(key, data) { 
					return new Promise(function(resolve2){
	        			let indexFile = new N3File(indexFolderHandle, [key]);
	        			indexFile.write(data).then(function() {
							if (exportKeysCount == 9) {
								resolve();
							} else {
								exportKeysCount++;
								resolve2();
							}
						});
					});
				});
	
			});
		});
	}
	
	#importIndex() {
		return Promise.resolve();
		/*let that = this;
		
		let indexFolder = new N3Directory(that.directoryHandle, [this.#indexFolderName]);
		return indexFolder.getHandle(true).then(function(indexFolderHandle) {
			let indexFilesIterator = indexFolderHandle.values();
			let p = new Promise(function(resolvep) {
				(function loopIndexFiles() {
					indexFilesIterator.next().then(function(element) {
						if (element.done) {
							resolvep();
						} else {
							let indexFileHandle = element.value;
							
							indexFileHandle.getFile().then(function(file) {
								file.text().then(function(fileContent) {
									console.log(element.value.name, fileContent);
									that.#flexSearchDocument.import(element.value.name, fileContent);
									loopIndexFiles();
								});
							});
						}
					});
				})();
			});
			return p;
		});*/
	}
	
}
