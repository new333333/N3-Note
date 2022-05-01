// TODO: cache read data to prevent disc access?
class N3StoreServiceFileSystem extends N3StoreServiceAbstract {

	#dataFolderName
	#imagesFolderName

	#notesFolderName

	#noteDataFileName
	#noteExpandedFileName
	#noteTitleFileName
	#noteDescriptionFileName
	#noteChildrenFileName

	#tasksFolderName

	#trashFolderName
	#taskDataFileName
	#taskTitleFileName
	#taskDescriptionFileName

	constructor(directoryHandle, searchService) {
		super(searchService);
		this.directoryHandle = directoryHandle;

		this.#imagesFolderName = "assets";
		this.#dataFolderName = "data";

		this.#notesFolderName = "notes";

		this.#noteDataFileName = "data";
		this.#noteExpandedFileName = "expanded";
		this.#noteTitleFileName = "title";
		this.#noteDescriptionFileName = "description";
		this.#noteChildrenFileName = "children";
		this.#trashFolderName = "trash";

		this.#tasksFolderName = "tasks";
		this.#taskDataFileName = "data";
		this.#taskTitleFileName = "title";
		this.#taskDescriptionFileName = "description";
	};


	#writeNoteData(noteFolderHandle, note) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let noteDataFileFile = new N3File(noteFolderHandle, [that.#noteDataFileName + ".json"]);

			let noteData = Object.assign({}, note.data);
			delete noteData.description;

