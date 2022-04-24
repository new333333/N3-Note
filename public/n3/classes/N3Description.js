
class N3Description {
	
	constructor(description) {
		this.description = description;
	};
	
	// return Primise with description with loaded images
	loadImages() {
		var that = this;
		return new Promise(function(resolve) {
	
			let $imagesHiddenContainer = $("<div />");
			$imagesHiddenContainer.html(that.description);
	
			let imgs = $("img", $imagesHiddenContainer);
	
			(function loopImages(i) {
	
				if (i >= imgs.length) {
					let htmlWithImages = $imagesHiddenContainer.html();
					$imagesHiddenContainer.remove();
					resolve(htmlWithImages || "");
				} else {
					let nextImg = imgs[i];
	
					if (!nextImg.dataset.n3src) {
						loopImages(i + 1);
					} else {
	
						let filePath = nextImg.dataset.n3src;
	
						let dirs = filePath.split("/");
						let fileName = dirs.pop();
	
						let n3Directory = new N3Directory(dirs, false);
						n3Directory.getHandle().then(function(dirHandle) {
							dirHandle.getFileHandle(fileName).then(function(attachmentFileHandle) {
								attachmentFileHandle.getFile().then(function(fileData) {
	
									let reader = new FileReader();
									reader.addEventListener("load", function() {
										nextImg.src = reader.result;
										loopImages(i + 1);
									}, false);
									reader.readAsDataURL(fileData);
	
								});
							});
						}).catch(function(err) {
							loopImages(i + 1);
						});
	
					}
				}
			})(0);
		});
	}
}

