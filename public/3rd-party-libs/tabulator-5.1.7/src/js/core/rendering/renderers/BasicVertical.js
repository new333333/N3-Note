import Renderer from '../Renderer.js';
import Helpers from '../../tools/Helpers.js';

export default class BaiscVertical extends Renderer{
	constructor(table){
		super(table);

		this.verticalFillMode = "fill";

		this.scrollTop = 0;
		this.scrollLeft = 0;

		this.scrollTop = 0;
		this.scrollLeft = 0;
	}

	clearRows(){
		var element = this.tableElement;

		// element.children.detach();
		while(element.firstChild) element.removeChild(element.firstChild);

		element.scrollTop = 0;
		element.scrollLeft = 0;

		element.style.minWidth = "";
		element.style.minHeight = "";
		element.style.display = "";
		element.style.visibility = "";
	}

	renderRows(){
		var element = this.tableElement,
		onlyGroupHeaders = true;

		this.rows().forEach((row, index) => {
			this.styleRow(row, index);
			element.appendChild(row.getElement());
			row.initialize(true);

			if(row.type !== "group"){
				onlyGroupHeaders = false;
			}
		});

		if(onlyGroupHeaders){
			element.style.minWidth = this.table.columnManager.getWidth() + "px";
		}else{
			element.style.minWidth = "";
		}
	}


	rerenderRows(callback){
		this.clearRows();
		this.renderRows();

		if(callback){
			callback();
		}
	}

	scrollToRowNearestTop(row){
		var rowTop = Helpers.elOffset(row.getElement()).top;

		return !(Math.abs(this.elementVertical.scrollTop - rowTop) > Math.abs(this.elementVertical.scrollTop + this.elementVertical.clientHeight - rowTop));
	}

	scrollToRow(row){
		var rowEl = row.getElement();

		this.elementVertical.scrollTop = Helpers.elOffset(rowEl).top - Helpers.elOffset(this.elementVertical).top + this.elementVertical.scrollTop;
	}

	visibleRows(includingBuffer){
		return this.rows();
	}

}