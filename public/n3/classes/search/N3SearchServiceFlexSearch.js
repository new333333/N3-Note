
class N3SearchServiceFlexSearch extends N3SearchServiceAbstract {

	#flexSearchDocument

	constructor() {
		super();
		this.#flexSearchDocument = new FlexSearch.Document({
			tokenize: "forward",
			document: {
				id: "id",
				tag: "type",
				index: ["type", "content", "trash"],
				store: ["type", "title", "path"]
			}
		});
		
	}

	getIndex() {
		return this.#flexSearchDocument;
	}

	addNote(note) {

		let that = this;

		let noteIterator = note;
		let path = "";
		let sep = "";
		while (noteIterator && noteIterator.key !== "root_1") {
			path = noteIterator.title + sep + path;
			sep = " / ";
			noteIterator = noteIterator.parent;
		}
	
		let descriptionClean = that.#cleanDescription(note.data.description);
				
		this.#flexSearchDocument.add({
			id: note.key,
			type: "note",
			title: note.title,
			path: path,
			content: note.title + " " + descriptionClean,
			trash: false
		});
	}

	addNotesTree(tree, path) {
		if (!tree) {
			return;
		}

		let that = this;
		path = path || "";
		tree.forEach(function(note) {
					
			let notePath = path + (path.length > 0 ? " / " : "") + note.title;

			let descriptionClean = that.#cleanDescription(note.data.description);

			that.#flexSearchDocument.add({
				id: note.key,
				type: "note",
				title: note.title,
				path: notePath,
				content: note.title + " " + descriptionClean,
				trash: false
			});
			
			that.addNotesTree(note.children, notePath);
		});
	}

	// TODO: history title, description are not indexed
	modifyNote(note, trash = false) {
		let that = this;

		if (trash) {
			this.#flexSearchDocument.remove(note.key);
		} else {

			let noteIterator = note;
			let path = "";
			let sep = "";
			while (noteIterator && noteIterator.key !== "root_1") {
				path = noteIterator.title + sep + path;
				sep = " / ";
				noteIterator = noteIterator.parent;
			}

			let descriptionClean = that.#cleanDescription(note.data.description);
		
			this.#flexSearchDocument.update({
				id: note.key,
				type: "note",
				title: note.title,
				path: path,
				content: note.title + " " + descriptionClean,
				trash: trash
			});
		}
	}

	#cleanDescription(description) {
		let $htmlCntainer = $("<div />");
		let currentNoteLinks = [];
		$htmlCntainer.html(description);
		let internalLinks = $("[data-link-node]", $htmlCntainer);
		internalLinks.each(function(index) {
			let $this = $(this);
			$this.remove();
		});
		let descriptionCleaned = $htmlCntainer.html();
		return descriptionCleaned;
	}

}
