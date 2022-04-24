
class N3File {

	constructor(path) {
		this.path = path;
	};

	exists() {
		let that = this;
		return new Promise(function(resolve) {

			let dirs = that.path.split("/");
			let fileName = dirs.pop();

			let n3Directory = new N3Directory(dirs, false);
			n3Directory.getHandle().then(function(dirHandle) {
				dirHandle.getFileHandle(fileName, { create: false }).then(function(fileHandle) {
					resolve(true);
				}, function(err) {
					resolve(false);
				});
			}).catch(function(err) {
				resolve(false);
			});
		});
	}

}
