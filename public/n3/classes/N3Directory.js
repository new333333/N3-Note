
class N3Directory {

	constructor(dirs, create) {
		this.dirs = dirs;
		this.create = create;
	};

	getHandle() {
		let that = this;
		return new Promise(function(resolve, reject) {

			(function loopDirs(i, dirHandle) {

				if (i >= that.dirs.length) {
					resolve(dirHandle);
				} else {

					window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {
						localFolder.getDirectoryHandle(that.dirs[i], { create: that.create }).then(function(dirHandle) {
							loopDirs(i + 1, dirHandle);
						}, function(err) {
							reject(err);
						});
					});

				}
			})(0, false);

		});
	}

}

