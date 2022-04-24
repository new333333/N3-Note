class N3File {

	constructor(path) {
		this.path = path;
	};

	getHandle(create) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let dirs = that.path.split("/");
			let fileName = dirs.pop();

			let n3Directory = new N3Directory(dirs);
			n3Directory.getHandle(create).then(function(dirHandle) {
				dirHandle.getFileHandle(fileName, { create: create }).then(function(fileHandle) {
					resolve(fileHandle);
				});
			}).catch(function(error) {
				reject(error);
			});
		});
	}

	exists() {
		let that = this;
		return new Promise(function(resolve) {

			let dirs = that.path.split("/");
			let fileName = dirs.pop();

			let n3Directory = new N3Directory(dirs);
			n3Directory.getHandle(false).then(function(dirHandle) {
				dirHandle.getFileHandle(fileName, { create: false }).then(function(fileHandle) {
					resolve(true);
				});
			}).catch(function(error) {
				resolve(false);
			});
		});
	}

}

class N3Blob {

	constructor(blob) {
		this.blob = blob;
	};

	save(path) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let n3File = new N3File(path);
			n3File.getHandle(true).then(function(fileHandle) {
				fileHandle.createWritable().then(function(writable) {
					writable.write(that.blob).then(function() {
						writable.close().then(function() {
							resolve();
						}, function(err) {
							reject(err);
						});
					}, function(err) {
						reject(err);
					});
				}, function(err) {
					reject(err);
				});
			}).catch(function(err) {
				reject(err);
			});
		});
	}
}


class N3Directory {

	constructor(directoryHandle, dirs) {
		this.dirs = dirs;
		this.localDirectoryHandle = directoryHandle;
	};

	getHandle(create) {
		let that = this;
		return new Promise(function(resolve, reject) {

			(function loopDirs(i, dirHandle) {

				if (i >= that.dirs.length) {
					resolve(dirHandle);
				} else {

					dirHandle.getDirectoryHandle(that.dirs[i], { create: create }).then(function(dirHandle) {
						loopDirs(i + 1, dirHandle);
					}, function(err) {
						reject(err);
					});

				}
			})(0, that.localDirectoryHandle);

		});
	}

}


class N3StoreFileSystem extends N3StoreAbstract {

	#dataFolder
	#imagesFolder
	#notesFolder
	#noteDataFile
	#noteTitleFile
	#noteDescriptionFile
	#noteChildrenFile

	constructor(directoryHandle) {
		super();
		this.#imagesFolder = "assets";
		this.#dataFolder = "data";
		this.#notesFolder = "notes";
		this.#noteDataFile = "data";
		this.#noteTitleFile = "title";
		this.#noteDescriptionFile = "description";
		this.#noteChildrenFile = "children";
		this.localDirectoryHandle = directoryHandle;
	};


