
class N3StoreFileSystem extends N3StoreAbstract {

	constructor() {
		super();
	};

	// TODO: remove it after erfactoring - store every node separatly
	saveNodes(tree) {
		return new Promise(function(resolve) {
			// tree - root contains only internal-root node
			window.n3.store.extractNodesImages(tree.children).then(function(nodeTreeUpdated) {
				window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {
					localFolder.getFileHandle("nodes.json", { create: true }).then(function(treeFileHandle) {
						treeFileHandle.createWritable().then(function(writable) {
							// Write the contents of the file to the stream.
							let jsonString = JSON.stringify(nodeTreeUpdated || [], null, 2);
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
			});
		});
	}
	
	// TODO: refactor to remove tasks one by one
	deleteTasks(nodeKey) {
	
		return new Promise(function(resolve) {
			window.n3.localFolder.getDirectoryHandle().then(function(localFolder) {
				localFolder.getDirectoryHandle("tasks", { create: false }).then(function(tableDirHandle) {
					tableDirHandle.removeEntry(nodeKey + ".json").then(function() {
						console.log("N3Store.deleteTasks, for node key: " + nodeKey);
						resolve();
					}, function(err) {
						// no NodeTasks file, ignore
						resolve();
					});
				});
			});
		});
	
	}
	
}
