// TODO: cache read data to prevent disc access?
class N3StoreServiceFileSystem extends N3StoreServiceAbstract {
	
	#STOREVERSION = 2;
	#configFileName

	#dataFolderName
	#imagesFolderName

	#notesFolderName

	#noteMetaDataFileName
	#noteDataFileName
	#noteExpandedFileName
	#noteTitleFileName
	#noteDescriptionFileName
	#noteChildrenFileName

	#trashFolderName

	constructor(directoryHandle) {
		super();
		this.directoryHandle = directoryHandle;
		
		this.#configFileName = "conf";

		this.#imagesFolderName = "assets";
		this.#dataFolderName = "data";

		this.#notesFolderName = "notes";

		this.#noteMetaDataFileName = "metadata";
		this.#noteDataFileName = "data";
		this.#noteExpandedFileName = "expanded";
		this.#noteTitleFileName = "title";
		this.#noteDescriptionFileName = "description";
		this.#noteChildrenFileName = "children";
		this.#trashFolderName = "trash";

	};


	#readConfig() {
		let that = this;
		return new Promise(function(resolve, reject) {
			let configFile = new N3File(that.directoryHandle, [that.#configFileName + ".json"]);
			configFile.text().then(function(config) {
				config = config || "{}";
				config = JSON.parse(config);
				resolve(config);
			}).catch(function(err) {
				resolve({
					version: 1
				});
			});
		});	
	}
	
	#writeConfig() {
		let that = this;
		let configFile = new N3File(that.directoryHandle, [that.#configFileName + ".json"]);
		return configFile.write(JSON.stringify({
			version: that.#STOREVERSION
		}, null, 2));
	}
	

	#writeNoteExpand(noteFolderHandle, key, expanded) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let noteExpandedFile = new N3File(noteFolderHandle, [that.#noteExpandedFileName + ".json"]);
			noteExpandedFile.write(JSON.stringify({ expanded: expanded }, null, 2)).then(function(data) {
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});
	}

	#readNoteExpand(notesFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let noteExpandedFile = new N3File(notesFolderHandle, [that.#noteExpandedFileName + ".json"]);
			noteExpandedFile.textOrFalse().then(function(data) {
				data = data || "{\"expanded\": false}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});

	}

	#readNoteMetaData(notesFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let noteMetaDataFile = new N3File(notesFolderHandle, [that.#noteMetaDataFileName + ".json"]);
			noteMetaDataFile.textOrFalse().then(function(data) {
				data = data || "{}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});

	}

	#readNoteTitle(noteFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let noteTitleFile = new N3File(noteFolderHandle, [that.#noteTitleFileName + ".json"]);
			noteTitleFile.textOrFalse().then(function(data) {
				data = data || "{}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});
	}


	#readNoteData(noteFolderHandle) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let noteDataFile = new N3File(noteFolderHandle, [that.#noteDataFileName + ".json"]);
			noteDataFile.textOrFalse().then(function(data) {
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

			let noteDescriptionFile = new N3File(notesFolderHandle, [that.#noteDescriptionFileName + ".json"]);
			noteDescriptionFile.textOrFalse().then(function(data) {
				data = data || "{}";
				data = JSON.parse(data);
				resolve(data);
			}).catch(function(err) {
				reject(err);
			});

		});
	}

	#writeNoteData(dirHandle, note, modifiedFields) {
		let modifiedAnythingButNotTitleOrDescription = false;

		if (modifiedFields) {
			let modifiedFieldsClone = modifiedFields.map(function(x) {return x;});
			modifiedFieldsClone = modifiedFieldsClone.filter(function(x) {return x !== "title" && x !== "description";});
			modifiedAnythingButNotTitleOrDescription = modifiedFieldsClone.length > 0;
		}

		if (modifiedFields !== undefined && !modifiedAnythingButNotTitleOrDescription) {
			return Promise.resolve();
		} else {
		
			var that = this;
			let noteDataFile = new N3File(dirHandle, [that.#noteDataFileName + ".json"]);
			return noteDataFile.text().then(function(text) {
				let oldNoteData = JSON.parse(text);
				let timeStampAsTime = JSJoda.Instant.parse(oldNoteData.timeStamp).epochSecond();
				let prevNoteDataFile = new N3File(dirHandle, [that.#noteDataFileName + "." + timeStampAsTime + ".json"]);
				return prevNoteDataFile.write(JSON.stringify(oldNoteData, null, 2));
			}).then(function() {
				// new file revision
				let noteData = Object.assign({}, note.data);
				delete noteData.description;
				delete noteData.creationDate;

				noteData.timeStamp = JSJoda.Instant.now().toString();
				
				return noteDataFile.write(JSON.stringify(noteData, null, 2));
			}).catch(function(error) {
				// not yet exists, create new file
				let noteData = Object.assign({}, note.data);
				delete noteData.description;
				delete noteData.creationDate;
				noteData.timeStamp = JSJoda.Instant.now().toString();

				let noteDataFile = new N3File(dirHandle, [that.#noteDataFileName + ".json"]);
				return noteDataFile.write(JSON.stringify(noteData, null, 2));
			});

		}

	}

	#writeNoteMetaData(noteFolderHandle, note, modifiedFields) {
		// ignore modifiedFields, save: creationDate 	
		let that = this;
		return new Promise(function(resolve, reject) {
			let noteMetaDataFile = new N3File(noteFolderHandle, [that.#noteMetaDataFileName + ".json"]);

			let noteMetaData = {
				creationDate: note.data.creationDate
			};

			noteMetaDataFile.write(JSON.stringify(noteMetaData, null, 2)).then(function() {
				resolve();

			}).catch(function(err) {
				reject(err);
			});

		});
	}

	

	#writeNoteTitle(dirHandle, note, modifiedFields) {
		if (modifiedFields && !modifiedFields.includes("title")) {
			return Promise.resolve();
		} else {
		
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

	}

	#writeNoteDescription(dirHandle, note, modifiedFields) {
		if (modifiedFields && !modifiedFields.includes("description")) {
			return Promise.resolve();
		} else {
				
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
		return this.readNotes(that.#trashFolderName);
	}
	
	readNotesTreeStore(key, dataOrTrashFolderName = this.#dataFolderName) {
		let that = this;
		return that.readNotesStore(key, dataOrTrashFolderName).then(function(children) {
			
			return new Promise(function(resolve, reject) {

				(function loopChildren(i) {
	
					if (i >= children.length) {
						resolve(children);
					} else {
						
						that.readNotesTreeStore(children[i].key, dataOrTrashFolderName).then(function(notesChildren) {
							children[i].children = notesChildren;
							loopChildren(i + 1);
						}).catch(function(error) {
							// it's required!
							reject(error);
						});
					}
				})(0);
			});
		});
	}

	readNotesStore(key, dataOrTrashFolderName = this.#dataFolderName) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let notesFolder = new N3Directory(that.directoryHandle, [dataOrTrashFolderName, that.#notesFolderName]);
			notesFolder.getHandle(false).then(function(notesFolderHandle) {
				that.#getNoteFolderHandle(notesFolderHandle, key).then(function(childrenContainerFolderHandle) {
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

	#getNoteFolderHandle(notesFolderHandle, key) {
		return new Promise(function(resolveI, rejectI) {
			if (key) {
				notesFolderHandle.getDirectoryHandle(key, { create: false }).then(function(noteFolderHandler) {
					resolveI(noteFolderHandler);
				});
			} else {
				resolveI(notesFolderHandle);
			}
		});
	}

	addNoteStore(note) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let noteFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName, note.key]);
			noteFolder.getHandle(true).then(function(dirHandle) {

				that.#writeNoteMetaData(dirHandle, note).then(function() {
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

		});
	}

	modifyNoteStore(note, modifiedFields) {
		let that = this;
		return new Promise(function(resolve, reject) {
			let noteFolder = new N3Directory(that.directoryHandle, [that.#dataFolderName, that.#notesFolderName, note.key]);
			noteFolder.getHandle(true).then(function(dirHandle) {
				// at the moment it's only creationdate... that.#writeNoteMetaData(dirHandle, note, modifiedFields).then(function() {
					that.#writeNoteData(dirHandle, note, modifiedFields).then(function() {
						that.#writeNoteTitle(dirHandle, note, modifiedFields).then(function() {
							that.#writeNoteDescription(dirHandle, note, modifiedFields).then(function() {
								that.#writeNoteChildrenFile(note.parent).then(function() {
									console.log("N3StoreServiceFileSystem.modifyNoteStore " + note.key);
									resolve();
								});
							});
						});
					});
				// });
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
	#readNote(noteFolderHandle) {
		let that = this;
		return that.#readNoteMetaData(noteFolderHandle).then(function(metaData) {
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
								note.data.creationDate = metaData.creationDate;
								
								if (childrenChildrenKeys.length == 0) {
									note.children = [];
								}
								return note;
							});
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
