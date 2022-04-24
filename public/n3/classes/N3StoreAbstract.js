
class N3StoreAbstract {

	constructor() {
		if (new.target === N3StoreAbstract) {
			throw new TypeError("Cannot construct N3StoreAbstract instances directly");
		}
		if (typeof this.saveNodes !== "function") {
			throw new TypeError("Must override method");
		}
		if (typeof this.deleteTasks !== "function") {
			throw new TypeError("Must override method");
		}
	};

}
