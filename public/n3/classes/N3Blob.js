
class N3Blob {

	constructor(blob) {
		this.blob = blob;
	};

	save(path) {
		let that = this;
		return new Promise(function(resolve, reject) {

			let dirs = path.split("/");
			let fileName = dirs.pop();
			
			let n3Directory = new N3Directory(dirs, true);
			n3Directory.getHandle().then(function(dirHandle) {
				dirHandle.getFileHandle(fileName, { create: true }).then(function(fileHandle) {
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
				}, function(err) {
					reject(err);
				});
			}).catch(function(err) {
				reject(err);
			});
		});
	}
}

