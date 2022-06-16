
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
	
		this.#flexSearchDocument.add({
			id: note.key,
			type: "note",
			title: note.title,
			path: note.data.path,
			content: note.title + " " + note.data.description,
			trash: false
		});
	}

	addNotesTree(tree) {
		if (!tree) {
			return;
		}

		let that = this;
		tree.forEach(function(note) {
			that.#flexSearchDocument.add({
				id: note.key,
				type: "note",
				title: note.title,
				path: note.data.path,
				content: note.title + " " + note.data.description,
				trash: false
			});
			
			that.addNotesTree(note.children);
		});
	}

	// TODO: history title, description are not indexed
	updateNote(note, trash = false) {
		let that = this;
	
		this.#flexSearchDocument.update({
			id: note.key,
			type: "note",
			title: note.title,
			path: note.data.path,
			content: note.title + " " + note.data.description,
			trash: trash
		});

	}

}