			noteDataFileFile.write(JSON.stringify(noteData, null, 2)).then(function() {
				resolve();

			}).catch(function(err) {
				reject(err);
			});

		});
	}

	#writeTaskData(taskFolderHandle, task) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let taskDataFile = new N3File(taskFolderHandle, [that.#taskDataFileName + ".json"]);

			let taskData = Object.assign({}, task);
			delete taskData.description;
			delete taskData.title;
			delete taskData.noteKey;

			taskDataFile.write(JSON.stringify(taskData, null, 2)).then(function(data) {
				resolve(data);

			}).catch(function(err) {
				reject(err);
			});

		});
	}

	#readTaskData(taskFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let taskDataFile = new N3File(taskFolderHandle, [that.#taskDataFileName + ".json"]);
			taskDataFile.textOrFalse().then(function(data) {
				data = data || "{}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});

	}

	#writeNoteExpand(noteFolderHandle, key, expanded) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let noteDataFileFile = new N3File(noteFolderHandle, [that.#noteExpandedFileName + ".json"]);
			noteDataFileFile.write(JSON.stringify({ expanded: expanded }, null, 2)).then(function(data) {
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});
	}

	#readNoteExpand(notesFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let noteDataFileFile = new N3File(notesFolderHandle, [that.#noteExpandedFileName + ".json"]);
			noteDataFileFile.textOrFalse().then(function(data) {
				data = data || "{\"expanded\": false}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});

	}

	#readNoteData(notesFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let noteDataFileFile = new N3File(notesFolderHandle, [that.#noteDataFileName + ".json"]);
			noteDataFileFile.textOrFalse().then(function(data) {
				data = data || "{}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});

	}

	#readNoteTitle(notesFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let noteDataFileFile = new N3File(notesFolderHandle, [that.#noteTitleFileName + ".json"]);
			noteDataFileFile.textOrFalse().then(function(data) {
				data = data || "{}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});
	}

	#readNoteDesription(notesFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let noteDataFileFile = new N3File(notesFolderHandle, [that.#noteDescriptionFileName + ".json"]);
			noteDataFileFile.textOrFalse().then(function(data) {
				data = data || "{}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});
	}


	#writeNoteTitle(dirHandle, note) {
		var that = this;
		let noteTitleFile = new N3File(dirHandle, [that.#noteTitleFileName + ".json"]);
		return noteTitleFile.text().then(function(text) {
			let oldTitle = JSON.parse(text);
			let timeStampAsTime = JSJoda.Instant.parse(oldTitle.timeStamp).epochSecond();
			let prevNoteTitleFile = new N3File(dirHandle, [that.#noteTitleFileName + "." + timeStampAsTime + ".json"]);
			return prevNoteTitleFile.write(JSON.stringify(oldTitle, null, 2));
		}).then(function() {
			let title = {
				title: note.title,
				timeStamp: JSJoda.Instant.now().toString()
			};
			return noteTitleFile.write(JSON.stringify(title, null, 2));
		}).catch(function(error) {
			// not yet exists, create title
			let title = {
				title: note.title,
				timeStamp: JSJoda.Instant.now().toString()
			};
			let noteTitleFile = new N3File(dirHandle, [that.#noteTitleFileName + ".json"]);
			return noteTitleFile.write(JSON.stringify(title, null, 2));
		});

	}

	#writeNoteDescription(dirHandle, note) {
		var that = this;

		if (!note.data.description) {
			note.data.description = "";
		}

		let noteDescriptionFile = new N3File(dirHandle, [that.#noteDescriptionFileName + ".json"]);
		return noteDescriptionFile.text().then(function(text) {
			let oldDescription = JSON.parse(text);
			let timeStampAsTime = JSJoda.Instant.parse(oldDescription.timeStamp).epochSecond();
			let prevNoteDescriptionFile = new N3File(dirHandle, [that.#noteDescriptionFileName + "." + timeStampAsTime + ".json"]);
			return prevNoteDescriptionFile.write(JSON.stringify(oldDescription, null, 2));
		}).then(function() {
			let description = {
				description: note.data.description,
				timeStamp: JSJoda.Instant.now().toString()
			};
			return noteDescriptionFile.write(JSON.stringify(description, null, 2));
		}).catch(function(error) {
			// not yet exists, create description
			let description = {
				description: note.data.description,
				timeStamp: JSJoda.Instant.now().toString()
			};
			let noteDescriptionFile = new N3File(dirHandle, [that.#noteDescriptionFileName + ".json"]);
			return noteDescriptionFile.write(JSON.stringify(description, null, 2));
		});

	}

	#readNoteChildrenFile(folderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let trashChildrenFile = new N3File(folderHandle, [that.#noteChildrenFileName + ".json"]);
			trashChildrenFile.textOrFalse().then(function(childrenAsString) {
				childrenAsString = childrenAsString || "[]";
				let children = JSON.parse(childrenAsString);
				resolve(children);
			});

		});
	}


	#writeNoteChildrenFile(note, dataOrTrashFolderName = this.#dataFolderName) {
		if (!note) {
			return new Promise(function(resolve, reject) {
				resolve();
			});
		}

		let that = this;
		return new Promise(function(resolve, reject) {

			(function() {
				return new Promise(function(resolveI, rejectI) {
					if (note.title == "root") {
						let notesRootFolder = new N3Directory(that.directoryHandle, [dataOrTrashFolderName, that.#notesFolderName]);
						notesRootFolder.getHandle(true).then(function(dirHandle) {
							resolveI(dirHandle);
						});
					} else {
						let noteFolder = new N3Directory(that.directoryHandle, [dataOrTrashFolderName, that.#notesFolderName, note.key]);
						noteFolder.getHandle(true).then(function(dirHandle) {
							resolveI(dirHandle);
						});
					}
				});
			})().then(function(dirHandle) {

				let childrenFileName = that.#noteChildrenFileName + ".json";

				dirHandle.getFileHandle(childrenFileName, { create: true }).then(function(fileHandle) {
					fileHandle.createWritable().then(function(writable) {
						let children = [];
						if (note.children && note.children.length > 0) {
							note.children.forEach(function(note) {
								children.push(note.key);
							});
						}

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

	readNotesInTrash() {
		let that = this;
		return new Promise(function(resolve, reject) {
			readNotes(that.#trashFolderName).then(function(children) {
				resolve(children);
			});
		});
	}

	readNotesStore(key, dataOrTrashFolderName = this.#dataFolderName) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let notesFolder = new N3Directory(that.directoryHandle, [dataOrTrashFolderName, that.#notesFolderName]);
			notesFolder.getHandle(false).then(function(notesFolderHandle) {

				(function() {
					return new Promise(function(resolveI, rejectI) {
						if (key) {
							notesFolderHandle.getDirectoryHandle(key, { create: false }).then(function(noteFolderHandler) {
								resolveI(noteFolderHandler);
							});
						} else {
							resolveI(notesFolderHandle);
						}
					});
				})().then(function(childrenContainerFolderHandle) {
					that.#readNoteChildrenFile(childrenContainerFolderHandle).then(function(childrenKeys) {
						let childrenPromises = childrenKeys.map(function(childrenKey) {
							return notesFolderHandle.getDirectoryHandle(childrenKey, { create: false }).then(function(noteFolderHandle) {
								return that.#readNote(noteFolderHandle).then(function(note) {
									return note;
								});
							});
						});

						Promise.all(childrenPromises).then(function(children) {
							resolve(children);
						})

					});

				});
			}).catch(function(error) {
				resolve([]);
			});

		});
	}

	#writeTaskTitle(dirHandle, task) {
		var that = this;
		let titleFile = new N3File(dirHandle, [that.#taskTitleFileName + ".json"]);
		return titleFile.text().then(function(text) {
			let oldTitle = JSON.parse(text);
			let timeStampAsTime = JSJoda.Instant.parse(oldTitle.timeStamp).epochSecond();
			let prevNoteTitleFile = new N3File(dirHandle, [that.#taskTitleFileName + "." + timeStampAsTime + ".json"]);
			return prevNoteTitleFile.write(JSON.stringify(oldTitle, null, 2));
		}).then(function() {
			let title = {
				title: task.title,
				timeStamp: JSJoda.Instant.now().toString()
			};
			return titleFile.write(JSON.stringify(title, null, 2));
		}).catch(function(error) {
			// not yet exists, create title
			let title = {
				title: task.title,
				timeStamp: JSJoda.Instant.now().toString()
			};
			let titleFile = new N3File(dirHandle, [that.#taskTitleFileName + ".json"]);
			return titleFile.write(JSON.stringify(title, null, 2));
		});
	}

	#readTaskTitle(taskFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let titleFile = new N3File(taskFolderHandle, [that.#taskTitleFileName + ".json"]);
			titleFile.textOrFalse().then(function(data) {
				data = data || "{}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});
	}

	#writeTaskDescription(dirHandle, task) {
		var that = this;

		if (!task.description) {
			task.description = "";
		}

		let descriptionFile = new N3File(dirHandle, [that.#taskDescriptionFileName + ".json"]);
		return descriptionFile.text().then(function(text) {
			let oldDescription = JSON.parse(text);
			let timeStampAsTime = JSJoda.Instant.parse(oldDescription.timeStamp).epochSecond();
			let prevNoteDescriptionFile = new N3File(dirHandle, [that.#taskDescriptionFileName + "." + timeStampAsTime + ".json"]);
			return prevNoteDescriptionFile.write(JSON.stringify(oldDescription, null, 2));
		}).then(function() {
			let description = {
				description: task.description,
				timeStamp: JSJoda.Instant.now().toString()
			};
			return descriptionFile.write(JSON.stringify(description, null, 2));
		}).catch(function(error) {
			// not yet exists, create description
			let description = {
				description: task.description,
				timeStamp: JSJoda.Instant.now().toString()
			};
			let descriptionFile = new N3File(dirHandle, [that.#taskDescriptionFileName + ".json"]);
			return descriptionFile.write(JSON.stringify(description, null, 2));
		});

	}

	#readTasksDesription(taskFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let descriptionFile = new N3File(taskFolderHandle, [that.#taskDescriptionFileName + ".json"]);
			descriptionFile.textOrFalse().then(function(data) {
				data = data || "{}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});
	}

	addTaskStore(task) {
		let that = this;
		let taskFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName, task.noteKey, that.#tasksFolderName, task.id]);
		return taskFolder.getHandle(true).then(function(dirHandle) {
			return that.#writeTaskData(dirHandle, task).then(function() {
				return that.#writeTaskTitle(dirHandle, task).then(function() {
					return that.#writeTaskDescription(dirHandle, task).then(function() {
						console.log("N3StoreServiceFileSystem.addTaskStore " + task.id + " for note " + task.noteKey);
					});
				});
			});
		});
	}

	moveTaskToTrashStore(task) {
		let that = this;

		let taskFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName, task.noteKey, that.#tasksFolderName, task.id]);
		let noteTasksTrashFolder = new N3Directory(that.directoryHandle, [that.#trashFolderName, that.#notesFolderName, task.noteKey, that.#tasksFolderName]);

		return taskFolder.copyTo(noteTasksTrashFolder).then(function() {
			let noteTasksFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName, task.noteKey, that.#tasksFolderName]);
			return noteTasksFolder.getHandle(false).then(function(noteTasksFolderHandle) {
				return noteTasksFolderHandle.removeEntry(task.id, { recursive: true });
			});

		});
	}

	// TODO: rebuild like node: new method for title and description
	modifyTaskStore(task) {
		let that = this;
		let taskFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName, task.noteKey, that.#tasksFolderName, task.id]);
		return taskFolder.getHandle(true).then(function(dirHandle) {
			return that.#writeTaskData(dirHandle, task).then(function() {
				return that.#writeTaskTitle(dirHandle, task).then(function() {
					return that.#writeTaskDescription(dirHandle, task).then(function() {
						console.log("N3StoreServiceFileSystem.modifyTaskStore " + task.id + " for note " + task.noteKey);
					});
				});
			});
		});
	}

	addNoteStore(note) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let noteFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName, note.key]);
			noteFolder.getHandle(true).then(function(dirHandle) {

				that.#writeNoteData(dirHandle, note).then(function() {
					that.#writeNoteTitle(dirHandle, note).then(function() {
						that.#writeNoteDescription(dirHandle, note).then(function() {
							that.#writeNoteChildrenFile(note.parent).then(function() {
								console.log("N3StoreServiceFileSystem.addNoteStore " + note.key);
								resolve();
							});
						});
					});
				});
			});

		});
	}

	modifyNoteStore(note, modifiedFields) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let noteFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName, note.key]);
			noteFolder.getHandle(true).then(function(dirHandle) {

				(function() {
					return new Promise(function(resolveI, rejectI) {
						if (modifiedFields.includes("title")) {
							that.#writeNoteTitle(dirHandle, note).then(function() {
								resolveI();
							});
						} else {
							resolveI();
						}
					});
				})().then(function() {
					if (modifiedFields.includes("description")) {
						that.#writeNoteDescription(dirHandle, note).then(function() {
							console.log("N3StoreServiceFileSystem.modifyNote " + note.key);
							resolve();
						});
					} else {
						console.log("N3StoreServiceFileSystem.modifyNote " + note.key);
						resolve();
					}
				});

			});

		});
	}

	expandNoteStore(note, expanded) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let noteFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName, note.key]);
			noteFolder.getHandle(true).then(function(noteFolderHandle) {
				that.#writeNoteExpand(noteFolderHandle, note.key, expanded).then(function() {
					console.log("N3StoreServiceFileSystem.expandNote " + note.key);

					resolve();
				});
			});

		});
	}

	moveNoteStore(note, oldParentNote) {
		let that = this;
		return new Promise(function(resolve, reject) {

			that.#writeNoteChildrenFile(oldParentNote).then(function() {
				that.#writeNoteChildrenFile(note.parent).then(function() {
					console.log("N3StoreServiceFileSystem.moveNote " + note.key);
					resolve();
				});
			}).catch(function(error) {
				reject(error);
			});

		});
	}



	moveNoteToTrashStore(note, parentNoteInTrash) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let parentWithRemovedChildren = false;
			// only for deleted root need save children for children it will be removed in next steps
			if (!parentNoteInTrash) {
				parentWithRemovedChildren = {
					title: note.parent.title,
					key: note.parent.key,
					children: []
				}
				note.parent.children.forEach(function(child) {
					if (child.key != note.key) {
						parentWithRemovedChildren.children.push({ key: child.key });
					}
				});
			}


			that.#writeNoteChildrenFile(parentWithRemovedChildren).then(function() {

				let noteFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName, note.key]);
				let notesTrashFolder = new N3Directory(that.directoryHandle, [that.#trashFolderName, that.#notesFolderName]);

				let noteChildrenFilePath = [that.#trashFolderName, that.#notesFolderName];
				if (parentNoteInTrash) {
					noteChildrenFilePath.push(parentNoteInTrash.key);
				}
				noteChildrenFilePath.push(that.#noteChildrenFileName + ".json");
				let trashChildrenFile = new N3File(that.directoryHandle, noteChildrenFilePath);
				trashChildrenFile.textOrFalse().then(function(childrenAsString) {
					childrenAsString = childrenAsString || "[]";
					let trashNoteChildren = JSON.parse(childrenAsString);
					trashNoteChildren = trashNoteChildren.map(function(key) {
						return { key: key };
					});

					trashNoteChildren.push({ key: note.key });

					noteFolder.copyTo(notesTrashFolder).then(function() {

						// only for deleted root need save children in trash, for children children list will be moved also to trash
						let rootNoteTrash = false;
						if (!parentNoteInTrash) {
							rootNoteTrash = {
								title: "root",
								children: trashNoteChildren
							};
						}
						that.#writeNoteChildrenFile(rootNoteTrash, that.#trashFolderName).then(function() {

							let notesFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName]);
							notesFolder.getHandle(false).then(function(notesFolderHandle) {
								notesFolderHandle.removeEntry(note.key, { recursive: true }).then(function() {

									if (!note.children) {
										note.children = [];
									}
									(function loopChildren(i) {

										if (i >= note.children.length) {
											console.log("N3Store.moveNoteToTrash: " + note.key);
											resolve();
										} else {

											that.moveNoteToTrash(note.children[i], note).then(function() {
												loopChildren(i + 1);
											}, function(err) {
												reject(err);
											});

										}
									})(0);

								}, function(error) {
									reject(error);
								});
							});

						});
					});
				});
			}).catch(function(error) {
				reject(error);
			});

		});
	}

	// TODO: refactor to remove tasks one by one
	deleteTasks(noteKey) {
		let that = this;
		return new Promise(function(resolve, reject) {
			that.directoryHandle.getDirectoryHandle("tasks", { create: false }).then(function(tableDirHandle) {
				tableDirHandle.removeEntry(noteKey + ".json").then(function() {
					console.log("N3Store.deleteTasks, for node key: " + noteKey);
					resolve();
				}, function(error) {
					// no NodeTasks file, ignore error
					resolve();
				});
			});
		});

	}

	writeTasksStore(params, tasksToSave) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let noteKey = params.noteKey;
			that.directoryHandle.getDirectoryHandle("tasks", { create: true }).then(function(tableDirHandle) {
				tableDirHandle.getFileHandle(noteKey + ".json", { create: true }).then(function(tasksFileHandle) {
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

	writeImageStore(ownerTyp, ownerId, fileName, blob) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let n3File = new N3File(that.directoryHandle, [that.#imagesFolderName, fileName]);
			n3File.exists().then(function(exists) {
				if (exists) {
					resolve();
				} else {

					n3File.write(blob).then(function() {
						resolve();
					}).catch(function(error) {
						reject(error);
					});
				}
			});

		});
	}

	readImageStore(ownerTyp, ownerId, fileName) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let dirs = [that.#imagesFolderName];

			let n3Directory = new N3Directory(that.directoryHandle, dirs);
			n3Directory.getHandle(false).then(function(dirHandle) {
				dirHandle.getFileHandle(fileName).then(function(attachmentFileHandle) {
					attachmentFileHandle.getFile().then(function(fileData) {
						let reader = new FileReader();
						reader.addEventListener("load", function() {
							resolve(reader.result);
						}, false);
						reader.readAsDataURL(fileData);
					});
				}, function(error) {
					reject(error);
				});
			}).catch(function(error) {
				reject(error);
			});
		});
	}

	readTasksStore(dataOrTrashFolderName = this.#dataFolderName) {
		let that = this;
		let tasks = [];
		return new Promise(function(resolve, reject) {

			let notesFolder = new N3Directory(that.directoryHandle, [dataOrTrashFolderName, that.#notesFolderName]);
			notesFolder.getHandle(false).then(function(notesFolderHandle) {
				let notesIterator = notesFolderHandle.values();
				let notesIteratorPromise = new Promise(function(resolveN, rejectN) {
					(function loopNotes() {
						notesIterator.next().then(function(element) {
							if (element.done) {
								resolveN();
							} else {
								if (element.value.kind == "directory") {
									let noteFolderHandle = element.value;
									noteFolderHandle.getDirectoryHandle("tasks", { create: true }).then(function(tasksFolderHandle) {
										let tasksIterator = tasksFolderHandle.values();
										let p = new Promise(function(resolvep) {
											(function loopTasks() {
												tasksIterator.next().then(function(element) {
													if (element.done) {
														resolvep();
													} else {
														let taskFolderHandle = element.value;
														that.#readTask(taskFolderHandle).then(function(task) {
															task.noteKey = noteFolderHandle.name;
															tasks.push(task);
															loopTasks();
														});
													}
												});
											})();
										});
										p.then(function() {
											loopNotes();
										});
									});
								} else {
									loopNotes();
								}
							}
						});

					})();
				});
				notesIteratorPromise.then(function() {
					resolve(tasks);
				});
			}).catch(function(error) {
				resolve(tasks);
			});
		});
	}

	#readTask(taskFolderHandle) {
		let that = this;
		return that.#readTaskData(taskFolderHandle).then(function(task) {
			return that.#readTaskTitle(taskFolderHandle).then(function(title) {
				return that.#readTasksDesription(taskFolderHandle).then(function(description) {
					task.title = title.title;
					task.description = description.description;
					return task;
				});
			});
		});
	}

	#readNote(noteFolderHandle) {
		let that = this;
		return that.#readNoteData(noteFolderHandle).then(function(data) {
			return that.#readNoteTitle(noteFolderHandle).then(function(title) {
				return that.#readNoteDesription(noteFolderHandle).then(function(description) {
					return that.#readNoteChildrenFile(noteFolderHandle).then(function(childrenChildrenKeys) {
						return that.#readNoteExpand(noteFolderHandle).then(function(expanded) {
							let note = {
								key: noteFolderHandle.name,
								lazy: true,
								expanded: expanded.expanded,
								title: title.title,
								data: data

							};
							note.data.description = description.description;
							if (childrenChildrenKeys.length == 0) {
								note.children = [];
							}
							return note;
						});
					});
				});
			});
		});
	}

	iterateNotesStore(callback, dataOrTrashFolderName = this.#dataFolderName) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let notesFolder = new N3Directory(that.directoryHandle, [dataOrTrashFolderName, that.#notesFolderName]);
			notesFolder.getHandle(false).then(function(notesFolderHandle) {

				let notesIterator = notesFolderHandle.values();
				let notesIteratorPromise = new Promise(function(resolveN, rejectN) {
					(function loopNotes() {
						notesIterator.next().then(function(element) {
							if (element.done) {
								resolveN();
							} else {
								if (element.value.kind == "directory") {

									that.#readNote(element.value).then(function(note) {
										callback(note).then(function() {
											loopNotes();
										});
									});

								} else {
									loopNotes();
								}
							}
						});

					})();
				});
				notesIteratorPromise.then(function() {
					resolve();
				});

			}).catch(function(error) {
				resolve();
			});
		});
	}

}
