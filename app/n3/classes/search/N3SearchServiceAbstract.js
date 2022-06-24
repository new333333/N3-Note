
class N3SearchServiceAbstract {

	constructor() {
		if (new.target === N3SearchServiceAbstract) {
			throw new TypeError("Cannot construct N3StoreServiceAbstract instances directly");
		}
		
		// TODO: complete list of required methods
		if (typeof this.addNote !== "function") {
			throw new TypeError("Must override method addNote");
		}
	};
	
	
}
