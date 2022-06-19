
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

		let noteIt = note;
		let path = "";
		let sep = "";
		while (noteIt && noteIt.key !== "root_1") {
			path = noteIt.title + sep + path;
			sep = " / ";
			noteIt = noteIt.parent;
		}
	
		this.#flexSearchDocument.add({
			id: note.key,
			type: "note",
			title: note.title,
			path: path,
			content: note.title + " " + note.data.description,
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

			that.#flexSearchDocument.add({
				id: note.key,
				type: "note",
				title: note.title,
				path: notePath,
				content: note.title + " " + note.data.description,
				trash: false
			});
			
			that.addNotesTree(note.children, notePath);
		});
	}

	// TODO: history title, description are not indexed
	modifyNote(note, trash = false) {
		let that = this;

		let noteIt = note;
		let path = "";
		let sep = "";
		while (noteIt && noteIt.key !== "root_1") {
			path = noteIt.title + sep + path;
			sep = " / ";
			noteIt = noteIt.parent;
		}
	
		this.#flexSearchDocument.update({
			id: note.key,
			type: "note",
			title: note.title,
			path: path,
			content: note.title + " " + note.data.description,
			trash: trash
		});

	}

}
