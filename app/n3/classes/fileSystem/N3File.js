class N3File {

	constructor(directoryHandle, path) {
		this.directoryHandle = directoryHandle;
		this.path = path;
		this.fileName = path.pop();
	};

	getHandle(create) {
		if (this.fileHandle) {
			return Promise().resolve(this.fileHandle);
		}

		let that = this;

		let n3Directory = new N3Directory(this.directoryHandle, this.path);
		return n3Directory.getHandle(create).then(function(dirHandle) {
			return dirHandle.getFileHandle(that.fileName, { create: create });
		}).then(function(fileHandle) {
			that.fileHandle = fileHandle;
			return fileHandle;
		});
	}

	exists() {
		let n3Directory = new N3Directory(this.directoryHandle, this.path);
		return n3Directory.getHandle(false).then(function(dirHandle) {
			return dirHandle.getFileHandle(that.fileName, { create: false });
		}).then(function(fileHandle) {
			return true;
		}).catch(function(error) {
			return false;
		});
	}

	text() {
		return this.getHandle(false).then(function(fileHandle) {
			return fileHandle.getFile();
		}).then(function(file) {
			return file.text();
		}).then(function(fileContent) {
			return fileContent;
		});
	}

	textOrFalse() {
		return this.text().then(function(text) {
			return text;
		}).catch(function(error) {
			return false;
		});
	}

	write(content) {
		return this.getHandle(true).then(function(fileHandle) {
			return fileHandle.createWritable();
		}).then(function(writable) {
			return writable.write(content).then(function() {
				return writable.close();
			});
			
		});
	}
	
	copyTo(targetFolderHandle) {
		return this.getHandle(true).then(function(fileHandle) {
			return fileHandle.getFile().then(function(file) {
				return file.text().then(function(fileContent) {
					return targetFolderHandle.getFileHandle(file.name, { create: true }).then(function(targetFileHandle) {
						return targetFileHandle.createWritable().then(function(writable) {
							return writable.write(fileContent).then(function() {
								return writable.close().then(function() {
									return true;
								});
							});
						});
					});
				});
			});
		});
	}
	
}