	#writeNoteData(dirHandle, note) {
		let that = this;
		return new Promise(function(resolve, reject) {
			dirHandle.getFileHandle(that.#noteDataFile + ".json", { create: true }).then(function(fileHandle) {
				fileHandle.createWritable().then(function(writable) {
					let noteData = Object.assign({}, note.data);
					delete noteData.description;
					noteData.expanded = note.expanded;
					writable.write(JSON.stringify(noteData, null, 2)).then(function() {
						writable.close().then(function() {
							resolve();
						});
					});
				});
			});
		});
	}

	#writeNoteTitle(dirHandle, note) {
		let that = this;
		return new Promise(function(resolve, reject) {

			dirHandle.getFileHandle(that.#noteTitleFile + ".json", { create: false }).then(function(fileHandle) {
				// file already exists - create new version
				fileHandle.getFile().then(function(file) {
					file.text().then(function(fileText) {
						let oldTitle = JSON.parse(fileText);
						let timeStampAsTime = JSJoda.Instant.parse(oldTitle.timeStamp).epochSecond();
						writeTitleToFile(dirHandle, that.#noteTitleFile + "." + timeStampAsTime + ".json", oldTitle).then(function() {

							fileHandle.createWritable().then(function(writable) {
								let title = {
									title: note.title,
									timeStamp: JSJoda.Instant.now().toString()
								};
								writable.write(JSON.stringify(title, null, 2)).then(function() {
									writable.close().then(function() {
										resolve();
									});
								});
							});


						});
					});

				});

			}, function(error) {
				// not yet exists, create
				let title = {
					title: note.title,
					timeStamp: JSJoda.Instant.now().toString()
				};
				writeTitleToFile(dirHandle, that.#noteTitleFile + ".json", title).then(function() {
					resolve();
				});
			});


			function writeTitleToFile(dirHandle, fileName, title) {
				return new Promise(function(resolveN, rejectN) {
					dirHandle.getFileHandle(fileName, { create: true }).then(function(fileHandle) {
						fileHandle.createWritable().then(function(writable) {
							writable.write(JSON.stringify(title, null, 2)).then(function() {
								writable.close().then(function() {
									resolveN();
								});
							});
						});
					});
				});
			}

		});
	}

	#writeNoteDescription(dirHandle, note) {
		let that = this;
		return new Promise(function(resolve, reject) {

			dirHandle.getFileHandle(that.#noteDescriptionFile + ".json", { create: false }).then(function(fileHandle) {
				// file already exists - create new version
				fileHandle.getFile().then(function(file) {
					file.text().then(function(fileText) {
						let oldDescription = JSON.parse(fileText);
						let timeStampAsTime = JSJoda.Instant.parse(oldDescription.timeStamp).epochSecond();
						writeDescriptionToFile(dirHandle, that.#noteDescriptionFile + "." + timeStampAsTime + ".json", oldDescription).then(function() {

							fileHandle.createWritable().then(function(writable) {
								let description = {
									description: note.data.description,
									timeStamp: JSJoda.Instant.now().toString()
								};
								writable.write(JSON.stringify(description, null, 2)).then(function() {
									writable.close().then(function() {
										resolve();
									});
								});
							});


						});
					});

				});

			}, function(error) {
				// not yet exists, create
				let description = {
					description: note.data.description,
					timeStamp: JSJoda.Instant.now().toString()
				};
				writeDescriptionToFile(dirHandle, that.#noteDescriptionFile + ".json", description).then(function() {
					resolve();
				});
			});


			function writeDescriptionToFile(dirHandle, fileName, description) {
				return new Promise(function(resolveN, rejectN) {
					dirHandle.getFileHandle(fileName, { create: true }).then(function(fileHandle) {
						fileHandle.createWritable().then(function(writable) {
							writable.write(JSON.stringify(description, null, 2)).then(function() {
								writable.close().then(function() {
									resolveN();
								});
							});
						});
					});
				});
			}

		});
	}

	#writeNoteChildren(note) {
		let that = this;
		return new Promise(function(resolve, reject) {
			
			(function() {
				return new Promise(function(resolveI, rejectI) {
					if (note.title == "root") {
						let notesRootFolder = new N3Directory(that.localDirectoryHandle, [that.#dataFolder, that.#notesFolder]);
						notesRootFolder.getHandle(true).then(function(dirHandle) {
							resolveI(dirHandle);
						});
					} else {
						let noteFolder = new N3Directory(that.localDirectoryHandle, [that.#dataFolder, that.#notesFolder, note.key]);
						noteFolder.getHandle(true).then(function(dirHandle) {
							resolveI(dirHandle);
						});
					}
				});
			})().then(function(dirHandle) {
				dirHandle.getFileHandle(that.#noteChildrenFile + ".json", { create: true }).then(function(fileHandle) {
					fileHandle.createWritable().then(function(writable) {
						let children = [];
						note.children.forEach(function(note) {
							children.push(note.key);
						});
						
						writable.write(JSON.stringify(children, null, 2)).then(function() {
							writable.close().then(function() {
								resolve();
							});
						});
					});
	
				}, function(error) {
					reject(error);
				});
			});
		});
	}

	addNote(note) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let noteFolder = new N3Directory(that.localDirectoryHandle, [that.#dataFolder, that.#notesFolder, note.key]);
			noteFolder.getHandle(true).then(function(dirHandle) {

				that.#writeNoteData(dirHandle, note).then(function() {
					that.#writeNoteTitle(dirHandle, note).then(function() {
						that.#writeNoteDescription(dirHandle, note).then(function() {
							that.#writeNoteChildren(note.parent).then(function() {
								console.log("N3StoreFileSystem.addNote " + note.key);
								resolve();
							});
						});
					});
				});
			});

		});
	}

	writeNodes(tree) {
		let that = this;
		return new Promise(function(resolve, reject) {
			that.localDirectoryHandle.getFileHandle("nodes.json", { create: true }).then(function(treeFileHandle) {
				treeFileHandle.createWritable().then(function(writable) {
					// Write the contents of the file to the stream.
					let jsonString = JSON.stringify(tree || [], null, 2);
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
	}

	// TODO: refactor to remove tasks one by one
	deleteTasks(nodeKey) {
		let that = this;
		return new Promise(function(resolve, reject) {
			that.localDirectoryHandle.getDirectoryHandle("tasks", { create: false }).then(function(tableDirHandle) {
				tableDirHandle.removeEntry(nodeKey + ".json").then(function() {
					console.log("N3Store.deleteTasks, for node key: " + nodeKey);
					resolve();
				}, function(error) {
					// no NodeTasks file, ignore error
					resolve();
				});
			});
		});

	}

	writeTasks(params, tasksToSave) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let nodeKey = params.nodeKey;
			that.localDirectoryHandle.getDirectoryHandle("tasks", { create: true }).then(function(tableDirHandle) {
				tableDirHandle.getFileHandle(nodeKey + ".json", { create: true }).then(function(tasksFileHandle) {
					tasksFileHandle.createWritable().then(function(writable) {
						writable.write(JSON.stringify(tasksToSave, null, 2)).then(function() {
							writable.close().then(function() {
								resolve();
							});
						});
					});
				});
			}).catch(function(error) {
				reject(error);
			});
		});
	}

	writeImage(ownerTyp, ownerId, fileName, blob) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let imgPath = that.#imagesFolder + "/" + fileName;

			let n3File = new N3File(imgPath);
			n3File.exists().then(function(exists) {
				if (exists) {
					resolve();
				} else {

					let n3Blob = new N3Blob(blob);
					n3Blob.save(imgPath).then(function() {
						resolve();
					}).catch(function(error) {
						reject(error);
					});
				}
			});

		});
	}

	readImage(ownerTyp, ownerId, fileName) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let dirs = [that.#imagesFolder];

			let n3Directory = new N3Directory(that.localDirectoryHandle, dirs);
			n3Directory.getHandle(false).then(function(dirHandle) {
				dirHandle.getFileHandle(fileName).then(function(attachmentFileHandle) {
					attachmentFileHandle.getFile().then(function(fileData) {
						let reader = new FileReader();
						reader.addEventListener("load", function() {
							resolve(reader.result);
						}, false);
						reader.readAsDataURL(fileData);
					});
				});
			}).catch(function() {
				reject();
			});
		});
	}

	readNodes() {
		let that = this;
		return new Promise(function(resolve, reject) {
			that.localDirectoryHandle.getFileHandle("nodes.json", { create: true }).then(function(treeFileHandle) {
				treeFileHandle.getFile().then(function(treeFile) {
					treeFile.text().then(function(treeContents) {
						resolve(treeContents);
					});
				});
			}).catch(function() {
				reject();
			});
		});
	}


	readTasks() {
		let that = this;
		let tasks = [];
		return new Promise(function(resolve, reject) {
			that.localDirectoryHandle.getDirectoryHandle("tasks", { create: true }).then(function(tableDirHandle) {
				let asyncIt = tableDirHandle.values();
				let p = new Promise(function(resolvep) {
					(function loopEntries() {
						asyncIt.next().then(function(element) {
							let taskFileHandle = element.value;
							let done = element.done;

							if (done) {
								resolvep();
							} else {

								taskFileHandle.getFile().then(function(taskFile) {
									let taskFileName = taskFile.name;
									taskFile.text().then(function(taskFileAsText) {
										let taskAsJson = JSON.parse(taskFileAsText || "[]");
										let nodeKey = taskFileName.replaceAll(".json", "");
										taskAsJson.forEach(function(task) {
											task["nodeKey"] = nodeKey;
											task.tags = task.tags || [];
											task.tags.forEach(function(tagToAdd) {
												let tagIndex = window.n3.task.tagsList.findIndex(function(existingTag) {
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

											// window.n3.search.index.add("taskId:" + task.id, task.title + " " + task.description);

											window.n3.search.document.add({
												id: task.id,
												nodeKey: task.nodeKey,
												type: "task",
												title: task.title,
												content: task.title + "  " + task.description
											});
										});
										loopEntries();
									});

								});
							}
						});

					})();

				});
				p.then(function() {
					resolve(tasks);
				});

			});
		});
	}
}
