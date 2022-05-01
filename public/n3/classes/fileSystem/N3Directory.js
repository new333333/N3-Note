class N3Directory {

	constructor(directoryHandle, dirs) {
		this.dirs = dirs || [];
		this.directoryHandle = directoryHandle;
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
					}).catch(function(error) {
						// it's required!
						reject(error);
					});

				}
			})(0, that.directoryHandle);

		});
	}


	#copyFolderTo(dirHandle, targetFolderHandle) {
		// dirHandle
		// 		kind: "directory"
		// 		name: "7248cee1-958e-4d4f-b680-ee3085dffa0d"
		let that = this;
		return new Promise(function(resolve, reject) {

			targetFolderHandle.getDirectoryHandle(dirHandle.name, { create: true }).then(function(createdCopyOfFolderHandle) {

				let asyncIt = dirHandle.values();
				let p = new Promise(function(resolvep, rejectp) {
					(function loopEntries() {
						asyncIt.next().then(function(element) {
							// kind: "file"
							// name: "data.json"

							// kind: "directory"
							// name: "tasks"

							let done = element.done;

							if (done) {

								resolvep();

							} else {

								let kind = element.value.kind;
								let name = element.value.name;

								if (kind == "directory") {

									dirHandle.getDirectoryHandle(name, { create: false }).then(function(nextFolderHandle) {
										that.#copyFolderTo(nextFolderHandle, createdCopyOfFolderHandle).then(function() {
											loopEntries();
										});
									});

								} else {
									dirHandle.getFileHandle(name, { create: false }).then(function(fileHandle) {
										fileHandle.getFile().then(function(file) {
											file.text().then(function(fileContent) {
												createdCopyOfFolderHandle.getFileHandle(name, { create: true }).then(function(targetFileHandle) {
													targetFileHandle.createWritable().then(function(writable) {
														writable.write(fileContent).then(function() {
															writable.close().then(function() {
																loopEntries();
															});
														});
													});
												});
											});
										});
									});

								}
							}
						});

					})();

				});
				p.then(function() {
					resolve();
				});
			});
		});

	}


	copyTo(targetDirectory) {
		let that = this;
		return new Promise(function(resolve, reject) {

			that.getHandle(false).then(function(dirHandle) {
				targetDirectory.getHandle(true).then(function(targetDirHandle) {
					that.#copyFolderTo(dirHandle, targetDirHandle).then(function() {
						resolve();
					}).catch(function(err) {
						reject(err);
					});
				}).catch(function(err) {
					reject(err);
				});
			}).catch(function(err) {
				reject(err);
			});
		});
	}
}